const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Chat Endpoint ---
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_HF_API_KEY}`,
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

// --- Secure News Proxy Endpoint ---
// This handles requests on your phone and live Vercel deployments!
app.get('/v4/api/news', async (req, res) => {
  const category = req.query.category || 'football';
  try {
    const newsResponse = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(category)}&apiKey=${process.env.REACT_APP_NEWS_API_KEY}`,
      { method: 'GET' }
    );
    
    const data = await newsResponse.json();
    res.json(data);
  } catch (error) {
    console.error('Backend News Proxy Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch news via backend proxy.' });
  }
});

// --- Dynamic Server Port Configuration ---
// Render automatically provides a dynamic port, but it will default to 5000 locally
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`AI server running on port ${PORT}`);
});