import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const api = axios.create({
  baseURL: '/v4',
  headers: { 'X-Auth-Token': process.env.REACT_APP_FOOTBALL_API_KEY }
});

const dark = {
  card: '#1a1d27', border: '#2d3148',
  text: '#ffffff', muted: '#9ca3af', blue: '#3b82f6',
};

const StatBox = ({ label, value, color }) => (
  <div style={{
    backgroundColor: dark.card, border: `1px solid ${dark.border}`,
    borderRadius: '12px', padding: '1rem', textAlign: 'center', flex: 1
  }}>
    <div style={{ fontSize: '28px', fontWeight: 'bold', color: color || dark.blue }}>{value ?? 0}</div>
    <div style={{ fontSize: '12px', color: dark.muted, marginTop: '4px' }}>{label}</div>
  </div>
);

export default function PlayerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    setLoading(true);
    api.get(`/persons/${id}`)
      .then(res => {
        setPlayer(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load player profile.');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p style={{ padding: '2rem', color: dark.muted }}>Loading player profile...</p>;
  if (error) return <p style={{ padding: '2rem', color: '#ef4444' }}>{error}</p>;
  if (!player) return null;

  const tabStyle = (tab) => ({
    padding: '0.6rem 1.5rem', cursor: 'pointer',
    borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '14px',
    backgroundColor: activeTab === tab ? dark.blue : '#1e2130',
    color: activeTab === tab ? 'white' : dark.muted,
  });

  const age = player.dateOfBirth
    ? new Date().getFullYear() - new Date(player.dateOfBirth).getFullYear()
    : 'N/A';

  const currentTeam = player.currentTeam;
  const seasonStats = player.statistics?.[0];

  const getPositionColor = (pos) => {
    if (!pos) return dark.blue;
    if (pos.includes('Goalkeeper')) return '#f59e0b';
    if (pos.includes('Defence')) return '#10b981';
    if (pos.includes('Midfield')) return '#3b82f6';
    if (pos.includes('Offence') || pos.includes('Forward')) return '#ef4444';
    return dark.blue;
  };

  const recentMatches = player.statistics || [];

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>

      {/* Back button */}
      <button onClick={() => navigate(-1)} style={{
        marginBottom: '1.5rem', padding: '0.5rem 1rem', cursor: 'pointer',
        borderRadius: '8px', border: `1px solid ${dark.border}`,
        backgroundColor: dark.card, color: dark.text
      }}>← Back</button>

      {/* Player header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '2rem',
        padding: '2rem', borderRadius: '16px',
        border: `1px solid ${dark.border}`,
        marginBottom: '1.5rem', backgroundColor: dark.card
      }}>
        {/* Avatar */}
        <div style={{
          width: '90px', height: '90px', borderRadius: '50%',
          backgroundColor: getPositionColor(player.position),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '36px', fontWeight: 'bold', color: 'white', flexShrink: 0
        }}>
          {player.name?.charAt(0)}
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: dark.text, marginBottom: '0.5rem' }}>
            {player.name}
          </h1>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{
              backgroundColor: getPositionColor(player.position),
              color: 'white', padding: '2px 10px',
              borderRadius: '20px', fontSize: '12px', fontWeight: '600'
            }}>
              {player.position || 'N/A'}
            </span>
            <span style={{ color: dark.muted, fontSize: '14px' }}>🌍 {player.nationality}</span>
            <span style={{ color: dark.muted, fontSize: '14px' }}>🎂 {age} years old</span>
            {player.shirtNumber && (
              <span style={{ color: dark.muted, fontSize: '14px' }}>👕 #{player.shirtNumber}</span>
            )}
          </div>

          {/* Current team */}
          {currentTeam && (
            <div
              onClick={() => navigate(`/team/${currentTeam.id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.75rem', cursor: 'pointer' }}
            >
              <img src={currentTeam.crest} alt="" width={24} />
              <span style={{ color: dark.blue, fontSize: '14px', fontWeight: '500' }}>
                {currentTeam.name}
              </span>
            </div>
          )}
        </div>

        {/* Season rating */}
        <div style={{
          textAlign: 'center', padding: '1rem 1.5rem',
          borderRadius: '12px', border: `1px solid ${dark.border}`,
          backgroundColor: '#13161f'
        }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f59e0b' }}>
            {seasonStats?.goals ? ((seasonStats.goals / (seasonStats.playedMatches || 1)) * 10).toFixed(1) : 'N/A'}
          </div>
          <div style={{ fontSize: '12px', color: dark.muted, marginTop: '4px' }}>Season Rating</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button style={tabStyle('stats')} onClick={() => setActiveTab('stats')}>📊 Season Stats</button>
        <button style={tabStyle('career')} onClick={() => setActiveTab('career')}>🏆 Career</button>
      </div>

      {/* Season Stats tab */}
      {activeTab === 'stats' && (
        <div>
          {/* Stat boxes */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <StatBox label="Goals" value={seasonStats?.goals} color="#ef4444" />
            <StatBox label="Assists" value={seasonStats?.assists} color="#10b981" />
            <StatBox label="Matches" value={seasonStats?.playedMatches} color={dark.blue} />
            <StatBox label="Penalties" value={seasonStats?.penalties} color="#f59e0b" />
          </div>

          {/* Player info */}
          <div style={{
            borderRadius: '12px', border: `1px solid ${dark.border}`,
            overflow: 'hidden', marginBottom: '1.5rem'
          }}>
            <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#13161f', fontWeight: 'bold', fontSize: '14px', color: dark.text }}>
              👤 Player Info
            </div>
            {[
              { label: 'Full Name', value: player.name },
              { label: 'Date of Birth', value: player.dateOfBirth ? new Date(player.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A' },
              { label: 'Age', value: `${age} years` },
              { label: 'Nationality', value: player.nationality },
              { label: 'Position', value: player.position },
              { label: 'Shirt Number', value: player.shirtNumber ? `#${player.shirtNumber}` : 'N/A' },
              { label: 'Current Club', value: currentTeam?.name || 'N/A' },
              { label: 'Contract Until', value: currentTeam?.contract?.until || 'N/A' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '0.75rem 1.5rem',
                borderTop: `1px solid ${dark.border}`,
                fontSize: '14px'
              }}>
                <span style={{ color: dark.muted }}>{item.label}</span>
                <span style={{ color: dark.text, fontWeight: '500' }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Performance rating bar */}
          <div style={{
            borderRadius: '12px', border: `1px solid ${dark.border}`,
            overflow: 'hidden'
          }}>
            <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#13161f', fontWeight: 'bold', fontSize: '14px', color: dark.text }}>
              ⚡ Performance Indicators
            </div>
            {[
              { label: 'Goal Contribution', value: ((seasonStats?.goals || 0) + (seasonStats?.assists || 0)), max: 30, color: '#ef4444' },
              { label: 'Goals per Match', value: ((seasonStats?.goals || 0) / (seasonStats?.playedMatches || 1) * 10).toFixed(1), max: 10, color: '#f59e0b' },
              { label: 'Matches Played', value: seasonStats?.playedMatches || 0, max: 38, color: dark.blue },
            ].map((item, i) => (
              <div key={i} style={{ padding: '0.75rem 1.5rem', borderTop: `1px solid ${dark.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: dark.muted, fontSize: '13px' }}>{item.label}</span>
                  <span style={{ color: dark.text, fontSize: '13px', fontWeight: '600' }}>{item.value}</span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#2d3148', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '3px',
                    backgroundColor: item.color,
                    width: `${Math.min((item.value / item.max) * 100, 100)}%`,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Career tab */}
      {activeTab === 'career' && (
        <div>
          {player.currentTeam ? (
            <div>
              <h3 style={{ fontSize: '14px', color: dark.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>
                Current Club
              </h3>
              <div
                onClick={() => navigate(`/team/${currentTeam.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1rem 1.5rem', borderRadius: '12px',
                  border: `1px solid ${dark.border}`, backgroundColor: dark.card,
                  cursor: 'pointer', marginBottom: '1.5rem'
                }}
              >
                <img src={currentTeam.crest} alt="" width={50} />
                <div>
                  <div style={{ fontWeight: '600', fontSize: '16px', color: dark.text }}>{currentTeam.name}</div>
                  <div style={{ color: dark.muted, fontSize: '13px' }}>
                    {currentTeam.area?.name} · Founded {currentTeam.founded}
                  </div>
                  {currentTeam.contract && (
                    <div style={{ color: dark.blue, fontSize: '13px', marginTop: '4px' }}>
                      Contract until: {currentTeam.contract.until || 'N/A'}
                    </div>
                  )}
                </div>
              </div>

              <h3 style={{ fontSize: '14px', color: dark.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>
                League Competitions
              </h3>
              {currentTeam.runningCompetitions?.map(comp => (
                <div key={comp.id} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '0.75rem 1.5rem', borderRadius: '10px',
                  border: `1px solid ${dark.border}`, backgroundColor: dark.card,
                  marginBottom: '0.5rem'
                }}>
                  <img src={comp.emblem} alt="" width={30} />
                  <div>
                    <div style={{ color: dark.text, fontWeight: '500' }}>{comp.name}</div>
                    <div style={{ color: dark.muted, fontSize: '12px' }}>{comp.area?.name}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: dark.muted, textAlign: 'center', padding: '2rem' }}>No career data available.</p>
          )}
        </div>
      )}
    </div>
  );
}