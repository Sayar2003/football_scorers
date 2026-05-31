import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { glass } from '../styles/glass';

export default function MatchStatsChart({ homeTeam, awayTeam, homeScore, awayScore }) {
  const homePossession = Math.min(70, Math.max(30, 50 + (homeScore - awayScore) * 5));
  const awayPossession = 100 - homePossession;

  const data = [
    { stat: 'Goals', home: homeScore, away: awayScore },
    { stat: 'Possession', home: homePossession, away: awayPossession },
    { stat: 'Shots', home: Math.round(homeScore * 4.5 + 5), away: Math.round(awayScore * 4.5 + 5) },
    { stat: 'On Target', home: Math.round(homeScore * 2.5 + 2), away: Math.round(awayScore * 2.5 + 2) },
    { stat: 'Corners', home: Math.round(homePossession / 10), away: Math.round(awayPossession / 10) },
    { stat: 'Fouls', home: Math.round(12 - homeScore), away: Math.round(12 - awayScore) },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ ...glass.card, padding: '0.75rem', fontSize: '13px' }}>
          <p style={{ color: glass.colors.text, fontWeight: '600', marginBottom: '4px' }}>{label}</p>
          <p style={{ color: '#60a5fa' }}>{homeTeam}: {payload[0]?.value}</p>
          <p style={{ color: '#f87171' }}>{awayTeam}: {payload[1]?.value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ ...glass.card, padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ color: glass.colors.text, fontSize: '14px', fontWeight: '600', marginBottom: '1rem' }}>
        📊 Match Statistics
      </h3>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem', fontSize: '13px' }}>
        <span style={{ color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', backgroundColor: '#60a5fa', borderRadius: '2px', display: 'inline-block' }} />
          {homeTeam}
        </span>
        <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', backgroundColor: '#f87171', borderRadius: '2px', display: 'inline-block' }} />
          {awayTeam}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="stat" tick={{ fill: glass.colors.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: glass.colors.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="home" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((_, i) => <Cell key={i} fill="#3b82f6" fillOpacity={0.8} />)}
          </Bar>
          <Bar dataKey="away" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((_, i) => <Cell key={i} fill="#ef4444" fillOpacity={0.8} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}