import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStandings, LEAGUES } from '../services/footballAPI';

const dark = {
  bg: '#0f1117',
  card: '#1a1d27',
  border: '#2d3148',
  text: '#ffffff',
  muted: '#9ca3af',
  blue: '#3b82f6',
};

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
        setError('Failed to load standings.');
        setLoading(false);
      });
  }, [selectedLeague]);

  const getFormColor = (result) => {
    if (result === 'W') return { backgroundColor: '#16a34a', color: 'white' };
    if (result === 'L') return { backgroundColor: '#dc2626', color: 'white' };
    if (result === 'D') return { backgroundColor: '#d97706', color: 'white' };
    return { backgroundColor: '#374151', color: '#9ca3af' };
  };

  const parseForm = (form) => {
    if (!form) return [];
    return form.split(',').slice(-5);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '1.5rem', color: dark.text }}>
        📊 Standings
      </h1>

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

      {loading && <p style={{ color: dark.muted }}>Loading standings...</p>}
      {error && <p style={{ color: '#ef4444' }}>{error}</p>}

      {!loading && !error && (
        <div style={{ borderRadius: '12px', border: `1px solid ${dark.border}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#13161f' }}>
                <th style={th}>#</th>
                <th style={{ ...th, textAlign: 'left' }}>Team</th>
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
              {standings.map((row, index) => {
                const form = parseForm(row.form);
                return (
                  <tr
                    key={row.team.id}
                    style={{
                      borderTop: `1px solid ${dark.border}`,
                      backgroundColor: index % 2 === 0 ? dark.card : '#1e2130',
                      transition: 'background 0.2s'
                    }}
                  >
                    <td style={{ ...td, textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px', height: '24px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor:
                          row.position <= 4 ? '#1e3a5f' :
                          row.position === 5 ? '#3d2e00' :
                          row.position >= 18 ? '#3d0000' : 'transparent',
                        color:
                          row.position <= 4 ? '#60a5fa' :
                          row.position === 5 ? '#fbbf24' :
                          row.position >= 18 ? '#f87171' : dark.muted
                      }}>
                        {row.position}
                      </span>
                    </td>

                    <td style={{ ...td, textAlign: 'left' }}>
                      <span
                        onClick={() => navigate(`/team/${row.team.id}`)}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                      >
                        <img src={row.team.crest} alt="" width={22} />
                        <span style={{ color: dark.text, fontWeight: '500' }}>{row.team.name}</span>
                      </span>
                    </td>

                    <td style={td}>{row.playedGames}</td>
                    <td style={td}>{row.won}</td>
                    <td style={td}>{row.draw}</td>
                    <td style={td}>{row.lost}</td>
                    <td style={td}>{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                    <td style={{ ...td, fontWeight: 'bold', color: dark.blue }}>{row.points}</td>

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
                        )) : <span style={{ color: dark.muted, fontSize: '12px' }}>N/A</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      {!loading && !error && (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '12px', color: dark.muted, flexWrap: 'wrap' }}>
          <span><span style={{ backgroundColor: '#1e3a5f', color: '#60a5fa', padding: '1px 6px', borderRadius: '4px' }}>Top 4</span> Champions League</span>
          <span><span style={{ backgroundColor: '#3d2e00', color: '#fbbf24', padding: '1px 6px', borderRadius: '4px' }}>5th</span> Europa League</span>
          <span><span style={{ backgroundColor: '#3d0000', color: '#f87171', padding: '1px 6px', borderRadius: '4px' }}>18-20</span> Relegation</span>
        </div>
      )}
    </div>
  );
}

const th = { padding: '10px 12px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textAlign: 'center' };
const td = { padding: '10px 12px', fontSize: '13px', color: '#9ca3af', textAlign: 'center' };