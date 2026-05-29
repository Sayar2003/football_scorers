import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Standings from './pages/Standings';
import Matches from './pages/Matches';
import MatchDetail from './pages/MatchDetail';
import TopScorers from './pages/TopScorers';
import TeamDetail from './pages/TeamDetails';
import Search from './pages/Search';
import Fixtures from './pages/Fixtures';
import PlayerProfile from './pages/PlayerProfile';
import MatchPredictor from './pages/MatchPredictor';
import News from './pages/News';
import YoungTalent from './pages/YoungTalent';
import ContentCreator from './pages/ContentCreator';
import Chatbot from './pages/Chatbot';
import './index.css';

const NAV_LINKS = [
  { path: '/', label: '📊 Standings' },
  { path: '/matches', label: '⚽ Matches' },
  { path: '/fixtures', label: '📅 Fixtures' },
  { path: '/scorers', label: '🥇 Scorers' },
  { path: '/predict', label: '🔮 Predictor' },
  { path: '/talent', label: '🌟 Talent' },
  { path: '/news', label: '📰 News' },
  { path: '/search', label: '🔍 Search' },
  { path: '/chat', label: '🤖 AI Chat' },
  { path: '/creator', label: '🎨 Creator' },
];

function Navbar() {
  const location = useLocation();

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10, 14, 26, 0.8)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '0 2rem',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: '0.25rem', maxWidth: '1400px',
        margin: '0 auto', overflowX: 'auto',
        scrollbarWidth: 'none', msOverflowStyle: 'none',
        padding: '0.6rem 0'
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', marginRight: '1rem', flexShrink: 0 }}>
          <span style={{
            fontWeight: '800', fontSize: '1.2rem',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            ⚽ FootballApp
          </span>
        </Link>

        {/* Nav links */}
        {NAV_LINKS.map(link => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              style={{
                textDecoration: 'none',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontWeight: isActive ? '600' : '400',
                fontSize: '13px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.5)',
                border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Standings />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/fixtures" element={<Fixtures />} />
        <Route path="/match/:id" element={<MatchDetail />} />
        <Route path="/scorers" element={<TopScorers />} />
        <Route path="/team/:id" element={<TeamDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/player/:id" element={<PlayerProfile />} />
        <Route path="/predict" element={<MatchPredictor />} />
        <Route path="/news" element={<News />} />
        <Route path="/talent" element={<YoungTalent />} />
        <Route path="/creator" element={<ContentCreator />} />
        <Route path="/chat" element={<Chatbot />} />
      </Routes>
    </Router>
  );
}

export default App;