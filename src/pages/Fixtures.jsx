import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { getGlass, leagueButtonStyle } from '../styles/glass';

const api = axios.create({
  baseURL: '/v4',
  headers: { 'X-Auth-Token': process.env.REACT_APP_FOOTBALL_API_KEY }
});

const LEAGUES = {
  PL: { name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  PD: { name: 'La Liga', flag: '🇪🇸' },
  BL1: { name: 'Bundesliga', flag: '🇩🇪' },
  SA: { name: 'Serie A', flag: '🇮🇹' },
  FL1: { name: 'Ligue 1', flag: '🇫🇷' },
};

const formatDateForAPI = (date) => date.toISOString().split('T')[0];
const getTodayStr = () => formatDateForAPI(new Date());

export default function Fixtures() {
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [selectedLeague, setSelectedLeague] = useState('PL');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const glass = getGlass(isDark);

  useEffect(() => {
    setLoading(true); 
    setMatches([]);
    api.get(`/competitions/${selectedLeague}/matches?dateFrom=${selectedDate}&dateTo=${selectedDate}`)
      .then(res => { setMatches(res.data.matches); setLoading(false); })
      .catch(() => { setMatches([]); setLoading(false); });
  }, [selectedDate, selectedLeague]);

  const changeDate = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(formatDateForAPI(date));
  };

  const formatDisplayDate = (dateStr) => {
    const today = getTodayStr();
    const tomorrow = formatDateForAPI(new Date(Date.now() + 86400000));
    const yesterday = formatDateForAPI(new Date(Date.now() - 86400000));
    if (dateStr === today) return 'Today';
    if (dateStr === tomorrow) return 'Tomorrow';
    if (dateStr === yesterday) return 'Yesterday';
    return new Date(dateStr).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }} className="fade-in">
      <h1 style={{
        fontSize: '24px', 
        fontWeight: '700', 
        marginBottom: '1.5rem',
        color: glass.colors.text,
        background: isDark 
          ? 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)' 
          : 'linear-gradient(135deg, #0f1117 0%, rgba(15,17,23,0.7) 100%)',
        WebkitBackgroundClip: 'text', 
        WebkitTextFillColor: 'transparent', 
        backgroundClip: 'text'
      }}>
        📅 Fixtures
      </h1>

      {/* League selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {Object.entries(LEAGUES).map(([code, league]) => (
          <button 
            key={code} 
            onClick={() => setSelectedLeague(code)} 
            style={{
              ...leagueButtonStyle(selectedLeague === code, isDark),
              cursor: 'pointer'
            }}
          >
            {league.flag} {league.name}
          </button>
        ))}
      </div>

      {/* Date navigation */}
      <div style={{ ...glass.card, display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', marginBottom: '1rem' }}>
        <button 
          onClick={() => changeDate(-1)} 
          style={{ 
            ...(glass.button?.secondary || {}), 
            padding: '0.5rem 1rem', 
            fontSize: '16px',
            cursor: 'pointer',
            borderRadius: '6px',
            border: `1px solid ${glass.colors.border}`,
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            color: glass.colors.text
          }}
        >
          ←
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '18px', color: glass.colors.text }}>{formatDisplayDate(selectedDate)}</div>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ 
              ...glass.input, 
              marginTop: '8px', 
              padding: '6px 10px', 
              fontSize: '13px', 
              cursor: 'pointer',
              border: `1px solid ${glass.colors.border}`,
              borderRadius: '6px',
              backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.6)',
              color: glass.colors.text
            }} 
          />
        </div>
        <button 
          onClick={() => changeDate(1)} 
          style={{ 
            ...(glass.button?.secondary || {}), 
            padding: '0.5rem 1rem', 
            fontSize: '16px',
            cursor: 'pointer',
            borderRadius: '6px',
            border: `1px solid ${glass.colors.border}`,
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            color: glass.colors.text
          }}
        >
          →
        </button>
      </div>

      {/* Quick date buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
        {[-2, -1, 0, 1, 2].map(offset => {
          const date = new Date();
          date.setDate(date.getDate() + offset);
          const dateStr = formatDateForAPI(date);
          const labels = { '-2': '-2 Days', '-1': 'Yesterday', '0': 'Today', '1': 'Tomorrow', '2': '+2 Days' };
          const isActive = selectedDate === dateStr;
          return (
            <button 
              key={offset} 
              onClick={() => setSelectedDate(dateStr)} 
              style={{
                ...leagueButtonStyle(isActive, isDark),
                cursor: 'pointer'
              }}
            >
              {labels[String(offset)]}
            </button>
          );
        })}
      </div>

      {loading && (
        <div style={{ ...glass.card, padding: '3rem', textAlign: 'center', color: glass.colors.muted }}>
          Loading fixtures...
        </div>
      )}

      {!loading && matches.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: glass.colors.muted }}>
          <p style={{ fontSize: '48px', marginBottom: '1rem' }}>😴</p>
          <p style={{ fontSize: '18px', color: glass.colors.text, fontWeight: '600' }}>No matches on this date</p>
          <p style={{ fontSize: '14px', marginTop: '0.25rem' }}>Try a different date or league</p>
        </div>
      )}

      {!loading && matches.map(match => {
        const isInPlay = match.status === 'IN_PLAY';
        return (
          <div 
            key={match.id} 
            onClick={() => navigate(`/match/${match.id}`)}
            className="hover-glow"
            style={{
              ...glass.card, 
              cursor: 'pointer', 
              display: 'flex',
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '0.9rem 1.5rem', 
              marginBottom: '0.5rem', 
              borderRadius: '10px',
              border: isInPlay 
                ? (isDark ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(22, 163, 74, 0.4)')
                : `1px solid ${glass.colors.border}`,
              background: isInPlay 
                ? (isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(22, 163, 74, 0.06)') 
                : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'),
            }}
          >
            {/* Home Team */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '38%', minWidth: 0 }}>
              <img src={match.homeTeam.crest} alt="" width={26} height={26} style={{ objectFit: 'contain', flexShrink: 0 }} />
              <span style={{ 
                fontWeight: '500', 
                fontSize: '14px', 
                color: glass.colors.text,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {match.homeTeam.shortName || match.homeTeam.name}
              </span>
            </div>

            {/* Score / Center Status info */}
            <div style={{ textAlign: 'center', width: '24%', flexShrink: 0 }}>
              {match.status === 'SCHEDULED' ? (
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: glass.colors.text }}>{formatTime(match.utcDate)}</div>
                  <div style={{ fontSize: '11px', color: isDark ? glass.colors.blue : '#2563eb', fontWeight: '500', marginTop: '2px' }}>Upcoming</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: glass.colors.text, letterSpacing: '0.5px' }}>
                    {match.score.fullTime.home ?? '-'} : {match.score.fullTime.away ?? '-'}
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    fontWeight: '700',
                    marginTop: '2px',
                    color: isInPlay ? (isDark ? '#4ade80' : '#16a34a') : glass.colors.muted 
                  }}>
                    {isInPlay ? '🔴 LIVE' : 'FT'}
                  </div>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '38%', justifyContent: 'flex-end', minWidth: 0 }}>
              <span style={{ 
                fontWeight: '500', 
                fontSize: '14px', 
                color: glass.colors.text,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'right'
              }}>
                {match.awayTeam.shortName || match.awayTeam.name}
              </span>
              <img src={match.awayTeam.crest} alt="" width={26} height={26} style={{ objectFit: 'contain', flexShrink: 0 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}