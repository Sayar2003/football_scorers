import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { glass, leagueButtonStyle } from '../styles/glass';

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

  useEffect(() => {
    setLoading(true); setMatches([]);
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
        fontSize: '24px', fontWeight: '700', marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.7))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
      }}>📅 Fixtures</h1>

      {/* League selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {Object.entries(LEAGUES).map(([code, league]) => (
          <button key={code} onClick={() => setSelectedLeague(code)} style={leagueButtonStyle(selectedLeague === code)}>
            {league.flag} {league.name}
          </button>
        ))}
      </div>

      {/* Date navigation */}
      <div style={{ ...glass.card, display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', marginBottom: '1rem' }}>
        <button onClick={() => changeDate(-1)} style={{ ...glass.button.secondary, padding: '0.5rem 1rem', fontSize: '16px' }}>←</button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '18px', color: glass.colors.text }}>{formatDisplayDate(selectedDate)}</div>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            style={{ ...glass.input, marginTop: '4px', padding: '4px 8px', fontSize: '13px', cursor: 'pointer' }} />
        </div>
        <button onClick={() => changeDate(1)} style={{ ...glass.button.secondary, padding: '0.5rem 1rem', fontSize: '16px' }}>→</button>
      </div>

      {/* Quick date buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
        {[-2, -1, 0, 1, 2].map(offset => {
          const date = new Date();
          date.setDate(date.getDate() + offset);
          const dateStr = formatDateForAPI(date);
          const labels = { '-2': '-2', '-1': 'Yesterday', '0': 'Today', '1': 'Tomorrow', '2': '+2' };
          const isActive = selectedDate === dateStr;
          return (
            <button key={offset} onClick={() => setSelectedDate(dateStr)} style={leagueButtonStyle(isActive)}>
              {labels[String(offset)]}
            </button>
          );
        })}
      </div>

      {loading && <div style={{ ...glass.card, padding: '3rem', textAlign: 'center', color: glass.colors.muted }}>Loading fixtures...</div>}

      {!loading && matches.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: glass.colors.muted }}>
          <p style={{ fontSize: '48px', marginBottom: '1rem' }}>😴</p>
          <p style={{ fontSize: '18px', color: glass.colors.text }}>No matches on this date</p>
          <p style={{ fontSize: '14px' }}>Try a different date or league</p>
        </div>
      )}

      {!loading && matches.map(match => (
        <div key={match.id} onClick={() => navigate(`/match/${match.id}`)}
          className="hover-glow"
          style={{
            ...glass.card, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between',
            padding: '0.9rem 1.5rem', marginBottom: '0.5rem', borderRadius: '10px',
            border: match.status === 'IN_PLAY' ? '1px solid rgba(22,163,74,0.4)' : `1px solid ${glass.colors.border}`,
            background: match.status === 'IN_PLAY' ? 'rgba(22,163,74,0.08)' : 'rgba(255,255,255,0.02)',
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '38%' }}>
            <img src={match.homeTeam.crest} alt="" width={26} />
            <span style={{ fontWeight: '500', fontSize: '14px', color: glass.colors.text }}>
              {match.homeTeam.shortName || match.homeTeam.name}
            </span>
          </div>
          <div style={{ textAlign: 'center', width: '24%' }}>
            {match.status === 'SCHEDULED' ? (
              <div>
                <div style={{ fontWeight: '600', fontSize: '15px', color: glass.colors.text }}>{formatTime(match.utcDate)}</div>
                <div style={{ fontSize: '11px', color: glass.colors.blue }}>Upcoming</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: glass.colors.text }}>
                  {match.score.fullTime.home ?? '-'} : {match.score.fullTime.away ?? '-'}
                </div>
                <div style={{ fontSize: '12px', color: match.status === 'IN_PLAY' ? '#16a34a' : glass.colors.muted }}>
                  {match.status === 'IN_PLAY' ? '🔴 LIVE' : 'FT'}
                </div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '38%', justifyContent: 'flex-end' }}>
            <span style={{ fontWeight: '500', fontSize: '14px', color: glass.colors.text }}>
              {match.awayTeam.shortName || match.awayTeam.name}
            </span>
            <img src={match.awayTeam.crest} alt="" width={26} />
          </div>
        </div>
      ))}
    </div>
  );
}