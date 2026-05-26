import { useState, useEffect } from 'react';
import axios from 'axios';
import { LEAGUES } from '../services/footballAPI';

const api = axios.create({
  baseURL: '/v4',
  headers: {
    'X-Auth-Token': process.env.REACT_APP_FOOTBALL_API_KEY
  }
});

export default function TopScorers() {
  const [selectedLeague, setSelectedLeague] = useState('PL');
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get(`/competitions/${selectedLeague}/scorers?limit=20`)
      .then(res => {
        setScorers(res.data.scorers);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load top scorers.');
        setLoading(false);
      });
  }, [selectedLeague]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h1>🥇 Top Scorers</h1>

      {/* League selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
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

      {loading && <p>Loading top scorers...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
              <th style={th}>#</th>
              <th style={th}>Player</th>
              <th style={th}>Team</th>
              <th style={th}>Goals</th>
              <th style={th}>Assists</th>
              <th style={th}>Penalties</th>
              <th style={th}>Matches</th>
            </tr>
          </thead>
          <tbody>
            {scorers.map((item, index) => (
              <tr key={item.player.id} style={{
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: index === 0 ? '#fffbeb' : index === 1 ? '#f9fafb' : index === 2 ? '#fdf2f8' : 'white'
              }}>
                <td style={td}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </td>
                <td style={td}>
                  <div style={{ fontWeight: '600' }}>{item.player.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.player.nationality}</div>
                </td>
                <td style={td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={item.team.crest} alt="" width={20} />
                    {item.team.shortName || item.team.name}
                  </div>
                </td>
                <td style={{ ...td, fontWeight: 'bold', fontSize: '16px', color: '#2563eb' }}>
                  {item.goals}
                </td>
                <td style={td}>{item.assists ?? 0}</td>
                <td style={td}>{item.penalties ?? 0}</td>
                <td style={td}>{item.playedMatches}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th = { padding: '10px 12px', fontSize: '14px' };
const td = { padding: '10px 12px', fontSize: '14px' };