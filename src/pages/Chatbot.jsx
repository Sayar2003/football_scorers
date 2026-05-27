import { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../services/aiService';

const dark = {
  card: '#1a1d27', border: '#2d3148',
  text: '#ffffff', muted: '#9ca3af', blue: '#3b82f6',
};

const QUICK_QUESTIONS = [
  'Who are the best strikers in the Premier League?',
  'Explain the offside rule',
  'What makes a good football team?',
  'Who has won the most Champions League titles?',
  'Compare Messi and Ronaldo careers',
  'What is tiki-taka football?',
  'Who is the best goalkeeper in the world?',
  'Explain how VAR works',
];

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I am your football AI assistant. Ask me anything about football — matches, players, tactics, stats, or anything else!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const response = await sendMessage(userText);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I could not connect to the AI. Please try again in a moment.'
      }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: dark.text }}>🤖 AI Football Assistant</h1>
        <p style={{ color: dark.muted, fontSize: '14px', marginTop: '4px' }}>
          Ask anything about football — matches, players, tactics, stats and more
        </p>
      </div>

      {/* Quick questions */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {QUICK_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            disabled={loading}
            style={{
              padding: '0.3rem 0.8rem', borderRadius: '20px',
              border: `1px solid ${dark.border}`, backgroundColor: dark.card,
              color: dark.muted, cursor: 'pointer', fontSize: '12px',
              opacity: loading ? 0.5 : 1
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', borderRadius: '12px',
        border: `1px solid ${dark.border}`, backgroundColor: dark.card,
        padding: '1rem', marginBottom: '1rem', display: 'flex',
        flexDirection: 'column', gap: '1rem'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            {msg.role === 'assistant' && (
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                backgroundColor: dark.blue, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', flexShrink: 0, marginRight: '8px'
              }}>
                🤖
              </div>
            )}
            <div style={{
              maxWidth: '70%', padding: '0.75rem 1rem',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              backgroundColor: msg.role === 'user' ? dark.blue : '#13161f',
              color: dark.text, fontSize: '14px', lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                backgroundColor: '#374151', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', flexShrink: 0, marginLeft: '8px'
              }}>
                👤
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              backgroundColor: dark.blue, display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '16px'
            }}>🤖</div>
            <div style={{
              padding: '0.75rem 1rem', borderRadius: '16px 16px 16px 4px',
              backgroundColor: '#13161f', color: dark.muted, fontSize: '14px'
            }}>
              <span>Thinking</span>
              <span style={{ animation: 'dots 1.5s infinite' }}>...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about football..."
          disabled={loading}
          style={{
            flex: 1, padding: '0.75rem 1rem', borderRadius: '10px',
            border: `2px solid ${dark.border}`, fontSize: '15px',
            outline: 'none', fontFamily: 'inherit',
            backgroundColor: dark.card, color: dark.text,
            opacity: loading ? 0.7 : 1
          }}
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          style={{
            padding: '0.75rem 1.5rem', borderRadius: '10px',
            border: 'none', backgroundColor: dark.blue,
            color: 'white', fontWeight: 'bold',
            fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading || !input.trim() ? 0.5 : 1
          }}
        >
          {loading ? '...' : '➤'}
        </button>
      </div>

      <style>{`
        @keyframes dots {
          0%, 20% { content: '.'; }
          40% { content: '..'; }
          60%, 100% { content: '...'; }
        }
      `}</style>
    </div>
  );
}