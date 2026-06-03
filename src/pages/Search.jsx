import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { glass } from '../styles/glass';

const api = axios.create({
  baseURL: '/v4',
  headers: { 'X-Auth-Token': process.env.REACT_APP_FOOTBALL_API_KEY }
});

const LEAGUE_CODES = ['PL', 'PD', 'BL1', 'SA', 'FL1'];

export default function Search() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const cachedTeams = useRef(null);

  const getAllTeams = async () => {
    if (cachedTeams.current) return cachedTeams.current;
    const responses = await Promise.all(LEAGUE_CODES.map(code => api.get(`/competitions/${code}/teams`)));
    const allTeams = responses.flatMap(res => res.data.teams);
    const unique = Array.from(new Map(allTeams.map(t => [t.id, t])).values());
    cachedTeams.current = unique;
    return unique;
  };

  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    setLoading(true); setError(null); setResults(null);
    try {
      const allTeams = await getAllTeams();
      const filtered = allTeams.filter(team =>
        team.name.toLowerCase().includes(q.toLowerCase()) ||
        team.shortName?.toLowerCase().includes(q.toLowerCase()) ||
        team.tla?.toLowerCase().includes(q.toLowerCase())
      );
      setResults(filtered);
      setLoading(false);
    } catch {
      setError('Search failed. Please wait a moment and try again.');
      setLoading(false);
    }
  };

  // Auto search if query comes from URL
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery) {
      setQuery(urlQuery);
      handleSearch(urlQuery);
    }
  }, [searchParams]);

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }} className="fade-in">
      <h1 style={{
        fontSize: '24px', fontWeight: '700', marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.7))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
      }}>🔍 Search</h1>

{/* Search bar — only show when no results yet */}
{!results && (
  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
    <input
      type="text" value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Search for a team e.g. Arsenal, Barcelona..."
      style={{
        ...glass.input, flex: 1, padding: '0.75rem 1rem',
        fontSize: '15px', fontFamily: 'inherit'
      }}
    />
    <button
      onClick={() => handleSearch()}
      style={{ ...glass.button.primary, padding: '0.75rem 1.5rem', fontSize: '15px' }}
    >
      Search
    </button>
  </div>
)}

      {results && results.length > 0 && (
        <div>
          <p style={{ color: glass.colors.muted, fontSize: '14px', marginBottom: '1rem' }}>
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </p>
          {results.map(team => (
            <div key={team.id} onClick={() => navigate(`/team/${team.id}`)}
              className="hover-glow"
              style={{
                ...glass.card, display: 'flex', alignItems: 'center',
                gap: '1rem', padding: '1rem 1.5rem',
                marginBottom: '0.75rem', cursor: 'pointer'
              }}>
              <img src={team.crest} alt={team.name} width={45} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '16px', color: glass.colors.text }}>
                  {team.name}
                </div>
                <div style={{ color: glass.colors.muted, fontSize: '13px', marginTop: '2px' }}>
                  📍 {team.venue} · 🌐 {team.area?.name} · 🏠 Founded {team.founded}
                </div>
              </div>
              <div style={{ color: glass.colors.blue, fontSize: '13px', fontWeight: '500' }}>
                View Team →
              </div>
            </div>
          ))}
        </div>
      )}

      {!results && !loading && (
        <div>
          <p style={{ color: glass.colors.muted, fontSize: '14px', marginBottom: '1rem' }}>
            🔥 Popular searches
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {['Arsenal', 'Barcelona', 'Bayern', 'Juventus', 'PSG', 'Liverpool', 'Real Madrid', 'Manchester City', 'Chelsea', 'AC Milan'].map(name => (
              <button key={name} onClick={() => { setQuery(name); handleSearch(name); }}
                style={{
                  ...glass.button.secondary, padding: '0.4rem 1rem',
                  borderRadius: '20px', fontSize: '14px'
                }}>
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}