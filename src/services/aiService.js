// AI Service — switch between Hugging Face and Claude easily
// To switch to Claude: change USE_CLAUDE to true and add REACT_APP_ANTHROPIC_API_KEY to .env

const USE_CLAUDE = false;

const HF_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';

const systemPrompt = `You are a football expert AI assistant for FootballApp. 
You have deep knowledge of football statistics, players, teams, tactics, and history.
You cover the top 5 leagues: Premier League, La Liga, Bundesliga, Serie A, and Ligue 1.
Keep responses concise, informative and engaging.
When given match or player data, analyze it and provide insights.
Always respond in a friendly, expert tone like a football analyst.`;

export const sendMessage = async (userMessage, context = '') => {
  const fullMessage = context
    ? `Context: ${context}\n\nUser question: ${userMessage}`
    : userMessage;

  if (USE_CLAUDE) {
    return sendToClaude(fullMessage);
  } else {
    return sendToHuggingFace(fullMessage);
  }
};

const sendToClaude = async (message) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.REACT_APP_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }]
    })
  });
  const data = await response.json();
  return data.content[0].text;
};

const sendToHuggingFace = async (message) => {
  const prompt = `<s>[INST] ${systemPrompt}\n\n${message} [/INST]`;
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${HF_MODEL}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 512,
          temperature: 0.7,
          return_full_text: false
        }
      })
    }
  );
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data[0]?.generated_text || 'Sorry I could not generate a response.';
};