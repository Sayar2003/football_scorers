import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStandings, LEAGUES } from '../services/footballAPI';

export default function Standings() {
  const [selectedLeague, setSelectedLeague] = useState('PL');
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    getStandings(selectedLeague)
      .then(res => {
        setStandings(res.data.standings[0].table);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load standings. Check your API key.');
        setLoading(false);
      });
  }, [selectedLeague]);

  const getFormColor = (result) => {
    if (result === 'W') return { backgroundColor: '#16a34a', color: 'white' };
    if (result === 'L') return { backgroundColor: '#dc2626', color: 'white' };
    if (result === 'D') return { backgroundColor: '#d97706', color: 'white' };
    return { backgroundColor: '#e5e7eb', color: '#6b7280' };
  };

  const parseForm = (form) => {
    if (!form) return [];
    return form.split(',').slice(-5);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>📊 Standings</h1>

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
              <th style={th}>Form</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => {
              const form = parseForm(row.form);
              return (
                <tr
                  key={row.team.id}
                  style={{ borderBottom: '1px solid #e5e7eb' }}
                >
                  {/* Position */}
                  <td style={td}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '24px', height: '24px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor:
                        row.position <= 4 ? '#dbeafe' :
                        row.position === 5 ? '#fef3c7' :
                        row.position >= 18 ? '#fee2e2' : 'transparent',
                      color:
                        row.position <= 4 ? '#1d4ed8' :
                        row.position === 5 ? '#92400e' :
                        row.position >= 18 ? '#991b1b' : '#374151'
                    }}>
                      {row.position}
                    </span>
                  </td>

                  {/* Team */}
                  <td style={td}>
                    <span
                      onClick={() => navigate(`/team/${row.team.id}`)}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <img src={row.team.crest} alt="" width={22} />
                      <span style={{ fontWeight: '500' }}>{row.team.name}</span>
                    </span>
                  </td>

                  <td style={td}>{row.playedGames}</td>
                  <td style={td}>{row.won}</td>
                  <td style={td}>{row.draw}</td>
                  <td style={td}>{row.lost}</td>
                  <td style={td}>{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                  <td style={{ ...td, fontWeight: 'bold' }}>{row.points}</td>

                  {/* Form */}
                  <td style={td}>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {form.length > 0 ? form.map((result, i) => (
                        <span key={i} style={{
                          ...getFormColor(result),
                          width: '20px', height: '20px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {result}
                        </span>
                      )) : (
                        <span style={{ color: '#9ca3af', fontSize: '12px' }}>N/A</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Legend */}
      {!loading && !error && (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '12px', color: '#6b7280' }}>
          <span><span style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Top 4</span> Champions League</span>
          <span><span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>5th</span> Europa League</span>
          <span><span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>18-20</span> Relegation</span>
        </div>
      )}
    </div>
  );
}

const th = { padding: '10px 12px', fontSize: '13px', fontWeight: '600', color: '#6b7280' };
const td = { padding: '10px 12px', fontSize: '14px' };