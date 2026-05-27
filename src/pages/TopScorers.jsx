import { useState, useEffect } from 'react';
import axios from 'axios';
import { LEAGUES } from '../services/footballAPI';

const api = axios.create({
  baseURL: '/v4',
  headers: { 'X-Auth-Token': process.env.REACT_APP_FOOTBALL_API_KEY }
});

const dark = {
  card: '#1a1d27', border: '#2d3148',
  text: '#ffffff', muted: '#9ca3af', blue: '#3b82f6',
};

export default function TopScorers() {
  const [selectedLeague, setSelectedLeague] = useState('PL');
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get(`/competitions/${selectedLeague}/scorers?limit=20`)
      .then(res => { setScorers(res.data.scorers); setLoading(false); })
      .catch(() => { setError('Failed to load top scorers.'); setLoading(false); });
  }, [selectedLeague]);

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '700', color: dark.text, marginBottom: '1.5rem' }}>🥇 Top Scorers</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {Object.entries(LEAGUES).map(([code, league]) => (
          <button key={code} onClick={() => setSelectedLeague(code)} style={{
            padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '8px', border: '1px solid',
            borderColor: selectedLeague === code ? dark.blue : dark.border,
            backgroundColor: selectedLeague === code ? dark.blue : dark.card,
            color: selectedLeague === code ? 'white' : dark.muted,
            fontWeight: selectedLeague === code ? '600' : 'normal', fontSize: '13px'
          }}>
            {league.flag} {league.name}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: dark.muted }}>Loading top scorers...</p>}
      {error && <p style={{ color: '#ef4444' }}>{error}</p>}

      {!loading && !error && (
        <div style={{ borderRadius: '12px', border: `1px solid ${dark.border}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#13161f' }}>
                {['#', 'Player', 'Team', 'Goals', 'Assists', 'Pens', 'Matches'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '600', color: dark.muted, textAlign: h === 'Player' || h === 'Team' ? 'left' : 'center' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scorers.map((item, index) => (
                <tr key={item.player.id} style={{
                  borderTop: `1px solid ${dark.border}`,
                  backgroundColor: index === 0 ? '#2d2600' : index === 1 ? '#1e2130' : index === 2 ? '#2d1a2d' : dark.card
                }}>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '16px' }}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : <span style={{ color: dark.muted }}>{index + 1}</span>}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: '600', color: dark.text }}>{item.player.name}</div>
                    <div style={{ fontSize: '12px', color: dark.muted }}>{item.player.nationality}</div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={item.team.crest} alt="" width={20} />
                      <span style={{ color: dark.muted, fontSize: '13px' }}>{item.team.shortName || item.team.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 'bold', fontSize: '16px', color: dark.blue }}>{item.goals}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: dark.muted }}>{item.assists ?? 0}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: dark.muted }}>{item.penalties ?? 0}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: dark.muted }}>{item.playedMatches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}