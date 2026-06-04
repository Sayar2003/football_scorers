import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { getGlass, leagueButtonStyle } from '../styles/glass';

import { API_BASE_URL } from '../config/apiConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'X-Auth-Token': process.env.REACT_APP_FOOTBALL_API_KEY }
});

const LEAGUES = {
  PL:  { name: 'Premier League', flag: '🏴' },
  PD:  { name: 'La Liga',         flag: '🇪🇸' },
  BL1: { name: 'Bundesliga',     flag: '🇩🇪' },
  SA:  { name: 'Serie A',        flag: '🇮🇹' },
  FL1: { name: 'Ligue 1',        flag: '🇫🇷' },
};

const predictMatch = (homeTeam, awayTeam, h2hMatches) => {
  let homeScore = 50;
  const posDiff = awayTeam.position - homeTeam.position;
  homeScore += posDiff * 2;
  const ptsDiff = homeTeam.points - awayTeam.points;
  homeScore += ptsDiff * 0.5;
  const parseForm = (form) => {
    if (!form) return 0;
    return form.split(',').slice(-5).reduce((acc, r) => acc + (r === 'W' ? 3 : r === 'D' ? 1 : 0), 0);
  };
  homeScore += (parseForm(homeTeam.form) - parseForm(awayTeam.form)) * 1.5;
  homeScore += (homeTeam.goalDifference - awayTeam.goalDifference) * 0.3;
  homeScore += 5;
  if (h2hMatches?.length > 0) {
    const homeWins = h2hMatches.filter(m =>
      (m.homeTeam.id === homeTeam.id && m.score.fullTime.home > m.score.fullTime.away) ||
      (m.awayTeam.id === homeTeam.id && m.score.fullTime.away > m.score.fullTime.home)
    ).length;
    const awayWins = h2hMatches.filter(m =>
      (m.homeTeam.id === awayTeam.id && m.score.fullTime.home > m.score.fullTime.away) ||
      (m.awayTeam.id === awayTeam.id && m.score.fullTime.away > m.score.fullTime.home)
    ).length;
    homeScore += (homeWins - awayWins) * 3;
  }
  homeScore = Math.min(85, Math.max(15, homeScore));
  const awayScore = 100 - homeScore;
  const drawScore = 100 - Math.abs(homeScore - 50);
  const total = homeScore + awayScore + drawScore;
  const homeWinProb = Math.round((homeScore / total) * 100);
  const awayWinProb = Math.round((awayScore / total) * 100);
  const drawProb = 100 - homeWinProb - awayWinProb;
  const homeGoals = Math.round((homeTeam.goalsFor / homeTeam.playedGames) * (1 + (homeTeam.position < awayTeam.position ? 0.2 : -0.1)));
  const awayGoals = Math.round((awayTeam.goalsFor / awayTeam.playedGames) * (1 + (awayTeam.position < homeTeam.position ? 0.2 : -0.1)));
  return {
    homeWinProb, drawProb, awayWinProb,
    predictedScore: `${homeGoals} - ${awayGoals}`,
    favourite: homeWinProb > awayWinProb ? 'home' : awayWinProb > homeWinProb ? 'away' : 'draw',
    confidence: Math.abs(homeWinProb - awayWinProb) > 20 ? 'High' : Math.abs(homeWinProb - awayWinProb) > 10 ? 'Medium' : 'Low'
  };
};

