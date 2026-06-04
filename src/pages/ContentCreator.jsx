import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { useTheme } from '../context/ThemeContext';
import { getGlass } from '../styles/glass';

const toBase64 = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve('');
    img.src = url;
  });
};

import { API_BASE_URL } from '../config/apiConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'X-Auth-Token': process.env.REACT_APP_FOOTBALL_API_KEY }
});

const LEAGUES = {
  PL:  { name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  PD:  { name: 'La Liga',         flag: '🇪🇸' },
  BL1: { name: 'Bundesliga',     flag: '🇩🇪' },
  SA:  { name: 'Serie A',        flag: '🇮🇹' },
  FL1: { name: 'Ligue 1',        flag: '🇫🇷' },
};

export default function ContentCreator() {
  const [cardType, setCardType] = useState('match');
  const [selectedLeague, setSelectedLeague] = useState('PL');
  const [matches, setMatches] = useState([]);
  const [scorers, setScorers] = useState([]);
  const [standings, setStandings] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);
  const { isDark } = useTheme();
  const glass = getGlass(isDark);

  useEffect(() => {
    setLoading(true);
    setMatches([]);
    setScorers([]);
    setStandings([]);
    setSelectedMatch('');
    setSelectedPlayer('');
    
    Promise.all([
      api.get(`/competitions/${selectedLeague}/matches`),
      api.get(`/competitions/${selectedLeague}/scorers?limit=20`),
      api.get(`/competitions/${selectedLeague}/standings`)
    ]).then(([matchRes, scorerRes, standRes]) => {
      const allMatches = matchRes.data.matches || [];
      const finishedMatches = allMatches.filter(m => m.status === 'FINISHED');
      
      if (finishedMatches.length > 0) {
        setMatches(finishedMatches.slice(-10));
      } else {
        setMatches(allMatches.slice(0, 10));
      }

      setScorers(scorerRes.data.scorers || []);
      setStandings(standRes.data.standings?.[0]?.table?.slice(0, 10) || []);
      setLoading(false);
    }).catch((err) => {
      console.error("API Error or Rate Limit Exceeded:", err);
      alert("API request limit hit or error. Please wait a few seconds before changing leagues again.");
      setLoading(false);
    });
  }, [selectedLeague]);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const images = cardRef.current.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(async (img) => {
          const base64 = await toBase64(img.src);
          if (base64) img.src = base64;
        })
      );

      // Uses exact background layer variant corresponding to your theme setting
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: isDark ? '#0f1117' : '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      const link = document.createElement('a');
      link.download = `footballapp-${cardType}-card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      alert('Download failed. Try again.');
    }
    setDownloading(false);
  };

  const copyCaption = (text) => {
    navigator.clipboard.writeText(text);
    alert('Caption copied to clipboard!');
  };

  const selectedMatchData = matches.find(m => m.id === parseInt(selectedMatch));
  const selectedPlayerData = scorers.find(s => s.player.id === parseInt(selectedPlayer));
  const leagueName = LEAGUES[selectedLeague]?.name || '';
  const leagueFlag = LEAGUES[selectedLeague]?.flag || '';

  const homeScore = selectedMatchData?.score?.fullTime?.home ?? '-';
  const awayScore = selectedMatchData?.score?.fullTime?.away ?? '-';

  const matchCaption = selectedMatchData
    ? `⚽ ${selectedMatchData.homeTeam.shortName || selectedMatchData.homeTeam.name} ${homeScore} - ${awayScore} ${selectedMatchData.awayTeam.shortName || selectedMatchData.awayTeam.name}\n\n🏆 ${leagueName}\n📅 ${new Date(selectedMatchData.utcDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}\n\n#Football #${leagueName.replace(/\s+/g, '')} #FootballApp`
    : '';

  const playerCaption = selectedPlayerData
    ? `⭐ ${selectedPlayerData.player.name} — ${leagueName} Top Scorer\n\n⚽ ${selectedPlayerData.goals} Goals\n🎯 ${selectedPlayerData.assists ?? 0} Assists\n🏆 ${selectedPlayerData.team.name}\n\n#Football #${leagueName.replace(/\s+/g, '')} #FootballApp`
    : '';

  const standingsCaption = standings.length > 0
    ? `📊 ${leagueName} Standings\n\n${standings.slice(0, 5).map((s, i) => `${i + 1}. ${s.team.name} — ${s.points} pts`).join('\n')}\n\n#Football #${leagueName.replace(/\s+/g, '')} #FootballApp`
    : '';

  // Clean shared card style that flips naturally based on current mode context
  const cardPreviewBaseStyle = {
    background: isDark 
      ? 'linear-gradient(135deg, #0f1117 0%, #1a1d27 100%)' 
      : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: '16px', 
    padding: '2rem', 
    minWidth: '320px',
    boxShadow: isDark ? 'none' : '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)'
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '700', color: glass.colors.text, marginBottom: '0.5rem' }}>
        🎨 Content Creator
      </h1>
      <p style={{ color: glass.colors.muted, fontSize: '14px', marginBottom: '1.5rem' }}>
        Create shareable football cards for Instagram, Twitter and more
      </p>

      {/* Card type selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'match', label: '⚽ Match Result' },
          { id: 'player', label: '⭐ Player Stats' },
          { id: 'standings', label: '📊 Standings' },
        ].map(type => (
          <button 
            key={type.id} 
            onClick={() => setCardType(type.id)} 
            style={{
              padding: '0.6rem 1.2rem', 
              cursor: 'pointer', 
              borderRadius: '8px', 
              border: '1px solid',
              borderColor: cardType === type.id 
                ? (isDark ? 'rgba(59,130,246,0.4)' : '#3b82f6') 
                : glass.colors.border,
              background: cardType === type.id 
                ? (isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.08)') 
                : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
              color: cardType === type.id ? (isDark ? glass.colors.blue : '#2563eb') : glass.colors.muted,
              backdropFilter: 'blur(10px)',
              fontWeight: cardType === type.id ? '600' : 'normal', 
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* League selector row */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {Object.entries(LEAGUES).map(([code, league]) => {
          const isSelected = selectedLeague === code;
          return (
            <button 
              key={code} 
              onClick={() => setSelectedLeague(code)} 
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: isSelected ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: isSelected 
                  ? '1px solid #3b82f6' 
                  : `1px solid ${glass.colors.border}`,
                background: isSelected 
                  ? 'linear-gradient(135deg, #3b82f6, #2563eb)' 
                  : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                color: isSelected ? '#ffffff' : glass.colors.text,
                boxShadow: isSelected && !isDark ? '0 4px 12px rgba(59, 130, 246, 0.25)' : 'none'
              }}
            >
              {league.flag} {league.name}
            </button>
          );
        })}
      </div>

      {/* Match Selector Dropdown */}
      {cardType === 'match' && (
        <select
          value={selectedMatch}
          onChange={(e) => setSelectedMatch(e.target.value)}
          style={{
            width: '100%', padding: '0.75rem', borderRadius: '8px',
            border: `1px solid ${glass.colors.border}`,
            background: isDark ? '#1a1d27' : '#ffffff',
            color: glass.colors.text, fontSize: '14px',
            marginBottom: '1.5rem', cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="" style={{ background: isDark ? '#1a1d27' : '#ffffff' }}>
            {loading ? "Loading matches..." : "Select a match..."}
          </option>
          {matches.map(m => {
            const hScore = m.score?.fullTime?.home ?? '-';
            const aScore = m.score?.fullTime?.away ?? '-';
            return (
              <option key={m.id} value={m.id} style={{ background: isDark ? '#1a1d27' : '#ffffff' }}>
                {m.homeTeam.shortName || m.homeTeam.name} {hScore} - {aScore} {m.awayTeam.shortName || m.awayTeam.name} ({m.status})
              </option>
            );
          })}
        </select>
      )}

      {/* Player Selector Dropdown */}
      {cardType === 'player' && (
        <select
          value={selectedPlayer}
          onChange={(e) => setSelectedPlayer(e.target.value)}
          style={{
            width: '100%', padding: '0.75rem', borderRadius: '8px',
            border: `1px solid ${glass.colors.border}`, 
            background: isDark ? '#1a1d27' : '#ffffff',
            color: glass.colors.text, fontSize: '14px', marginBottom: '1.5rem', cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="" style={{ background: isDark ? '#1a1d27' : '#ffffff' }}>
            {loading ? "Loading players..." : "Select a player..."}
          </option>
          {scorers.map(s => (
            <option key={s.player.id} value={s.player.id} style={{ background: isDark ? '#1a1d27' : '#ffffff' }}>
              {s.player.name} — {s.goals} goals ({s.team.name})
            </option>
          ))}
        </select>
      )}

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Card preview Column */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <p style={{ color: glass.colors.muted, fontSize: '13px', marginBottom: '0.75rem' }}>Preview</p>

          {/* MATCH CARD */}
          {cardType === 'match' && selectedMatchData && (
            <div ref={cardRef} style={{
              ...cardPreviewBaseStyle,
              border: isDark ? `1px solid ${glass.colors.blue}` : '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span style={{ color: glass.colors.muted, fontSize: '13px' }}>{leagueFlag} {leagueName}</span>
                <span style={{ color: glass.colors.muted, fontSize: '12px' }}>
                  {new Date(selectedMatchData.utcDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    backgroundColor: '#3b82f6', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', fontWeight: 'bold', color: 'white',
                    marginBottom: '8px', margin: '0 auto 8px',
                    boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)'
                  }}>
                    {(selectedMatchData.homeTeam.shortName || selectedMatchData.homeTeam.name).charAt(0)}
                  </div>
                  <div style={{ color: glass.colors.text, fontWeight: '700', fontSize: '15px' }}>
                    {selectedMatchData.homeTeam.shortName || selectedMatchData.homeTeam.name}
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '0 1rem' }}>
                  <div style={{ fontSize: '42px', fontWeight: '900', color: glass.colors.text, letterSpacing: '4px' }}>
                    {homeScore} : {awayScore}
                  </div>
                  <div style={{ color: glass.colors.muted, fontSize: '12px', marginTop: '4px' }}>
                    {selectedMatchData.status}
                  </div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    backgroundColor: '#ef4444', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', fontWeight: 'bold', color: 'white',
                    marginBottom: '8px', margin: '0 auto 8px',
                    boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)'
                  }}>
                    {(selectedMatchData.awayTeam.shortName || selectedMatchData.awayTeam.name).charAt(0)}
                  </div>
                  <div style={{ color: glass.colors.text, fontWeight: '700', fontSize: '15px' }}>
                    {selectedMatchData.awayTeam.shortName || selectedMatchData.awayTeam.name}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#3b82f6', ...glass.text, fontSize: '12px', fontWeight: '600' }}>
                ⚽ FootballApp
              </div>
            </div>
          )}

          {/* PLAYER CARD */}
          {cardType === 'player' && selectedPlayerData && (
            <div ref={cardRef} style={{
              ...cardPreviewBaseStyle,
              border: isDark ? '1px solid #f59e0b' : '1px solid rgba(245, 158, 11, 0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span style={{ color: glass.colors.muted, fontSize: '13px' }}>{leagueFlag} {leagueName}</span>
                <span style={{ color: '#f59e0b', fontSize: '12px', fontWeight: '600' }}>⭐ Top Scorer</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  backgroundColor: '#f59e0b', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px', fontWeight: 'bold', color: 'white', flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}>
                  {selectedPlayerData.player.name.charAt(0)}
                </div>
                <div>
                  <div style={{ color: glass.colors.text, fontWeight: '700', fontSize: '20px' }}>
                    {selectedPlayerData.player.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <span style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      backgroundColor: '#3b82f6', display: 'inline-flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: 'bold', color: 'white'
                    }}>
                      {selectedPlayerData.team.name.charAt(0)}
                    </span>
                    <span style={{ color: glass.colors.muted, fontSize: '13px' }}>{selectedPlayerData.team.name}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[
                  { label: 'Goals', value: selectedPlayerData.goals, color: '#ef4444' },
                  { label: 'Assists', value: selectedPlayerData.assists ?? 0, color: '#10b981' },
                  { label: 'Matches', value: selectedPlayerData.playedMatches ?? 0, color: '#3b82f6' },
                ].map(stat => (
                  <div key={stat.label} style={{
                    flex: 1, textAlign: 'center', padding: '0.75rem',
                    backgroundColor: stat.color + '15', borderRadius: '10px',
                    border: `1px solid ${stat.color}25`
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: '11px', color: glass.colors.muted, marginTop: '2px' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#3b82f6', fontSize: '12px', fontWeight: '600' }}>
                ⚽ FootballApp
              </div>
            </div>
          )}

          {/* STANDINGS CARD */}
          {cardType === 'standings' && standings.length > 0 && (
            <div ref={cardRef} style={{
              ...cardPreviewBaseStyle,
              border: isDark ? '1px solid #10b981' : '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span style={{ color: glass.colors.text, fontWeight: '700', fontSize: '16px' }}>
                  {leagueFlag} {leagueName}
                </span>
                <span style={{ color: '#10b981', fontSize: '12px', fontWeight: '600' }}>📊 Standings</span>
              </div>

              {standings.slice(0, 8).map((row, i) => (
                <div key={row.team.id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '0.5rem 0', borderBottom: i < 7 ? `1px solid ${glass.colors.border}` : 'none'
                }}>
                  <span style={{
                    width: '22px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold',
                    color: i < 4 ? '#3b82f6' : i >= 7 ? '#ef4444' : glass.colors.muted
                  }}>
                    {row.position}
                  </span>
                  <span style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    backgroundColor: '#3b82f6', display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: 'bold', color: 'white', flexShrink: 0
                  }}>
                    {row.team.name.charAt(0)}
                  </span>
                  <span style={{ flex: 1, color: glass.colors.text, fontSize: '13px', fontWeight: '500' }}>
                    {row.team.shortName || row.team.name}
                  </span>
                  <span style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '14px' }}>{row.points}</span>
                </div>
              ))}

              <div style={{ textAlign: 'center', marginTop: '1rem', color: '#3b82f6', fontSize: '12px', fontWeight: '600' }}>
                ⚽ FootballApp
              </div>
            </div>
          )}

          {/* Empty state container */}
          {((cardType === 'match' && !selectedMatchData) ||
            (cardType === 'player' && !selectedPlayerData)) && (
            <div style={{
              padding: '3rem', borderRadius: '16px', border: `2px dashed ${glass.colors.border}`,
              textAlign: 'center', color: glass.colors.muted,
              background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'
            }}>
              <p style={{ fontSize: '32px', marginBottom: '1rem' }}>🎨</p>
              <p>Select a {cardType === 'match' ? 'match' : 'player'} to preview the card</p>
            </div>
          )}
        </div>

        {/* Actions & Captions sidebar panel */}
        <div style={{ width: '280px' }}>
          <p style={{ color: glass.colors.muted, fontSize: '13px', marginBottom: '0.75rem' }}>Actions</p>

          <button
            onClick={downloadCard}
            disabled={downloading || (cardType === 'match' && !selectedMatchData) || (cardType === 'player' && !selectedPlayerData)}
            style={{
              width: '100%', padding: '0.75rem', borderRadius: '8px',
              border: 'none', backgroundColor: '#3b82f6', color: 'white',
              fontWeight: 'bold', fontSize: '14px', cursor: 'pointer',
              marginBottom: '1.5rem',
              opacity: (cardType === 'match' && !selectedMatchData) || (cardType === 'player' && !selectedPlayerData) ? 0.5 : 1,
              boxShadow: !isDark ? '0 4px 14px rgba(59, 130, 246, 0.3)' : 'none'
            }}
          >
            {downloading ? '⏳ Downloading...' : '⬇️ Download Card'}
          </button>

          {/* Caption wrapper (Match) */}
          {(cardType === 'match' && selectedMatchData) && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: glass.colors.muted, fontSize: '13px', marginBottom: '0.5rem' }}>📝 Caption</p>
              <div style={{
                padding: '0.75rem', borderRadius: '8px',
                border: `1px solid ${glass.colors.border}`, 
                backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                color: glass.colors.text, fontSize: '12px', lineHeight: '1.6',
                marginBottom: '0.5rem', whiteSpace: 'pre-wrap'
              }}>
                {matchCaption}
              </div>
              <button
                onClick={() => copyCaption(matchCaption)}
                style={{
                  width: '100%', padding: '0.5rem', borderRadius: '8px',
                  border: `1px solid ${glass.colors.border}`, 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  color: glass.colors.text, fontSize: '13px', cursor: 'pointer'
                }}
              >
                📋 Copy Caption
              </button>
            </div>
          )}

          {/* Caption wrapper (Player) */}
          {(cardType === 'player' && selectedPlayerData) && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: glass.colors.muted, fontSize: '13px', marginBottom: '0.5rem' }}>📝 Caption</p>
              <div style={{
                padding: '0.75rem', borderRadius: '8px',
                border: `1px solid ${glass.colors.border}`, 
                backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                color: glass.colors.text, fontSize: '12px', lineHeight: '1.6',
                marginBottom: '0.5rem', whiteSpace: 'pre-wrap'
              }}>
                {playerCaption}
              </div>
              <button
                onClick={() => copyCaption(playerCaption)}
                style={{
                  width: '100%', padding: '0.5rem', borderRadius: '8px',
                  border: `1px solid ${glass.colors.border}`, 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  color: glass.colors.text, fontSize: '13px', cursor: 'pointer'
                }}
              >
                📋 Copy Caption
              </button>
            </div>
          )}

          {/* Caption wrapper (Standings) */}
          {cardType === 'standings' && standings.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: glass.colors.muted, fontSize: '13px', marginBottom: '0.5rem' }}>📝 Caption</p>
              <div style={{
                padding: '0.75rem', borderRadius: '8px',
                border: `1px solid ${glass.colors.border}`, 
                backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                color: glass.colors.text, fontSize: '12px', lineHeight: '1.6',
                marginBottom: '0.5rem', whiteSpace: 'pre-wrap'
              }}>
                {standingsCaption}
              </div>
              <button
                onClick={() => copyCaption(standingsCaption)}
                style={{
                  width: '100%', padding: '0.5rem', borderRadius: '8px',
                  border: `1px solid ${glass.colors.border}`, 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  color: glass.colors.text, fontSize: '13px', cursor: 'pointer'
                }}
              >
                📋 Copy Caption
              </button>
            </div>
          )}

          {/* Tips block information box */}
          <div style={{
            marginTop: '1.5rem', padding: '1rem', borderRadius: '8px',
            border: `1px solid ${glass.colors.border}`, 
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'
          }}>
            <p style={{ color: glass.colors.text, fontSize: '13px', fontWeight: '600', marginBottom: '0.5rem' }}>💡 Tips</p>
            <p style={{ color: glass.colors.muted, fontSize: '12px', lineHeight: '1.6' }}>
              • Download the card as PNG<br />
              • Copy the caption with hashtags<br />
              • Post on Instagram, Twitter or TikTok<br />
              • Best size: 1:1 for Instagram posts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}