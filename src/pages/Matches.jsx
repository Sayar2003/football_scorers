import { useState, useEffect } from 'react';
import axios from 'axios';
import { LEAGUES } from '../services/footballAPI';

const api = axios.create({
  baseURL: '/v4',
  headers: {
    'X-Auth-Token': process.env.REACT_APP_FOOTBALL_API_KEY
  }
});

export default function Matches() {
  const [selectedLeague, setSelectedLeague] = useState('PL');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get(`/competitions/${selectedLeague}/matches`)
      .then(res => {
        setMatches(res.data.matches);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load matches.');
        setLoading(false);
      });
  }, [selectedLeague]);

  const getStatusStyle = (status) => {
    if (status === 'IN_PLAY') return { color: 'white', backgroundColor: '#16a34a', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' };
    if (status === 'FINISHED') return { color: '#6b7280', fontSize: '12px' };
    return { color: '#2563eb', fontSize: '12px' };
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

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h1>⚽ Matches</h1>

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
              border: '2px solid',
              borderColor: selectedLeague === code ? '#2563eb' : '#ccc',
              backgroundColor: selectedLeague === code ? '#2563eb' : 'white',
              color: selectedLeague === code ? 'white' : 'black',
              fontWeight: selectedLeague === code ? 'bold' : 'normal'
            }}
          >
            {league.flag} {league.name}
          </button>
        ))}
      </div>

      {loading && <p>Loading matches...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && matches.length === 0 && (
        <p>No matches found.</p>
      )}

      {!loading && !error && matches.map(match => (
        <div key={match.id} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          marginBottom: '0.75rem',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          backgroundColor: match.status === 'IN_PLAY' ? '#f0fdf4' : 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          {/* Home team */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '35%' }}>
            <img src={match.homeTeam.crest} alt="" width={28} />
            <span style={{ fontWeight: '500' }}>{match.homeTeam.shortName || match.homeTeam.name}</span>
          </div>

          {/* Score / Time */}
          <div style={{ textAlign: 'center', width: '30%' }}>
            {match.status === 'SCHEDULED' ? (
              <div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>{formatDate(match.utcDate)}</div>
                <div style={getStatusStyle(match.status)}>{getStatusLabel(match.status)}</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '22px', fontWeight: 'bold' }}>
                  {match.score.fullTime.home ?? '-'} : {match.score.fullTime.away ?? '-'}
                </div>
                <div style={getStatusStyle(match.status)}>{getStatusLabel(match.status)}</div>
              </div>
            )}
          </div>

          {/* Away team */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '35%', justifyContent: 'flex-end' }}>
            <span style={{ fontWeight: '500' }}>{match.awayTeam.shortName || match.awayTeam.name}</span>
            <img src={match.awayTeam.crest} alt="" width={28} />
          </div>
        </div>
      ))}
    </div>
  );
}