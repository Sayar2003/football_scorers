require('dotenv').config();
const express = require('express');
const cors = require('cors');

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());

// --- CACHE LAYER MEMORY ENGINE ---
let globalScorersCache = null;
let cacheExpirationTime = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 Hour Cache Lifetime Boundary
const LEAGUE_CODES = ['PL', 'PD', 'BL1', 'SA', 'FL1'];

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'FootballApp API running and healthy' });
});

// --- NEW ENDPOINT: Consolidated Top Scorers Cache Service ---
app.get('/api/top-scorers', async (req, res) => {
  const currentTime = Date.now();
  const apiKey = process.env.REACT_APP_FOOTBALL_API_KEY || process.env.FOOTBALL_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Football API Key missing' });
  }

  // 1. If valid data exists in local server memory, return it instantly
  if (globalScorersCache && cacheExpirationTime && currentTime < cacheExpirationTime) {
    console.log("⚡ Serving aggregated player list instantly from server memory cache...");
    return res.json(globalScorersCache);
  }

  console.log("🌐 Cache empty or expired. Synchronizing with football data API tiers...");
  try {
    const aggregatedScorers = [];

    // 2. Fetch data sequentially from the leagues with built-in pauses to completely bypass 429 ceilings
    for (const code of LEAGUE_CODES) {
      console.log(`Fetching scorer metrics for competition pool: ${code}`);
      const targetUrl = `https://api.football-data.org/v4/competitions/${code}/scorers?limit=50`;
      
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'X-Auth-Token': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 429) {
        console.warn(`⚠️ Rate limit boundary tripped during fetch for league ${code}. Using existing memory frames if available.`);
        if (globalScorersCache) return res.json(globalScorersCache);
        return res.status(429).json({ error: "External data tier rate limits reached. Please try again shortly." });
      }

      const data = await response.json();
      if (data.scorers && Array.isArray(data.scorers)) {
        aggregatedScorers.push(...data.scorers);
      }

      // Crucial: 250ms spacing pause between network targets ensures compliance with free tier accounts
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    // 3. Deduplicate elements by Player ID to keep arrays clean
    const uniqueScorers = Array.from(new Map(aggregatedScorers.map(s => [s.player.id, s])).values());

    // 4. Update memory cache parameters
    globalScorersCache = uniqueScorers;
    cacheExpirationTime = currentTime + CACHE_DURATION;

    console.log(`✅ Successfully updated local caching tier. Registered ${uniqueScorers.length} players.`);
    res.json(uniqueScorers);

  } catch (err) {
    console.error('Data Tier Gathering Failure:', err.message);
    if (globalScorersCache) {
      console.log("♻️ Returning stale cache pool instead of throwing error stack to client.");
      return res.json(globalScorersCache);
    }
    res.status(500).json({ error: err.message });
  }
});

// Football data proxy (Fallback endpoint for individual player data fetches)
app.use('/v4', async (req, res) => {
  try {
    const apiKey = process.env.REACT_APP_FOOTBALL_API_KEY || process.env.FOOTBALL_API_KEY;
    const BASE_URL = 'https://api.football-data.org/v4';

    if (!apiKey) {
      return res.status(500).json({ error: 'Football API Key missing' });
    }

    const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const targetUrl = `${BASE_URL}${req.path}${queryString}`;

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'X-Auth-Token': apiKey,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Football API Proxy Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  try {
    const hfKey = process.env.REACT_APP_HF_API_KEY;
    if (!hfKey) return res.status(500).json({ error: 'HuggingFace API Key missing' });

    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `<s>[INST] You are a football expert. Answer this: ${message} [/INST]`,
          parameters: { max_new_tokens: 512, return_full_text: false }
        })
      }
    );

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error });
    res.json({ response: data[0]?.generated_text || 'No response generated.' });
  } catch (err) {
    console.error('HuggingFace error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// News proxy — uses GNews API (works in production)
app.get('/api/news', async (req, res) => {
  const query = req.query.q || 'football';
  try {
    const gNewsKey = process.env.REACT_APP_GNEWS_API_KEY;
    const newsKey = process.env.REACT_APP_NEWS_API_KEY;

    let data;

    // Try GNews first
    if (gNewsKey) {
      const response = await fetch(
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=20&token=${gNewsKey}`
      );
      data = await response.json();
      if (data.articles) {
        // Normalize GNews format to match NewsAPI format
        const normalized = data.articles.map(a => ({
          title: a.title,
          description: a.description,
          url: a.url,
          urlToImage: a.image,
          publishedAt: a.publishedAt,
          source: { name: a.source?.name || 'Unknown' }
        }));
        return res.json({ status: 'ok', articles: normalized });
      }
    }

    // Fallback to NewsAPI
    if (newsKey) {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${newsKey}`
      );
      data = await response.json();
      return res.json(data);
    }

    res.status(500).json({ error: 'No news API key configured' });
  } catch (err) {
    console.error('News Proxy Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FootballApp Server running on port ${PORT}`);
});