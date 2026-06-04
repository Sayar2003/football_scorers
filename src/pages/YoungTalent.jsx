import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { getGlass, leagueButtonStyle } from '../styles/glass';

import { API_BASE_URL } from '../config/apiConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
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
  if (!pos) return '#3b82f6';
  if (pos.includes('Goalkeeper')) return '#f59e0b';
  if (pos.includes('Defence')) return '#10b981';
  if (pos.includes('Midfield')) return '#3b82f6';
  if (pos.includes('Offence') || pos.includes('Forward')) return '#ef4444';
  return '#3b82f6';
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
  const { isDark } = useTheme();
  const glass = getGlass(isDark);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setPlayers([]);

    api.get(`/competitions/${selectedLeague}/scorers?limit=50`)
      .then(res => {
        if (!isMounted) return;
        const young = res.data.scorers
          .filter(s => {
            const age = getAge(s.player.dateOfBirth);
            return age !== null && age <= 23;
          })
          .map(s => {
            const ageVal = getAge(s.player.dateOfBirth);
            return {
              ...s,
              age: ageVal,
              potential: getPotentialLabel(s.goals, s.assists || 0, ageVal)
            };
          })
          .sort((a, b) => (b.goals + (b.assists || 0)) - (a.goals + (a.assists || 0)));
        
        setPlayers(young);
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          setError('Failed to load young talent data.');
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [selectedLeague]);

  const positions = ['all', 'Goalkeeper', 'Defence', 'Midfield', 'Offence'];

  const filteredPlayers = positionFilter === 'all'
    ? players
    : players.filter(p => p.player.position?.includes(positionFilter));

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }} className="fade-in">

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: glass.colors.text }}>🌟 Young Talent</h1>
        <p style={{ color: glass.colors.muted, fontSize: '14px', marginTop: '4px' }}>
          Players aged 23 and under making an impact this season
        </p>
      </div>

      {/* League selector - FIXED contrast bindings */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {Object.entries(LEAGUES).map(([code, league]) => {
          const isActive = selectedLeague === code;
          return (
            <button 
              key={code} 
              onClick={() => setSelectedLeague(code)} 
              style={{
                ...leagueButtonStyle(isActive),
                fontWeight: isActive ? '600' : '500',
                fontSize: '13px',
                padding: '0.4rem 0.9rem',
                borderRadius: '20px',
                cursor: 'pointer',
                // Explicitly managing the text contrast boundaries across theme transitions
                color: isActive 
                  ? '#3b82f6' 
                  : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)'),
                backgroundColor: isActive 
                  ? 'rgba(59,130,246,0.15)' 
                  : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                borderColor: isActive ? 'rgba(59,130,246,0.4)' : glass.colors.border,
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {league.flag} {league.name}
            </button>
          );
        })}
      </div>

      {/* Position filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {positions.map(pos => (
          <button 
            key={pos} 
            onClick={() => setPositionFilter(pos)} 
            style={{
              padding: '0.3rem 0.8rem', 
              cursor: 'pointer', 
              borderRadius: '20px', 
              border: '1px solid',
              borderColor: positionFilter === pos ? '#10b981' : glass.colors.border,
              background: positionFilter === pos ? '#10b981' : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
              color: positionFilter === pos ? '#ffffff' : glass.colors.muted,
              backdropFilter: 'blur(10px)',
              fontSize: '12px', 
              fontWeight: positionFilter === pos ? '600' : 'normal',
              transition: 'all 0.2s ease'
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

          {/* Top 3 featured marquee profiles */}
          {filteredPlayers.length >= 3 && positionFilter === 'all' && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {filteredPlayers.slice(0, 3).map((item, index) => (
                <div
                  key={item.player.id}
                  onClick={() => navigate(`/player/${item.player.id}`)}
                  style={{
                    ...glass.card,
                    flex: 1, 
                    minWidth: '260px', 
                    padding: '1.5rem',
                    borderRadius: '16px', 
                    border: `1px solid ${glass.colors.border}`,
                    cursor: 'pointer',
                    textAlign: 'center', 
                    position: 'relative'
                  }}
                  className="hover-glow"
                >
                  <div style={{ position: 'absolute', top: '12px', left: '12px', fontSize: '20px' }}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>

                  <div style={{
                    position: 'absolute', 
                    top: '12px', 
                    right: '12px',
                    backgroundColor: item.potential.color + '22',
                    color: item.potential.color,
                    padding: '2px 8px', 
                    borderRadius: '20px',
                    fontSize: '11px', 
                    fontWeight: '700'
                  }}>
                    {item.potential.label}
                  </div>

                  <div style={{
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%',
                    backgroundColor: getPositionColor(item.player.position),
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '22px', 
                    fontWeight: 'bold', 
                    color: '#ffffff',
                    margin: '1.5rem auto 0.75rem'
                  }}>
                    {item.player.name.charAt(0)}
                  </div>

                  <div style={{ fontWeight: '700', fontSize: '16px', color: glass.colors.text, marginBottom: '4px' }}>
                    {item.player.name}
                  </div>
                  <div style={{ color: glass.colors.muted, fontSize: '12px', marginBottom: '0.75rem' }}>
                    {item.player.nationality} · Age {item.age}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '1rem' }}>
                    <img src={item.team.crest} alt="" width={18} height={18} style={{ objectFit: 'contain' }} />
                    <span style={{ color: glass.colors.text, fontSize: '12px', fontWeight: '500' }}>
                      {item.team.shortName || item.team.name}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: '#ef444422', color: '#ef4444', padding: '4px 12px', borderRadius: '8px', textAlign: 'center', flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.goals}</div>
                      <div style={{ fontSize: '11px', fontWeight: '500' }}>Goals</div>
                    </div>
                    <div style={{ backgroundColor: '#10b98122', color: '#10b981', padding: '4px 12px', borderRadius: '8px', textAlign: 'center', flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.assists ?? 0}</div>
                      <div style={{ fontSize: '11px', fontWeight: '500' }}>Assists</div>
                    </div>
                    <div style={{ backgroundColor: '#3b82f622', color: '#3b82f6', padding: '4px 12px', borderRadius: '8px', textAlign: 'center', flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.playedMatches}</div>
                      <div style={{ fontSize: '11px', fontWeight: '500' }}>Games</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Core Player Listing Table */}
          <div style={{ borderRadius: '12px', border: `1px solid ${glass.colors.border}`, overflow: 'hidden', background: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.4)' }}>
            <div style={{ 
              padding: '0.75rem 1.5rem', 
              backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)', 
              fontWeight: '700', 
              fontSize: '14px', 
              color: glass.colors.text,
              borderBottom: `1px solid ${glass.colors.border}`
            }}>
              Scouting Database Registry
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.01)' }}>
                    {['#', 'Player', 'Age', 'Team', 'Goals', 'Assists', 'Games', 'Potential'].map(h => (
                      <th key={h} style={{ 
                        padding: '10px 12px', 
                        fontSize: '11px', 
                        fontWeight: '700', 
                        color: glass.colors.muted, 
                        textAlign: h === 'Player' || h === 'Team' ? 'left' : 'center',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.slice(positionFilter === 'all' && filteredPlayers.length >= 3 ? 3 : 0).map((item, index) => {
                    const structuralIndex = (positionFilter === 'all' && filteredPlayers.length >= 3 ? 4 : 1) + index;
                    return (
                      <tr
                        key={item.player.id}
                        onClick={() => navigate(`/player/${item.player.id}`)}
                        style={{
                          borderTop: `1px solid ${glass.colors.border}`,
                          backgroundColor: 'transparent', 
                          cursor: 'pointer'
                        }}
                        className="hover-glow"
                      >
                        <td style={{ padding: '12px', textAlign: 'center', color: glass.colors.muted, fontSize: '13px', fontWeight: '500' }}>
                          {structuralIndex}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '28px', 
                              height: '28px', 
                              borderRadius: '50%',
                              backgroundColor: getPositionColor(item.player.position),
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontSize: '11px', 
                              fontWeight: 'bold', 
                              color: '#ffffff', 
                              flexShrink: 0
                            }}>
                              {item.player.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: glass.colors.text, fontSize: '13px' }}>{item.player.name}</div>
                              <div style={{ color: glass.colors.muted, fontSize: '11px' }}>{item.player.position || 'Player'} · {item.player.nationality}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', color: glass.colors.text, fontSize: '13px', fontWeight: '500' }}>
                          {item.age}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <img src={item.team.crest} alt="" width={18} height={18} style={{ objectFit: 'contain' }} />
                            <span style={{ color: glass.colors.text, fontSize: '13px', fontWeight: '500' }}>{item.team.shortName || item.team.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#ef4444', fontSize: '14px' }}>
                          {item.goals}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#10b981', fontSize: '13px' }}>
                          {item.assists ?? 0}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', color: glass.colors.text, fontSize: '13px' }}>
                          {item.playedMatches}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{
                            backgroundColor: item.potential.color + '22',
                            color: item.potential.color,
                            padding: '3px 10px', 
                            borderRadius: '20px',
                            fontSize: '11px', 
                            fontWeight: '600',
                            display: 'inline-block'
                          }}>
                            {item.potential.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}