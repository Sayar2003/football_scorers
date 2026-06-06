import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getGlass } from '../../styles/glass';
import { useTheme } from '../../context/ThemeContext';
import { API_BASE_URL } from '../../config/apiConfig';

// --- FIXED: Let backend proxy handle authentication tokens securely ---
const api = axios.create({
  baseURL: API_BASE_URL
});

const LEAGUE_CODES = ['PL', 'PD', 'BL1', 'SA', 'FL1'];

// Color palette array for dynamic multi-player color assignments
const PLAYER_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#a855f7', '#ec4899'];

const getPositionColor = (pos) => {
  if (!pos) return '#3b82f6';
  if (pos.includes('Goalkeeper')) return '#f59e0b';
  if (pos.includes('Defence')) return '#10b981';
  if (pos.includes('Midfield')) return '#3b82f6';
  if (pos.includes('Offence')) return '#ef4444';
  return '#3b82f6';
};

const calculateRadarData = (stats, position) => {
  const goals = stats?.goals || 0;
  const assists = stats?.assists || 0;
  const matches = stats?.playedMatches || 1;
  const penalties = stats?.penalties || 0;

  if (position?.includes('Goalkeeper')) {
    return [
      { stat: 'Reflexes', value: 75 },
      { stat: 'Positioning', value: 80 },
      { stat: 'Distribution', value: Math.min(100, (matches / 38) * 100) },
      { stat: 'Command', value: 70 },
      { stat: 'Aerial', value: 65 },
      { stat: 'Saves', value: Math.max(50, 100 - goals * 10) },
    ];
  }

  if (position?.includes('Defence')) {
    return [
      { stat: 'Defending', value: 80 },
      { stat: 'Tackling', value: 75 },
      { stat: 'Positioning', value: Math.min(100, (matches / 38) * 100) },
      { stat: 'Heading', value: 70 },
      { stat: 'Passing', value: Math.min(100, ((goals + assists) / matches) * 60) },
      { stat: 'Goals', value: Math.min(100, (goals / matches) * 100) },
    ];
  }

  return [
    { stat: 'Goals', value: Math.min(100, (goals / matches) * 100) },
    { stat: 'Assists', value: Math.min(100, (assists / matches) * 80) },
    { stat: 'Involvement', value: Math.min(100, ((goals + assists) / matches) * 60) },
    { stat: 'Consistency', value: Math.min(100, (matches / 38) * 100) },
    { stat: 'Efficiency', value: Math.min(100, goals > 0 ? ((goals - penalties) / goals) * 100 : 50) },
    { stat: 'Impact', value: Math.min(100, ((goals * 2 + assists) / (matches * 0.3))) },
  ];
};

