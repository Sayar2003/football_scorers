require('dotenv').config();
const express = require('express');
const cors = require('cors');

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'FootballApp API running and healthy' });
});

// Football data proxy
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