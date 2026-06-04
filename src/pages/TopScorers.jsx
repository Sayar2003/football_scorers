import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LEAGUES } from '../services/footballAPI';
import { useTheme } from '../context/ThemeContext';
import { getGlass, leagueButtonStyle } from '../styles/glass';

import { API_BASE_URL } from '../config/apiConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'X-Auth-Token': process.env.REACT_APP_FOOTBALL_API_KEY }
});

// Global cache persists across renders safely
const CACHE = {};
const CACHE_TIME = {};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export default function TopScorers() {
  const [selectedLeague, setSelectedLeague] = useState('PL');
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [waitTime, setWaitTime] = useState(0);
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const { isDark } = useTheme();
  const glass = getGlass(isDark);

  useEffect(() => {
    let isMounted = true;
    const now = Date.now();

    // Return cached data if still valid
    if (CACHE[selectedLeague] && now - CACHE_TIME[selectedLeague] < CACHE_DURATION) {
      setScorers(CACHE[selectedLeague]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setWaitTime(0);

    const fetchTopScorers = () => {
      api.get(`/competitions/${selectedLeague}/scorers?limit=20`)
        .then(res => {
          if (!isMounted) return;
          CACHE[selectedLeague] = res.data.scorers;
          CACHE_TIME[selectedLeague] = Date.now();
          setScorers(res.data.scorers);
          setLoading(false);
        })
        .catch(err => {
          if (!isMounted) return;
          if (err.response?.status === 429) {
            // Rate limited — start clean countdown tracker
            let seconds = 60;
            setWaitTime(seconds);
            setError('rate_limited');
            setLoading(false);

            if (timerRef.current) clearInterval(timerRef.current);
            
            timerRef.current = setInterval(() => {
              seconds -= 1;
              if (isMounted) setWaitTime(seconds);
              
              if (seconds <= 0) {
                clearInterval(timerRef.current);
                if (isMounted) {
                  setError(null);
                  setWaitTime(0);
                  setLoading(true);
                  
                  api.get(`/competitions/${selectedLeague}/scorers?limit=20`)
                    .then(res => {
                      if (!isMounted) return;
                      CACHE[selectedLeague] = res.data.scorers;
                      CACHE_TIME[selectedLeague] = Date.now();
                      setScorers(res.data.scorers);
                      setLoading(false);
                    })
                    .catch(() => {
                      if (isMounted) {
                        setError('failed');
                        setLoading(false);
                      }
                    });
                }
              }
            }, 1000);
          } else {
            setError('failed');
            setLoading(false);
          }
        });
    };

    fetchTopScorers();

    return () => {
      isMounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selectedLeague]);

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }} className="fade-in">
      <h1 style={{
        fontSize: '24px', fontWeight: '700', marginBottom: '1.5rem',
        background: isDark 
          ? 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.7))' 
          : `linear-gradient(135deg, ${glass.colors.text}, ${glass.colors.muted})`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
      }}>🥇 Top Scorers</h1>

      {/* Fixed Contrast League Navigation row */}
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

      {loading && (
        <div style={{ ...glass.card, padding: '3rem', textAlign: 'center', color: glass.colors.muted }}>
          <p style={{ fontSize: '24px', marginBottom: '1rem' }}>⏳</p>
          <p>Loading top scorers...</p>
        </div>
      )}

      {/* Rate limit countdown notification */}
      {error === 'rate_limited' && (
        <div style={{ ...glass.card, padding: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '32px', marginBottom: '1rem' }}>⏱️</p>
          <p style={{ color: glass.colors.text, fontWeight: '600', fontSize: '16px', marginBottom: '0.5rem' }}>
            API Rate Limit Reached
          </p>
          <p style={{ color: glass.colors.muted, fontSize: '14px', marginBottom: '1rem' }}>
            Too many requests. Auto-retrying in...
          </p>
          <div style={{
            fontSize: '48px', fontWeight: 'bold',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
          }}>
            {waitTime}s
          </div>
          <p style={{ color: glass.colors.muted, fontSize: '12px', marginTop: '1rem' }}>
            The free API tier allows 10 requests per minute.
          </p>
        </div>
      )}

      {error === 'failed' && (
        <div style={{ ...glass.card, padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: glass.colors.red }}>Failed to load dashboard metrics. Please try again.</p>
          <button
            onClick={() => { setError(null); setLoading(true); setSelectedLeague(selectedLeague); }}
            style={{ ...glass.button.primary, padding: '0.5rem 1.5rem', marginTop: '1rem' }}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div style={{ ...glass.card, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ 
                  borderBottom: `1px solid ${glass.colors.border}`, 
                  background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)' 
                }}>
                  {['#', 'Player', 'Team', 'Goals', 'Assists', 'Pens', 'Matches'].map(h => (
                    <th key={h} style={{
                      padding: '12px', fontSize: '11px', fontWeight: '700',
                      color: glass.colors.muted, textAlign: h === 'Player' || h === 'Team' ? 'left' : 'center',
                      textTransform: 'uppercase', letterSpacing: '0.5px'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scorers.map((item, index) => (
                  <tr key={item.player.id} className="hover-glow"
                    onClick={() => navigate(`/player/${item.player.id}`)}
                    style={{
                      borderBottom: `1px solid ${glass.colors.border}`,
                      background: index === 0 ? (isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.08)') :
                        index === 1 ? (isDark ? 'rgba(156,163,175,0.08)' : 'rgba(156,163,175,0.05)') :
                        index === 2 ? (isDark ? 'rgba(180,83,9,0.1)' : 'rgba(180,83,9,0.06)') : 'transparent',
                      cursor: 'pointer'
                    }}>
                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '16px' }}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' :
                        <span style={{ color: glass.colors.muted, fontSize: '13px', fontWeight: '500' }}>{index + 1}</span>}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600', color: glass.colors.text }}>
                        {item.player.name}
                      </div>
                      <div style={{ fontSize: '12px', color: glass.colors.muted }}>{item.player.nationality}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={item.team.crest} alt="" width={20} height={20} style={{ objectFit: 'contain' }} />
                        <span style={{ color: glass.colors.text, fontSize: '13px', fontWeight: '500' }}>
                          {item.team.shortName || item.team.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: '700', fontSize: '16px', color: glass.colors.blue }}>{item.goals}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: glass.colors.text }}>{item.assists ?? 0}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: glass.colors.muted }}>{item.penalties ?? 0}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: glass.colors.text }}>{item.playedMatches}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}