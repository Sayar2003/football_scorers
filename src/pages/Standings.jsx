import { useState, useEffect } from 'react';
import { getStandings, LEAGUES } from '../services/footballAPI';

export default function Standings() {
  const [selectedLeague, setSelectedLeague] = useState('PL');
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getStandings(selectedLeague)
      .then(res => {
        setStandings(res.data.standings[0].table);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load standings. Check your API key.');
        setLoading(false);
      });
  }, [selectedLeague]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h1>📊 Standings</h1>

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

      {/* Content */}
      {loading && <p>Loading standings...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
              <th style={th}>#</th>
              <th style={th}>Team</th>
              <th style={th}>P</th>
              <th style={th}>W</th>
              <th style={th}>D</th>
              <th style={th}>L</th>
              <th style={th}>GD</th>
              <th style={th}>Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => (
              <tr key={row.team.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={td}>{row.position}</td>
                <td style={td}>
                  <img src={row.team.crest} alt="" width={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  {row.team.name}
                </td>
                <td style={td}>{row.playedGames}</td>
                <td style={td}>{row.won}</td>
                <td style={td}>{row.draw}</td>
                <td style={td}>{row.lost}</td>
                <td style={td}>{row.goalDifference}</td>
                <td style={{ ...td, fontWeight: 'bold' }}>{row.points}</td>
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