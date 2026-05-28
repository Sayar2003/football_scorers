import { useState, useEffect } from 'react';
import axios from 'axios';

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

const dark = {
  card: '#1a1d27', border: '#2d3148',
  text: '#ffffff', muted: '#9ca3af', blue: '#3b82f6',
};

const predictMatch = (homeTeam, awayTeam, h2hMatches) => {
  let homeScore = 50;

  // 1. Position advantage
  const posDiff = awayTeam.position - homeTeam.position;
  homeScore += posDiff * 2;

  // 2. Points advantage
  const ptsDiff = homeTeam.points - awayTeam.points;
  homeScore += ptsDiff * 0.5;

  // 3. Form advantage
  const parseForm = (form) => {
    if (!form) return 0;
    return form.split(',').slice(-5).reduce((acc, r) => {
      return acc + (r === 'W' ? 3 : r === 'D' ? 1 : 0);
    }, 0);
  };
  const homeForm = parseForm(homeTeam.form);
  const awayForm = parseForm(awayTeam.form);
  homeScore += (homeForm - awayForm) * 1.5;

  // 4. Goal difference advantage
  const gdDiff = homeTeam.goalDifference - awayTeam.goalDifference;
  homeScore += gdDiff * 0.3;

  // 5. Home advantage
  homeScore += 5;

  // 6. H2H record
  if (h2hMatches && h2hMatches.length > 0) {
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

  // Cap between 15 and 85
  homeScore = Math.min(85, Math.max(15, homeScore));

  const awayScore = 100 - homeScore;
  const drawScore = 100 - Math.abs(homeScore - 50);
  const total = homeScore + awayScore + drawScore;

  const homeWinProb = Math.round((homeScore / total) * 100);
  const awayWinProb = Math.round((awayScore / total) * 100);
  const drawProb = 100 - homeWinProb - awayWinProb;

  // Predicted score
  const homeGoals = Math.round((homeTeam.goalsFor / homeTeam.playedGames) *
    (1 + (homeTeam.position < awayTeam.position ? 0.2 : -0.1)));
  const awayGoals = Math.round((awayTeam.goalsFor / awayTeam.playedGames) *
    (1 + (awayTeam.position < homeTeam.position ? 0.2 : -0.1)));

  return {
    homeWinProb,
    drawProb,
    awayWinProb,
    predictedScore: `${homeGoals} - ${awayGoals}`,
    favourite: homeWinProb > awayWinProb ? 'home' : awayWinProb > homeWinProb ? 'away' : 'draw',
    confidence: Math.abs(homeWinProb - awayWinProb) > 20 ? 'High' : Math.abs(homeWinProb - awayWinProb) > 10 ? 'Medium' : 'Low'
  };
};

const getAnalysis = (homeTeam, awayTeam, prediction, h2hMatches) => {
  const lines = [];

  // Form analysis
  const parseForm = (form) => form ? form.split(',').slice(-5) : [];
  const homeForm = parseForm(homeTeam.form);
  const awayForm = parseForm(awayTeam.form);
  const homeWinStreak = homeForm.filter(r => r === 'W').length;
  const awayWinStreak = awayForm.filter(r => r === 'W').length;

  if (homeWinStreak >= 3) lines.push(`🔥 ${homeTeam.name} are in great form with ${homeWinStreak} wins in last 5`);
  if (awayWinStreak >= 3) lines.push(`🔥 ${awayTeam.name} are in great form with ${awayWinStreak} wins in last 5`);
  if (homeForm.slice(-2).every(r => r === 'L')) lines.push(`⚠️ ${homeTeam.name} have lost their last 2 matches`);
  if (awayForm.slice(-2).every(r => r === 'L')) lines.push(`⚠️ ${awayTeam.name} have lost their last 2 matches`);

  // Position analysis
  if (homeTeam.position <= 4) lines.push(`⭐ ${homeTeam.name} are in Champions League position (${homeTeam.position}th)`);
  if (awayTeam.position <= 4) lines.push(`⭐ ${awayTeam.name} are in Champions League position (${awayTeam.position}th)`);
  if (homeTeam.position >= 18) lines.push(`❗ ${homeTeam.name} are in the relegation zone`);
  if (awayTeam.position >= 18) lines.push(`❗ ${awayTeam.name} are in the relegation zone`);

  // H2H analysis
  if (h2hMatches && h2hMatches.length > 0) {
    const homeH2HWins = h2hMatches.filter(m =>
      (m.homeTeam.id === homeTeam.id && m.score.fullTime.home > m.score.fullTime.away) ||
      (m.awayTeam.id === homeTeam.id && m.score.fullTime.away > m.score.fullTime.home)
    ).length;
    if (homeH2HWins > h2hMatches.length / 2) {
      lines.push(`📊 ${homeTeam.name} have won ${homeH2HWins} of last ${h2hMatches.length} meetings`);
    }
  }

  // Points gap
  const ptsDiff = Math.abs(homeTeam.points - awayTeam.points);
  if (ptsDiff > 15) {
    const better = homeTeam.points > awayTeam.points ? homeTeam.name : awayTeam.name;
    lines.push(`📈 ${better} have a significant ${ptsDiff} point advantage in the table`);
  }

  if (lines.length === 0) lines.push('⚖️ This looks like a very evenly matched contest');

  return lines;
};

export default function MatchPredictor() {
  const [selectedLeague, setSelectedLeague] = useState('PL');
  const [standings, setStandings] = useState([]);
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [h2hMatches, setH2hMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStandings, setLoadingStandings] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoadingStandings(true);
    setPrediction(null);
    setHomeTeam('');
    setAwayTeam('');
    api.get(`/competitions/${selectedLeague}/standings`)
      .then(res => {
        setStandings(res.data.standings[0].table);
        setLoadingStandings(false);
      })
      .catch(() => setLoadingStandings(false));
  }, [selectedLeague]);

  const handlePredict = async () => {
    if (!homeTeam || !awayTeam || homeTeam === awayTeam) {
      setError('Please select two different teams!');
      return;
    }
    setError(null);
    setLoading(true);
    setPrediction(null);

    const home = standings.find(s => s.team.id === parseInt(homeTeam));
    const away = standings.find(s => s.team.id === parseInt(awayTeam));

    try {
      // Try to get H2H data
      const matches = await api.get(`/competitions/${selectedLeague}/matches`);
      const h2h = matches.data.matches.filter(m =>
        (m.homeTeam.id === home.team.id && m.awayTeam.id === away.team.id) ||
        (m.homeTeam.id === away.team.id && m.awayTeam.id === home.team.id)
      ).filter(m => m.status === 'FINISHED');
      setH2hMatches(h2h);

      const result = predictMatch(
        { ...home.team, ...home },
        { ...away.team, ...away },
        h2h
      );
      const analysis = getAnalysis(
        { ...home.team, ...home },
        { ...away.team, ...away },
        result,
        h2h
      );
      setPrediction({ ...result, analysis });
    } catch {
      const result = predictMatch(
        { ...home.team, ...home },
        { ...away.team, ...away },
        []
      );
      const analysis = getAnalysis(
        { ...home.team, ...home },
        { ...away.team, ...away },
        result,
        []
      );
      setPrediction({ ...result, analysis });
    }
    setLoading(false);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence === 'High') return '#16a34a';
    if (confidence === 'Medium') return '#f59e0b';
    return '#ef4444';
  };

  const selectedHome = standings.find(s => s.team.id === parseInt(homeTeam));
  const selectedAway = standings.find(s => s.team.id === parseInt(awayTeam));

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '700', color: dark.text, marginBottom: '0.5rem' }}>
        🔮 Match Predictor
      </h1>
      <p style={{ color: dark.muted, fontSize: '14px', marginBottom: '1.5rem' }}>
        Predict match outcomes based on standings, form and head to head history
      </p>

      {/* League selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {Object.entries(LEAGUES).map(([code, league]) => (
          <button key={code} onClick={() => setSelectedLeague(code)} style={{
            padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '8px', border: '1px solid',
            borderColor: selectedLeague === code ? dark.blue : dark.border,
            backgroundColor: selectedLeague === code ? dark.blue : dark.card,
            color: selectedLeague === code ? 'white' : dark.muted,
            fontWeight: selectedLeague === code ? '600' : 'normal', fontSize: '13px'
          }}>
            {league.flag} {league.name}
          </button>
        ))}
      </div>

      {/* Team selector */}
      {loadingStandings ? (
        <p style={{ color: dark.muted }}>Loading teams...</p>
      ) : (
        <div style={{
          display: 'flex', gap: '1rem', alignItems: 'center',
          marginBottom: '1.5rem', flexWrap: 'wrap'
        }}>
          {/* Home team */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ color: dark.muted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
              🏠 Home Team
            </label>
            <select
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: '8px',
                border: `1px solid ${dark.border}`, backgroundColor: dark.card,
                color: dark.text, fontSize: '14px', cursor: 'pointer'
              }}
            >
              <option value="">Select home team...</option>
              {standings.map(s => (
                <option key={s.team.id} value={s.team.id}>{s.team.name}</option>
              ))}
            </select>
          </div>

          <div style={{ color: dark.muted, fontSize: '20px', fontWeight: 'bold', paddingTop: '20px' }}>VS</div>

          {/* Away team */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ color: dark.muted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
              ✈️ Away Team
            </label>
            <select
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: '8px',
                border: `1px solid ${dark.border}`, backgroundColor: dark.card,
                color: dark.text, fontSize: '14px', cursor: 'pointer'
              }}
            >
              <option value="">Select away team...</option>
              {standings.map(s => (
                <option key={s.team.id} value={s.team.id}>{s.team.name}</option>
              ))}
            </select>
          </div>

          {/* Predict button */}
          <div style={{ paddingTop: '20px' }}>
            <button
              onClick={handlePredict}
              disabled={loading || !homeTeam || !awayTeam}
              style={{
                padding: '0.75rem 2rem', borderRadius: '8px', border: 'none',
                backgroundColor: dark.blue, color: 'white', fontWeight: 'bold',
                fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: !homeTeam || !awayTeam ? 0.5 : 1
              }}
            >
              {loading ? '🔮 Predicting...' : '🔮 Predict'}
            </button>
          </div>
        </div>
      )}

      {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}

      {/* Selected teams preview */}
      {selectedHome && selectedAway && !prediction && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '2rem', padding: '1.5rem', borderRadius: '12px',
          border: `1px solid ${dark.border}`, backgroundColor: dark.card,
          marginBottom: '1.5rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <img src={selectedHome.team.crest} alt="" width={50} style={{ marginBottom: '8px' }} />
            <div style={{ color: dark.text, fontWeight: '600' }}>{selectedHome.team.name}</div>
            <div style={{ color: dark.muted, fontSize: '13px' }}>#{selectedHome.position} · {selectedHome.points} pts</div>
          </div>
          <div style={{ color: dark.muted, fontSize: '24px', fontWeight: 'bold' }}>VS</div>
          <div style={{ textAlign: 'center' }}>
            <img src={selectedAway.team.crest} alt="" width={50} style={{ marginBottom: '8px' }} />
            <div style={{ color: dark.text, fontWeight: '600' }}>{selectedAway.team.name}</div>
            <div style={{ color: dark.muted, fontSize: '13px' }}>#{selectedAway.position} · {selectedAway.points} pts</div>
          </div>
        </div>
      )}

      {/* Prediction result */}
      {prediction && selectedHome && selectedAway && (
        <div>
          {/* Match header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '2rem', padding: '2rem', borderRadius: '16px',
            border: `1px solid ${dark.border}`, backgroundColor: dark.card,
            marginBottom: '1.5rem', textAlign: 'center'
          }}>
            <div style={{ flex: 1 }}>
              <img src={selectedHome.team.crest} alt="" width={60} style={{ marginBottom: '8px' }} />
              <div style={{ color: prediction.favourite === 'home' ? '#60a5fa' : dark.text, fontWeight: 'bold', fontSize: '18px' }}>
                {selectedHome.team.name}
              </div>
              {prediction.favourite === 'home' && (
                <div style={{ color: '#60a5fa', fontSize: '12px', marginTop: '4px' }}>FAVOURITE ⭐</div>
              )}
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: dark.text }}>
                {prediction.predictedScore}
              </div>
              <div style={{ color: dark.muted, fontSize: '13px', marginTop: '4px' }}>Predicted Score</div>
              <div style={{
                marginTop: '8px', padding: '4px 12px', borderRadius: '20px',
                backgroundColor: getConfidenceColor(prediction.confidence) + '33',
                color: getConfidenceColor(prediction.confidence),
                fontSize: '12px', fontWeight: '600', display: 'inline-block'
              }}>
                {prediction.confidence} Confidence
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <img src={selectedAway.team.crest} alt="" width={60} style={{ marginBottom: '8px' }} />
              <div style={{ color: prediction.favourite === 'away' ? '#60a5fa' : dark.text, fontWeight: 'bold', fontSize: '18px' }}>
                {selectedAway.team.name}
              </div>
              {prediction.favourite === 'away' && (
                <div style={{ color: '#60a5fa', fontSize: '12px', marginTop: '4px' }}>FAVOURITE ⭐</div>
              )}
            </div>
          </div>

          {/* Win probabilities */}
          <div style={{
            borderRadius: '12px', border: `1px solid ${dark.border}`,
            overflow: 'hidden', marginBottom: '1.5rem'
          }}>
            <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#13161f', fontWeight: 'bold', fontSize: '14px', color: dark.text }}>
              📊 Win Probabilities
            </div>
            <div style={{ padding: '1.5rem' }}>
              {/* Probability bar */}
              <div style={{ display: 'flex', height: '40px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
                <div style={{
                  width: `${prediction.homeWinProb}%`, backgroundColor: '#3b82f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 'bold', fontSize: '14px',
                  transition: 'width 1s ease'
                }}>
                  {prediction.homeWinProb}%
                </div>
                <div style={{
                  width: `${prediction.drawProb}%`, backgroundColor: '#6b7280',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 'bold', fontSize: '14px'
                }}>
                  {prediction.drawProb}%
                </div>
                <div style={{
                  width: `${prediction.awayWinProb}%`, backgroundColor: '#ef4444',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 'bold', fontSize: '14px'
                }}>
                  {prediction.awayWinProb}%
                </div>
              </div>

              {/* Labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <div style={{ color: '#60a5fa' }}>
                  🏠 {selectedHome.team.shortName || selectedHome.team.name} Win
                </div>
                <div style={{ color: dark.muted }}>Draw</div>
                <div style={{ color: '#f87171' }}>
                  {selectedAway.team.shortName || selectedAway.team.name} Win ✈️
                </div>
              </div>
            </div>
          </div>

          {/* Key factors */}
          <div style={{
            borderRadius: '12px', border: `1px solid ${dark.border}`,
            overflow: 'hidden', marginBottom: '1.5rem'
          }}>
            <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#13161f', fontWeight: 'bold', fontSize: '14px', color: dark.text }}>
              🔍 Key Factors
            </div>
            {prediction.analysis.map((line, i) => (
              <div key={i} style={{
                padding: '0.75rem 1.5rem',
                borderTop: `1px solid ${dark.border}`,
                fontSize: '14px', color: dark.text
              }}>
                {line}
              </div>
            ))}
          </div>

          {/* Stats comparison */}
          <div style={{
            borderRadius: '12px', border: `1px solid ${dark.border}`,
            overflow: 'hidden', marginBottom: '1.5rem'
          }}>
            <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#13161f', fontWeight: 'bold', fontSize: '14px', color: dark.text }}>
              📈 Season Stats Comparison
            </div>
            {[
              { label: 'Position', home: `#${selectedHome.position}`, away: `#${selectedAway.position}` },
              { label: 'Points', home: selectedHome.points, away: selectedAway.points },
              { label: 'Wins', home: selectedHome.won, away: selectedAway.won },
              { label: 'Goals Scored', home: selectedHome.goalsFor, away: selectedAway.goalsFor },
              { label: 'Goals Conceded', home: selectedHome.goalsAgainst, away: selectedAway.goalsAgainst },
              { label: 'Goal Difference', home: selectedHome.goalDifference > 0 ? `+${selectedHome.goalDifference}` : selectedHome.goalDifference, away: selectedAway.goalDifference > 0 ? `+${selectedAway.goalDifference}` : selectedAway.goalDifference },
            ].map((stat, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center',
                padding: '0.75rem 1.5rem',
                borderTop: `1px solid ${dark.border}`,
              }}>
                <div style={{
                  flex: 1, textAlign: 'left', fontWeight: '600',
                  color: stat.home > stat.away ? '#60a5fa' : dark.text, fontSize: '14px'
                }}>{stat.home}</div>
                <div style={{ flex: 1, textAlign: 'center', color: dark.muted, fontSize: '13px' }}>{stat.label}</div>
                <div style={{
                  flex: 1, textAlign: 'right', fontWeight: '600',
                  color: stat.away > stat.home ? '#60a5fa' : dark.text, fontSize: '14px'
                }}>{stat.away}</div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <p style={{ color: dark.muted, fontSize: '12px', textAlign: 'center' }}>
            ⚠️ Predictions are based on current standings, form and historical data. Football is unpredictable — use for entertainment only!
          </p>
        </div>
      )}
    </div>
  );
}