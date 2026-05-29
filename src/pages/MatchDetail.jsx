import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RatingBadge from '../components/RatingBadge';
import { calculatePlayerRating, getRatingColor } from '../utils/ratingCalculator';
import { generateMatchSummary, generateShortSummary } from '../utils/matchSummarizer';

const api = axios.create({
  baseURL: '/v4',
  headers: { 'X-Auth-Token': process.env.REACT_APP_FOOTBALL_API_KEY }
});

const dark = {
  card: '#1a1d27', border: '#2d3148',
  text: '#ffffff', muted: '#9ca3af', blue: '#3b82f6',
};

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
    api.get(`/matches/${id}`)
      .then(res => {
        setMatch(res.data);
        return api.get(`/matches/${id}/head2head?limit=10`);
      })
      .then(res => {
        setH2h(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load match details.');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p style={{ padding: '2rem', color: dark.muted }}>Loading match details...</p>;
  if (error) return <p style={{ padding: '2rem', color: '#ef4444' }}>{error}</p>;
  if (!match) return null;

  const home = match.homeTeam;
  const away = match.awayTeam;
  const score = match.score.fullTime;
  const isFinished = match.status === 'FINISHED';
  const homeWon = isFinished && score.home > score.away;
  const awayWon = isFinished && score.away > score.home;
  const isDraw = isFinished && score.home === score.away;

  const tabStyle = (tab) => ({
    padding: '0.6rem 1.5rem', cursor: 'pointer',
    borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '14px',
    backgroundColor: activeTab === tab ? dark.blue : '#1e2130',
    color: activeTab === tab ? 'white' : dark.muted,
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
  const draws = h2hMatches.filter(m =>
    m.score.fullTime.home === m.score.fullTime.away
  ).length;

  // Calculate ratings for lineup players
  const getPlayerRating = (player, isHomeTeam) => {
    const isWin = isHomeTeam ? homeWon : awayWon;
    const isLoss = isHomeTeam ? awayWon : homeWon;
    const isGoalkeeper = player.position === 'Goalkeeper';
    return calculatePlayerRating(
      player.player,
      match.goals,
      isWin,
      isDraw,
      isLoss,
      isGoalkeeper
    );
  };

  // Fake possession based on goals (visual only)
  const homePossession = isFinished
    ? Math.min(70, Math.max(30, 50 + (score.home - score.away) * 5))
    : 50;
  const awayPossession = 100 - homePossession;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>

      <button onClick={() => navigate(-1)} style={{
        marginBottom: '1.5rem', padding: '0.5rem 1rem', cursor: 'pointer',
        borderRadius: '8px', border: `1px solid ${dark.border}`,
        backgroundColor: dark.card, color: dark.text
      }}>← Back</button>

      {/* Match header */}
      <div style={{
        textAlign: 'center', padding: '2rem', borderRadius: '16px',
        border: `1px solid ${dark.border}`, marginBottom: '1.5rem',
        backgroundColor: dark.card
      }}>
        <p style={{ color: dark.muted, marginBottom: '1rem', fontSize: '14px' }}>
          {match.competition.name} — {new Date(match.utcDate).toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          })}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
          <div style={{ textAlign: 'center', flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/team/${home.id}`)}>
            <img src={home.crest} alt={home.name} width={60} style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontWeight: 'bold', fontSize: '18px', color: homeWon ? '#60a5fa' : dark.text }}>
              {home.shortName || home.name}
            </div>
            {homeWon && <div style={{ fontSize: '11px', color: '#60a5fa', marginTop: '2px' }}>WINNER</div>}
          </div>

          <div style={{ textAlign: 'center' }}>
            {match.status === 'SCHEDULED' ? (
              <div style={{ fontSize: '24px', color: dark.muted }}>vs</div>
            ) : (
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: dark.text }}>
                {score.home ?? '-'} : {score.away ?? '-'}
              </div>
            )}
            <div style={{ fontSize: '13px', marginTop: '4px', color: match.status === 'IN_PLAY' ? '#16a34a' : dark.muted }}>
              {match.status === 'IN_PLAY' ? '🔴 LIVE' : match.status === 'FINISHED' ? 'Full Time' : 'Upcoming'}
            </div>
          </div>

          <div style={{ textAlign: 'center', flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/team/${away.id}`)}>
            <img src={away.crest} alt={away.name} width={60} style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontWeight: 'bold', fontSize: '18px', color: awayWon ? '#60a5fa' : dark.text }}>
              {away.shortName || away.name}
            </div>
            {awayWon && <div style={{ fontSize: '11px', color: '#60a5fa', marginTop: '2px' }}>WINNER</div>}
          </div>
        </div>

        {/* Possession bar */}
        {isFinished && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: dark.muted, marginBottom: '4px' }}>
              <span>{homePossession}%</span>
              <span>Possession</span>
              <span>{awayPossession}%</span>
            </div>
            <div style={{ height: '6px', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${homePossession}%`, backgroundColor: '#3b82f6' }} />
              <div style={{ width: `${awayPossession}%`, backgroundColor: '#ef4444' }} />
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
          {/* Match stats */}
          {isFinished && (
            <div style={{ borderRadius: '12px', border: `1px solid ${dark.border}`, overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#13161f', fontWeight: 'bold', fontSize: '14px', color: dark.text }}>
                📊 Match Stats
              </div>
              {[
                { label: 'Goals', home: score.home, away: score.away },
                { label: 'Possession', home: `${homePossession}%`, away: `${awayPossession}%` },
                { label: 'Result', home: homeWon ? 'WIN' : isDraw ? 'DRAW' : 'LOSS', away: awayWon ? 'WIN' : isDraw ? 'DRAW' : 'LOSS' },
              ].map((stat, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center',
                  padding: '0.75rem 1.5rem',
                  borderTop: `1px solid ${dark.border}`,
                }}>
                  <div style={{ flex: 1, textAlign: 'left', fontWeight: '600', color: dark.text, fontSize: '14px' }}>{stat.home}</div>
                  <div style={{ flex: 1, textAlign: 'center', color: dark.muted, fontSize: '13px' }}>{stat.label}</div>
                  <div style={{ flex: 1, textAlign: 'right', fontWeight: '600', color: dark.text, fontSize: '14px' }}>{stat.away}</div>
                </div>
              ))}
            </div>
          )}

          {/* Goals */}
          {match.goals && match.goals.length > 0 && (
            <div style={{ borderRadius: '12px', border: `1px solid ${dark.border}`, overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#13161f', fontWeight: 'bold', fontSize: '14px', color: dark.text }}>
                ⚽ Goals
              </div>
              {match.goals.map((goal, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: goal.team.id === home.id ? 'flex-start' : 'flex-end',
                  padding: '0.75rem 1.5rem',
                  borderTop: `1px solid ${dark.border}`,
                  fontSize: '14px', color: dark.text
                }}>
                  <span>
                    {goal.team.id === home.id ? '⚽ ' : ''}
                    <strong>{goal.scorer?.name}</strong> {goal.minute}'
                    {goal.assist && <span style={{ color: dark.muted }}> (assist: {goal.assist.name})</span>}
                    {goal.team.id !== home.id ? ' ⚽' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Lineups */}
          {match.lineups && match.lineups.length === 2 && (
            <div style={{ borderRadius: '12px', border: `1px solid ${dark.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#13161f', fontWeight: 'bold', fontSize: '14px', color: dark.text }}>
                👥 Lineups
              </div>
              <div style={{ display: 'flex', gap: '1rem', padding: '1rem 1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: dark.text }}>{home.shortName || home.name}</div>
                  {match.lineups[0].startXI?.map((p, i) => (
                    <div key={i} style={{ fontSize: '14px', padding: '4px 0', borderBottom: `1px solid ${dark.border}`, color: dark.muted }}>
                      {p.player.shirtNumber}. {p.player.name}
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: dark.text }}>{away.shortName || away.name}</div>
                  {match.lineups[1].startXI?.map((p, i) => (
                    <div key={i} style={{ fontSize: '14px', padding: '4px 0', borderBottom: `1px solid ${dark.border}`, color: dark.muted }}>
                      {p.player.shirtNumber}. {p.player.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!match.goals?.length && !match.lineups?.length && (
            <p style={{ color: dark.muted, textAlign: 'center', padding: '2rem' }}>
              Detailed match data not available on free tier.
            </p>
          )}
        </div>
      )}

      {/* Ratings tab */}
      {activeTab === 'ratings' && (
        <div>
          {match.lineups && match.lineups.length === 2 ? (
            <div style={{ display: 'flex', gap: '1rem' }}>
              {/* Home ratings */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: dark.text, fontSize: '15px' }}>
                  <img src={home.crest} alt="" width={20} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  {home.shortName || home.name}
                </div>
                {match.lineups[0].startXI?.map((p, i) => {
                  const rating = getPlayerRating(p, true);
                  return (
                    <div
                      key={i}
                      onClick={() => navigate(`/player/${p.player.id}`)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem', marginBottom: '4px',
                        borderRadius: '8px', border: `1px solid ${dark.border}`,
                        backgroundColor: dark.card, cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: dark.muted, fontSize: '12px', width: '16px' }}>{p.player.shirtNumber}</span>
                        <span style={{ color: dark.text, fontSize: '13px' }}>{p.player.name}</span>
                      </div>
                      <RatingBadge rating={rating} size="sm" />
                    </div>
                  );
                })}
              </div>

              {/* Away ratings */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: dark.text, fontSize: '15px' }}>
                  <img src={away.crest} alt="" width={20} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  {away.shortName || away.name}
                </div>
                {match.lineups[1].startXI?.map((p, i) => {
                  const rating = getPlayerRating(p, false);
                  return (
                    <div
                      key={i}
                      onClick={() => navigate(`/player/${p.player.id}`)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem', marginBottom: '4px',
                        borderRadius: '8px', border: `1px solid ${dark.border}`,
                        backgroundColor: dark.card, cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: dark.muted, fontSize: '12px', width: '16px' }}>{p.player.shirtNumber}</span>
                        <span style={{ color: dark.text, fontSize: '13px' }}>{p.player.name}</span>
                      </div>
                      <RatingBadge rating={rating} size="sm" />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: dark.muted, marginBottom: '1rem' }}>Lineup data not available for this match.</p>
              <p style={{ color: dark.muted, fontSize: '13px' }}>Ratings are calculated based on match result and goal contributions.</p>
            </div>
          )}
        </div>
      )}

      {/* Head to Head tab */}
      {activeTab === 'h2h' && (
        <div>
          {h2hMatches.length === 0 ? (
            <p style={{ color: dark.muted, textAlign: 'center', padding: '2rem' }}>No head to head data available.</p>
          ) : (
            <div>
              <div style={{
                display: 'flex', borderRadius: '12px',
                border: `1px solid ${dark.border}`, overflow: 'hidden',
                marginBottom: '1.5rem', textAlign: 'center'
              }}>
                <div style={{ flex: 1, padding: '1rem', backgroundColor: '#1e3a5f' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#60a5fa' }}>{homeWins}</div>
                  <div style={{ fontSize: '13px', color: '#60a5fa', fontWeight: '600' }}>{home.shortName || home.name}</div>
                  <div style={{ fontSize: '12px', color: dark.muted }}>Wins</div>
                </div>
                <div style={{ flex: 1, padding: '1rem', backgroundColor: '#13161f' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: dark.text }}>{draws}</div>
                  <div style={{ fontSize: '13px', color: dark.text, fontWeight: '600' }}>Draws</div>
                  <div style={{ fontSize: '12px', color: dark.muted }}>out of {h2hMatches.length}</div>
                </div>
                <div style={{ flex: 1, padding: '1rem', backgroundColor: '#3d0000' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f87171' }}>{awayWins}</div>
                  <div style={{ fontSize: '13px', color: '#f87171', fontWeight: '600' }}>{away.shortName || away.name}</div>
                  <div style={{ fontSize: '12px', color: dark.muted }}>Wins</div>
                </div>
              </div>

              <h3 style={{ fontSize: '12px', fontWeight: '700', color: dark.muted, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Recent Meetings
              </h3>
              {h2hMatches.map(m => {
                const isHomeTeamHome = m.homeTeam.id === home.id;
                const homeScore = m.score.fullTime.home;
                const awayScore = m.score.fullTime.away;
                const homeWon = isHomeTeamHome ? homeScore > awayScore : awayScore > homeScore;
                const awayWon = isHomeTeamHome ? awayScore > homeScore : homeScore > awayScore;

                return (
                  <div
                    key={m.id}
                    onClick={() => navigate(`/match/${m.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem', marginBottom: '0.5rem',
                      borderRadius: '10px', border: `1px solid ${dark.border}`,
                      backgroundColor: dark.card, cursor: 'pointer', fontSize: '14px'
                    }}
                  >
                    <div style={{ width: '30%', fontSize: '12px', color: dark.muted }}>
                      {new Date(m.utcDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', width: '40%' }}>
                      <span style={{ fontWeight: homeWon ? 'bold' : 'normal', color: dark.text }}>
                        <img src={m.homeTeam.crest} alt="" width={18} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        {m.homeTeam.shortName || m.homeTeam.name}
                      </span>
                      <span style={{ fontWeight: 'bold', fontSize: '15px', color: dark.text }}>
                        {homeScore} - {awayScore}
                      </span>
                      <span style={{ fontWeight: awayWon ? 'bold' : 'normal', color: dark.text }}>
                        {m.awayTeam.shortName || m.awayTeam.name}
                        <img src={m.awayTeam.crest} alt="" width={18} style={{ verticalAlign: 'middle', marginLeft: '4px' }} />
                      </span>
                    </div>
                    <div style={{ width: '30%', textAlign: 'right', fontSize: '12px', color: dark.muted }}>
                      {m.competition.name}
                    </div>
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
    <div style={{
      borderRadius: '12px', border: `1px solid ${dark.border}`,
      overflow: 'hidden', marginBottom: '1.5rem'
    }}>
      <div style={{
        padding: '0.75rem 1.5rem', backgroundColor: '#13161f',
        fontWeight: 'bold', fontSize: '14px', color: dark.text,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span>📝 Match Summary</span>
        {match.status === 'FINISHED' && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(generateMatchSummary(match));
              alert('Summary copied to clipboard!');
            }}
            style={{
              padding: '4px 12px', borderRadius: '6px',
              border: `1px solid ${dark.border}`, backgroundColor: dark.card,
              color: dark.muted, fontSize: '12px', cursor: 'pointer'
            }}
          >
            📋 Copy
          </button>
        )}
      </div>
      <div style={{ padding: '1.5rem' }}>
        {match.status === 'FINISHED' ? (
          <div>
            <p style={{
              color: dark.text, fontSize: '15px', lineHeight: '1.8',
              whiteSpace: 'pre-wrap'
            }}>
              {generateMatchSummary(match)}
            </p>

            {/* Short summary for social media */}
            <div style={{
              marginTop: '1.5rem', padding: '1rem', borderRadius: '8px',
              border: `1px solid ${dark.border}`, backgroundColor: '#13161f'
            }}>
              <p style={{ color: dark.muted, fontSize: '12px', marginBottom: '0.5rem', fontWeight: '600' }}>
                📱 SHORT VERSION (for social media)
              </p>
              <p style={{ color: dark.text, fontSize: '14px' }}>
                {generateShortSummary(match)}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateShortSummary(match));
                  alert('Short summary copied!');
                }}
                style={{
                  marginTop: '0.75rem', padding: '4px 12px', borderRadius: '6px',
                  border: `1px solid ${dark.border}`, backgroundColor: dark.card,
                  color: dark.muted, fontSize: '12px', cursor: 'pointer'
                }}
              >
                📋 Copy Short Version
              </button>
            </div>
          </div>
        ) : (
          <p style={{ color: dark.muted, textAlign: 'center', padding: '2rem' }}>
            Summary will be available after the match finishes.
          </p>
        )}
      </div>
    </div>

    {/* AI upgrade notice */}
    <div style={{
      padding: '1rem', borderRadius: '8px',
      border: `1px solid #f59e0b44`, backgroundColor: '#f59e0b11',
      fontSize: '13px', color: '#f59e0b'
    }}>
      💡 <strong>Coming soon:</strong> AI-powered summaries with Claude will provide deeper tactical analysis and journalist-quality match reports.
    </div>
  </div>
)}
    </div>
  );
}