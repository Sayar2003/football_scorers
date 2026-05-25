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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/matches/${id}`)
      .then(res => {
        setMatch(res.data);
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
      <div style={{ textAlign: 'center', padding: '2rem', borderRadius: '16px', border: '1px solid #e5e7eb', marginBottom: '1.5rem', backgroundColor: '#f9fafb' }}>
        <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '14px' }}>
          {match.competition.name} — {new Date(match.utcDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
          {/* Home team */}
          <div style={{ textAlign: 'center', flex: 1 }}>
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
            <div style={{ fontSize: '13px', color: match.status === 'IN_PLAY' ? '#16a34a' : '#6b7280', marginTop: '4px' }}>
              {match.status === 'IN_PLAY' ? '🔴 LIVE' : match.status === 'FINISHED' ? 'Full Time' : 'Upcoming'}
            </div>
          </div>

          {/* Away team */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <img src={away.crest} alt={away.name} width={60} style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{away.shortName || away.name}</div>
          </div>
        </div>
      </div>

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
            {/* Home lineup */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{home.shortName || home.name}</div>
              {match.lineups[0].startXI?.map((p, i) => (
                <div key={i} style={{ fontSize: '14px', padding: '4px 0', borderBottom: '1px solid #f3f4f6' }}>
                  {p.player.shirtNumber}. {p.player.name}
                </div>
              ))}
            </div>
            {/* Away lineup */}
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

    </div>
  );
}