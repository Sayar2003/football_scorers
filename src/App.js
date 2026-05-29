import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Standings from './pages/Standings';
import Matches from './pages/Matches';
import MatchDetail from './pages/MatchDetail';
import TopScorers from './pages/TopScorers';
import TeamDetail from './pages/TeamDetails';
import Search from './pages/Search';
import Fixtures from './pages/Fixtures';
import PlayerProfile from './pages/PlayerProfile';
import Chatbot from './pages/Chatbot';
import MatchPredictor from './pages/MatchPredictor';
import News from './pages/News';
import YoungTalent from './pages/YoungTalent';
import ContentCreator from './pages/ContentCreator';
import './index.css';

function Navbar() {
  const location = useLocation();

  const linkStyle = (path) => ({
    textDecoration: 'none',
    padding: '0.5rem 1.2rem',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '14px',
    backgroundColor: location.pathname === path ? '#3b82f6' : 'transparent',
    color: location.pathname === path ? 'white' : '#9ca3af',
    transition: 'all 0.2s'
  });

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.75rem 2rem',
      backgroundColor: '#1a1d27',
      borderBottom: '1px solid #2d3148',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      flexWrap: 'wrap'
    }}>
      <span style={{
        fontWeight: 'bold',
        fontSize: '1.2rem',
        marginRight: '1.5rem',
        color: '#ffffff'
      }}>
        ⚽ FootballApp
      </span>
      <Link to="/" style={linkStyle('/')}>Standings</Link>
      <Link to="/matches" style={linkStyle('/matches')}>Matches</Link>
      <Link to="/fixtures" style={linkStyle('/fixtures')}>Fixtures</Link>
      <Link to="/scorers" style={linkStyle('/scorers')}>Top Scorers</Link>
      <Link to="/search" style={linkStyle('/search')}>🔍 Search</Link>
      <Link to="/chat" style={linkStyle('/chat')}>🤖 AI Chat</Link>
      <Link to="/predict" style={linkStyle('/predict')}>🔮 Predictor</Link>
      <Link to="/news" style={linkStyle('/news')}>📰 News</Link>
      <Link to="/talent" style={linkStyle('/talent')}>🌟 Talent</Link>
      <Link to="/creator" style={linkStyle('/creator')}>🎨 Creator</Link>
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
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/predict" element={<MatchPredictor />} />
        <Route path="/news" element={<News />} />
        <Route path="/talent" element={<YoungTalent />} />
        <Route path="/creator" element={<ContentCreator />} />
      </Routes>
    </Router>
  );
}

export default App;