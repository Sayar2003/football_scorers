import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function TopBar({ onMenuClick }) {
  const [search, setSearch] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark } = useTheme();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search)}`);
      setSearch('');
    }
  };

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 30,
      height: '64px', display: 'flex', alignItems: 'center',
      padding: '0 1rem', gap: '0.75rem',
      background: isDark ? 'rgba(10,14,26,0.9)' : 'rgba(240,245,255,0.9)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
    }}>

      {/* Menu button */}
      <button onClick={onMenuClick} style={{
        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
        borderRadius: '10px',
        color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
        cursor: 'pointer', padding: '8px 12px', fontSize: '18px',
        transition: 'all 0.2s', flexShrink: 0,
      }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 12px rgba(59,130,246,0.3)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
      >☰</button>

      {/* Search bar */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '500px', display: 'flex', gap: '0.5rem' }}>
          <span style={{
            position: 'absolute', left: '14px', top: '50%',
            transform: 'translateY(-50%)', fontSize: '14px', opacity: 0.5, zIndex: 1
          }}>🔍</span>
          <input
            type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search teams, players..."
            style={{
              flex: 1, padding: '0.55rem 1rem 0.55rem 2.5rem',
              borderRadius: '12px', fontSize: '14px',
              fontFamily: 'inherit', outline: 'none',
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
              color: isDark ? '#ffffff' : '#0f1117',
              transition: 'all 0.2s',
            }}
            onFocus={e => {
              e.target.style.border = '1px solid rgba(59,130,246,0.5)';
              e.target.style.boxShadow = '0 0 15px rgba(59,130,246,0.15)';
            }}
            onBlur={e => {
              e.target.style.border = isDark
                ? '1px solid rgba(255,255,255,0.1)'
                : '1px solid rgba(0,0,0,0.1)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button
            onClick={() => {
              if (search.trim()) {
                navigate(`/search?q=${encodeURIComponent(search)}`);
                setSearch('');
              }
            }}
            style={{
              padding: '0.55rem 1rem', borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              border: 'none', color: 'white', cursor: 'pointer',
              fontSize: '13px', fontWeight: '500',
              fontFamily: 'inherit', transition: 'all 0.2s', flexShrink: 0
            }}
          >Search</button>
        </div>
      </div>

      {/* User icon */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          style={{
            background: 'none', border: 'none',
            borderRadius: '50%', cursor: 'pointer', padding: 0,
            width: '38px', height: '38px', overflow: 'hidden',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 15px rgba(59,130,246,0.4)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" width={38} height={38} style={{ borderRadius: '50%' }} />
          ) : (
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '15px', fontWeight: 'bold', color: 'white'
            }}>
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '👤'}
            </div>
          )}
        </button>

        {/* Dropdown */}
        {showUserMenu && (
          <div style={{
            position: 'absolute', right: 0, top: '46px',
            width: '200px', borderRadius: '12px',
            background: isDark ? 'rgba(15,17,23,0.97)' : 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            zIndex: 100, overflow: 'hidden'
          }}>
            <div style={{
              padding: '0.75rem 1rem',
              borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)'
            }}>
              <div style={{ fontWeight: '600', fontSize: '13px', color: isDark ? '#ffffff' : '#0f1117' }}>
                {user?.displayName || 'Football Fan'}
              </div>
              <div style={{ fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
            <div style={{ padding: '0.4rem' }}>
              {[
                { label: '⭐ My Favorites', action: () => { navigate('/favorites'); setShowUserMenu(false); } },
                { label: '🔍 Search', action: () => { navigate('/search'); setShowUserMenu(false); } },
              ].map((item, i) => (
                <button key={i} onClick={item.action} style={{
                  width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px',
                  border: 'none', background: 'transparent',
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                  cursor: 'pointer', fontSize: '13px', textAlign: 'left',
                  fontFamily: 'inherit', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >{item.label}</button>
              ))}
              <button onClick={() => { logout(); setShowUserMenu(false); }} style={{
                width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px',
                border: 'none', background: 'transparent',
                color: '#f87171', cursor: 'pointer', fontSize: '13px',
                textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >🚪 Sign Out</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}