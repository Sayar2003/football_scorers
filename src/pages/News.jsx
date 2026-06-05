import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getGlass } from '../styles/glass';

const CATEGORIES = [
  { id: 'all', label: '📰 All News' },
  { id: 'transfer', label: '🔄 Transfers' },
  { id: 'premier league', label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League' },
  { id: 'la liga', label: '🇪🇸 La Liga' },
  { id: 'bundesliga', label: '🇩🇪 Bundesliga' },
  { id: 'serie a', label: '🇮🇹 Serie A' },
  { id: 'ligue 1', label: '🇫🇷 Ligue 1' },
];

const categoryQueries = {
  'all': 'football transfer news',
  'transfer': 'football transfer signing rumour',
  'premier league': 'Premier League football',
  'la liga': 'La Liga football Spain',
  'bundesliga': 'Bundesliga football Germany',
  'serie a': 'Serie A football Italy',
  'ligue 1': 'Ligue 1 football France',
};

// Fixed: glass passed down explicitly as a prop to react safely to light/dark toggles
function ArticleCard({ article, featured, formatDate, glass }) {
  if (!article || !article.source) return null;

  return (
    <a href={article.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
      <div className="hover-glow" style={{
        ...glass.card,
        borderRadius: featured ? '16px' : '12px',
        overflow: 'hidden', 
        cursor: 'pointer',
        marginBottom: featured ? '1.5rem' : '0',
        height: featured ? 'auto' : '100%',
        display: 'flex', 
        flexDirection: 'column'
      }}>
        {article.image && (
  <img src={article.image} alt={article.title}
    style={{ width: '100%', height: featured ? '300px' : '160px', objectFit: 'cover' }}
    onError={(e) => { e.target.style.display = 'none'; }} />
)}
        <div style={{ padding: featured ? '1.5rem' : '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            {featured && (
              <span style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                Featured
              </span>
            )}
            <span style={{ color: glass.colors.muted, fontSize: '11px' }}>
              {article.source.name || 'Unknown Source'} · {formatDate(article.publishedAt)}
            </span>
          </div>
          
          {featured ? (
            <h2 style={{ color: glass.colors.text, fontSize: '20px', fontWeight: '700', marginBottom: '0.5rem', lineHeight: '1.4' }}>{article.title}</h2>
          ) : (
            <h3 style={{ color: glass.colors.text, fontSize: '14px', fontWeight: '600', lineHeight: '1.4', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.title}</h3>
          )}
          
          {featured && article.description && (
            <p style={{ color: glass.colors.muted, fontSize: '14px', lineHeight: '1.6', margin: '0.5rem 0' }}>{article.description}</p>
          )}
          <div style={{ color: glass.colors.blue, fontSize: '12px', marginTop: 'auto', paddingTop: '0.75rem', fontWeight: '500' }}>Read more →</div>
        </div>
      </div>
    </a>
  );
}

export default function News() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const { isDark } = useTheme();
  const glass = getGlass(isDark);

useEffect(() => {
  setLoading(true);
  setError(null);

  const categoryQueries = {
    'all': 'football transfer news',
    'transfer': 'football transfer signing rumour',
    'premier league': 'Premier League football',
    'la liga': 'La Liga football Spain',
    'bundesliga': 'Bundesliga football Germany',
    'serie a': 'Serie A football Italy',
    'ligue 1': 'Ligue 1 football France',
  };

  const query = categoryQueries[category] || `football ${category}`;
  const backendUrl = process.env.REACT_APP_BACKEND_URL?.replace('/v4', '') || 'http://localhost:5000';
  const url = `${backendUrl}/api/news?q=${encodeURIComponent(query)}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data.articles) throw new Error('No articles found');
      setArticles(data.articles.filter(a => a.title && a.image));
      setLoading(false);
    })
    .catch(err => {
      setError('Failed to load news. ' + err.message);
      setLoading(false);
    });
}, [category]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const diff = Math.floor((new Date() - date) / 1000 / 60);
    if (diff < 60) return `${diff < 0 ? 0 : diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const filteredArticles = articles.filter(a =>
    search === '' || 
    a.title?.toLowerCase().includes(search.toLowerCase()) ||
    a.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }} className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            background: isDark 
              ? 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.7))' 
              : `linear-gradient(135deg, ${glass.colors.text}, ${glass.colors.muted})`, 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            backgroundClip: 'text' 
          }}>📰 Football News</h1>
          <p style={{ color: glass.colors.muted, fontSize: '14px', marginTop: '4px' }}>Latest news, transfers and updates</p>
        </div>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search news..."
          style={{ ...glass.input, padding: '0.5rem 1rem', fontSize: '14px', width: '250px' }} />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setCategory(cat.id)} style={{
            padding: '0.4rem 0.9rem', 
            cursor: 'pointer', 
            borderRadius: '20px', 
            border: '1px solid',
            borderColor: category === cat.id ? 'rgba(59,130,246,0.5)' : glass.colors.border,
            background: category === cat.id ? 'rgba(59,130,246,0.2)' : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
            color: category === cat.id ? glass.colors.blue : glass.colors.muted,
            fontWeight: category === cat.id ? '600' : 'normal', 
            fontSize: '13px',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease'
          }}>{cat.label}</button>
        ))}
      </div>

      {loading && (
        <div style={{ ...glass.card, padding: '3rem', textAlign: 'center', color: glass.colors.muted }}>
          <p style={{ fontSize: '32px', marginBottom: '1rem' }}>📰</p>
          <p>Loading latest news...</p>
        </div>
      )}
      
      {error && (
        <div style={{ ...glass.card, textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '32px', marginBottom: '1rem' }}>❌</p>
          <p style={{ color: glass.colors.red, fontWeight: '600' }}>{error}</p>
          <p style={{ color: glass.colors.muted, fontSize: '13px', marginTop: '0.5rem' }}>
            The app is now making requests through your proxy backend service. If errors persist, verify your Render Environment configurations are running.
          </p>
        </div>
      )}
      
      {!loading && !error && filteredArticles.length === 0 && (
        <p style={{ color: glass.colors.muted, textAlign: 'center', padding: '2rem' }}>No articles found matching your query criteria.</p>
      )}

      {!loading && !error && filteredArticles.length > 0 && (
        <div>
          {/* Main Featured Banner Article */}
          <ArticleCard article={filteredArticles[0]} featured={true} formatDate={formatDate} glass={glass} />
          
          {/* Article Catalog Layout Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {filteredArticles.slice(1).map((article, i) => (
              <ArticleCard key={i} article={article} featured={false} formatDate={formatDate} glass={glass} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}