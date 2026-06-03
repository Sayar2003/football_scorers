import { useState } from 'react';
import { auth, googleProvider } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';
import { getGlass } from '../styles/glass';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();
  const glass = getGlass(isDark);

  const handleSubmit = async () => {
    setError(''); 
    setLoading(true);
    try {
      if (isSignUp) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(.*\)/, ''));
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError(''); 
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(.*\)/, ''));
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', 
    padding: '0.85rem 1rem',
    borderRadius: '10px', 
    fontSize: '15px',
    fontFamily: 'inherit', 
    outline: 'none',
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    border: `1px solid ${glass.colors.border}`,
    color: glass.colors.text, 
    marginBottom: '1rem',
    transition: 'all 0.2s ease-in-out',
  };

  // Line dynamic color for the canvas layout pitch lines
  const pitchLineColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,17,23,0.08)';

  return (
    <div style={{
      minHeight: '100vh', 
      display: 'flex',
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative', 
      overflow: 'hidden',
      background: isDark 
        ? 'linear-gradient(135deg, #0a0e1a 0%, #0f1117 100%)' 
        : 'linear-gradient(135deg, #f4f6fa 0%, #eef2f6 100%)',
      transition: 'background 0.3s ease'
    }}>
      {/* Animated football pitch background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: isDark ? 0.4 : 0.7 }}>
        <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
          <rect width="800" height="600" fill="none" stroke={pitchLineColor} strokeWidth="2" />
          <line x1="400" y1="0" x2="400" y2="600" stroke={pitchLineColor} strokeWidth="1" />
          <circle cx="400" cy="300" r="80" fill="none" stroke={pitchLineColor} strokeWidth="1" />
          <circle cx="400" cy="300" r="5" fill={isDark ? 'rgba(59,130,246,0.4)' : 'rgba(59,130,246,0.2)'} />
          <rect x="0" y="175" width="120" height="250" fill="none" stroke={pitchLineColor} strokeWidth="1" />
          <rect x="680" y="175" width="120" height="250" fill="none" stroke={pitchLineColor} strokeWidth="1" />
          <rect x="0" y="225" width="50" height="150" fill="none" stroke={pitchLineColor} strokeWidth="1" />
          <rect x="750" y="225" width="50" height="150" fill="none" stroke={pitchLineColor} strokeWidth="1" />
          <circle cx="120" cy="300" r="40" fill="none" stroke={pitchLineColor} strokeWidth="1" />
          <circle cx="680" cy="300" r="40" fill="none" stroke={pitchLineColor} strokeWidth="1" />
          <path d="M 0 0 Q 30 0 30 30" fill="none" stroke={pitchLineColor} strokeWidth="1" />
          <path d="M 800 0 Q 770 0 770 30" fill="none" stroke={pitchLineColor} strokeWidth="1" />
          <path d="M 0 600 Q 30 600 30 570" fill="none" stroke={pitchLineColor} strokeWidth="1" />
          <path d="M 800 600 Q 770 600 770 570" fill="none" stroke={pitchLineColor} strokeWidth="1" />
        </svg>
      </div>

      {/* Animated orbs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <div style={{
          position: 'absolute', width: '400px', height: '400px',
          borderRadius: '50%', top: '-100px', left: '-100px',
          background: isDark 
            ? 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' 
            : 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
          animation: 'float1 8s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', width: '300px', height: '300px',
          borderRadius: '50%', bottom: '-50px', right: '-50px',
          background: isDark 
            ? 'radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)' 
            : 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)',
          animation: 'float2 10s ease-in-out infinite'
        }} />
      </div>

      {/* Login card container */}
      <div style={{
        ...glass.card,
        position: 'relative', 
        zIndex: 10,
        width: '100%', 
        maxWidth: '420px',
        margin: '0 2rem',
        borderRadius: '24px', 
        padding: '2.5rem',
        boxShadow: isDark ? '0 25px 50px rgba(0,0,0,0.4)' : '0 25px 50px rgba(15,17,23,0.06)'
      }}>
        {/* Logo Headings */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '48px', marginBottom: '0.5rem' }}>⚽</div>
          <h1 style={{
            fontSize: '28px', 
            fontWeight: '800',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            backgroundClip: 'text'
          }}>
            FootballApp
          </h1>
          <p style={{ color: glass.colors.muted, fontSize: '14px', marginTop: '6px', fontWeight: '500' }}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {/* Google OAuth action */}
        <button 
          onClick={handleGoogle} 
          disabled={loading} 
          style={{
            width: '100%', 
            padding: '0.85rem',
            borderRadius: '10px', 
            border: `1px solid ${glass.colors.border}`,
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)',
            color: glass.colors.text, 
            fontSize: '15px', 
            fontWeight: '600',
            cursor: 'pointer', 
            marginBottom: '1.5rem',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '10px',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
            boxShadow: !isDark ? '0 2px 8px rgba(0,0,0,0.04)' : 'none'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: glass.colors.border }} />
          <span style={{ color: glass.colors.muted, fontSize: '13px' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: glass.colors.border }} />
        </div>

        {/* Input Form Fields */}
        {isSignUp && (
          <input
            type="text" 
            placeholder="Full Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
        )}
        <input
          type="email" 
          placeholder="Email address" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          style={inputStyle}
        />

        {error && (
          <div style={{
            padding: '0.75rem', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            background: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(220,38,38,0.08)', 
            border: isDark ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(220,38,38,0.2)',
            color: isDark ? '#f87171' : '#dc2626', 
            fontSize: '13px',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        <button 
          onClick={handleSubmit} 
          disabled={loading} 
          style={{
            width: '100%', 
            padding: '0.85rem',
            borderRadius: '10px', 
            border: 'none',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: 'white', 
            fontSize: '15px', 
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            fontFamily: 'inherit', 
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 15px rgba(59,130,246,0.3)'
          }}
        >
          {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: glass.colors.muted, fontSize: '14px' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: isDark ? '#60a5fa' : '#2563eb', 
              cursor: 'pointer', 
              marginLeft: '6px', 
              fontSize: '14px', 
              fontWeight: '600',
              fontFamily: 'inherit' 
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, 20px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, -30px); }
        }
      `}</style>
    </div>
  );
}