import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { glass } from '../styles/glass';

const api = axios.create({
  baseURL: '/v4',
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

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get(`/teams/${id}`), api.get(`/teams/${id}/matches?status=FINISHED&limit=5`)])
      .then(([teamRes, matchRes]) => {
        setTeam(teamRes.data); setMatches(matchRes.data.matches); setLoading(false);
      })
      .catch(() => { setError('Failed to load team details.'); setLoading(false); });
  }, [id]);

  if (loading) return <p style={{ padding: '2rem', color: glass.colors.muted }}>Loading team details...</p>;
  if (error) return <p style={{ padding: '2rem', color: glass.colors.red }}>{error}</p>;
  if (!team) return null;

  const tabStyle = (tab) => ({
    padding: '0.6rem 1.5rem', cursor: 'pointer', borderRadius: '8px', border: 'none',
    fontWeight: '600', fontSize: '14px',
    background: activeTab === tab ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'rgba(255,255,255,0.05)',
    color: activeTab === tab ? 'white' : glass.colors.muted,
    transition: 'all 0.2s ease'
  });

  const grouped = team.squad.reduce((acc, player) => {
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
      <div style={{ ...glass.cardStrong, display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <img src={team.crest} alt={team.name} width={80} />
        <div>
          <h1 style={{
            fontSize: '28px', marginBottom: '0.3rem',
            background: 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.8))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
          }}>{team.name}</h1>
          <p style={{ color: glass.colors.muted, fontSize: '14px' }}>📍 {team.venue}</p>
          <p style={{ color: glass.colors.muted, fontSize: '14px' }}>🏠 Founded: {team.founded}</p>
          <p style={{ color: glass.colors.muted, fontSize: '14px' }}>🌐 {team.area?.name}</p>
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
                        color: 'white', display: 'flex', alignItems: 'center',
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
          <h3 style={{ marginBottom: '1rem', fontSize: '16px', color: glass.colors.text }}>Last 5 Matches</h3>
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
                <span style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: resultColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px', flexShrink: 0 }}>{result}</span>
                <div style={{ flex: 1, marginLeft: '1rem', color: glass.colors.text }}>
                  <span>{isHome ? 'vs' : '@'} </span>
                  <img src={opponent.crest} alt="" width={18} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
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