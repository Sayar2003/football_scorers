import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFavorites, toggleFavoriteTeam, toggleFavoriteLeague, toggleFavoritePlayer } from '../utils/favorites';
import { useTheme } from '../context/ThemeContext';
import { getGlass } from '../styles/glass';

export default function Favorites() {
  const [favorites, setFavorites] = useState(getFavorites());
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const glass = getGlass(isDark);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const handleRemoveTeam = (team) => {
    const updated = toggleFavoriteTeam(team);
    setFavorites({ ...updated });
  };

  const handleRemoveLeague = (league) => {
    const updated = toggleFavoriteLeague(league.code, league.name, league.flag);
    setFavorites({ ...updated });
  };

  const handleRemovePlayer = (player) => {
    const updated = toggleFavoritePlayer(player);
    setFavorites({ ...updated });
  };

  const isEmpty = favorites.teams.length === 0 && favorites.leagues.length === 0 && favorites.players.length === 0;

  // Cross-theme generic styles for remove buttons
  const removeBtnStyle = {
    background: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)',
    border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '6px',
    color: isDark ? glass.colors.red : '#dc2626',
    cursor: 'pointer',
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }} className="fade-in">
      <h1 style={{
        fontSize: '24px', 
        fontWeight: '700', 
        marginBottom: '0.5rem',
        color: glass.colors.text,
        background: isDark 
          ? 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)' 
          : 'linear-gradient(135deg, #0f1117 0%, rgba(15,17,23,0.7) 100%)',
        WebkitBackgroundClip: 'text', 
        WebkitTextFillColor: 'transparent', 
        backgroundClip: 'text'
      }}>
        ⭐ Favorites
      </h1>
      <p style={{ color: glass.colors.muted, fontSize: '14px', marginBottom: '1.5rem' }}>
        Your saved teams, leagues and players
      </p>

      {isEmpty && (
        <div style={{ ...glass.card, textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ fontSize: '48px', marginBottom: '1rem' }}>⭐</p>
          <p style={{ color: glass.colors.text, fontSize: '18px', fontWeight: '600', marginBottom: '0.5rem' }}>
            No favorites yet
          </p>
          <p style={{ color: glass.colors.muted, fontSize: '14px', marginBottom: '1.5rem' }}>
            Star teams from the Standings page, players from Top Scorers, and leagues from Matches
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/')} 
              style={{ 
                ...(glass.button?.primary || {}), 
                padding: '0.5rem 1.5rem',
                cursor: 'pointer',
                borderRadius: '8px',
                fontWeight: '600',
                border: 'none',
                backgroundColor: '#3b82f6',
                color: '#ffffff'
              }}
            >
              Browse Standings
            </button>
            <button 
              onClick={() => navigate('/scorers')} 
              style={{ 
                ...(glass.button?.secondary || {}), 
                padding: '0.5rem 1.5rem',
                cursor: 'pointer',
                borderRadius: '8px',
                fontWeight: '600',
                border: `1px solid ${glass.colors.border}`,
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                color: glass.colors.text
              }}
            >
              Browse Scorers
            </button>
          </div>
        </div>
      )}

      {/* Favorite Teams Section */}
      {favorites.teams.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: glass.colors.text, marginBottom: '1rem' }}>
            🏟️ Teams ({favorites.teams.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {favorites.teams.map(team => (
              <div key={team.id} style={{ ...glass.card, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img 
                  src={team.crest} 
                  alt={team.name} 
                  width={40} 
                  height={40}
                  style={{ cursor: 'pointer', objectFit: 'contain' }}
                  onClick={() => navigate(`/team/${team.id}`)} 
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div 
                    onClick={() => navigate(`/team/${team.id}`)}
                    style={{ 
                      color: glass.colors.text, 
                      fontWeight: '600', 
                      fontSize: '14px', 
                      cursor: 'pointer',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {team.name}
                  </div>
                </div>
                <button onClick={() => handleRemoveTeam(team)} style={removeBtnStyle}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorite Leagues Section */}
      {favorites.leagues.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: glass.colors.text, marginBottom: '1rem' }}>
            🏆 Leagues ({favorites.leagues.length})
          </h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {favorites.leagues.map(league => (
              <div key={league.code} style={{
                ...glass.card, 
                padding: '0.75rem 1.25rem',
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem'
              }}>
                <span style={{ fontSize: '20px', lineHeight: '1' }}>{league.flag}</span>
                <span style={{ color: glass.colors.text, fontWeight: '500', fontSize: '14px' }}>{league.name}</span>
                <button onClick={() => handleRemoveLeague(league)} style={removeBtnStyle}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorite Players Section */}
      {favorites.players.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: glass.colors.text, marginBottom: '1rem' }}>
            👤 Players ({favorites.players.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {favorites.players.map(player => (
              <div key={player.id} style={{ ...glass.card, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div 
                  style={{
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: 'white', 
                    flexShrink: 0,
                    cursor: 'pointer',
                    boxShadow: !isDark ? '0 2px 8px rgba(59, 130, 246, 0.2)' : 'none'
                  }} 
                  onClick={() => navigate(`/player/${player.id}`)}
                >
                  {player.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div 
                    onClick={() => navigate(`/player/${player.id}`)}
                    style={{ 
                      color: glass.colors.text, 
                      fontWeight: '600', 
                      fontSize: '14px', 
                      cursor: 'pointer',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {player.name}
                  </div>
                  <div style={{ 
                    color: glass.colors.muted, 
                    fontSize: '12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap' 
                  }}>
                    {player.nationality}
                  </div>
                </div>
                <button onClick={() => handleRemovePlayer(player)} style={removeBtnStyle}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}