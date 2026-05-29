import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';

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

const api = axios.create({
  baseURL: '/v4',
  headers: { 'X-Auth-Token': process.env.REACT_APP_FOOTBALL_API_KEY }
});

const LEAGUES = {
  PL:  { name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  PD:  { name: 'La Liga',        flag: '🇪🇸' },
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

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/competitions/${selectedLeague}/matches`),
      api.get(`/competitions/${selectedLeague}/scorers?limit=20`),
      api.get(`/competitions/${selectedLeague}/standings`)
    ]).then(([matchRes, scorerRes, standRes]) => {
      setMatches(matchRes.data.matches.filter(m => m.status === 'FINISHED').slice(-10));
      setScorers(scorerRes.data.scorers);
      setStandings(standRes.data.standings[0].table.slice(0, 10));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedLeague]);

const downloadCard = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // Convert all images in card to base64 first
      const images = cardRef.current.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(async (img) => {
          const base64 = await toBase64(img.src);
          if (base64) img.src = base64;
        })
      );

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0f1117',
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
  const leagueName = LEAGUES[selectedLeague]?.name;
  const leagueFlag = LEAGUES[selectedLeague]?.flag;

  const matchCaption = selectedMatchData
    ? `⚽ ${selectedMatchData.homeTeam.shortName || selectedMatchData.homeTeam.name} ${selectedMatchData.score.fullTime.home} - ${selectedMatchData.score.fullTime.away} ${selectedMatchData.awayTeam.shortName || selectedMatchData.awayTeam.name}\n\n🏆 ${leagueName}\n📅 ${new Date(selectedMatchData.utcDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}\n\n#Football #${leagueName.replace(' ', '')} #FootballApp`
    : '';

  const playerCaption = selectedPlayerData
    ? `⭐ ${selectedPlayerData.player.name} — ${leagueName} Top Scorer\n\n⚽ ${selectedPlayerData.goals} Goals\n🎯 ${selectedPlayerData.assists ?? 0} Assists\n🏆 ${selectedPlayerData.team.name}\n\n#Football #${leagueName.replace(' ', '')} #FootballApp`
    : '';

  const standingsCaption = `📊 ${leagueName} Standings\n\n${standings.slice(0, 5).map((s, i) => `${i + 1}. ${s.team.name} — ${s.points} pts`).join('\n')}\n\n#Football #${leagueName.replace(' ', '')} #FootballApp`;

  const dark = { card: '#1a1d27', border: '#2d3148', text: '#ffffff', muted: '#9ca3af', blue: '#3b82f6' };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '700', color: dark.text, marginBottom: '0.5rem' }}>
        🎨 Content Creator
      </h1>
      <p style={{ color: dark.muted, fontSize: '14px', marginBottom: '1.5rem' }}>
        Create shareable football cards for Instagram, Twitter and more
      </p>

      {/* Card type selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'match', label: '⚽ Match Result' },
          { id: 'player', label: '⭐ Player Stats' },
          { id: 'standings', label: '📊 Standings' },
        ].map(type => (
          <button key={type.id} onClick={() => setCardType(type.id)} style={{
            padding: '0.6rem 1.2rem', cursor: 'pointer', borderRadius: '8px', border: '1px solid',
            borderColor: cardType === type.id ? dark.blue : dark.border,
            backgroundColor: cardType === type.id ? dark.blue : dark.card,
            color: cardType === type.id ? 'white' : dark.muted,
            fontWeight: cardType === type.id ? '600' : 'normal', fontSize: '14px'
          }}>
            {type.label}
          </button>
        ))}
      </div>

      {/* League selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {Object.entries(LEAGUES).map(([code, league]) => (
          <button key={code} onClick={() => setSelectedLeague(code)} style={{
            padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '8px', border: '1px solid',
            borderColor: selectedLeague === code ? dark.blue : dark.border,
            backgroundColor: selectedLeague === code ? dark.blue : dark.card,
            color: selectedLeague === code ? 'white' : dark.muted,
            fontSize: '13px'
          }}>
            {league.flag} {league.name}
          </button>
        ))}
      </div>

      {/* Match selector */}
      {cardType === 'match' && (
        <select
          value={selectedMatch}
          onChange={(e) => setSelectedMatch(e.target.value)}
          style={{
            width: '100%', padding: '0.75rem', borderRadius: '8px',
            border: `1px solid ${dark.border}`, backgroundColor: dark.card,
            color: dark.text, fontSize: '14px', marginBottom: '1.5rem', cursor: 'pointer'
          }}
        >
          <option value="">Select a match...</option>
          {matches.map(m => (
            <option key={m.id} value={m.id}>
              {m.homeTeam.shortName || m.homeTeam.name} {m.score.fullTime.home} - {m.score.fullTime.away} {m.awayTeam.shortName || m.awayTeam.name}
            </option>
          ))}
        </select>
      )}

      {/* Player selector */}
      {cardType === 'player' && (
        <select
          value={selectedPlayer}
          onChange={(e) => setSelectedPlayer(e.target.value)}
          style={{
            width: '100%', padding: '0.75rem', borderRadius: '8px',
            border: `1px solid ${dark.border}`, backgroundColor: dark.card,
            color: dark.text, fontSize: '14px', marginBottom: '1.5rem', cursor: 'pointer'
          }}
        >
          <option value="">Select a player...</option>
          {scorers.map(s => (
            <option key={s.player.id} value={s.player.id}>
              {s.player.name} — {s.goals} goals ({s.team.name})
            </option>
          ))}
        </select>
      )}

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Card preview */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <p style={{ color: dark.muted, fontSize: '13px', marginBottom: '0.75rem' }}>Preview</p>

          {/* MATCH CARD */}
          {cardType === 'match' && selectedMatchData && (
            <div ref={cardRef} style={{
              background: 'linear-gradient(135deg, #0f1117 0%, #1a1d27 100%)',
              borderRadius: '16px', padding: '2rem', border: '1px solid #3b82f6',
              minWidth: '320px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span style={{ color: '#9ca3af', fontSize: '13px' }}>{leagueFlag} {leagueName}</span>
                <span style={{ color: '#9ca3af', fontSize: '12px' }}>
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
  marginBottom: '8px', margin: '0 auto 8px'
}}>
  {(selectedMatchData.homeTeam.shortName || selectedMatchData.homeTeam.name).charAt(0)}
</div>
                  <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '15px' }}>
                    {selectedMatchData.homeTeam.shortName || selectedMatchData.homeTeam.name}
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '0 1rem' }}>
                  <div style={{ fontSize: '42px', fontWeight: '900', color: '#ffffff', letterSpacing: '4px' }}>
                    {selectedMatchData.score.fullTime.home} : {selectedMatchData.score.fullTime.away}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>Full Time</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{
  width: '56px', height: '56px', borderRadius: '50%',
  backgroundColor: '#ef4444', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
  fontSize: '20px', fontWeight: 'bold', color: 'white',
  marginBottom: '8px', margin: '0 auto 8px'
}}>
  {(selectedMatchData.awayTeam.shortName || selectedMatchData.awayTeam.name).charAt(0)}
