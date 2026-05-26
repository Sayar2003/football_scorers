import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LEAGUES } from '../services/footballAPI';

const api = axios.create({
  baseURL: '/v4',
  headers: {
    'X-Auth-Token': process.env.REACT_APP_FOOTBALL_API_KEY
  }
});

const dark = {
  bg: '#0f1117',
  card: '#1a1d27',
  cardHover: '#1e2130',
  border: '#2d3148',
  text: '#ffffff',
  muted: '#9ca3af',
  blue: '#3b82f6',
  green: '#16a34a',
};

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
      .catch(() => {
        setError('Failed to load matches.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMatches(selectedLeague, true);
    intervalRef.current = setInterval(() => {
      fetchMatches(selectedLeague, false);
    }, 30000);
    return () => clearInterval(intervalRef.current);
  }, [selectedLeague]);

  const getStatusStyle = (status) => {
    if (status === 'IN_PLAY') return { color: 'white', backgroundColor: dark.green, padding: '2px 8px', borderRadius: '4px', fontSize: '12px' };
    if (status === 'FINISHED') return { color: dark.muted, fontSize: '12px' };
    return { color: dark.blue, fontSize: '12px' };
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
    const date = new Date(match.utcDate).toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(match);
    return acc;
  }, {});

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: dark.text }}>⚽ Matches</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: dark.muted }}>
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: dark.green, display: 'inline-block',
            animation: 'pulse 2s infinite'
          }} />
          {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : 'Loading...'}
          <button
            onClick={() => fetchMatches(selectedLeague, true)}
            style={{
              padding: '4px 10px', borderRadius: '6px',
              border: `1px solid ${dark.border}`, cursor: 'pointer',
              fontSize: '12px', backgroundColor: dark.card,
              color: dark.muted
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* League selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {Object.entries(LEAGUES).map(([code, league]) => (
          <button
            key={code}
            onClick={() => setSelectedLeague(code)}
            style={{
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: selectedLeague === code ? dark.blue : dark.border,
              backgroundColor: selectedLeague === code ? dark.blue : dark.card,
              color: selectedLeague === code ? 'white' : dark.muted,
              fontWeight: selectedLeague === code ? '600' : 'normal',
              fontSize: '13px'
            }}
          >
            {league.flag} {league.name}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: dark.muted }}>Loading matches...</p>}
      {error && <p style={{ color: '#ef4444' }}>{error}</p>}

      {!loading && !error && matches.length === 0 && (
        <p style={{ color: dark.muted }}>No matches found.</p>
      )}

      {/* Matches grouped by date */}
      {!loading && !error && Object.entries(groupedMatches).map(([date, dayMatches]) => (
        <div key={date} style={{ marginBottom: '1.5rem' }}>
          {/* Date header */}
          <h3 style={{
            fontSize: '12px', fontWeight: '700', color: dark.muted,
            textTransform: 'uppercase', letterSpacing: '1px',
            marginBottom: '0.75rem', paddingBottom: '0.5rem',
            borderBottom: `1px solid ${dark.border}`
          }}>
            {date}
          </h3>

          {dayMatches.map(match => (
            <div
              key={match.id}
              onClick={() => navigate(`/match/${match.id}`)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.5rem',
                marginBottom: '0.5rem',
                borderRadius: '12px',
                border: match.status === 'IN_PLAY' ? `1px solid ${dark.green}` : `1px solid ${dark.border}`,
                backgroundColor: match.status === 'IN_PLAY' ? '#0f2d1a' : dark.card,
                transition: 'background 0.2s'
              }}
            >
              {/* Home team */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '35%' }}>
                <img src={match.homeTeam.crest} alt="" width={28} />
                <span style={{ fontWeight: '500', color: dark.text, fontSize: '14px' }}>
                  {match.homeTeam.shortName || match.homeTeam.name}
                </span>
              </div>

              {/* Score / Time */}
              <div style={{ textAlign: 'center', width: '30%' }}>
                {match.status === 'SCHEDULED' ? (
                  <div>
                    <div style={{ fontSize: '13px', color: dark.muted }}>{formatDate(match.utcDate)}</div>
                    <div style={getStatusStyle(match.status)}>{getStatusLabel(match.status)}</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: dark.text }}>
                      {match.score.fullTime.home ?? '-'} : {match.score.fullTime.away ?? '-'}
                    </div>
                    <div style={getStatusStyle(match.status)}>{getStatusLabel(match.status)}</div>
                  </div>
                )}
              </div>

              {/* Away team */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '35%', justifyContent: 'flex-end' }}>
                <span style={{ fontWeight: '500', color: dark.text, fontSize: '14px' }}>
                  {match.awayTeam.shortName || match.awayTeam.name}
                </span>
                <img src={match.awayTeam.crest} alt="" width={28} />
              </div>
            </div>
          ))}
        </div>
      ))}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}