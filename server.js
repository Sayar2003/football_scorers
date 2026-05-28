const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

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

const PORT = 5000;
app.listen(PORT, () => console.log(`AI server running on port ${PORT}`));