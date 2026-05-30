import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { glass, leagueButtonStyle } from '../styles/glass';
import axios from 'axios';

const api = axios.create({
  baseURL: '/v4',
  headers: { 'X-Auth-Token': process.env.REACT_APP_FOOTBALL_API_KEY }
});

const LEAGUES = {
  PL:  { name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮' },
  PD:  { name: 'La Liga',         flag: '🇪🇸' },
  BL1: { name: 'Bundesliga',     flag: '🇩🇪' },
  SA:  { name: 'Serie A',        flag: '🇮🇹' },
  FL1: { name: 'Ligue 1',        flag: '🇫🇷' },
};

const getPositionColor = (pos) => {
  if (!pos) return glass.colors.blue;
  if (pos.includes('Goalkeeper')) return '#f59e0b';
  if (pos.includes('Defence')) return '#10b981';
  if (pos.includes('Midfield')) return '#3b82f6';
  if (pos.includes('Offence') || pos.includes('Forward')) return '#ef4444';
  return glass.colors.blue;
};

const getAge = (dob) => {
  if (!dob) return null;
  return new Date().getFullYear() - new Date(dob).getFullYear();
};

const getPotentialLabel = (goals, assists, age) => {
  const contribution = goals + assists;
  if (contribution >= 10 && age <= 19) return { label: '🌟 World Class Prospect', color: '#f59e0b' };
  if (contribution >= 7 && age <= 20) return { label: '⭐ Top Prospect', color: '#3b82f6' };
  if (contribution >= 4) return { label: '📈 Rising Talent', color: '#10b981' };
  return { label: '👀 One to Watch', color: '#9ca3af' };
};

export default function YoungTalent() {
  const [selectedLeague, setSelectedLeague] = useState('PL');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [positionFilter, setPositionFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    setPlayers([]);

    api.get(`/competitions/${selectedLeague}/scorers?limit=50`)
      .then(res => {
        const young = res.data.scorers
          .filter(s => {
            const age = getAge(s.player.dateOfBirth);
            return age !== null && age <= 23;
          })
          .map(s => ({
            ...s,
            age: getAge(s.player.dateOfBirth),
            potential: getPotentialLabel(s.goals, s.assists || 0, getAge(s.player.dateOfBirth))
          }))
          .sort((a, b) => (b.goals + (b.assists || 0)) - (a.goals + (a.assists || 0)));
        setPlayers(young);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load young talent data.');
        setLoading(false);
      });
  }, [selectedLeague]);

  const positions = ['all', 'Goalkeeper', 'Defence', 'Midfield', 'Offence'];

  const filteredPlayers = positionFilter === 'all'
    ? players
    : players.filter(p => p.player.position?.includes(positionFilter));

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: glass.colors.text }}>🌟 Young Talent</h1>
        <p style={{ color: glass.colors.muted, fontSize: '14px', marginTop: '4px' }}>
          Players aged 23 and under making an impact this season
        </p>
      </div>

      {/* League selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {Object.entries(LEAGUES).map(([code, league]) => (
          <button 
            key={code} 
            onClick={() => setSelectedLeague(code)} 
            style={{
              ...leagueButtonStyle,
              ...leagueButtonStyle(selectedLeague === code),
              fontWeight: selectedLeague === code ? '600' : 'normal',
            }}
          >
            {league.flag} {league.name}
          </button>
        ))}
      </div>

      {/* Position filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {positions.map(pos => (
          <button 
            key={pos} 
            onClick={() => setPositionFilter(pos)} 
            style={{
              ...(glass.button || {}), // Spreads base glass button properties if they exist
              padding: '0.3rem 0.8rem', cursor: 'pointer', borderRadius: '20px', border: '1px solid',
              borderColor: positionFilter === pos ? '#10b981' : glass.colors.border,
background: positionFilter === pos ? '#10b981' : 'rgba(255,255,255,0.03)',
color: positionFilter === pos ? 'white' : glass.colors.muted,
backdropFilter: 'blur(10px)',
              fontSize: '12px', fontWeight: positionFilter === pos ? '600' : 'normal'
            }}
          >
            {pos === 'all' ? '👥 All Positions' : pos}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: glass.colors.muted }}>
          <p style={{ fontSize: '32px', marginBottom: '1rem' }}>🌟</p>
          <p>Scouting young talent...</p>
        </div>
      )}

      {error && <p style={{ color: '#ef4444', padding: '2rem', textAlign: 'center' }}>{error}</p>}

      {!loading && !error && filteredPlayers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: glass.colors.muted }}>
          <p style={{ fontSize: '32px', marginBottom: '1rem' }}>😴</p>
          <p>No young players found with goals/assists this season.</p>
          <p style={{ fontSize: '13px', marginTop: '0.5rem' }}>Try a different league or position.</p>
        </div>
      )}

      {!loading && !error && filteredPlayers.length > 0 && (
        <div>
          <p style={{ color: glass.colors.muted, fontSize: '13px', marginBottom: '1rem' }}>
            {filteredPlayers.length} young player{filteredPlayers.length !== 1 ? 's' : ''} found
          </p>

          {/* Top 3 featured */}
          {filteredPlayers.length >= 3 && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {filteredPlayers.slice(0, 3).map((item, index) => (
                <div
                  key={item.player.id}
                  onClick={() => navigate(`/player/${item.player.id}`)}
                  style={{
                    flex: 1, minWidth: '200px', padding: '1.5rem',
                    borderRadius: '16px', border: `1px solid ${glass.colors.border}`,
                    backgroundColor: glass.card, cursor: 'pointer',
                    textAlign: 'center', position: 'relative'
                  }}
                >
                  {/* Rank badge */}
                  <div style={{
                    position: 'absolute', top: '12px', left: '12px',
                    fontSize: '20px'
                  }}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>

                  {/* Potential badge */}
                  <div style={{
                    position: 'absolute', top: '12px', right: '12px',
                    backgroundColor: item.potential.color + '33',
                    color: item.potential.color,
                    padding: '2px 8px', borderRadius: '20px',
                    fontSize: '11px', fontWeight: '600'
                  }}>
                    {item.potential.label}
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '50%',
                    backgroundColor: getPositionColor(item.player.position),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px', fontWeight: 'bold', color: 'white',
                    margin: '1rem auto 0.75rem'
                  }}>
                    {item.player.name.charAt(0)}
                  </div>

                  <div style={{ fontWeight: '700', fontSize: '16px', color: glass.colors.text, marginBottom: '4px' }}>
                    {item.player.name}
                  </div>
                  <div style={{ color: glass.colors.muted, fontSize: '12px', marginBottom: '0.75rem' }}>
                    {item.player.nationality} · Age {item.age}
                  </div>

                  {/* Team */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '1rem' }}>
                    <img src={item.team.crest} alt="" width={18} />
                    <span style={{ color: glass.colors.muted, fontSize: '12px' }}>{item.team.shortName || item.team.name}</span>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <div style={{
                      backgroundColor: '#ef444433', color: '#ef4444',
                      padding: '4px 12px', borderRadius: '8px', textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{item.goals}</div>
                      <div style={{ fontSize: '11px' }}>Goals</div>
                    </div>
                    <div style={{
                      backgroundColor: '#10b98133', color: '#10b981',
                      padding: '4px 12px', borderRadius: '8px', textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{item.assists ?? 0}</div>
                      <div style={{ fontSize: '11px' }}>Assists</div>
                    </div>
                    <div style={{
                      backgroundColor: '#3b82f633', color: '#3b82f6',
                      padding: '4px 12px', borderRadius: '8px', textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{item.playedMatches}</div>
                      <div style={{ fontSize: '11px' }}>Games</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rest of players table */}
          {filteredPlayers.length > 3 && (
            <div style={{ borderRadius: '12px', border: `1px solid ${glass.colors.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#13161f', fontWeight: 'bold', fontSize: '14px', color: glass.colors.text }}>
                All Young Talents
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#13161f' }}>
                    {['#', 'Player', 'Age', 'Team', 'Goals', 'Assists', 'Games', 'Potential'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '600', color: glass.colors.muted, textAlign: h === 'Player' || h === 'Team' ? 'left' : 'center' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.slice(3).map((item, index) => (
                    <tr
                      key={item.player.id}
                      onClick={() => navigate(`/player/${item.player.id}`)}
                      style={{
                        borderTop: `1px solid ${glass.colors.border}`,
                        backgroundColor: glass.card, cursor: 'pointer'
                      }}
                    >
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: glass.colors.muted, fontSize: '13px' }}>
                        {index + 4}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            backgroundColor: getPositionColor(item.player.position),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: 'bold', color: 'white', flexShrink: 0
                          }}>
                            {item.player.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: glass.colors.text, fontSize: '13px' }}>{item.player.name}</div>
                            <div style={{ color: glass.colors.muted, fontSize: '11px' }}>{item.player.nationality}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: glass.colors.muted, fontSize: '13px' }}>
                        {item.age}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <img src={item.team.crest} alt="" width={18} />
                          <span style={{ color: glass.colors.muted, fontSize: '12px' }}>{item.team.shortName || item.team.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 'bold', color: '#ef4444', fontSize: '14px' }}>
                        {item.goals}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#10b981', fontSize: '13px' }}>
                        {item.assists ?? 0}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: glass.colors.muted, fontSize: '13px' }}>
                        {item.playedMatches}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span style={{
                          backgroundColor: item.potential.color + '33',
                          color: item.potential.color,
                          padding: '2px 8px', borderRadius: '20px',
                          fontSize: '11px', fontWeight: '600'
                        }}>
                          {item.potential.label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}