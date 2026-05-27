import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const api = axios.create({
  baseURL: '/v4',
  headers: { 'X-Auth-Token': process.env.REACT_APP_FOOTBALL_API_KEY }
});

const LEAGUE_CODES = ['PL', 'PD', 'BL1', 'SA', 'FL1'];

const dark = {
  card: '#1a1d27', border: '#2d3148',
  text: '#ffffff', muted: '#9ca3af', blue: '#3b82f6',
};

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const cachedTeams = useRef(null);

  const getAllTeams = async () => {
    if (cachedTeams.current) return cachedTeams.current;
    const responses = await Promise.all(
      LEAGUE_CODES.map(code => api.get(`/competitions/${code}/teams`))
    );
    const allTeams = responses.flatMap(res => res.data.teams);
    const unique = Array.from(new Map(allTeams.map(t => [t.id, t])).values());
    cachedTeams.current = unique;
    return unique;
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const allTeams = await getAllTeams();
      const filtered = allTeams.filter(team =>
        team.name.toLowerCase().includes(query.toLowerCase()) ||
        team.shortName?.toLowerCase().includes(query.toLowerCase()) ||
        team.tla?.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setLoading(false);
    } catch {
      setError('Search failed. Please wait a moment and try again.');
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '700', color: dark.text, marginBottom: '1.5rem' }}>🔍 Search</h1>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for a team e.g. Arsenal, Barcelona..."
          style={{
            flex: 1, padding: '0.75rem 1rem', borderRadius: '10px',
            border: `2px solid ${dark.border}`, fontSize: '15px',
            outline: 'none', fontFamily: 'inherit',
            backgroundColor: dark.card, color: dark.text,
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '0.75rem 1.5rem', borderRadius: '10px',
            border: 'none', backgroundColor: dark.blue,
            color: 'white', fontWeight: 'bold',
            fontSize: '15px', cursor: 'pointer'
          }}
        >
          Search
        </button>
      </div>

      {loading && <p style={{ color: dark.muted }}>Searching across all 5 leagues...</p>}
      {error && <p style={{ color: '#ef4444' }}>{error}</p>}

      {/* Results */}
      {results && results.length === 0 && (
        <p style={{ color: dark.muted }}>No teams found for "{query}".</p>
      )}

      {results && results.length > 0 && (
        <div>
          <p style={{ color: dark.muted, fontSize: '14px', marginBottom: '1rem' }}>
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </p>
          {results.map(team => (
            <div
              key={team.id}
              onClick={() => navigate(`/team/${team.id}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.5rem', marginBottom: '0.75rem',
                borderRadius: '12px', border: `1px solid ${dark.border}`,
                backgroundColor: dark.card, cursor: 'pointer',
              }}
            >
              <img src={team.crest} alt={team.name} width={45} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '16px', color: dark.text }}>{team.name}</div>
                <div style={{ color: dark.muted, fontSize: '13px', marginTop: '2px' }}>
                  📍 {team.venue} · 🌐 {team.area?.name} · 🏠 Founded {team.founded}
                </div>
              </div>
              <div style={{ color: dark.blue, fontSize: '13px', fontWeight: '500' }}>
                View Team →
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Popular searches */}
      {!results && !loading && (
        <div>
          <p style={{ color: dark.muted, fontSize: '14px', marginBottom: '1rem' }}>🔥 Popular searches</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {['Arsenal', 'Barcelona', 'Bayern', 'Juventus', 'PSG', 'Liverpool', 'Real Madrid', 'Manchester City', 'Chelsea', 'AC Milan'].map(name => (
              <button
                key={name}
                onClick={() => setQuery(name)}
                style={{
                  padding: '0.4rem 1rem', borderRadius: '20px',
                  border: `1px solid ${dark.border}`,
                  backgroundColor: dark.card,
                  cursor: 'pointer', fontSize: '14px', color: dark.muted
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}