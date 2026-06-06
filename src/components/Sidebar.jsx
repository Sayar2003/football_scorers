import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const NAV_LINKS = [
  { path: '/', label: 'Standings', icon: '📊' },
  { path: '/matches', label: 'Matches', icon: '⚽' },
  { path: '/fixtures', label: 'Fixtures', icon: '📅' },
  { path: '/scorers', label: 'Top Scorers', icon: '🥇' },
  { path: '/predict', label: 'Predictor', icon: '🔮' },
  { path: '/talent', label: 'Young Talent', icon: '🌟' },
  { path: '/news', label: 'News', icon: '📰' },
  { path: '/favorites', label: 'Favorites', icon: '⭐' },
  { path: '/chat', label: 'AI Chat', icon: '🤖' },
  { path: '/creator', label: 'Creator', icon: '🎨' },
];

const TOOL_LINKS = [
  { path: '/tools/comparator', label: 'Player Comparator', icon: '⚔️' },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark, setIsDark } = useTheme();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease'
          }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: 'fixed', left: 0, top: 0, bottom: 0,
        width: '280px', zIndex: 50,
        background: isDark
          ? 'rgba(10,14,26,0.95)'
          : 'rgba(240,245,255,0.95)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderRight: isDark
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(0,0,0,0.1)',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column',
        boxShadow: isOpen ? '4px 0 30px rgba(0,0,0,0.3)' : 'none'
      }}>

        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>⚽</span>
            <span style={{
              fontWeight: '800', fontSize: '18px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
            }}>FootballApp</span>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
            cursor: 'pointer', padding: '6px 10px', fontSize: '16px',
            transition: 'all 0.2s'
          }}>✕</button>
        </div>

        {/* User info */}
        {user && (
          <div style={{
            padding: '1rem 1.5rem',
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
            display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="" width={40} height={40} style={{ borderRadius: '50%' }} />
            ) : (
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', fontWeight: 'bold', color: 'white'
              }}>
                {user.displayName?.charAt(0) || user.email?.charAt(0)}
              </div>
            )}
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px', color: isDark ? '#ffffff' : '#0f1117' }}>
                {user.displayName || 'Football Fan'}
              </div>
              <div style={{ fontSize: '12px', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
                {user.email}
              </div>
            </div>
          </div>
        )}

        {/* Nav links */}
<div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
  {NAV_LINKS.map(link => {
    const isActive = location.pathname === link.path;
    return (
      <Link key={link.path} to={link.path} onClick={onClose}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '0.75rem 1rem', borderRadius: '10px',
          marginBottom: '4px', textDecoration: 'none',
          background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
          border: isActive ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
          color: isActive ? '#60a5fa' : isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
          fontWeight: isActive ? '600' : '400', fontSize: '14px',
          transition: 'all 0.2s',
          boxShadow: isActive ? '0 0 12px rgba(59,130,246,0.15)' : 'none'
        }}>
        <span style={{ fontSize: '18px' }}>{link.icon}</span>
        {link.label}
        {isActive && <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />}
      </Link>
    );
  })}

  {/* Tools section */}
  <div style={{
    marginTop: '1rem', marginBottom: '0.5rem',
    padding: '0 0.5rem',
    display: 'flex', alignItems: 'center', gap: '8px'
  }}>
    <div style={{ flex: 1, height: '1px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
    <span style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
      🔧 Tools
    </span>
    <div style={{ flex: 1, height: '1px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
  </div>

  {TOOL_LINKS.map(link => {
    const isActive = location.pathname === link.path;
    return (
      <Link key={link.path} to={link.path} onClick={onClose}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '0.75rem 1rem', borderRadius: '10px',
          marginBottom: '4px', textDecoration: 'none',
          background: isActive ? 'rgba(139,92,246,0.15)' : 'transparent',
          border: isActive ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent',
          color: isActive ? '#a78bfa' : isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
          fontWeight: isActive ? '600' : '400', fontSize: '14px',
          transition: 'all 0.2s',
          boxShadow: isActive ? '0 0 12px rgba(139,92,246,0.15)' : 'none'
        }}>
        <span style={{ fontSize: '18px' }}>{link.icon}</span>
        {link.label}
        {isActive && <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#a78bfa' }} />}
      </Link>
    );
  })}
</div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
        }}>
          {/* Dark/Light mode toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.75rem 1rem', borderRadius: '10px',
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            marginBottom: '0.75rem'
          }}>
            <span style={{ fontSize: '14px', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
              {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </span>
            <div
              onClick={() => setIsDark(!isDark)}
              style={{
                width: '44px', height: '24px', borderRadius: '12px',
                background: isDark ? '#3b82f6' : 'rgba(0,0,0,0.2)',
                position: 'relative', cursor: 'pointer', transition: 'background 0.3s'
              }}
            >
              <div style={{
                position: 'absolute', top: '2px',
                left: isDark ? '22px' : '2px',
                width: '20px', height: '20px', borderRadius: '50%',
                background: 'white', transition: 'left 0.3s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </div>
          </div>

          {/* Logout */}
          {user && (
            <button onClick={logout} style={{
              width: '100%', padding: '0.75rem',
              borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.1)', color: '#f87171',
              cursor: 'pointer', fontSize: '14px', fontWeight: '500',
              fontFamily: 'inherit', transition: 'all 0.2s'
            }}>
              🚪 Sign Out
            </button>
          )}
        </div>
      </div>
    </>
  );
}