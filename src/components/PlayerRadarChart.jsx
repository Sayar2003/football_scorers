import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function PlayerRadarChart({ seasonStats, position, playerName, isDark: parentIsDark, glass: parentGlass }) {
  // Use the parent context override if passed, otherwise fall back to local theme context
  const { isDark: localIsDark } = useTheme();
  const isDark = parentIsDark !== undefined ? parentIsDark : localIsDark;

  // Preserve all structural original data properties safely
  const goals = seasonStats?.goals || 0;
  const assists = seasonStats?.assists || 0;
  const matches = seasonStats?.playedMatches || 1;
  const penalties = seasonStats?.penalties || 0;

  // Re-mapped structural data array matching original chart vectors
  const statsData = [
    { label: 'Goals', value: Math.min((goals / Math.max(matches, 1)) * 150, 100) },
    { label: 'Assists', value: Math.min((assists / Math.max(matches, 1)) * 200, 100) },
    { label: 'Involvement', value: Math.min(((goals + assists) / Math.max(matches, 1)) * 120, 100) },
    { label: 'Consistency', value: Math.min((matches / 38) * 100, 100) },
    { label: 'Efficiency', value: goals > 0 ? Math.min(((goals - penalties) / goals) * 100, 100) : 50 },
  ];

  // Map settings
  const width = 500;
  const height = 340;
  const cx = width / 2;
  const cy = height / 2 + 12; 
  const r = 95; 

  const getCoordinates = (index, radiusValue) => {
    const angle = (Math.PI * 2 / 5) * index - Math.PI / 2;
    return {
      x: cx + radiusValue * Math.cos(angle),
      y: cy + radiusValue * Math.sin(angle),
    };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1].map((level) => {
    return Array.from({ length: 5 }, (_, i) => {
      const { x, y } = getCoordinates(i, r * level);
      return `${x},${y}`;
    }).join(' ');
  });

  const playerPoints = statsData.map((stat, i) => {
    const scaleRadius = (stat.value / 100) * r;
    const { x, y } = getCoordinates(i, scaleRadius);
    return `${x},${y}`;
  }).join(' ');

  // Matches the exact high-contrast layout colors of the profile metadata panel
  const themeConfig = {
    cardBg: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff', 
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0', 
    cardShadow: isDark ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
    headerText: isDark ? '#ffffff' : '#0f172a', 
    subText: isDark ? 'rgba(255, 255, 255, 0.5)' : '#64748b',   
    labels: isDark ? '#f1f5f9' : '#1e293b',    
    gridStroke: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1', 
    axisLine: isDark ? 'rgba(255, 255, 255, 0.25)' : '#94a3b8',   
    chartFill: isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(37, 99, 235, 0.15)',
    chartStroke: isDark ? '#60a5fa' : '#2563eb' 
  };

  return (
    <div style={{
      backgroundColor: themeConfig.cardBg,
      border: `1px solid ${themeConfig.cardBorder}`,
      boxShadow: themeConfig.cardShadow,
      borderRadius: '12px',
      padding: '1.75rem',
      marginBottom: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{ marginBottom: '0.25rem', textAlign: 'left' }}>
        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: themeConfig.headerText }}>
          📊 Performance Radar
        </h4>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: themeConfig.subText }}>
          Based on current season league statistics
        </p>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', maxHeight: '300px', marginTop: '0.5rem' }}>
        {gridLevels.map((points, idx) => (
          <polygon key={idx} points={points} fill="none" stroke={themeConfig.gridStroke} strokeWidth="1.2" />
        ))}

        {Array.from({ length: 5 }).map((_, i) => {
          const outerPoint = getCoordinates(i, r);
          return (
            <line key={i} x1={cx} y1={cy} x2={outerPoint.x} y2={outerPoint.y} stroke={themeConfig.axisLine} strokeWidth="1.2" strokeDasharray="4,3" />
          );
        })}

        <polygon points={playerPoints} fill={themeConfig.chartFill} stroke={themeConfig.chartStroke} strokeWidth="2.5" />

        {statsData.map((stat, i) => {
          const scaleRadius = (stat.value / 100) * r;
          const { x, y } = getCoordinates(i, scaleRadius);
          return (
            <circle key={i} cx={x} cy={y} r={3.5} fill={themeConfig.chartStroke} stroke={isDark ? '#1e293b' : '#ffffff'} strokeWidth="1" />
          );
        })}

        {statsData.map((stat, i) => {
          const labelOffset = r + 16;
          const { x, y } = getCoordinates(i, labelOffset);
          
          let textAnchor = 'middle';
          if (i === 1 || i === 2) textAnchor = 'start';
          if (i === 3 || i === 4) textAnchor = 'end';

          let yCorrection = y;
          if (i === 0) yCorrection -= 6;   
          if (i === 2 || i === 3) yCorrection += 12; 

          return (
            <text
              key={i}
              x={x}
              y={yCorrection}
              textAnchor={textAnchor}
              fill={themeConfig.labels}
              style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              {stat.label}
            </text>
          );
        })}
        <circle cx={cx} cy={cy} r={2.5} fill={themeConfig.axisLine} />
      </svg>
    </div>
  );
}