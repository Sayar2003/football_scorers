import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Standings from './pages/Standings';
import Matches from './pages/Matches';

function Navbar() {
  const location = useLocation();
  const linkStyle = (path) => ({
    textDecoration: 'none',
    padding: '0.5rem 1.2rem',
    borderRadius: '8px',
    fontWeight: '500',
    backgroundColor: location.pathname === path ? '#2563eb' : 'transparent',
    color: location.pathname === path ? 'white' : '#374151',
  });

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '1rem 2rem',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: 'white'
    }}>
      <span style={{ fontWeight: 'bold', fontSize: '1.2rem', marginRight: '1rem' }}>⚽ FootballApp</span>
      <Link to="/" style={linkStyle('/')}>Standings</Link>
      <Link to="/matches" style={linkStyle('/matches')}>Matches</Link>
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
      </Routes>
    </Router>
  );
}

export default App;