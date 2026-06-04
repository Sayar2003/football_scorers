import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { isFavoriteTeam, toggleFavoriteTeam } from '../utils/favorites';
import { useTheme } from '../context/ThemeContext';
import { getGlass } from '../styles/glass';

import { API_BASE_URL } from '../config/apiConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'X-Auth-Token': process.env.REACT_APP_FOOTBALL_API_KEY }
});

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('squad');
  const [isFav, setIsFav] = useState(() => isFavoriteTeam(parseInt(id)));
  const { isDark } = useTheme();
  const glass = getGlass(isDark);

  const handleFavorite = () => {
    if (!team) return;
    toggleFavoriteTeam({ id: parseInt(id), name: team.name, crest: team.crest });
    setIsFav(!isFav);
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      api.get(`/teams/${id}`), 
      api.get(`/teams/${id}/matches?status=FINISHED&limit=5`)
    ])
      .then(([teamRes, matchRes]) => {
        if (isMounted) {
          setTeam(teamRes.data); 
          setMatches(matchRes.data.matches); 
          setLoading(false);
        }
      })
      .catch(() => { 
        if (isMounted) {
          setError('Failed to load team details.'); 
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [id]);

  if (loading) return <p style={{ padding: '2rem', color: glass.colors.muted }}>Loading team details...</p>;
  if (error) return <p style={{ padding: '2rem', color: glass.colors.red }}>{error}</p>;
  if (!team) return null;

  const tabStyle = (tab) => ({
    padding: '0.6rem 1.5rem', cursor: 'pointer', borderRadius: '8px', border: 'none',
    fontWeight: '600', fontSize: '14px',
    background: activeTab === tab 
      ? 'linear-gradient(135deg, #3b82f6, #2563eb)' 
      : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
    color: activeTab === tab ? '#ffffff' : glass.colors.muted,
    transition: 'all 0.2s ease'
  });

  const grouped = (team.squad || []).reduce((acc, player) => {
    const pos = player.position || 'Unknown';
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(player);
    return acc;
  }, {});

  const positionOrder = ['Goalkeeper', 'Defence', 'Midfield', 'Offence', 'Unknown'];

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }} className="fade-in">
      <button onClick={() => navigate(-1)} style={{ ...glass.button.secondary, padding: '0.5rem 1rem', marginBottom: '1.5rem' }}>
        ← Back
      </button>

      {/* Team header */}
      <div style={{ ...glass.cardStrong, display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <img src={team.crest} alt={team.name} width={80} height={80} style={{ objectFit: 'contain' }} />
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h1 style={{
            fontSize: '28px', fontWeight: '700', marginBottom: '0.3rem',
            background: isDark 
              ? 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.8))' 
              : `linear-gradient(135deg, ${glass.colors.text}, ${glass.colors.muted})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
          }}>{team.name}</h1>
          <p style={{ color: glass.colors.muted, fontSize: '14px', margin: '2px 0' }}>📍 {team.venue || 'Unknown Venue'}</p>
          <p style={{ color: glass.colors.muted, fontSize: '14px', margin: '2px 0' }}>🏠 Founded: {team.founded || 'N/A'}</p>
          <p style={{ color: glass.colors.muted, fontSize: '14px', margin: '2px 0' }}>🌐 {team.area?.name}</p>
          <button onClick={handleFavorite} style={{
            background: isFav ? 'rgba(245,158,11,0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
            border: `1px solid ${isFav ? 'rgba(245,158,11,0.4)' : glass.colors.border}`,
            borderRadius: '8px', color: isFav ? '#fbbf24' : glass.colors.muted,
            cursor: 'pointer', padding: '6px 12px', fontSize: '14px', marginTop: '0.5rem'
          }}>
            {isFav ? '⭐ Saved' : '☆ Save Team'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button style={tabStyle('squad')} onClick={() => setActiveTab('squad')}>👥 Squad</button>
        <button style={tabStyle('form')} onClick={() => setActiveTab('form')}>📊 Recent Form</button>
      </div>

      {activeTab === 'squad' && (
        <div>
          {positionOrder.map(position => (
            grouped[position] ? (
              <div key={position} style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '11px', fontWeight: '700', color: glass.colors.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: `1px solid ${glass.colors.border}` }}>
                  {position}
                </h3>
                {grouped[position].map(player => (
                  <div key={player.id} onClick={() => navigate(`/player/${player.id}`)}
                    className="hover-glow"
                    style={{
                      ...glass.card, display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', padding: '0.6rem 1rem',
                      marginBottom: '4px', borderRadius: '8px', cursor: 'pointer'
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        color: '#ffffff', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0
                      }}>{player.shirtNumber ?? '?'}</span>
                      <span style={{ fontWeight: '500', color: glass.colors.text }}>{player.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', color: glass.colors.muted, fontSize: '13px' }}>
                      <span>🌍 {player.nationality}</span>
                      <span>🎂 {player.dateOfBirth ? new Date().getFullYear() - new Date(player.dateOfBirth).getFullYear() + ' yrs' : 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : null
          ))}
        </div>
      )}

      {activeTab === 'form' && (
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '16px', color: glass.colors.text, fontWeight: '600' }}>Last 5 Matches</h3>
          {matches.length === 0 && <p style={{ color: glass.colors.muted }}>No recent matches found.</p>}
          {matches.map(match => {
            const isHome = match.homeTeam.id === parseInt(id);
            const opponent = isHome ? match.awayTeam : match.homeTeam;
            const myScore = isHome ? match.score.fullTime.home : match.score.fullTime.away;
            const oppScore = isHome ? match.score.fullTime.away : match.score.fullTime.home;
            const result = myScore > oppScore ? 'W' : myScore < oppScore ? 'L' : 'D';
            const resultColor = result === 'W' ? '#16a34a' : result === 'L' ? '#dc2626' : '#d97706';

            return (
              <div key={match.id} className="hover-glow"
                style={{ ...glass.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', marginBottom: '0.5rem', borderRadius: '10px' }}>
                <span style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: resultColor, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px', flexShrink: 0 }}>{result}</span>
                <div style={{ flex: 1, marginLeft: '1rem', color: glass.colors.text, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: glass.colors.muted }}>{isHome ? 'vs' : '@'}</span>
                  <img src={opponent.crest} alt="" width={18} height={18} style={{ objectFit: 'contain' }} />
                  <span style={{ fontWeight: '500' }}>{opponent.shortName || opponent.name}</span>
                </div>
                <span style={{ fontWeight: 'bold', color: glass.colors.text }}>{myScore} - {oppScore}</span>
                <span style={{ color: glass.colors.muted, fontSize: '12px', marginLeft: '1rem' }}>
                  {new Date(match.utcDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}