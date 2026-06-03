const isDark = () => document.body.getAttribute('data-theme') !== 'light';

export const getGlass = (dark = true) => ({
  card: {
    background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
    borderRadius: '16px',
  },
  cardStrong: {
    background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)',
    borderRadius: '16px',
  },
  input: {
    background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
    borderRadius: '10px',
    color: dark ? '#ffffff' : '#0f1117',
    outline: 'none',
  },
  button: {
    primary: {
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      border: 'none', borderRadius: '10px',
      color: 'white', fontWeight: '600',
      cursor: 'pointer', transition: 'all 0.2s ease',
    },
    secondary: {
      background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
      borderRadius: '10px',
      color: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
      cursor: 'pointer', transition: 'all 0.2s ease',
    },
    active: {
      background: 'rgba(59,130,246,0.2)',
      border: '1px solid rgba(59,130,246,0.4)',
      borderRadius: '10px', color: '#60a5fa',
      fontWeight: '600', cursor: 'pointer',
    }
  },
  colors: {
    text: dark ? '#ffffff' : '#0f1117',
    muted: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
    blue: '#60a5fa',
    green: '#34d399',
    red: '#f87171',
    yellow: '#fbbf24',
    purple: '#a78bfa',
    border: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    tableHeader: dark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.04)',
    rowAlt: dark ? '#1e2130' : 'rgba(0,0,0,0.02)',
  }
});

// Keep old glass export for backward compatibility
export const glass = getGlass(true);

export const leagueButtonStyle = (isActive, dark = true) => ({
  padding: '0.5rem 1rem',
  cursor: 'pointer', borderRadius: '10px', border: '1px solid',
  borderColor: isActive ? 'rgba(59,130,246,0.4)' : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
  background: isActive ? 'rgba(59,130,246,0.2)' : (dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
  color: isActive ? '#60a5fa' : (dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'),
  fontWeight: isActive ? '600' : 'normal', fontSize: '13px',
  transition: 'all 0.2s ease', backdropFilter: 'blur(10px)',
});