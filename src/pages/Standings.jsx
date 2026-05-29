import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStandings, LEAGUES } from '../services/footballAPI';
import { glass, leagueButtonStyle } from '../styles/glass';

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
      .then(res => { setStandings(res.data.standings[0].table); setLoading(false); })
      .catch(() => { setError('Failed to load standings.'); setLoading(false); });
  }, [selectedLeague]);

  const getFormColor = (result) => {
    if (result === 'W') return { backgroundColor: '#16a34a', color: 'white' };
    if (result === 'L') return { backgroundColor: '#dc2626', color: 'white' };
    if (result === 'D') return { backgroundColor: '#d97706', color: 'white' };
    return { backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' };
  };

  const parseForm = (form) => {
    if (!form) return [];
    return form.split(',').slice(-5);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }} className="fade-in">
      <h1 style={{
        fontSize: '24px', fontWeight: '700', marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.7))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
      }}>
        📊 Standings
      </h1>

      {/* League selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {Object.entries(LEAGUES).map(([code, league]) => (
          <button key={code} onClick={() => setSelectedLeague(code)}
            style={leagueButtonStyle(selectedLeague === code)}>
            {league.flag} {league.name}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ ...glass.card, padding: '3rem', textAlign: 'center' }}>
          <div className="shimmer" style={{ height: '400px', borderRadius: '8px' }} />
        </div>
      )}
      {error && <p style={{ color: glass.colors.red }}>{error}</p>}

      {!loading && !error && (
        <div style={{ ...glass.card, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${glass.colors.border}` }}>
                {['#', 'Team', 'P', 'W', 'D', 'L', 'GD', 'Pts', 'Form'].map(h => (
                  <th key={h} style={{
                    padding: '12px', fontSize: '11px', fontWeight: '600',
                    color: glass.colors.muted, textAlign: h === 'Team' ? 'left' : 'center',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                    background: 'rgba(0,0,0,0.2)'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {standings.map((row, index) => {
                const form = parseForm(row.form);
                return (
                  <tr key={row.team.id} className="hover-glow" style={{
                    borderBottom: `1px solid ${glass.colors.border}`,
                    transition: 'background 0.2s',
                    cursor: 'default'
                  }}>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '26px', height: '26px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold',
                        background: row.position <= 4 ? 'rgba(59,130,246,0.2)' :
                          row.position === 5 ? 'rgba(245,158,11,0.2)' :
                          row.position >= 18 ? 'rgba(239,68,68,0.2)' : 'transparent',
                        color: row.position <= 4 ? '#60a5fa' :
                          row.position === 5 ? '#fbbf24' :
                          row.position >= 18 ? '#f87171' : glass.colors.muted
                      }}>{row.position}</span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'left' }}>
                      <span onClick={() => navigate(`/team/${row.team.id}`)}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={row.team.crest} alt="" width={22} />
                        <span style={{ color: glass.colors.text, fontWeight: '500', fontSize: '14px' }}>
                          {row.team.name}
                        </span>
                      </span>
                    </td>
                    {[row.playedGames, row.won, row.draw, row.lost].map((val, i) => (
                      <td key={i} style={{ padding: '12px', textAlign: 'center', color: glass.colors.muted, fontSize: '13px' }}>{val}</td>
                    ))}
                    <td style={{ padding: '12px', textAlign: 'center', color: glass.colors.muted, fontSize: '13px' }}>
                      {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: glass.colors.blue, fontSize: '14px' }}>
                      {row.points}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '3px', justifyContent: 'center' }}>
                        {form.length > 0 ? form.map((result, i) => (
                          <span key={i} style={{
                            ...getFormColor(result),
                            width: '20px', height: '20px', borderRadius: '4px',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: 'bold'
                          }}>{result}</span>
                        )) : <span style={{ color: glass.colors.muted, fontSize: '12px' }}>N/A</span>}
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
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '12px', color: glass.colors.muted, flexWrap: 'wrap' }}>
          <span><span style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa', padding: '1px 6px', borderRadius: '4px' }}>Top 4</span> Champions League</span>
          <span><span style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24', padding: '1px 6px', borderRadius: '4px' }}>5th</span> Europa League</span>
          <span><span style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', padding: '1px 6px', borderRadius: '4px' }}>18-20</span> Relegation</span>
        </div>
      )}
    </div>
  );
}