import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { glass } from '../styles/glass';

const calculateStats = (seasonStats, position) => {
  const goals = seasonStats?.goals || 0;
  const assists = seasonStats?.assists || 0;
  const matches = seasonStats?.playedMatches || 1;
  const penalties = seasonStats?.penalties || 0;

  const goalsPerMatch = Math.min(100, (goals / matches) * 100);
  const assistsPerMatch = Math.min(100, (assists / matches) * 80);
  const involvement = Math.min(100, ((goals + assists) / matches) * 60);
  const consistency = Math.min(100, (matches / 38) * 100);
  const efficiency = Math.min(100, goals > 0 ? ((goals - penalties) / goals) * 100 : 50);
  const impact = Math.min(100, ((goals * 2 + assists) / (matches * 0.3)));

  if (position?.includes('Goalkeeper')) {
    return [
      { stat: 'Reflexes', value: 75 },
      { stat: 'Positioning', value: 80 },
      { stat: 'Distribution', value: consistency },
      { stat: 'Command', value: 70 },
      { stat: 'Aerial', value: 65 },
      { stat: 'Saves', value: Math.max(50, 100 - goals * 10) },
    ];
  }

  if (position?.includes('Defence')) {
    return [
      { stat: 'Defending', value: 80 },
      { stat: 'Tackling', value: 75 },
      { stat: 'Positioning', value: consistency },
      { stat: 'Heading', value: 70 },
      { stat: 'Passing', value: involvement },
      { stat: 'Goals', value: goalsPerMatch },
    ];
  }

  return [
    { stat: 'Goals', value: goalsPerMatch },
    { stat: 'Assists', value: assistsPerMatch },
    { stat: 'Involvement', value: involvement },
    { stat: 'Consistency', value: consistency },
    { stat: 'Efficiency', value: efficiency },
    { stat: 'Impact', value: impact },
  ];
};

export default function PlayerRadarChart({ seasonStats, position, playerName }) {
  const data = calculateStats(seasonStats, position);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ ...glass.card, padding: '0.5rem 0.75rem', fontSize: '13px' }}>
          <p style={{ color: glass.colors.text }}>{payload[0]?.payload?.stat}: <strong>{Math.round(payload[0]?.value)}</strong></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ ...glass.card, padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ color: glass.colors.text, fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem' }}>
        📈 Performance Radar
      </h3>
      <p style={{ color: glass.colors.muted, fontSize: '12px', marginBottom: '1rem' }}>
        Based on season statistics
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis dataKey="stat" tick={{ fill: glass.colors.muted, fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name={playerName}
            dataKey="value"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}