</div>
                  <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '15px' }}>
                    {selectedMatchData.awayTeam.shortName || selectedMatchData.awayTeam.name}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#3b82f6', fontSize: '12px', fontWeight: '600' }}>
                ⚽ FootballApp
              </div>
            </div>
          )}

          {/* PLAYER CARD */}
          {cardType === 'player' && selectedPlayerData && (
            <div ref={cardRef} style={{
              background: 'linear-gradient(135deg, #0f1117 0%, #1a1d27 100%)',
              borderRadius: '16px', padding: '2rem', border: '1px solid #f59e0b',
              minWidth: '320px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span style={{ color: '#9ca3af', fontSize: '13px' }}>{leagueFlag} {leagueName}</span>
                <span style={{ color: '#f59e0b', fontSize: '12px', fontWeight: '600' }}>⭐ Top Scorer</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  backgroundColor: '#f59e0b', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px', fontWeight: 'bold', color: 'white', flexShrink: 0
                }}>
                  {selectedPlayerData.player.name.charAt(0)}
                </div>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '20px' }}>
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
                    <span style={{ color: '#9ca3af', fontSize: '13px' }}>{selectedPlayerData.team.name}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[
                  { label: 'Goals', value: selectedPlayerData.goals, color: '#ef4444' },
                  { label: 'Assists', value: selectedPlayerData.assists ?? 0, color: '#10b981' },
                  { label: 'Matches', value: selectedPlayerData.playedMatches, color: '#3b82f6' },
                ].map(stat => (
                  <div key={stat.label} style={{
                    flex: 1, textAlign: 'center', padding: '0.75rem',
                    backgroundColor: stat.color + '22', borderRadius: '10px',
                    border: `1px solid ${stat.color}44`
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{stat.label}</div>
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
              background: 'linear-gradient(135deg, #0f1117 0%, #1a1d27 100%)',
              borderRadius: '16px', padding: '2rem', border: '1px solid #10b981',
              minWidth: '320px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '16px' }}>
                  {leagueFlag} {leagueName}
                </span>
                <span style={{ color: '#10b981', fontSize: '12px', fontWeight: '600' }}>📊 Standings</span>
              </div>

              {standings.slice(0, 8).map((row, i) => (
                <div key={row.team.id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '0.5rem 0', borderBottom: i < 7 ? '1px solid #2d3148' : 'none'
                }}>
                  <span style={{
                    width: '22px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold',
                    color: i < 4 ? '#60a5fa' : i >= 7 ? '#f87171' : '#9ca3af'
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
                  <span style={{ flex: 1, color: '#ffffff', fontSize: '13px', fontWeight: '500' }}>
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

          {/* Empty state */}
          {((cardType === 'match' && !selectedMatchData) ||
            (cardType === 'player' && !selectedPlayerData)) && (
            <div style={{
              padding: '3rem', borderRadius: '16px', border: `2px dashed ${dark.border}`,
              textAlign: 'center', color: dark.muted
            }}>
              <p style={{ fontSize: '32px', marginBottom: '1rem' }}>🎨</p>
              <p>Select a {cardType === 'match' ? 'match' : 'player'} to preview the card</p>
            </div>
          )}
        </div>

        {/* Actions panel */}
        <div style={{ width: '280px' }}>
          <p style={{ color: dark.muted, fontSize: '13px', marginBottom: '0.75rem' }}>Actions</p>

          {/* Download button */}
          <button
            onClick={downloadCard}
            disabled={downloading || (cardType === 'match' && !selectedMatchData) || (cardType === 'player' && !selectedPlayerData)}
            style={{
              width: '100%', padding: '0.75rem', borderRadius: '8px',
              border: 'none', backgroundColor: dark.blue, color: 'white',
              fontWeight: 'bold', fontSize: '14px', cursor: 'pointer',
              marginBottom: '0.75rem',
              opacity: (cardType === 'match' && !selectedMatchData) || (cardType === 'player' && !selectedPlayerData) ? 0.5 : 1
            }}
          >
            {downloading ? '⏳ Downloading...' : '⬇️ Download Card'}
          </button>

          {/* Copy caption */}
          {(cardType === 'match' && selectedMatchData) && (
            <div>
              <p style={{ color: dark.muted, fontSize: '13px', marginBottom: '0.5rem' }}>📝 Caption</p>
              <div style={{
                padding: '0.75rem', borderRadius: '8px',
                border: `1px solid ${dark.border}`, backgroundColor: dark.card,
                color: dark.muted, fontSize: '12px', lineHeight: '1.6',
                marginBottom: '0.5rem', whiteSpace: 'pre-wrap'
              }}>
                {matchCaption}
              </div>
              <button
                onClick={() => copyCaption(matchCaption)}
                style={{
                  width: '100%', padding: '0.5rem', borderRadius: '8px',
                  border: `1px solid ${dark.border}`, backgroundColor: dark.card,
                  color: dark.text, fontSize: '13px', cursor: 'pointer'
                }}
              >
                📋 Copy Caption
              </button>
            </div>
          )}

          {(cardType === 'player' && selectedPlayerData) && (
            <div>
              <p style={{ color: dark.muted, fontSize: '13px', marginBottom: '0.5rem' }}>📝 Caption</p>
              <div style={{
                padding: '0.75rem', borderRadius: '8px',
                border: `1px solid ${dark.border}`, backgroundColor: dark.card,
                color: dark.muted, fontSize: '12px', lineHeight: '1.6',
                marginBottom: '0.5rem', whiteSpace: 'pre-wrap'
              }}>
                {playerCaption}
              </div>
              <button
                onClick={() => copyCaption(playerCaption)}
                style={{
                  width: '100%', padding: '0.5rem', borderRadius: '8px',
                  border: `1px solid ${dark.border}`, backgroundColor: dark.card,
                  color: dark.text, fontSize: '13px', cursor: 'pointer'
                }}
              >
                📋 Copy Caption
              </button>
            </div>
          )}

          {cardType === 'standings' && (
            <div>
              <p style={{ color: dark.muted, fontSize: '13px', marginBottom: '0.5rem' }}>📝 Caption</p>
              <div style={{
                padding: '0.75rem', borderRadius: '8px',
                border: `1px solid ${dark.border}`, backgroundColor: dark.card,
                color: dark.muted, fontSize: '12px', lineHeight: '1.6',
                marginBottom: '0.5rem', whiteSpace: 'pre-wrap'
              }}>
                {standingsCaption}
              </div>
              <button
                onClick={() => copyCaption(standingsCaption)}
                style={{
                  width: '100%', padding: '0.5rem', borderRadius: '8px',
                  border: `1px solid ${dark.border}`, backgroundColor: dark.card,
                  color: dark.text, fontSize: '13px', cursor: 'pointer'
                }}
              >
                📋 Copy Caption
              </button>
            </div>
          )}

          {/* Tips */}
          <div style={{
            marginTop: '1.5rem', padding: '1rem', borderRadius: '8px',
            border: `1px solid ${dark.border}`, backgroundColor: dark.card
          }}>
            <p style={{ color: dark.text, fontSize: '13px', fontWeight: '600', marginBottom: '0.5rem' }}>💡 Tips</p>
            <p style={{ color: dark.muted, fontSize: '12px', lineHeight: '1.6' }}>
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