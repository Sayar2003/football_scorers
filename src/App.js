import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Standings from './pages/Standings';
import Matches from './pages/Matches';
import MatchDetail from './pages/MatchDetail';
import TopScorers from './pages/TopScorers';
import TeamDetails from './pages/TeamDetails';
import './index.css';

function Navbar() {
  const location = useLocation();

  const linkStyle = (path) => ({
    textDecoration: 'none',
    padding: '0.5rem 1.2rem',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '15px',
    backgroundColor: location.pathname === path ? '#3b82f6' : 'transparent',
    color: location.pathname === path ? 'white' : '#374151',
    transition: 'all 0.2s'
  });

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '1rem 2rem',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <span style={{ fontWeight: 'bold', fontSize: '1.3rem', marginRight: '1.5rem' }}>
        ⚽ FootballApp
      </span>
      <Link to="/" style={linkStyle('/')}>Standings</Link>
      <Link to="/matches" style={linkStyle('/matches')}>Matches</Link>
      <Link to="/scorers" style={linkStyle('/scorers')}>Top Scorers</Link>
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
        <Route path="/match/:id" element={<MatchDetail />} />
        <Route path="/scorers" element={<TopScorers />} />
        <Route path="/team/:id" element={<TeamDetails />} />
      </Routes>
    </Router>
  );
}

export default App;