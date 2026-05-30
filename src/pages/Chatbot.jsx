import { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../services/aiService';
import { glass } from '../styles/glass';

const QUICK_QUESTIONS = [
  'Show Premier League standings',
  'Who is top scorer in La Liga?',
  'Explain the offside rule',
  'Compare Messi and Ronaldo',
  'What is tiki-taka football?',
  'Who has won the most Champions League?',
  'Show recent Bundesliga results',
  'Explain how VAR works',
];

export default function Chatbot() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: '👋 Hi! I am your football AI assistant. Ask me anything about football — matches, players, tactics, stats, or anything else!'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setLoading(true);
    try {
      const response = await sendMessage(userText);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Sorry, I could not connect. Please try again.' }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }} className="fade-in">
      <div style={{ marginBottom: '1rem' }}>
        <h1 style={{
          fontSize: '24px', fontWeight: '700',
          background: 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.7))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
        }}>🤖 AI Football Assistant</h1>
        <p style={{ color: glass.colors.muted, fontSize: '14px', marginTop: '4px' }}>Ask anything about football</p>
      </div>

      {/* Quick questions */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {QUICK_QUESTIONS.map((q, i) => (
          <button key={i} onClick={() => handleSend(q)} disabled={loading} style={{
            ...glass.button.secondary, padding: '0.3rem 0.8rem',
            borderRadius: '20px', fontSize: '12px', opacity: loading ? 0.5 : 1
          }}>{q}</button>
        ))}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', ...glass.card,
        padding: '1rem', marginBottom: '1rem',
        display: 'flex', flexDirection: 'column', gap: '1rem'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && (
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', flexShrink: 0, marginRight: '8px'
              }}>🤖</div>
            )}
            <div style={{
              maxWidth: '70%', padding: '0.75rem 1rem',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                : 'rgba(255,255,255,0.05)',
              border: msg.role === 'user' ? 'none' : `1px solid ${glass.colors.border}`,
              color: glass.colors.text, fontSize: '14px', lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>{msg.content}</div>
            {msg.role === 'user' && (
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', flexShrink: 0, marginLeft: '8px'
              }}>👤</div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🤖</div>
            <div style={{ padding: '0.75rem 1rem', borderRadius: '16px 16px 16px 4px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${glass.colors.border}`, color: glass.colors.muted, fontSize: '14px' }}>
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text" value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about football..."
          disabled={loading}
          style={{ ...glass.input, flex: 1, padding: '0.75rem 1rem', fontSize: '15px', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}
        />
        <button onClick={() => handleSend()} disabled={loading || !input.trim()}
          style={{ ...glass.button.primary, padding: '0.75rem 1.5rem', fontSize: '15px', opacity: loading || !input.trim() ? 0.5 : 1 }}>
          {loading ? '...' : '➤'}
        </button>
      </div>
    </div>
  );
}