const getAnalysis = (homeTeam, awayTeam, h2hMatches) => {
  const lines = [];
  const parseForm = (form) => form ? form.split(',').slice(-5) : [];
  const homeForm = parseForm(homeTeam.form);
  const awayForm = parseForm(awayTeam.form);
  if (homeForm.filter(r => r === 'W').length >= 3) lines.push(`🔥 ${homeTeam.name} are in great form with ${homeForm.filter(r => r === 'W').length} wins in last 5`);
  if (awayForm.filter(r => r === 'W').length >= 3) lines.push(`🔥 ${awayTeam.name} are in great form with ${awayForm.filter(r => r === 'W').length} wins in last 5`);
  if (homeForm.slice(-2).every(r => r === 'L')) lines.push(`⚠️ ${homeTeam.name} have lost their last 2 matches`);
  if (awayForm.slice(-2).every(r => r === 'L')) lines.push(`⚠️ ${awayTeam.name} have lost their last 2 matches`);
  if (homeTeam.position <= 4) lines.push(`⭐ ${homeTeam.name} are in Champions League position`);
  if (awayTeam.position <= 4) lines.push(`⭐ ${awayTeam.name} are in Champions League position`);
  if (homeTeam.position >= 18) lines.push(`❗ ${homeTeam.name} are in the relegation zone`);
  if (awayTeam.position >= 18) lines.push(`❗ ${awayTeam.name} are in the relegation zone`);
  if (h2hMatches?.length > 0) {
    const homeH2HWins = h2hMatches.filter(m =>
      (m.homeTeam.id === homeTeam.id && m.score.fullTime.home > m.score.fullTime.away) ||
      (m.awayTeam.id === homeTeam.id && m.score.fullTime.away > m.score.fullTime.home)
    ).length;
    if (homeH2HWins > h2hMatches.length / 2) lines.push(`📊 ${homeTeam.name} have won ${homeH2HWins} of last ${h2hMatches.length} meetings`);
  }
  const ptsDiff = Math.abs(homeTeam.points - awayTeam.points);
  if (ptsDiff > 15) lines.push(`📈 ${homeTeam.points > awayTeam.points ? homeTeam.name : awayTeam.name} have a ${ptsDiff} point advantage`);
  if (lines.length === 0) lines.push('⚖️ This looks like a very evenly matched contest');
  return lines;
};

