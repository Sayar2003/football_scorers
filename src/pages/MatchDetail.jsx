import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const api = axios.create({
  baseURL: '/v4',
  headers: {
    'X-Auth-Token': process.env.REACT_APP_FOOTBALL_API_KEY
  }
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

  if (loading) return <p style={{ padding: '2rem' }}>Loading match details...</p>;
  if (error) return <p style={{ padding: '2rem', color: 'red' }}>{error}</p>;
  if (!match) return null;

  const home = match.homeTeam;
  const away = match.awayTeam;
  const score = match.score.fullTime;

  const tabStyle = (tab) => ({
    padding: '0.6rem 1.5rem',
    cursor: 'pointer',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '600',
    fontSize: '14px',
    backgroundColor: activeTab === tab ? '#2563eb' : '#f3f4f6',
    color: activeTab === tab ? 'white' : '#374151',
  });

  // H2H stats
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

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: 'white' }}
      >
        ← Back
      </button>

      {/* Match header */}
      <div style={{
        textAlign: 'center', padding: '2rem', borderRadius: '16px',
        border: '1px solid #e5e7eb', marginBottom: '1.5rem',
        backgroundColor: '#f9fafb'
      }}>
        <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '14px' }}>
          {match.competition.name} — {new Date(match.utcDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
          {/* Home team */}
          <div
            style={{ textAlign: 'center', flex: 1, cursor: 'pointer' }}
            onClick={() => navigate(`/team/${home.id}`)}
          >
            <img src={home.crest} alt={home.name} width={60} style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{home.shortName || home.name}</div>
          </div>

          {/* Score */}
          <div style={{ textAlign: 'center' }}>
            {match.status === 'SCHEDULED' ? (
              <div style={{ fontSize: '24px', color: '#6b7280' }}>vs</div>
            ) : (
              <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
                {score.home ?? '-'} : {score.away ?? '-'}
              </div>
            )}
            <div style={{
              fontSize: '13px', marginTop: '4px',
              color: match.status === 'IN_PLAY' ? '#16a34a' : '#6b7280'
            }}>
              {match.status === 'IN_PLAY' ? '🔴 LIVE' : match.status === 'FINISHED' ? 'Full Time' : 'Upcoming'}
            </div>
          </div>

          {/* Away team */}
          <div
            style={{ textAlign: 'center', flex: 1, cursor: 'pointer' }}
            onClick={() => navigate(`/team/${away.id}`)}
          >
            <img src={away.crest} alt={away.name} width={60} style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{away.shortName || away.name}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}>📋 Overview</button>
        <button style={tabStyle('h2h')} onClick={() => setActiveTab('h2h')}>⚔️ Head to Head</button>
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Goals */}
          {match.goals && match.goals.length > 0 && (
            <div style={{ marginBottom: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#f3f4f6', fontWeight: 'bold', fontSize: '14px' }}>
                ⚽ Goals
              </div>
              {match.goals.map((goal, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: goal.team.id === home.id ? 'flex-start' : 'flex-end',
                  padding: '0.75rem 1.5rem',
                  borderTop: '1px solid #f3f4f6',
                  fontSize: '14px'
                }}>
                  <span>
                    {goal.team.id === home.id ? '⚽ ' : ''}
                    <strong>{goal.scorer?.name}</strong> {goal.minute}'
                    {goal.team.id !== home.id ? ' ⚽' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Lineups */}
          {match.lineups && match.lineups.length === 2 && (
            <div style={{ borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#f3f4f6', fontWeight: 'bold', fontSize: '14px' }}>
                👥 Lineups
              </div>
              <div style={{ display: 'flex', gap: '1rem', padding: '1rem 1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{home.shortName || home.name}</div>
                  {match.lineups[0].startXI?.map((p, i) => (
                    <div key={i} style={{ fontSize: '14px', padding: '4px 0', borderBottom: '1px solid #f3f4f6' }}>
                      {p.player.shirtNumber}. {p.player.name}
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{away.shortName || away.name}</div>
                  {match.lineups[1].startXI?.map((p, i) => (
                    <div key={i} style={{ fontSize: '14px', padding: '4px 0', borderBottom: '1px solid #f3f4f6' }}>
                      {p.player.shirtNumber}. {p.player.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!match.goals?.length && !match.lineups?.length && (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
              Detailed match data not available on free tier.
            </p>
          )}
        </div>
      )}

      {/* Head to Head tab */}
      {activeTab === 'h2h' && (
        <div>
          {h2hMatches.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No head to head data available.</p>
          ) : (
            <div>
              {/* H2H summary */}
              <div style={{
                display: 'flex', borderRadius: '12px',
                border: '1px solid #e5e7eb', overflow: 'hidden',
                marginBottom: '1.5rem', textAlign: 'center'
              }}>
                <div style={{ flex: 1, padding: '1rem', backgroundColor: '#dbeafe' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1d4ed8' }}>{homeWins}</div>
                  <div style={{ fontSize: '13px', color: '#1d4ed8', fontWeight: '600' }}>{home.shortName || home.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Wins</div>
                </div>
                <div style={{ flex: 1, padding: '1rem', backgroundColor: '#f3f4f6' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#374151' }}>{draws}</div>
                  <div style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>Draws</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>out of {h2hMatches.length}</div>
                </div>
                <div style={{ flex: 1, padding: '1rem', backgroundColor: '#fee2e2' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#dc2626' }}>{awayWins}</div>
                  <div style={{ fontSize: '13px', color: '#dc2626', fontWeight: '600' }}>{away.shortName || away.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Wins</div>
                </div>
              </div>

              {/* H2H match list */}
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#6b7280', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
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
                      borderRadius: '10px', border: '1px solid #e5e7eb',
                      backgroundColor: 'white', cursor: 'pointer', fontSize: '14px'
                    }}
                  >
                    <div style={{ width: '30%', fontSize: '12px', color: '#6b7280' }}>
                      {new Date(m.utcDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', width: '40%' }}>
                      <span style={{ fontWeight: homeWon ? 'bold' : 'normal' }}>
                        <img src={m.homeTeam.crest} alt="" width={18} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        {m.homeTeam.shortName || m.homeTeam.name}
                      </span>
                      <span style={{ fontWeight: 'bold', fontSize: '15px' }}>
                        {homeScore} - {awayScore}
                      </span>
                      <span style={{ fontWeight: awayWon ? 'bold' : 'normal' }}>
                        {m.awayTeam.shortName || m.awayTeam.name}
                        <img src={m.awayTeam.crest} alt="" width={18} style={{ verticalAlign: 'middle', marginLeft: '4px' }} />
                      </span>
                    </div>
                    <div style={{ width: '30%', textAlign: 'right', fontSize: '12px', color: '#6b7280' }}>
                      {m.competition.name}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}