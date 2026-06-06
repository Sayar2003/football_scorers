import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthProvider from './context/AuthContext';
import ThemeProvider from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import AnimatedBackground from './components/AnimatedBackground';
import Login from './pages/Login';
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
import Favorites from './pages/Favorites';
import PlayerComparator from './pages/tools/PlayerComparator';
import './index.css';

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  if (!user) return <Login />;

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <AnimatedBackground />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main style={{ padding: '0' }}>
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
            <Route path="/favorites" element={<Favorites />} />
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/tools/comparator" element={<PlayerComparator />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppLayout />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;