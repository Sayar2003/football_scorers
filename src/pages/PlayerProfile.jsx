import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { isFavoritePlayer, toggleFavoritePlayer } from '../utils/favorites';
import PlayerRadarChart from '../components/PlayerRadarChart';
import { useTheme } from '../context/ThemeContext';
import { getGlass } from '../styles/glass';

import { API_BASE_URL } from '../config/apiConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'X-Auth-Token': process.env.REACT_APP_FOOTBALL_API_KEY }
});

const getPositionColor = (pos) => {
  if (!pos) return '#3b82f6';
  if (pos.includes('Goalkeeper')) return '#f59e0b';
  if (pos.includes('Defence')) return '#10b981';
  if (pos.includes('Midfield')) return '#3b82f6';
  if (pos.includes('Offence')) return '#ef4444';
  return '#3b82f6';
};

const StatBox = ({ label, value, color, glass }) => (
  <div style={{ ...glass.card, textAlign: 'center', flex: 1, padding: '1rem' }}>
    <div style={{ fontSize: '28px', fontWeight: 'bold', color: color || glass.colors.blue }}>{value ?? 0}</div>
    <div style={{ fontSize: '12px', color: glass.colors.muted, marginTop: '4px' }}>{label}</div>
  </div>
);

export default function PlayerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('stats');
  const { isDark } = useTheme();
  const glass = getGlass(isDark);
  
  const [isFav, setIsFav] = useState(() => isFavoritePlayer(parseInt(id)));

  const handleFavorite = () => {
    if (!player) return;
    toggleFavoritePlayer({ id: parseInt(id), name: player.name, nationality: player.nationality });
    setIsFav(!isFav);
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    const fetchData = async () => {
      try {
        const playerRes = await api.get(`/persons/${id}`);
        const playerData = playerRes.data;
        
        const leagueCodes = ['PL', 'PD', 'BL1', 'SA', 'FL1'];
        let foundStats = null;

        for (const code of leagueCodes) {
          try {
            await new Promise(resolve => setTimeout(resolve, 300));
            const scorersRes = await api.get(`/competitions/${code}/scorers?limit=50`);
            const found = scorersRes.data.scorers.find(s => s.player.id === parseInt(id));
            if (found) {
              foundStats = {
                goals: found.goals,
                assists: found.assists,
                playedMatches: found.playedMatches,
                penalties: found.penalties,
              };
              break;
            }
          } catch {
            continue;
          }
        }

        if (isMounted) {
          if (foundStats) playerData.statistics = [foundStats];
          setPlayer(playerData);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setError('Failed to load player profile.');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [id]);

  if (loading) return <p style={{ padding: '2rem', color: glass.colors.muted }}>Loading player profile...</p>;
  if (error) return <p style={{ padding: '2rem', color: glass.colors.red }}>{error}</p>;
  if (!player) return null;

  const tabStyle = (tab) => ({
    padding: '0.6rem 1.5rem', cursor: 'pointer', borderRadius: '8px', border: 'none',
    fontWeight: '600', fontSize: '14px',
    background: activeTab === tab 
      ? 'linear-gradient(135deg, #3b82f6, #2563eb)' 
      : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
    color: activeTab === tab ? '#ffffff' : glass.colors.muted,
    transition: 'all 0.2s ease'
  });

  const sectionHeaderStyle = {
    padding: '0.75rem 1.5rem', 
    background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)', 
    fontWeight: '700', 
    fontSize: '14px', 
    color: glass.colors.text
  };

  const age = player.dateOfBirth ? new Date().getFullYear() - new Date(player.dateOfBirth).getFullYear() : 'N/A';
  const currentTeam = player.currentTeam;
  const seasonStats = player.statistics?.[0];

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }} className="fade-in">
      <button onClick={() => navigate(-1)} style={{ ...glass.button.secondary, padding: '0.5rem 1rem', marginBottom: '1.5rem' }}>← Back</button>

      {/* Player header */}
      <div style={{ ...glass.cardStrong, display: 'flex', alignItems: 'center', gap: '2rem', padding: '2rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{
          width: '90px', height: '90px', borderRadius: '50%',
          background: `linear-gradient(135deg, ${getPositionColor(player.position)}, ${getPositionColor(player.position)}aa)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '36px', fontWeight: 'bold', color: '#ffffff', flexShrink: 0,
          boxShadow: `0 0 30px ${getPositionColor(player.position)}44`
        }}>
          {player.name?.charAt(0)}
        </div>

        <div style={{ flex: 1, minWidth: '200px' }}>
          <h1 style={{
            fontSize: '28px', fontWeight: '700', marginBottom: '0.5rem',
            background: isDark 
              ? 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.8))' 
              : `linear-gradient(135deg, ${glass.colors.text}, ${glass.colors.muted})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
          }}>{player.name}</h1>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            <span style={{ background: `${getPositionColor(player.position)}33`, color: getPositionColor(player.position), padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
              {player.position || 'N/A'}
            </span>
            <span style={{ color: glass.colors.muted, fontSize: '14px' }}>🌍 {player.nationality}</span>
            <span style={{ color: glass.colors.muted, fontSize: '14px' }}>🎂 {age} years</span>
            {player.shirtNumber && <span style={{ color: glass.colors.muted, fontSize: '14px' }}>👕 #{player.shirtNumber}</span>}
          </div>
          <button onClick={handleFavorite} style={{
            background: isFav ? 'rgba(245,158,11,0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
            border: `1px solid ${isFav ? 'rgba(245,158,11,0.4)' : glass.colors.border}`,
            borderRadius: '8px', color: isFav ? '#fbbf24' : glass.colors.muted,
            cursor: 'pointer', padding: '6px 12px', fontSize: '14px', marginTop: '0.25rem'
          }}>
            {isFav ? '⭐ Saved' : '☆ Save Player'}
          </button>
          {currentTeam && (
            <div onClick={() => navigate(`/team/${currentTeam.id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.75rem', cursor: 'pointer' }}>
              <img src={currentTeam.crest} alt="" width={24} height={24} style={{ objectFit: 'contain' }} />
              <span style={{ color: glass.colors.blue, fontSize: '14px', fontWeight: '500' }}>{currentTeam.name}</span>
            </div>
          )}
        </div>

        <div style={{ ...glass.card, textAlign: 'center', padding: '1rem 1.5rem', minWidth: '120px' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#fbbf24' }}>
            {seasonStats?.goals ? ((seasonStats.goals / (seasonStats.playedMatches || 1)) * 10).toFixed(1) : 'N/A'}
          </div>
          <div style={{ fontSize: '12px', color: glass.colors.muted, marginTop: '4px' }}>Season Rating</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button style={tabStyle('stats')} onClick={() => setActiveTab('stats')}>📊 Season Stats</button>
        <button style={tabStyle('career')} onClick={() => setActiveTab('career')}>🏆 Career</button>
      </div>

      {activeTab === 'stats' && (
        <div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <StatBox label="Goals" value={seasonStats?.goals} color="#ef4444" glass={glass} />
            <StatBox label="Assists" value={seasonStats?.assists} color="#10b981" glass={glass} />
            <StatBox label="Matches" value={seasonStats?.playedMatches} color={glass.colors.blue} glass={glass} />
            <StatBox label="Penalties" value={seasonStats?.penalties} color="#fbbf24" glass={glass} />
          </div>

          {/* Fixed Radar Chart Component - Passing theme down */}
          <PlayerRadarChart
            seasonStats={seasonStats}
            position={player.position}
            playerName={player.name}
            isDark={isDark}
            glass={glass}
          />

          <div style={{ ...glass.card, overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={sectionHeaderStyle}>Public Profile Metadata</div>
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
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.5rem', borderTop: `1px solid ${glass.colors.border}`, fontSize: '14px' }}>
                <span style={{ color: glass.colors.muted }}>{item.label}</span>
                <span style={{ color: glass.colors.text, fontWeight: '500' }}>{item.value}</span>
              </div>
            ))}
          </div>

          <div style={{ ...glass.card, overflow: 'hidden' }}>
            <div style={sectionHeaderStyle}>⚡ Performance Indicators</div>
            {[
              { label: 'Goal Contribution', value: (seasonStats?.goals || 0) + (seasonStats?.assists || 0), max: 30, color: '#ef4444' },
              { label: 'Goals per Match', value: ((seasonStats?.goals || 0) / (seasonStats?.playedMatches || 1) * 10).toFixed(1), max: 10, color: '#fbbf24' },
              { label: 'Matches Played', value: seasonStats?.playedMatches || 0, max: 38, color: glass.colors.blue },
            ].map((item, i) => (
              <div key={i} style={{ padding: '0.75rem 1.5rem', borderTop: `1px solid ${glass.colors.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: glass.colors.muted, fontSize: '13px' }}>{item.label}</span>
                  <span style={{ color: glass.colors.text, fontSize: '13px', fontWeight: '600' }}>{item.value}</span>
                </div>
                <div style={{ height: '6px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '3px', backgroundColor: item.color, width: `${Math.min((parseFloat(item.value) / item.max) * 100, 100)}%`, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'career' && (
        <div>
          {currentTeam ? (
            <div>
              <h3 style={{ fontSize: '11px', color: glass.colors.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', fontWeight: '700' }}>Current Club</h3>
              <div onClick={() => navigate(`/team/${currentTeam.id}`)}
                className="hover-glow"
                style={{ ...glass.card, display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
                <img src={currentTeam.crest} alt="" width={50} height={50} style={{ objectFit: 'contain' }} />
                <div>
                  <div style={{ fontWeight: '600', fontSize: '16px', color: glass.colors.text }}>{currentTeam.name}</div>
                  <div style={{ color: glass.colors.muted, fontSize: '13px' }}>{currentTeam.area?.name} · Founded {currentTeam.founded}</div>
                  {currentTeam.contract && <div style={{ color: glass.colors.blue, fontSize: '13px', marginTop: '4px', fontWeight: '500' }}>Contract until: {currentTeam.contract.until || 'N/A'}</div>}
                </div>
              </div>

              <h3 style={{ fontSize: '11px', color: glass.colors.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', fontWeight: '700' }}>Competitions</h3>
              {currentTeam.runningCompetitions?.map(comp => (
                <div key={comp.id} className="hover-glow"
                  style={{ ...glass.card, display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1.5rem', borderRadius: '10px', marginBottom: '0.5rem' }}>
                  <img src={comp.emblem} alt="" width={30} height={30} style={{ objectFit: 'contain' }} />
                  <div>
                    <div style={{ color: glass.colors.text, fontWeight: '500' }}>{comp.name}</div>
                    <div style={{ color: glass.colors.muted, fontSize: '12px' }}>{comp.area?.name}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: glass.colors.muted, textAlign: 'center', padding: '2rem' }}>No career data available.</p>
          )}
        </div>
      )}
    </div>
  );
}