export default function MatchPredictor() {
  const [selectedLeague, setSelectedLeague] = useState('PL');
  const [standings, setStandings] = useState([]);
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStandings, setLoadingStandings] = useState(true);
  const [error, setError] = useState(null);
  const { isDark } = useTheme();
  const glass = getGlass(isDark);

  useEffect(() => {
    let isMounted = true;
    setLoadingStandings(true);
    setPrediction(null);
    setHomeTeam(''); 
    setAwayTeam('');
    
    api.get(`/competitions/${selectedLeague}/standings`)
      .then(res => { 
        if (isMounted) {
          setStandings(res.data.standings[0].table); 
          setLoadingStandings(false); 
        }
      })
      .catch(() => {
        if (isMounted) setLoadingStandings(false);
      });

    return () => { isMounted = false; };
  }, [selectedLeague]);

  const handlePredict = async () => {
    if (!homeTeam || !awayTeam || homeTeam === awayTeam) { setError('Please select two different teams!'); return; }
    setError(null); setLoading(true); setPrediction(null);
    const home = standings.find(s => s.team.id === parseInt(homeTeam));
    const away = standings.find(s => s.team.id === parseInt(awayTeam));
    try {
      const matches = await api.get(`/competitions/${selectedLeague}/matches`);
      const h2h = matches.data.matches.filter(m =>
        ((m.homeTeam.id === home.team.id && m.awayTeam.id === away.team.id) ||
        (m.homeTeam.id === away.team.id && m.awayTeam.id === home.team.id)) &&
        m.status === 'FINISHED'
      );
      const result = predictMatch({ ...home.team, ...home }, { ...away.team, ...away }, h2h);
      const analysis = getAnalysis({ ...home.team, ...home }, { ...away.team, ...away }, h2h);
      setPrediction({ ...result, analysis });
    } catch {
      const result = predictMatch({ ...home.team, ...home }, { ...away.team, ...away }, []);
      const analysis = getAnalysis({ ...home.team, ...home }, { ...away.team, ...away }, []);
      setPrediction({ ...result, analysis });
    }
    setLoading(false);
  };

  const getConfidenceColor = (c) => c === 'High' ? '#16a34a' : c === 'Medium' ? '#f59e0b' : '#ef4444';
  const selectedHome = standings.find(s => s.team.id === parseInt(homeTeam));
  const selectedAway = standings.find(s => s.team.id === parseInt(awayTeam));

  const selectStyle = {
    width: '100%', padding: '0.75rem', borderRadius: '8px',
    border: `1px solid ${glass.colors.border}`,
    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', 
    color: glass.colors.text,
    fontSize: '14px', cursor: 'pointer', outline: 'none',
    backdropFilter: 'blur(10px)',
    WebkitAppearance: 'none',
    MozAppearance: 'none'
  };

  const optionStyle = {
    background: isDark ? '#151c2c' : '#ffffff',
    color: glass.colors.text,
    padding: '10px'
  };

  const sectionHeaderStyle = {
    padding: '0.75rem 1.5rem', 
    background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)', 
    fontWeight: '700', 
    fontSize: '14px', 
    color: glass.colors.text,
    letterSpacing: '0.5px'
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }} className="fade-in">
      <h1 style={{
        fontSize: '24px', fontWeight: '700', marginBottom: '0.5rem',
        background: isDark 
          ? 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.7))' 
          : `linear-gradient(135deg, ${glass.colors.text}, ${glass.colors.muted})`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
      }}>🔮 Match Predictor</h1>
      <p style={{ color: glass.colors.muted, fontSize: '14px', marginBottom: '1.5rem' }}>
        Predict match outcomes based on standings, form and head to head history
      </p>

      {/* Fixed Contrast League Buttons Container */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {Object.entries(LEAGUES).map(([code, league]) => {
          const isActive = selectedLeague === code;
          return (
            <button 
              key={code} 
              onClick={() => setSelectedLeague(code)} 
              style={{
                ...leagueButtonStyle(isActive),
                fontWeight: isActive ? '600' : '500',
                fontSize: '13px',
                padding: '0.4rem 0.9rem',
                borderRadius: '20px',
                cursor: 'pointer',
                color: isActive 
                  ? '#3b82f6' 
                  : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)'),
                backgroundColor: isActive 
                  ? 'rgba(59,130,246,0.15)' 
                  : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                borderColor: isActive ? 'rgba(59,130,246,0.4)' : glass.colors.border,
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {league.flag} {league.name}
            </button>
          );
        })}
      </div>

      {loadingStandings ? (
        <p style={{ color: glass.colors.muted }}>Loading teams...</p>
      ) : (
        <div style={{ ...glass.card, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ color: glass.colors.muted, fontSize: '13px', display: 'block', marginBottom: '6px', fontWeight: '500' }}>🏠 Home Team</label>
              <select value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} style={selectStyle}>
                <option value="" style={optionStyle}>Select home team...</option>
                {standings.map(s => (
                  <option key={s.team.id} value={s.team.id} style={optionStyle}>
                    {s.team.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ color: glass.colors.muted, fontSize: '20px', fontWeight: 'bold', paddingBottom: '8px' }}>VS</div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ color: glass.colors.muted, fontSize: '13px', display: 'block', marginBottom: '6px', fontWeight: '500' }}>✈️ Away Team</label>
              <select value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} style={selectStyle}>
                <option value="" style={optionStyle}>Select away team...</option>
                {standings.map(s => (
                  <option key={s.team.id} value={s.team.id} style={optionStyle}>
                    {s.team.name}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={handlePredict} disabled={loading || !homeTeam || !awayTeam}
              style={{ ...glass.button.primary, padding: '0.75rem 2rem', fontSize: '15px', opacity: !homeTeam || !awayTeam ? 0.5 : 1 }}>
              {loading ? '🔮 Predicting...' : '🔮 Predict'}
            </button>
          </div>
        </div>
      )}

      {error && <p style={{ color: glass.colors.red, marginBottom: '1rem', fontWeight: '500' }}>{error}</p>}

      {selectedHome && selectedAway && !prediction && (
        <div style={{ ...glass.card, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <div>
            <img src={selectedHome.team.crest} alt="" width={50} height={50} style={{ marginBottom: '8px', objectFit: 'contain' }} />
            <div style={{ color: glass.colors.text, fontWeight: '600' }}>{selectedHome.team.name}</div>
            <div style={{ color: glass.colors.muted, fontSize: '13px' }}>#{selectedHome.position} · {selectedHome.points} pts</div>
          </div>
          <div style={{ color: glass.colors.muted, fontSize: '24px', fontWeight: 'bold' }}>VS</div>
          <div>
            <img src={selectedAway.team.crest} alt="" width={50} height={50} style={{ marginBottom: '8px', objectFit: 'contain' }} />
            <div style={{ color: glass.colors.text, fontWeight: '600' }}>{selectedAway.team.name}</div>
            <div style={{ color: glass.colors.muted, fontSize: '13px' }}>#{selectedAway.position} · {selectedAway.points} pts</div>
          </div>
        </div>
      )}

      {prediction && selectedHome && selectedAway && (
        <div className="fade-in">
          {/* Match header */}
          <div style={{ ...glass.cardStrong, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', padding: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            <div style={{ flex: 1 }}>
              <img src={selectedHome.team.crest} alt="" width={60} height={60} style={{ marginBottom: '8px', objectFit: 'contain' }} />
              <div style={{ color: prediction.favourite === 'home' ? glass.colors.blue : glass.colors.text, fontWeight: 'bold', fontSize: '18px' }}>{selectedHome.team.name}</div>
              {prediction.favourite === 'home' && <div style={{ color: glass.colors.blue, fontSize: '12px', marginTop: '4px', fontWeight: '700' }}>FAVOURITE ⭐</div>}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '36px', fontWeight: '900',
                background: isDark
                  ? 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.8))'
                  : `linear-gradient(135deg, ${glass.colors.text}, ${glass.colors.muted})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}>{prediction.predictedScore}</div>
              <div style={{ color: glass.colors.muted, fontSize: '13px', marginTop: '4px', fontWeight: '500' }}>Predicted Score</div>
              <div style={{ marginTop: '8px', padding: '4px 12px', borderRadius: '20px', background: `${getConfidenceColor(prediction.confidence)}22`, color: getConfidenceColor(prediction.confidence), fontSize: '12px', fontWeight: '600', display: 'inline-block' }}>
                {prediction.confidence} Confidence
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <img src={selectedAway.team.crest} alt="" width={60} height={60} style={{ marginBottom: '8px', objectFit: 'contain' }} />
              <div style={{ color: prediction.favourite === 'away' ? glass.colors.blue : glass.colors.text, fontWeight: 'bold', fontSize: '18px' }}>{selectedAway.team.name}</div>
              {prediction.favourite === 'away' && <div style={{ color: glass.colors.blue, fontSize: '12px', marginTop: '4px', fontWeight: '700' }}>FAVOURITE ⭐</div>}
            </div>
          </div>

          {/* Win probabilities */}
          <div style={{ ...glass.card, overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={sectionHeaderStyle}>📊 Win Probabilities</div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', height: '40px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
                <div style={{ width: `${prediction.homeWinProb}%`, background: 'linear-gradient(90deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>{prediction.homeWinProb}%</div>
                <div style={{ width: `${prediction.drawProb}%`, background: 'rgba(107,114,128,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>{prediction.drawProb}%</div>
                <div style={{ width: `${prediction.awayWinProb}%`, background: 'linear-gradient(90deg, #ef4444, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>{prediction.awayWinProb}%</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '500' }}>
                <div style={{ color: glass.colors.blue }}>🏠 {selectedHome.team.shortName || selectedHome.team.name}</div>
                <div style={{ color: glass.colors.muted }}>Draw</div>
                <div style={{ color: glass.colors.red }}>{selectedAway.team.shortName || selectedAway.team.name} ✈️</div>
              </div>
            </div>
          </div>

          {/* Key factors */}
          <div style={{ ...glass.card, overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={sectionHeaderStyle}>🔍 Key Factors</div>
            {prediction.analysis.map((line, i) => (
              <div key={i} style={{ padding: '0.75rem 1.5rem', borderTop: `1px solid ${glass.colors.border}`, fontSize: '14px', color: glass.colors.text, fontWeight: '500' }}>{line}</div>
            ))}
          </div>

          {/* Stats comparison */}
          <div style={{ ...glass.card, overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={sectionHeaderStyle}>📈 Season Stats</div>
            {[
              { label: 'Position', home: `#${selectedHome.position}`, away: `#${selectedAway.position}` },
              { label: 'Points', home: selectedHome.points, away: selectedAway.points },
              { label: 'Wins', home: selectedHome.won, away: selectedAway.won },
              { label: 'Goals Scored', home: selectedHome.goalsFor, away: selectedAway.goalsFor },
              { label: 'Goals Conceded', home: selectedHome.goalsAgainst, away: selectedAway.goalsAgainst },
              { label: 'Goal Difference', home: selectedHome.goalDifference > 0 ? `+${selectedHome.goalDifference}` : selectedHome.goalDifference, away: selectedAway.goalDifference > 0 ? `+${selectedAway.goalDifference}` : selectedAway.goalDifference },
            ].map((stat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1.5rem', borderTop: `1px solid ${glass.colors.border}` }}>
                <div style={{ flex: 1, textAlign: 'left', fontWeight: '600', color: stat.home > stat.away ? glass.colors.blue : glass.colors.text, fontSize: '14px' }}>{stat.home}</div>
                <div style={{ flex: 1, textAlign: 'center', color: glass.colors.muted, fontSize: '13px', fontWeight: '500' }}>{stat.label}</div>
                <div style={{ flex: 1, textAlign: 'right', fontWeight: '600', color: stat.away > stat.home ? glass.colors.blue : glass.colors.text, fontSize: '14px' }}>{stat.away}</div>
              </div>
            ))}
          </div>

          <p style={{ color: glass.colors.muted, fontSize: '12px', textAlign: 'center' }}>
            ⚠️ Predictions are based on current data. Football is unpredictable — for entertainment only!
          </p>
        </div>
      )}
    </div>
  );
}