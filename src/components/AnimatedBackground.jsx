import { useTheme } from '../context/ThemeContext';

export default function AnimatedBackground() {
  const { isDark } = useTheme();

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Football pitch lines */}
      <svg
        width="100%" height="100%"
        viewBox="0 0 1400 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: isDark ? 0.04 : 0.06 }}
      >
        {/* Outer boundary */}
        <rect x="50" y="50" width="1300" height="800" fill="none"
          stroke={isDark ? '#3b82f6' : '#1d4ed8'} strokeWidth="2" />

        {/* Center line */}
        <line x1="700" y1="50" x2="700" y2="850"
          stroke={isDark ? '#3b82f6' : '#1d4ed8'} strokeWidth="1" />

        {/* Center circle */}
        <circle cx="700" cy="450" r="100" fill="none"
          stroke={isDark ? '#3b82f6' : '#1d4ed8'} strokeWidth="1" />
        <circle cx="700" cy="450" r="5" fill={isDark ? '#3b82f6' : '#1d4ed8'} />

        {/* Left penalty box */}
        <rect x="50" y="225" width="180" height="300" fill="none"
          stroke={isDark ? '#3b82f6' : '#1d4ed8'} strokeWidth="1" />
        {/* Left goal box */}
        <rect x="50" y="325" width="60" height="100" fill="none"
          stroke={isDark ? '#3b82f6' : '#1d4ed8'} strokeWidth="1" />
        {/* Left penalty spot */}
        <circle cx="162" cy="450" r="4" fill={isDark ? '#3b82f6' : '#1d4ed8'} />
        {/* Left penalty arc */}
        <path d="M 230 370 Q 280 450 230 530" fill="none"
          stroke={isDark ? '#3b82f6' : '#1d4ed8'} strokeWidth="1" />

        {/* Right penalty box */}
        <rect x="1170" y="225" width="180" height="300" fill="none"
          stroke={isDark ? '#3b82f6' : '#1d4ed8'} strokeWidth="1" />
        {/* Right goal box */}
        <rect x="1290" y="325" width="60" height="100" fill="none"
          stroke={isDark ? '#3b82f6' : '#1d4ed8'} strokeWidth="1" />
        {/* Right penalty spot */}
        <circle cx="1238" cy="450" r="4" fill={isDark ? '#3b82f6' : '#1d4ed8'} />
        {/* Right penalty arc */}
        <path d="M 1170 370 Q 1120 450 1170 530" fill="none"
          stroke={isDark ? '#3b82f6' : '#1d4ed8'} strokeWidth="1" />

        {/* Corner arcs */}
        <path d="M 50 80 Q 80 50 80 80" fill="none" stroke={isDark ? '#3b82f6' : '#1d4ed8'} strokeWidth="1" />
        <path d="M 1320 80 Q 1320 50 1350 80" fill="none" stroke={isDark ? '#3b82f6' : '#1d4ed8'} strokeWidth="1" />
        <path d="M 50 820 Q 80 850 80 820" fill="none" stroke={isDark ? '#3b82f6' : '#1d4ed8'} strokeWidth="1" />
        <path d="M 1320 820 Q 1320 850 1350 820" fill="none" stroke={isDark ? '#3b82f6' : '#1d4ed8'} strokeWidth="1" />
      </svg>

      {/* Animated gradient orbs */}
      <div style={{
        position: 'absolute', width: '600px', height: '600px',
        borderRadius: '50%', top: '-200px', left: '-200px',
        background: isDark
          ? 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
        animation: 'orbFloat1 12s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute', width: '500px', height: '500px',
        borderRadius: '50%', bottom: '-100px', right: '-100px',
        background: isDark
          ? 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)',
        animation: 'orbFloat2 15s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute', width: '400px', height: '400px',
        borderRadius: '50%', top: '40%', left: '40%',
        background: isDark
          ? 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(16,185,129,0.03) 0%, transparent 70%)',
        animation: 'orbFloat3 18s ease-in-out infinite'
      }} />

      <style>{`
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, 30px) scale(1.05); }
          66% { transform: translate(-20px, 50px) scale(0.95); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, -40px) scale(1.08); }
          66% { transform: translate(40px, -20px) scale(0.92); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -30px) scale(1.1); }
        }
      `}</style>
    </div>
  );
}