import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LEAGUES } from '../services/footballAPI';
import { glass, leagueButtonStyle } from '../styles/glass';

const api = axios.create({
  baseURL: '/v4',
  headers: { 'X-Auth-Token': process.env.REACT_APP_FOOTBALL_API_KEY }
});

export default function Matches() {
  const [selectedLeague, setSelectedLeague] = useState('PL');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const fetchMatches = (league, showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    api.get(`/competitions/${league}/matches`)
      .then(res => {
        setMatches(res.data.matches);
        setLastUpdated(new Date());
        setLoading(false);
      })
      .catch(() => { setError('Failed to load matches.'); setLoading(false); });
  };

  useEffect(() => {
    fetchMatches(selectedLeague, true);
    intervalRef.current = setInterval(() => fetchMatches(selectedLeague, false), 60000);
    return () => clearInterval(intervalRef.current);
  }, [selectedLeague]);

  const getStatusStyle = (status) => {
    if (status === 'IN_PLAY') return { color: 'white', background: 'linear-gradient(135deg, #16a34a, #15803d)', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' };
    if (status === 'FINISHED') return { color: glass.colors.muted, fontSize: '12px' };
    return { color: glass.colors.blue, fontSize: '12px' };
  };

  const getStatusLabel = (status) => {
    if (status === 'IN_PLAY') return '🔴 LIVE';
    if (status === 'FINISHED') return 'FT';
    if (status === 'SCHEDULED') return 'Upcoming';
    return status;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) +
      ' ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const groupedMatches = matches.reduce((acc, match) => {
    const date = new Date(match.utcDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(match);
    return acc;
  }, {});

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }} className="fade-in">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{
          fontSize: '24px', fontWeight: '700',
          background: 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.7))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
        }}>⚽ Matches</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: glass.colors.muted }}>
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: '#16a34a', display: 'inline-block',
            animation: 'pulse-live 2s infinite'
          }} />
          {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : 'Loading...'}
          <button onClick={() => fetchMatches(selectedLeague, true)} style={{
            ...glass.button.secondary, padding: '4px 10px', fontSize: '12px'
          }}>🔄 Refresh</button>
        </div>
      </div>

      {/* League selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {Object.entries(LEAGUES).map(([code, league]) => (
          <button key={code} onClick={() => setSelectedLeague(code)}
            style={leagueButtonStyle(selectedLeague === code)}>
            {league.flag} {league.name}
          </button>
        ))}
      </div>

      {loading && <div style={{ ...glass.card, padding: '3rem', textAlign: 'center', color: glass.colors.muted }}>Loading matches...</div>}
      {error && <p style={{ color: glass.colors.red }}>{error}</p>}
      {!loading && !error && matches.length === 0 && <p style={{ color: glass.colors.muted }}>No matches found.</p>}

      {!loading && !error && Object.entries(groupedMatches).map(([date, dayMatches]) => (
        <div key={date} style={{ marginBottom: '1.5rem' }}>
          <h3 style={{
            fontSize: '11px', fontWeight: '600', color: glass.colors.muted,
            textTransform: 'uppercase', letterSpacing: '1px',
            marginBottom: '0.75rem', paddingBottom: '0.5rem',
            borderBottom: `1px solid ${glass.colors.border}`
          }}>{date}</h3>

          {dayMatches.map(match => (
            <div key={match.id} onClick={() => navigate(`/match/${match.id}`)}
              className="hover-glow"
              style={{
                ...glass.card,
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', padding: '1rem 1.5rem',
                marginBottom: '0.5rem', borderRadius: '12px',
                border: match.status === 'IN_PLAY'
                  ? '1px solid rgba(22, 163, 74, 0.4)'
                  : '1px solid rgba(255,255,255,0.06)',
                background: match.status === 'IN_PLAY'
                  ? 'rgba(22, 163, 74, 0.08)'
                  : 'rgba(255,255,255,0.02)',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '35%' }}>
                <img src={match.homeTeam.crest} alt="" width={28} />
                <span style={{ fontWeight: '500', color: glass.colors.text, fontSize: '14px' }}>
                  {match.homeTeam.shortName || match.homeTeam.name}
                </span>
              </div>

              <div style={{ textAlign: 'center', width: '30%' }}>
                {match.status === 'SCHEDULED' ? (
                  <div>
                    <div style={{ fontSize: '13px', color: glass.colors.muted }}>{formatDate(match.utcDate)}</div>
                    <div style={getStatusStyle(match.status)}>{getStatusLabel(match.status)}</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: glass.colors.text }}>
                      {match.score.fullTime.home ?? '-'} : {match.score.fullTime.away ?? '-'}
                    </div>
                    <div style={getStatusStyle(match.status)}>{getStatusLabel(match.status)}</div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '35%', justifyContent: 'flex-end' }}>
                <span style={{ fontWeight: '500', color: glass.colors.text, fontSize: '14px' }}>
                  {match.awayTeam.shortName || match.awayTeam.name}
                </span>
                <img src={match.awayTeam.crest} alt="" width={28} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}