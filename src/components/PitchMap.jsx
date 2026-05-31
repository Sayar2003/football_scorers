import { useNavigate } from 'react-router-dom';
import { getRatingColor } from '../utils/ratingCalculator';

const POSITION_COORDS = {
  // 4-3-3
  Goalkeeper: [[50, 88]],
  Defence: [[20, 72], [38, 72], [62, 72], [80, 72]],
  Midfield: [[25, 52], [50, 48], [75, 52]],
  Offence: [[20, 28], [50, 20], [80, 28]],
};

const getFormation = (players) => {
  const grouped = {};
  players.forEach(p => {
    const pos = p.position || 'Midfield';
    if (!grouped[pos]) grouped[pos] = [];
    grouped[pos].push(p);
  });
  return grouped;
};

const getCoords = (position, index, total) => {
  const presets = POSITION_COORDS[position];
  if (presets && presets[index]) return presets[index];
  const spacing = 80 / (total + 1);
  const y = position === 'Goalkeeper' ? 88 :
    position === 'Defence' ? 72 :
    position === 'Midfield' ? 52 :
    position === 'Offence' ? 28 : 50;
  return [spacing * (index + 1) + 10, y];
};

export default function PitchMap({ lineup, teamName, goals, isHome, ratings }) {
  const navigate = useNavigate();
  if (!lineup || lineup.length === 0) return null;

  const grouped = getFormation(lineup.map(p => p.player));

  return (
    <div style={{ flex: 1 }}>
      <p style={{
        textAlign: 'center', fontSize: '13px', fontWeight: '600',
        color: isHome ? '#60a5fa' : '#f87171', marginBottom: '8px'
      }}>{teamName}</p>

      {/* Pitch */}
      <div style={{ position: 'relative', width: '100%', paddingBottom: '150%', borderRadius: '8px', overflow: 'hidden' }}>
        {/* Pitch background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, #1a3a2a 0%, #1e4a30 25%, #1a3a2a 50%, #1e4a30 75%, #1a3a2a 100%)',
          border: '2px solid rgba(255,255,255,0.15)',
          borderRadius: '8px'
        }}>
          {/* Pitch markings */}
          <svg width="100%" height="100%" viewBox="0 0 100 150" preserveAspectRatio="none">
            {/* Center line */}
            <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            {/* Center circle */}
            <circle cx="50" cy="75" r="12" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            {/* Center spot */}
            <circle cx="50" cy="75" r="1" fill="rgba(255,255,255,0.3)" />
            {/* Top penalty box */}
            <rect x="20" y="0" width="60" height="22" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            {/* Top goal box */}
            <rect x="34" y="0" width="32" height="8" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            {/* Top penalty spot */}
            <circle cx="50" cy="16" r="1" fill="rgba(255,255,255,0.3)" />
            {/* Bottom penalty box */}
            <rect x="20" y="128" width="60" height="22" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            {/* Bottom goal box */}
            <rect x="34" y="142" width="32" height="8" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            {/* Bottom penalty spot */}
            <circle cx="50" cy="134" r="1" fill="rgba(255,255,255,0.3)" />
            {/* Corner arcs */}
            <path d="M 0 0 Q 4 0 4 4" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            <path d="M 100 0 Q 96 0 96 4" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            <path d="M 0 150 Q 4 150 4 146" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            <path d="M 100 150 Q 96 150 96 146" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          </svg>

          {/* Players */}
          {Object.entries(grouped).map(([position, players]) =>
            players.map((player, index) => {
              const [x, y] = getCoords(position, index, players.length);
              const rating = ratings?.[player.id];
              const ratingColor = rating ? getRatingColor(rating) : '#3b82f6';
              const isGoalScorer = goals?.some(g => g.scorer?.id === player.id);

              return (
                <div
                  key={player.id}
                  onClick={() => navigate(`/player/${player.id}`)}
                  style={{
                    position: 'absolute',
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    zIndex: 10,
                    textAlign: 'center'
                  }}
                >
                  {/* Player dot */}
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    backgroundColor: ratingColor,
                    border: `2px solid ${isGoalScorer ? '#fbbf24' : 'rgba(255,255,255,0.3)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 'bold', color: 'white',
                    boxShadow: isGoalScorer ? '0 0 8px #fbbf24' : '0 2px 4px rgba(0,0,0,0.3)',
                    transition: 'transform 0.2s',
                    margin: '0 auto'
                  }}>
                    {player.shirtNumber || '?'}
                  </div>
                  {/* Player name */}
                  <div style={{
                    fontSize: '9px', color: 'white', marginTop: '2px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                    whiteSpace: 'nowrap', maxWidth: '50px',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    fontWeight: '600'
                  }}>
                    {player.name?.split(' ').pop()}
                  </div>
                  {/* Goal indicator */}
                  {isGoalScorer && (
                    <div style={{ fontSize: '10px', marginTop: '1px' }}>⚽</div>
                  )}
                  {/* Rating badge */}
                  {rating && (
                    <div style={{
                      fontSize: '9px', fontWeight: 'bold',
                      color: ratingColor, marginTop: '1px'
                    }}>{rating}</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}