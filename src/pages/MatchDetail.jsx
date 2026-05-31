import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RatingBadge from '../components/RatingBadge';
import { calculatePlayerRating } from '../utils/ratingCalculator';
import { generateMatchSummary, generateShortSummary } from '../utils/matchSummarizer';
import MatchStatsChart from '../components/MatchStatsChart';
import PitchMap from '../components/PitchMap';
import { glass } from '../styles/glass';

const api = axios.create({
  baseURL: '/v4',
  headers: { 'X-Auth-Token': process.env.REACT_APP_FOOTBALL_API_KEY }
});

export default function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [h2h, setH2h] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
  setLoading(true);
  
  const fetchData = async () => {
    try {
      // Add delay between requests to avoid rate limiting
      const matchRes = await api.get(`/matches/${id}`);
      setMatch(matchRes.data);
      
      // Wait 500ms before second request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const h2hRes = await api.get(`/matches/${id}/head2head?limit=10`);
        setH2h(h2hRes.data);
      } catch {
        setH2h({ matches: [] });
      }
      
      setLoading(false);
    } catch {
      setError('Failed to load match details. Please wait a moment and try again.');
      setLoading(false);
    }
  };

  fetchData();
}, [id]);

  if (loading) return <p style={{ padding: '2rem', color: glass.colors.muted }}>Loading match details...</p>;
  if (error) return <p style={{ padding: '2rem', color: glass.colors.red }}>{error}</p>;
  if (!match) return null;

  const home = match.homeTeam;
  const away = match.awayTeam;
  const score = match.score.fullTime;
  const isFinished = match.status === 'FINISHED';
  const homeWon = isFinished && score.home > score.away;
  const awayWon = isFinished && score.away > score.home;
  const isDraw = isFinished && score.home === score.away;

  const tabStyle = (tab) => ({
    padding: '0.6rem 1.2rem', cursor: 'pointer', borderRadius: '8px', border: 'none',
    fontWeight: '600', fontSize: '13px',
    background: activeTab === tab ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'rgba(255,255,255,0.05)',
    color: activeTab === tab ? 'white' : glass.colors.muted,
    transition: 'all 0.2s ease'
  });

  const h2hMatches = h2h?.matches || [];
  const homeWins = h2hMatches.filter(m =>
    (m.homeTeam.id === home.id && m.score.fullTime.home > m.score.fullTime.away) ||
    (m.awayTeam.id === home.id && m.score.fullTime.away > m.score.fullTime.home)
  ).length;
  const awayWins = h2hMatches.filter(m =>
    (m.homeTeam.id === away.id && m.score.fullTime.home > m.score.fullTime.away) ||
    (m.awayTeam.id === away.id && m.score.fullTime.away > m.score.fullTime.home)
  ).length;
  const draws = h2hMatches.filter(m => m.score.fullTime.home === m.score.fullTime.away).length;

  const getPlayerRating = (player, isHomeTeam) => {
    const isWin = isHomeTeam ? homeWon : awayWon;
    const isLoss = isHomeTeam ? awayWon : homeWon;
    return calculatePlayerRating(player.player, match.goals, isWin, isDraw, isLoss, player.position === 'Goalkeeper');
  };

  const homePossession = isFinished ? Math.min(70, Math.max(30, 50 + (score.home - score.away) * 5)) : 50;
  const awayPossession = 100 - homePossession;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }} className="fade-in">
      <button onClick={() => navigate(-1)} style={{ ...glass.button.secondary, padding: '0.5rem 1rem', marginBottom: '1.5rem' }}>
        ← Back
      </button>

      {/* Match header */}
      <div style={{ ...glass.cardStrong, textAlign: 'center', padding: '2rem', marginBottom: '1.5rem' }}>
        <p style={{ color: glass.colors.muted, marginBottom: '1rem', fontSize: '14px' }}>
          {match.competition.name} — {new Date(match.utcDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
          <div style={{ textAlign: 'center', flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/team/${home.id}`)}>
            <img src={home.crest} alt={home.name} width={60} style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontWeight: 'bold', fontSize: '18px', color: homeWon ? glass.colors.blue : glass.colors.text }}>
              {home.shortName || home.name}
            </div>
            {homeWon && <div style={{ fontSize: '11px', color: glass.colors.blue, marginTop: '2px' }}>WINNER ⭐</div>}
          </div>

          <div style={{ textAlign: 'center' }}>
            {match.status === 'SCHEDULED' ? (
              <div style={{ fontSize: '24px', color: glass.colors.muted }}>vs</div>
            ) : (
              <div style={{
                fontSize: '48px', fontWeight: '900', color: glass.colors.text,
                background: 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.8))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}>
                {score.home ?? '-'} : {score.away ?? '-'}
              </div>
            )}
            <div style={{ fontSize: '13px', marginTop: '4px', color: match.status === 'IN_PLAY' ? '#16a34a' : glass.colors.muted }}>
              {match.status === 'IN_PLAY' ? '🔴 LIVE' : match.status === 'FINISHED' ? 'Full Time' : 'Upcoming'}
            </div>
          </div>

          <div style={{ textAlign: 'center', flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/team/${away.id}`)}>
            <img src={away.crest} alt={away.name} width={60} style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontWeight: 'bold', fontSize: '18px', color: awayWon ? glass.colors.blue : glass.colors.text }}>
              {away.shortName || away.name}
            </div>
            {awayWon && <div style={{ fontSize: '11px', color: glass.colors.blue, marginTop: '2px' }}>WINNER ⭐</div>}
          </div>
        </div>

        {/* Possession bar */}
        {isFinished && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: glass.colors.muted, marginBottom: '6px' }}>
              <span>{homePossession}%</span>
              <span>Possession</span>
              <span>{awayPossession}%</span>
            </div>
            <div style={{ height: '6px', borderRadius: '3px', overflow: 'hidden', display: 'flex', background: 'rgba(255,255,255,0.05)' }}>
              <div style={{ width: `${homePossession}%`, background: 'linear-gradient(90deg, #3b82f6, #2563eb)', transition: 'width 1s ease' }} />
              <div style={{ width: `${awayPossession}%`, background: 'linear-gradient(90deg, #ef4444, #dc2626)', transition: 'width 1s ease' }} />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}>📋 Overview</button>
        <button style={tabStyle('ratings')} onClick={() => setActiveTab('ratings')}>⭐ Ratings</button>
        <button style={tabStyle('h2h')} onClick={() => setActiveTab('h2h')}>⚔️ Head to Head</button>
        <button style={tabStyle('summary')} onClick={() => setActiveTab('summary')}>📝 Summary</button>
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Animated Stats Chart */}
{isFinished && (
  <MatchStatsChart
    homeTeam={home.shortName || home.name}
    awayTeam={away.shortName || away.name}
    homeScore={score.home}
    awayScore={score.away}
  />
)}
          {isFinished && (
            <div style={{ ...glass.card, overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(0,0,0,0.3)', fontWeight: 'bold', fontSize: '14px', color: glass.colors.text }}>
                📊 Match Stats
              </div>
              {[
                { label: 'Goals', home: score.home, away: score.away },
                { label: 'Possession', home: `${homePossession}%`, away: `${awayPossession}%` },
                { label: 'Result', home: homeWon ? 'WIN' : isDraw ? 'DRAW' : 'LOSS', away: awayWon ? 'WIN' : isDraw ? 'DRAW' : 'LOSS' },
              ].map((stat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1.5rem', borderTop: `1px solid ${glass.colors.border}` }}>
                  <div style={{ flex: 1, textAlign: 'left', fontWeight: '600', color: glass.colors.text, fontSize: '14px' }}>{stat.home}</div>
                  <div style={{ flex: 1, textAlign: 'center', color: glass.colors.muted, fontSize: '13px' }}>{stat.label}</div>
                  <div style={{ flex: 1, textAlign: 'right', fontWeight: '600', color: glass.colors.text, fontSize: '14px' }}>{stat.away}</div>
                </div>
              ))}
            </div>
          )}

          {match.goals && match.goals.length > 0 && (
            <div style={{ ...glass.card, overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(0,0,0,0.3)', fontWeight: 'bold', fontSize: '14px', color: glass.colors.text }}>⚽ Goals</div>
              {match.goals.map((goal, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: goal.team.id === home.id ? 'flex-start' : 'flex-end',
                  padding: '0.75rem 1.5rem', borderTop: `1px solid ${glass.colors.border}`, fontSize: '14px', color: glass.colors.text
                }}>
                  <span>
                    {goal.team.id === home.id ? '⚽ ' : ''}
                    <strong>{goal.scorer?.name}</strong> {goal.minute}'
                    {goal.assist && <span style={{ color: glass.colors.muted }}> (assist: {goal.assist.name})</span>}
                    {goal.team.id !== home.id ? ' ⚽' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}

          {match.lineups && match.lineups.length === 2 && (
            <div style={{ ...glass.card, overflow: 'hidden' }}>
              <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(0,0,0,0.3)', fontWeight: 'bold', fontSize: '14px', color: glass.colors.text }}>👥 Lineups</div>
              <div style={{ display: 'flex', gap: '1rem', padding: '1rem 1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: glass.colors.text }}>{home.shortName || home.name}</div>
                  {match.lineups[0].startXI?.map((p, i) => (
                    <div key={i} style={{ fontSize: '14px', padding: '4px 0', borderBottom: `1px solid ${glass.colors.border}`, color: glass.colors.muted }}>
                      {p.player.shirtNumber}. {p.player.name}
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: glass.colors.text }}>{away.shortName || away.name}</div>
                  {match.lineups[1].startXI?.map((p, i) => (
                    <div key={i} style={{ fontSize: '14px', padding: '4px 0', borderBottom: `1px solid ${glass.colors.border}`, color: glass.colors.muted }}>
                      {p.player.shirtNumber}. {p.player.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!match.goals?.length && !match.lineups?.length && (
            <p style={{ color: glass.colors.muted, textAlign: 'center', padding: '2rem' }}>
              Detailed match data not available on free tier.
            </p>
          )}
        </div>
      )}

     {/* Lineup tab */}
     {activeTab === 'ratings' && (
  <div>
    {match.lineups && match.lineups.length === 2 ? (
      <div>
        {/* Pitch Map */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <PitchMap
            lineup={match.lineups[0].startXI}
            teamName={home.shortName || home.name}
            goals={match.goals}
            isHome={true}
            ratings={match.lineups[0].startXI?.reduce((acc, p) => {
              acc[p.player.id] = getPlayerRating(p, true);
              return acc;
            }, {})}
          />
          <PitchMap
            lineup={match.lineups[1].startXI}
            teamName={away.shortName || away.name}
            goals={match.goals}
            isHome={false}
            ratings={match.lineups[1].startXI?.reduce((acc, p) => {
              acc[p.player.id] = getPlayerRating(p, false);
              return acc;
            }, {})}
          />
        </div>

        {/* Player ratings list */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          {[0, 1].map(teamIndex => {
            const isHome = teamIndex === 0;
            const team = isHome ? home : away;
            return (
              <div key={teamIndex} style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: glass.colors.text, fontSize: '15px' }}>
                  <img src={team.crest} alt="" width={20} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  {team.shortName || team.name}
                </div>
                {match.lineups[teamIndex].startXI?.map((p, i) => {
                  const rating = getPlayerRating(p, isHome);
                  return (
                    <div key={i} onClick={() => navigate(`/player/${p.player.id}`)}
                      className="hover-glow"
                      style={{ ...glass.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', marginBottom: '4px', borderRadius: '8px', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: glass.colors.muted, fontSize: '12px', width: '16px' }}>{p.player.shirtNumber}</span>
                        <span style={{ color: glass.colors.text, fontSize: '13px' }}>{p.player.name}</span>
                      </div>
                      <RatingBadge rating={rating} size="sm" />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    ) : (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: glass.colors.muted }}>Lineup data not available for this match.</p>
        <p style={{ color: glass.colors.muted, fontSize: '13px', marginTop: '0.5rem' }}>Ratings are calculated based on match result and goal contributions.</p>
      </div>
    )}
  </div>
)}

      {/* H2H tab */}
      {activeTab === 'h2h' && (
        <div>
          {h2hMatches.length === 0 ? (
            <p style={{ color: glass.colors.muted, textAlign: 'center', padding: '2rem' }}>No head to head data available.</p>
          ) : (
            <div>
              <div style={{ display: 'flex', borderRadius: '12px', border: `1px solid ${glass.colors.border}`, overflow: 'hidden', marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{ flex: 1, padding: '1rem', background: 'rgba(59,130,246,0.15)' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: glass.colors.blue }}>{homeWins}</div>
                  <div style={{ fontSize: '13px', color: glass.colors.blue, fontWeight: '600' }}>{home.shortName || home.name}</div>
                  <div style={{ fontSize: '12px', color: glass.colors.muted }}>Wins</div>
                </div>
                <div style={{ flex: 1, padding: '1rem', background: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: glass.colors.text }}>{draws}</div>
                  <div style={{ fontSize: '13px', color: glass.colors.text, fontWeight: '600' }}>Draws</div>
                  <div style={{ fontSize: '12px', color: glass.colors.muted }}>out of {h2hMatches.length}</div>
                </div>
                <div style={{ flex: 1, padding: '1rem', background: 'rgba(239,68,68,0.15)' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: glass.colors.red }}>{awayWins}</div>
                  <div style={{ fontSize: '13px', color: glass.colors.red, fontWeight: '600' }}>{away.shortName || away.name}</div>
                  <div style={{ fontSize: '12px', color: glass.colors.muted }}>Wins</div>
                </div>
              </div>

              <h3 style={{ fontSize: '11px', fontWeight: '700', color: glass.colors.muted, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Recent Meetings</h3>
              {h2hMatches.map(m => {
                const isHomeTeamHome = m.homeTeam.id === home.id;
                const homeScore = m.score.fullTime.home;
                const awayScore = m.score.fullTime.away;
                const homeWon = isHomeTeamHome ? homeScore > awayScore : awayScore > homeScore;
                const awayWon = isHomeTeamHome ? awayScore > homeScore : homeScore > awayScore;
                return (
                  <div key={m.id} onClick={() => navigate(`/match/${m.id}`)}
                    className="hover-glow"
                    style={{ ...glass.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', marginBottom: '0.5rem', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' }}>
                    <div style={{ width: '30%', fontSize: '12px', color: glass.colors.muted }}>
                      {new Date(m.utcDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', width: '40%' }}>
                      <span style={{ fontWeight: homeWon ? 'bold' : 'normal', color: glass.colors.text }}>
                        <img src={m.homeTeam.crest} alt="" width={18} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        {m.homeTeam.shortName || m.homeTeam.name}
                      </span>
                      <span style={{ fontWeight: 'bold', fontSize: '15px', color: glass.colors.text }}>{homeScore} - {awayScore}</span>
                      <span style={{ fontWeight: awayWon ? 'bold' : 'normal', color: glass.colors.text }}>
                        {m.awayTeam.shortName || m.awayTeam.name}
                        <img src={m.awayTeam.crest} alt="" width={18} style={{ verticalAlign: 'middle', marginLeft: '4px' }} />
                      </span>
                    </div>
                    <div style={{ width: '30%', textAlign: 'right', fontSize: '12px', color: glass.colors.muted }}>{m.competition.name}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Summary tab */}
      {activeTab === 'summary' && (
        <div>
          <div style={{ ...glass.card, overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(0,0,0,0.3)', fontWeight: 'bold', fontSize: '14px', color: glass.colors.text, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📝 Match Summary</span>
              {isFinished && (
                <button onClick={() => { navigator.clipboard.writeText(generateMatchSummary(match)); alert('Copied!'); }}
                  style={{ ...glass.button.secondary, padding: '4px 12px', fontSize: '12px' }}>
                  📋 Copy
                </button>
              )}
            </div>
            <div style={{ padding: '1.5rem' }}>
              {isFinished ? (
                <div>
                  <p style={{ color: glass.colors.text, fontSize: '15px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                    {generateMatchSummary(match)}
                  </p>
                  <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: `1px solid ${glass.colors.border}` }}>
                    <p style={{ color: glass.colors.muted, fontSize: '12px', marginBottom: '0.5rem', fontWeight: '600' }}>📱 SHORT VERSION</p>
                    <p style={{ color: glass.colors.text, fontSize: '14px' }}>{generateShortSummary(match)}</p>
                    <button onClick={() => { navigator.clipboard.writeText(generateShortSummary(match)); alert('Copied!'); }}
                      style={{ ...glass.button.secondary, marginTop: '0.75rem', padding: '4px 12px', fontSize: '12px' }}>
                      📋 Copy Short Version
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ color: glass.colors.muted, textAlign: 'center', padding: '2rem' }}>
                  Summary available after the match finishes.
                </p>
              )}
            </div>
          </div>
          <div style={{ padding: '1rem', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)', fontSize: '13px', color: '#fbbf24' }}>
            💡 <strong>Coming soon:</strong> AI-powered summaries with Claude for deeper tactical analysis.
          </div>
        </div>
      )}
    </div>
  );
}