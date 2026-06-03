import { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../services/aiService';
import { useTheme } from '../context/ThemeContext';
import { getGlass } from '../styles/glass';

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
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I am your football AI assistant. Ask me anything about football — matches, players, tactics, stats, or anything else!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Dynamic theme detection using your context
  const { isDark } = useTheme();
  const glass = getGlass(isDark);

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
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Sorry, I could not connect. Please try again.' }]);
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
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }} className="fade-in">
      <div style={{ marginBottom: '1rem' }}>
        <h1 style={{
          fontSize: '24px', 
          fontWeight: '700',
          // Dynamic text gradient that flips to a dark slate in light mode
          background: isDark 
            ? 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.7))' 
            : 'linear-gradient(135deg, #1e293b, #475569)',
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent', 
          backgroundClip: 'text'
        }}>🤖 AI Football Assistant</h1>
        <p style={{ color: glass.colors.muted, fontSize: '14px', marginTop: '4px' }}>
          Ask anything about football
        </p>
      </div>

      {/* Quick questions pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {QUICK_QUESTIONS.map((q, i) => (
          <button 
            key={i} 
            onClick={() => handleSend(q)} 
            disabled={loading} 
            style={{
              ...glass.button.secondary, 
              padding: '0.3rem 0.8rem',
              borderRadius: '20px', 
              fontSize: '12px', 
              opacity: loading ? 0.5 : 1,
              cursor: 'pointer',
              // Clean border accent matching the light-mode theme
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)'
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Main Box */}
      <div style={{
        flex: 1, 
        overflowY: 'auto', 
        ...glass.card, // Inherits the exact glassmorphism background from your CSS theme builder
        padding: '1rem', 
        marginBottom: '1rem',
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem',
        boxShadow: isDark ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.05)'
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
              maxWidth: '70%', 
              padding: '0.75rem 1rem',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              // User responses keep the bright blue brand accent; assistant responses shift dynamically
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'),
              border: msg.role === 'user' ? 'none' : `1px solid ${glass.colors.border}`,
              color: msg.role === 'user' ? '#ffffff' : glass.colors.text, 
              fontSize: '14px', 
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              boxShadow: msg.role === 'user' ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none'
            }}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', flexShrink: 0, marginLeft: '8px'
              }}>👤</div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🤖</div>
            <div style={{ 
              padding: '0.75rem 1rem', 
              borderRadius: '16px 16px 16px 4px', 
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', 
              border: `1px solid ${glass.colors.border}`, 
              color: glass.colors.muted, 
              fontSize: '14px' 
            }}>
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Row */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about football..."
          disabled={loading}
          style={{ 
            ...glass.input, 
            flex: 1, 
            padding: '0.75rem 1rem', 
            fontSize: '15px', 
            fontFamily: 'inherit', 
            opacity: loading ? 0.7 : 1,
            // Fallback colors ensuring pure contrast over the clear light background card layout
            color: glass.colors.text,
            border: `1px solid ${glass.colors.border}`
          }}
        />
        <button 
          onClick={() => handleSend()} 
          disabled={loading || !input.trim()}
          style={{ 
            ...glass.button.primary, 
            padding: '0.75rem 1.5rem', 
            fontSize: '15px', 
            opacity: loading || !input.trim() ? 0.5 : 1,
            cursor: 'pointer'
          }}
        >
          {loading ? '...' : '➤'}
        </button>
      </div>
    </div>
  );
}