export default function PlayerComparator() {
  const { isDark } = useTheme();
  const glass = getGlass(isDark);
  const navigate = useNavigate();

  // --- FIXED: Unified Multi-Player Array State Pool ---
  const [selectedPlayers, setSelectedPlayers] = useState([]); // Array of { player, stats, radarData }
  
  // Search state variables
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const cachedTeams = useRef(null);

 const getAllPlayers = async () => {
  if (cachedTeams.current) return cachedTeams.current;
  try {
    // Hit your proxy's consolidated endpoint instead of looping 5 separate external requests
    const res = await api.get('/top-scorers');
    const allPlayers = res.data || [];
    cachedTeams.current = allPlayers;
    return allPlayers;
  } catch (err) {
    console.error("Error gathering data from local cache proxy:", err);
    return [];
  }
};

  // --- FIXED: Debounce Engine hooks for responsive search handling ---
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const all = await getAllPlayers();
        const filtered = all.filter(p =>
          p.player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.player.nationality?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered.slice(0, 8));
      } catch (err) {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350); // 350ms delay boundaries

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectPlayer = async (scorerItem) => {
    setSearchQuery('');
    setSearchResults([]);
    
    // Guard clause to prevent duplicate comparisons
    if (selectedPlayers.some(p => p.player.id === scorerItem.player.id)) return;

    setLoading(true);
    try {
      const playerRes = await api.get(`/persons/${scorerItem.player.id}`);
      const playerData = playerRes.data;
      
      const statsObj = {
        goals: scorerItem.goals,
        assists: scorerItem.assists,
        playedMatches: scorerItem.playedMatches,
        penalties: scorerItem.penalties,
      };

      playerData.statistics = [statsObj];
      const radarMetrics = calculateRadarData(statsObj, playerData.position);

      setSelectedPlayers(prev => [
        ...prev,
        { player: playerData, stats: statsObj, radarData: radarMetrics }
      ]);
    } catch (err) {
      console.error("Failed gathering structural profile details:", err);
    } finally {
      setLoading(false);
    }
  };

  const removePlayer = (index) => {
    setSelectedPlayers(prev => prev.filter((_, i) => i !== index));
  };

  // --- FIXED: Multi-Player Merging Engine for Recharts Radar Maps ---
  const buildMergedRadarData = () => {
    if (selectedPlayers.length === 0) return null;
    
    // Pick metrics framework template from player 1
    const baseMetrics = selectedPlayers[0].radarData;
    
    return baseMetrics.map((item, index) => {
      const row = { stat: item.stat };
      selectedPlayers.forEach((p, pIdx) => {
        row[`player_${pIdx}`] = Math.round(p.radarData[index]?.value || 0);
      });
      return row;
    });
  };

  const getMaxValueIndex = (valuesArray) => {
    const max = Math.max(...valuesArray);
    if (valuesArray.filter(v => v === max).length > 1) return -1; // Draw marker split
    return valuesArray.indexOf(max);
  };

  const renderMultiStatRow = (label, valuesExtractor) => {
    const values = selectedPlayers.map(valuesExtractor);
    const winningIndex = getMaxValueIndex(values);

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `120px repeat(${selectedPlayers.length}, 1fr)`,
        alignItems: 'center',
        padding: '0.75rem 1rem',
        borderBottom: `1px solid ${glass.colors.border}`,
        textAlign: 'center'
      }}>
        <div style={{ color: glass.colors.muted, fontSize: '12px', textAlign: 'left', fontWeight: '600', textTransform: 'uppercase' }}>
          {label}
        </div>
        {values.map((val, idx) => (
          <div key={idx} style={{
            fontWeight: idx === winningIndex ? '700' : '400',
            color: idx === winningIndex ? PLAYER_COLORS[idx % PLAYER_COLORS.length] : glass.colors.text,
            fontSize: '15px'
          }}>
            {val}
          </div>
        ))}
      </div>
    );
  };

  const radarData = buildMergedRadarData();

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }} className="fade-in">
      <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '0.5rem', color: glass.colors.text }}>
        ⚔️ Multi-Player Comparator
      </h1>
      <p style={{ color: glass.colors.muted, fontSize: '14px', marginBottom: '2rem' }}>
        Search and select up to 6 football players side-by-side to cross-reference performance analytics.
      </p>

      {/* Dynamic Search Box Layout Component */}
      <div style={{ position: 'relative', marginBottom: '2.5rem', maxWidth: '500px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search and add player (e.g. Haaland, Kane)..."
          disabled={selectedPlayers.length >= 6}
          style={{
            ...glass.input, width: '100%',
            padding: '0.85rem 1.2rem', fontSize: '14px',
            fontFamily: 'inherit'
          }}
        />

        {searching && (
          <div style={{ position: 'absolute', right: '15px', top: '12px', color: glass.colors.muted, fontSize: '12px' }}>
            Searching...
          </div>
        )}

        {/* Droplist Results Rendering Container */}
        {searchResults.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            zIndex: 50, borderRadius: '10px', overflow: 'hidden',
            background: isDark ? 'rgba(15,17,23,0.98)' : 'rgba(255,255,255,0.98)',
            border: `1px solid ${glass.colors.border}`,
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            marginTop: '4px'
          }}>
            {searchResults.map((item, i) => (
              <div key={i}
                onClick={() => handleSelectPlayer(item)}
                style={{
                  padding: '0.75rem 1rem', cursor: 'pointer',
                  borderBottom: `1px solid ${glass.colors.border}`,
                  display: 'flex', alignItems: 'center', gap: '10px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${getPositionColor(item.player.position)}, ${getPositionColor(item.player.position)}aa)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 'bold', color: 'white', flexShrink: 0
                }}>
                  {item.player.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: glass.colors.text, fontSize: '14px' }}>{item.player.name}</div>
                  <div style={{ fontSize: '12px', color: glass.colors.muted }}>{item.team.name} · {item.goals} goals</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading && <p style={{ color: glass.colors.blue, marginBottom: '1rem' }}>Loading advanced analytics...</p>}

      {/* Selected Players Grid Headings Track */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {selectedPlayers.map((p, idx) => (
          <div key={p.player.id} style={{
            ...glass.card, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '12px',
            border: `2px solid ${PLAYER_COLORS[idx % PLAYER_COLORS.length]}`
          }}>
            <div style={{
              width: '12px', height: '12px', borderRadius: '50%',
              backgroundColor: PLAYER_COLORS[idx % PLAYER_COLORS.length]
            }} />
            <div>
              <div style={{ fontWeight: '700', fontSize: '14px', color: glass.colors.text }}>{p.player.name}</div>
              <div style={{ fontSize: '11px', color: glass.colors.muted }}>{p.player.currentTeam?.name || 'Unknown'}</div>
            </div>
            <button 
              onClick={() => removePlayer(idx)}
              style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Comparison Engine Render blocks */}
      {selectedPlayers.length >= 2 ? (
        <div className="fade-in">
          
          {/* Recharts Consolidated Radar Engine */}
          {radarData && (
            <div style={{ ...glass.card, padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ color: glass.colors.text, fontSize: '16px', fontWeight: '600', marginBottom: '1.5rem', textAlign: 'center' }}>
                📊 Multi-Attribute Radar Distribution
              </h3>
              <ResponsiveContainer width="100%" height={380}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke={glass.colors.border} />
                  <PolarAngleAxis dataKey="stat" tick={{ fill: glass.colors.muted, fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: isDark ? '#0f1117' : '#fff', borderRadius: '8px', color: glass.colors.text }} />
                  <Legend />
                  {selectedPlayers.map((p, idx) => (
                    <Radar
                      key={p.player.id}
                      name={p.player.name}
                      dataKey={`player_${idx}`}
                      stroke={PLAYER_COLORS[idx % PLAYER_COLORS.length]}
                      fill={PLAYER_COLORS[idx % PLAYER_COLORS.length]}
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Master Stats Comparison Matrix Box */}
          <div style={{ ...glass.card, overflow: 'hidden', marginBottom: '2rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `120px repeat(${selectedPlayers.length}, 1fr)`,
              padding: '1rem',
              background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)',
              borderBottom: `1px solid ${glass.colors.border}`,
              textAlign: 'center',
              fontWeight: '700'
            }}>
              <div style={{ color: glass.colors.text, textAlign: 'left', fontSize: '13px' }}>METRIC</div>
              {selectedPlayers.map((p, idx) => (
                <div key={idx} style={{ color: PLAYER_COLORS[idx % PLAYER_COLORS.length], fontSize: '14px' }}>
                  {p.player.name}
                </div>
              ))}
            </div>

            {renderMultiStatRow("Goals", (p) => p.stats?.goals || 0)}
            {renderMultiStatRow("Assists", (p) => p.stats?.assists || 0)}
            {renderMultiStatRow("Matches", (p) => p.stats?.playedMatches || 0)}
            {renderMultiStatRow("Penalties", (p) => p.stats?.penalties || 0)}
            {renderMultiStatRow("Goals / Match", (p) => p.stats ? ((p.stats.goals || 0) / (p.stats.playedMatches || 1)).toFixed(2) : 0)}
            {renderMultiStatRow("G+A Total", (p) => (p.stats?.goals || 0) + (p.stats?.assists || 0))}
          </div>

        </div>
      ) : (
        <div style={{ ...glass.card, padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '1rem' }}>⚔️</div>
          <p style={{ color: glass.colors.text, fontSize: '18px', fontWeight: '600', marginBottom: '0.5rem' }}>
            Select at least two players to initialize comparison
          </p>
          <p style={{ color: glass.colors.muted, fontSize: '14px' }}>
            Use the search pool bar input above to start aggregating profile telemetry maps side by side.
          </p>
        </div>
      )}
    </div>
  );
}