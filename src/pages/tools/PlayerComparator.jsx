import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getGlass } from '../../styles/glass';
import { useTheme } from '../../context/ThemeContext';
import { API_BASE_URL } from '../../config/apiConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'X-Auth-Token': process.env.REACT_APP_FOOTBALL_API_KEY }
});

const LEAGUE_CODES = ['PL', 'PD', 'BL1', 'SA', 'FL1'];

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

const mergeRadarData = (data1, data2) => {
  return data1.map((item, i) => ({
    stat: item.stat,
    Player1: Math.round(item.value),
    Player2: Math.round(data2[i]?.value || 0),
  }));
};

export default function PlayerComparator() {
  const { isDark } = useTheme();
  const glass = getGlass(isDark);
  const navigate = useNavigate();

  const [searchQuery1, setSearchQuery1] = useState('');
  const [searchQuery2, setSearchQuery2] = useState('');
  const [searchResults1, setSearchResults1] = useState([]);
  const [searchResults2, setSearchResults2] = useState([]);
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [stats1, setStats1] = useState(null);
  const [stats2, setStats2] = useState(null);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [searching1, setSearching1] = useState(false);
  const [searching2, setSearching2] = useState(false);
  const cachedTeams = useRef(null);

  const getAllPlayers = async () => {
    if (cachedTeams.current) return cachedTeams.current;
    const responses = await Promise.all(
      LEAGUE_CODES.map(code => api.get(`/competitions/${code}/scorers?limit=50`))
    );
    const allPlayers = responses.flatMap(res => res.data.scorers);
    const unique = Array.from(new Map(allPlayers.map(p => [p.player.id, p])).values());
    cachedTeams.current = unique;
    return unique;
  };

  const searchPlayers = async (query, setResults, setSearching) => {
    if (!query.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const all = await getAllPlayers();
      const filtered = all.filter(p =>
        p.player.name.toLowerCase().includes(query.toLowerCase()) ||
        p.player.nationality?.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered.slice(0, 8));
    } catch { setResults([]); }
    setSearching(false);
  };

  const fetchPlayerStats = async (playerId, setPlayer, setStats, setLoading) => {
    setLoading(true);
    try {
      const playerRes = await api.get(`/persons/${playerId}`);
      const playerData = playerRes.data;
      const all = await getAllPlayers();
      const found = all.find(p => p.player.id === parseInt(playerId));
      if (found) {
        playerData.statistics = [{
          goals: found.goals,
          assists: found.assists,
          playedMatches: found.playedMatches,
          penalties: found.penalties,
        }];
      }
      setPlayer(playerData);
      setStats(playerData.statistics?.[0] || null);
    } catch { }
    setLoading(false);
  };

  const selectPlayer = (scorerItem, slot) => {
    if (slot === 1) {
      setSearchQuery1(scorerItem.player.name);
      setSearchResults1([]);
      fetchPlayerStats(scorerItem.player.id, setPlayer1, setStats1, setLoading1);
    } else {
      setSearchQuery2(scorerItem.player.name);
      setSearchResults2([]);
      fetchPlayerStats(scorerItem.player.id, setPlayer2, setStats2, setLoading2);
    }
  };

  const getWinner = (val1, val2) => {
    if (val1 > val2) return 1;
    if (val2 > val1) return 2;
    return 0;
  };

  const radar1 = player1 ? calculateRadarData(stats1, player1.position) : null;
  const radar2 = player2 ? calculateRadarData(stats2, player2.position) : null;
  const radarData = radar1 && radar2 ? mergeRadarData(radar1, radar2) : null;

  const StatRow = ({ label, val1, val2 }) => {
    const winner = getWinner(val1, val2);
    return (
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '0.6rem 1rem',
        borderBottom: `1px solid ${glass.colors.border}`,
      }}>
        <div style={{
          flex: 1, textAlign: 'right',
          fontWeight: winner === 1 ? '700' : '400',
          color: winner === 1 ? glass.colors.blue : glass.colors.text,
          fontSize: '15px'
        }}>{val1 ?? 0}</div>
        <div style={{
          width: '120px', textAlign: 'center',
          color: glass.colors.muted, fontSize: '12px',
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>{label}</div>
        <div style={{
          flex: 1, textAlign: 'left',
          fontWeight: winner === 2 ? '700' : '400',
          color: winner === 2 ? '#f87171' : glass.colors.text,
          fontSize: '15px'
        }}>{val2 ?? 0}</div>
      </div>
    );
  };

  const PlayerSearch = ({ slot, query, setQuery, results, setResults, searching, player, loading }) => (
    <div style={{ flex: 1, minWidth: '250px' }}>
      <p style={{
        color: slot === 1 ? glass.colors.blue : '#f87171',
        fontWeight: '600', fontSize: '14px', marginBottom: '0.5rem'
      }}>
        {slot === 1 ? '🔵 Player 1' : '🔴 Player 2'}
      </p>
      <div style={{ position: 'relative' }}>
        <input
          type="text" value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            searchPlayers(e.target.value,
              slot === 1 ? setSearchResults1 : setSearchResults2,
              slot === 1 ? setSearching1 : setSearching2
            );
          }}
          placeholder="Search player name..."
          style={{
            ...glass.input, width: '100%',
            padding: '0.75rem 1rem', fontSize: '14px',
            fontFamily: 'inherit'
          }}
        />

        {/* Search results dropdown */}
        {results.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            zIndex: 50, borderRadius: '10px', overflow: 'hidden',
            background: isDark ? 'rgba(15,17,23,0.98)' : 'rgba(255,255,255,0.98)',
            border: `1px solid ${glass.colors.border}`,
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            marginTop: '4px'
          }}>
            {searching && (
              <div style={{ padding: '0.75rem', color: glass.colors.muted, fontSize: '13px' }}>
                Searching...
              </div>
            )}
            {results.map((item, i) => (
              <div key={i}
                onClick={() => selectPlayer(item, slot)}
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
                  <div style={{ fontWeight: '600', color: glass.colors.text, fontSize: '14px' }}>
                    {item.player.name}
                  </div>
                  <div style={{ fontSize: '12px', color: glass.colors.muted }}>
                    {item.team.name} · {item.goals} goals
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected player card */}
      {loading && (
        <div style={{ ...glass.card, padding: '1rem', marginTop: '0.75rem', textAlign: 'center', color: glass.colors.muted }}>
          Loading player...
        </div>
      )}

      {player && !loading && (
        <div
          onClick={() => navigate(`/player/${player.id}`)}
          style={{
            ...glass.card, padding: '1rem', marginTop: '0.75rem',
            cursor: 'pointer', transition: 'all 0.2s',
            border: `1px solid ${slot === 1 ? 'rgba(59,130,246,0.3)' : 'rgba(239,68,68,0.3)'}`,
          }}
          className="hover-glow"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: `linear-gradient(135deg, ${getPositionColor(player.position)}, ${getPositionColor(player.position)}aa)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', fontWeight: 'bold', color: 'white', flexShrink: 0,
              boxShadow: `0 0 15px ${getPositionColor(player.position)}44`
            }}>
              {player.name?.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px', color: glass.colors.text }}>
                {player.name}
              </div>
              <div style={{ fontSize: '12px', color: glass.colors.muted, marginTop: '2px' }}>
                {player.position || 'N/A'} · {player.nationality}
              </div>
              {player.currentTeam && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <img src={player.currentTeam.crest} alt="" width={16} />
                  <span style={{ fontSize: '12px', color: glass.colors.blue }}>
                    {player.currentTeam.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }} className="fade-in">
      <h1 style={{
        fontSize: '24px', fontWeight: '700', marginBottom: '0.5rem',
        color: glass.colors.text
      }}>⚔️ Player Comparator</h1>
      <p style={{ color: glass.colors.muted, fontSize: '14px', marginBottom: '2rem' }}>
        Compare any two players from the top 5 leagues side by side
      </p>

      {/* Player search inputs */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <PlayerSearch
          slot={1} query={searchQuery1} setQuery={setSearchQuery1}
          results={searchResults1} setResults={setSearchResults1}
          searching={searching1} player={player1} loading={loading1}
        />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', fontWeight: 'bold', color: glass.colors.muted,
          paddingTop: '2rem'
        }}>VS</div>
        <PlayerSearch
          slot={2} query={searchQuery2} setQuery={setSearchQuery2}
          results={searchResults2} setResults={setSearchResults2}
          searching={searching2} player={player2} loading={loading2}
        />
      </div>

      {/* Comparison section */}
      {player1 && player2 && (
        <div className="fade-in">

          {/* Radar chart */}
          {radarData && (
            <div style={{ ...glass.card, padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ color: glass.colors.text, fontSize: '16px', fontWeight: '600', marginBottom: '1rem', textAlign: 'center' }}>
                📊 Performance Comparison
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke={glass.colors.border} />
                  <PolarAngleAxis dataKey="stat" tick={{ fill: glass.colors.muted, fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: isDark ? 'rgba(15,17,23,0.95)' : 'rgba(255,255,255,0.95)',
                      border: `1px solid ${glass.colors.border}`,
                      borderRadius: '8px', color: glass.colors.text
                    }}
                  />
                  <Legend
                    formatter={(value) => value === 'Player1' ? player1.name : player2.name}
                  />
                  <Radar
                    name="Player1" dataKey="Player1"
                    stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2}
                  />
                  <Radar
                    name="Player2" dataKey="Player2"
                    stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Stats comparison table */}
          <div style={{ ...glass.card, overflow: 'hidden', marginBottom: '1.5rem' }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center',
              padding: '1rem',
              background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)',
              borderBottom: `1px solid ${glass.colors.border}`
            }}>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <div style={{ fontWeight: '700', color: glass.colors.blue, fontSize: '15px' }}>
                  {player1.name}
                </div>
                <div style={{ fontSize: '12px', color: glass.colors.muted }}>
                  {player1.position}
                </div>
              </div>
              <div style={{ width: '120px', textAlign: 'center', color: glass.colors.muted, fontSize: '12px' }}>
                STATS
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontWeight: '700', color: '#f87171', fontSize: '15px' }}>
                  {player2.name}
                </div>
                <div style={{ fontSize: '12px', color: glass.colors.muted }}>
                  {player2.position}
                </div>
              </div>
            </div>

            <StatRow label="Goals" val1={stats1?.goals} val2={stats2?.goals} />
            <StatRow label="Assists" val1={stats1?.assists} val2={stats2?.assists} />
            <StatRow label="Matches" val1={stats1?.playedMatches} val2={stats2?.playedMatches} />
            <StatRow label="Penalties" val1={stats1?.penalties} val2={stats2?.penalties} />
            <StatRow
              label="Goals/Match"
              val1={stats1 ? ((stats1.goals || 0) / (stats1.playedMatches || 1)).toFixed(2) : 0}
              val2={stats2 ? ((stats2.goals || 0) / (stats2.playedMatches || 1)).toFixed(2) : 0}
            />
            <StatRow
              label="G+A Total"
              val1={(stats1?.goals || 0) + (stats1?.assists || 0)}
              val2={(stats2?.goals || 0) + (stats2?.assists || 0)}
            />
          </div>

          {/* Bio comparison */}
          <div style={{ ...glass.card, overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{
              padding: '0.75rem 1rem',
              background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)',
              borderBottom: `1px solid ${glass.colors.border}`,
              color: glass.colors.text, fontWeight: '600', fontSize: '14px'
            }}>
              👤 Player Info
            </div>
            {[
              {
                label: 'Age',
                val1: player1.dateOfBirth ? new Date().getFullYear() - new Date(player1.dateOfBirth).getFullYear() : 'N/A',
                val2: player2.dateOfBirth ? new Date().getFullYear() - new Date(player2.dateOfBirth).getFullYear() : 'N/A'
              },
              { label: 'Nationality', val1: player1.nationality, val2: player2.nationality },
              { label: 'Position', val1: player1.position, val2: player2.position },
              { label: 'Club', val1: player1.currentTeam?.name, val2: player2.currentTeam?.name },
              { label: 'Shirt No.', val1: player1.shirtNumber ? `#${player1.shirtNumber}` : 'N/A', val2: player2.shirtNumber ? `#${player2.shirtNumber}` : 'N/A' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center',
                padding: '0.6rem 1rem',
                borderBottom: `1px solid ${glass.colors.border}`,
              }}>
                <div style={{ flex: 1, textAlign: 'right', color: glass.colors.text, fontSize: '14px' }}>
                  {item.val1 || 'N/A'}
                </div>
                <div style={{ width: '120px', textAlign: 'center', color: glass.colors.muted, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {item.label}
                </div>
                <div style={{ flex: 1, textAlign: 'left', color: glass.colors.text, fontSize: '14px' }}>
                  {item.val2 || 'N/A'}
                </div>
              </div>
            ))}
          </div>

          {/* Winner banner */}
          {stats1 && stats2 && (() => {
            const score1 = (stats1.goals || 0) * 2 + (stats1.assists || 0);
            const score2 = (stats2.goals || 0) * 2 + (stats2.assists || 0);
            const winner = score1 > score2 ? player1 : score2 > score1 ? player2 : null;
            const winnerColor = score1 > score2 ? '#3b82f6' : '#ef4444';

            return winner ? (
              <div style={{
                ...glass.card, padding: '1.5rem', textAlign: 'center',
                border: `1px solid ${winnerColor}44`,
                background: `${winnerColor}11`
              }}>
                <div style={{ fontSize: '32px', marginBottom: '0.5rem' }}>🏆</div>
                <div style={{ fontWeight: '800', fontSize: '20px', color: winnerColor }}>
                  {winner.name} wins!
                </div>
                <div style={{ color: glass.colors.muted, fontSize: '14px', marginTop: '4px' }}>
                  Based on goals and assists contribution this season
                </div>
              </div>
            ) : (
              <div style={{ ...glass.card, padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '0.5rem' }}>🤝</div>
                <div style={{ fontWeight: '700', fontSize: '18px', color: glass.colors.text }}>
                  It's a draw!
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Empty state */}
      {(!player1 || !player2) && (
        <div style={{ ...glass.card, padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '1rem' }}>⚔️</div>
          <p style={{ color: glass.colors.text, fontSize: '18px', fontWeight: '600', marginBottom: '0.5rem' }}>
            Select two players to compare
          </p>
          <p style={{ color: glass.colors.muted, fontSize: '14px' }}>
            Search for players from the top 5 leagues above
          </p>
        </div>
      )}
    </div>
  );
}