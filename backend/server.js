require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Safe dynamic import for node-fetch to support both CommonJS and ES Module layouts
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();

// Global Middleware Configurations
app.use(cors());
app.use(express.json());

// --- Root Health Check Status Route ---
app.get('/', (req, res) => {
    res.json({ status: 'FootballApp API running and healthy' });
});

// --- 1. Dynamic Catch-All Football Data Proxy ---
// Intercepts any frontend route starting with /v4 and seamlessly forwards it
app.use('/v4', async (req, res) => {
    try {
        // Look up the API token securely stored in backend/.env
        const apiKey = process.env.REACT_APP_FOOTBALL_API_KEY || process.env.FOOTBALL_API_KEY;
        const BASE_URL = 'https://api.football-data.org/v4';

        if (!apiKey) {
            return res.status(500).json({ error: 'Football API Key missing on server configuration' });
        }

        // Reconstruct the exact incoming query strings and endpoint fragments
        const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
        const targetUrl = `${BASE_URL}${req.path}${queryString}`;

        const response = await fetch(targetUrl, {
            method: req.method, // Keeps support for GET, POST, etc.
            headers: {
                'X-Auth-Token': apiKey,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        res.status(response.status).json(data);

    } catch (err) {
        console.error('Catch-all API Proxy Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- 2. Chat Endpoint (HuggingFace AI Expert) ---
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    try {
        const hfKey = process.env.REACT_APP_HF_API_KEY;
        if (!hfKey) {
            return res.status(500).json({ error: 'HuggingFace API Key missing on server.' });
        }

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

// --- 3. Secure News Proxy Endpoint ---
app.get('/v4/api/news', async (req, res) => {
    const category = req.query.category || 'football';
    try {
        const newsKey = process.env.REACT_APP_NEWS_API_KEY;
        if (!newsKey) {
            return res.status(500).json({ error: 'News API Key missing on server.' });
        }

        const newsResponse = await fetch(
            `https://newsapi.org/v2/everything?q=${encodeURIComponent(category)}&apiKey=${newsKey}`,
            { method: 'GET' }
        );
        
        const data = await newsResponse.json();
        res.json(data);
    } catch (error) {
        console.error('Backend News Proxy Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch news via backend proxy.' });
    }
});

// --- Dynamic Server Port Listener ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================================`);
    console.log(`🚀 Master Full-Stack Football Server Live on Port ${PORT}`);
    console.log(`=================================================`);
});