import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFavorites, toggleFavoriteTeam, toggleFavoriteLeague, toggleFavoritePlayer } from '../utils/favorites';
import { glass } from '../styles/glass';

export default function Favorites() {
  const [favorites, setFavorites] = useState(getFavorites());
  const navigate = useNavigate();

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

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }} className="fade-in">
      <h1 style={{
        fontSize: '24px', fontWeight: '700', marginBottom: '0.5rem',
        background: 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.7))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
      }}>⭐ Favorites</h1>
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
            <button onClick={() => navigate('/')} style={{ ...glass.button.primary, padding: '0.5rem 1.5rem' }}>
              Browse Standings
            </button>
            <button onClick={() => navigate('/scorers')} style={{ ...glass.button.secondary, padding: '0.5rem 1.5rem' }}>
              Browse Scorers
            </button>
          </div>
        </div>
      )}

      {/* Favorite Teams */}
      {favorites.teams.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: glass.colors.text, marginBottom: '1rem' }}>
            🏟️ Teams ({favorites.teams.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {favorites.teams.map(team => (
              <div key={team.id} style={{ ...glass.card, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src={team.crest} alt={team.name} width={40} style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/team/${team.id}`)} />
                <div style={{ flex: 1 }}>
                  <div onClick={() => navigate(`/team/${team.id}`)}
                    style={{ color: glass.colors.text, fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                    {team.name}
                  </div>
                </div>
                <button onClick={() => handleRemoveTeam(team)} style={{
                  background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '6px', color: glass.colors.red, cursor: 'pointer',
                  padding: '4px 8px', fontSize: '12px'
                }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorite Leagues */}
      {favorites.leagues.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: glass.colors.text, marginBottom: '1rem' }}>
            🏆 Leagues ({favorites.leagues.length})
          </h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {favorites.leagues.map(league => (
              <div key={league.code} style={{
                ...glass.card, padding: '0.75rem 1.5rem',
                display: 'flex', alignItems: 'center', gap: '0.75rem'
              }}>
                <span style={{ fontSize: '20px' }}>{league.flag}</span>
                <span style={{ color: glass.colors.text, fontWeight: '500' }}>{league.name}</span>
                <button onClick={() => handleRemoveLeague(league)} style={{
                  background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '6px', color: glass.colors.red, cursor: 'pointer',
                  padding: '4px 8px', fontSize: '12px'
                }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorite Players */}
      {favorites.players.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: glass.colors.text, marginBottom: '1rem' }}>
            👤 Players ({favorites.players.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {favorites.players.map(player => (
              <div key={player.id} style={{ ...glass.card, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', fontWeight: 'bold', color: 'white', flexShrink: 0,
                  cursor: 'pointer'
                }} onClick={() => navigate(`/player/${player.id}`)}>
                  {player.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div onClick={() => navigate(`/player/${player.id}`)}
                    style={{ color: glass.colors.text, fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                    {player.name}
                  </div>
                  <div style={{ color: glass.colors.muted, fontSize: '12px' }}>{player.nationality}</div>
                </div>
                <button onClick={() => handleRemovePlayer(player)} style={{
                  background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '6px', color: glass.colors.red, cursor: 'pointer',
                  padding: '4px 8px', fontSize: '12px'
                }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}