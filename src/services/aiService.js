import axios from 'axios';

const api = axios.create({
  baseURL: '/v4',
  headers: { 'X-Auth-Token': process.env.REACT_APP_FOOTBALL_API_KEY }
});

const LEAGUE_CODES = {
  'premier league': 'PL', 'epl': 'PL', 'england': 'PL',
  'la liga': 'PD', 'spain': 'PD', 'spanish': 'PD',
  'bundesliga': 'BL1', 'germany': 'BL1', 'german': 'BL1',
  'serie a': 'SA', 'italy': 'SA', 'italian': 'SA',
  'ligue 1': 'FL1', 'france': 'FL1', 'french': 'FL1',
};

const LEAGUE_NAMES = {
  PL: 'Premier League', PD: 'La Liga',
  BL1: 'Bundesliga', SA: 'Serie A', FL1: 'Ligue 1'
};

const detectLeague = (message) => {
  const lower = message.toLowerCase();
  for (const [key, code] of Object.entries(LEAGUE_CODES)) {
    if (lower.includes(key)) return code;
  }
  return 'PL'; // default
};

const formatStandings = (table, leagueName) => {
  const top5 = table.slice(0, 5);
  let response = `📊 **${leagueName} Standings (Top 5)**\n\n`;
  top5.forEach(row => {
    response += `${row.position}. ${row.team.name} — ${row.points} pts (${row.won}W ${row.draw}D ${row.lost}L)\n`;
  });
  response += `\nGD: Goal Difference`;
  return response;
};

const formatScorers = (scorers, leagueName) => {
  const top5 = scorers.slice(0, 5);
  let response = `⚽ **${leagueName} Top Scorers**\n\n`;
  top5.forEach((s, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
    response += `${medal} ${s.player.name} (${s.team.name}) — ${s.goals} goals\n`;
  });
  return response;
};

const formatMatches = (matches, leagueName) => {
  const recent = matches.filter(m => m.status === 'FINISHED').slice(-5);
  if (recent.length === 0) return `No recent matches found for ${leagueName}.`;
  let response = `🏆 **Recent ${leagueName} Results**\n\n`;
  recent.forEach(m => {
    response += `${m.homeTeam.shortName || m.homeTeam.name} ${m.score.fullTime.home} - ${m.score.fullTime.away} ${m.awayTeam.shortName || m.awayTeam.name}\n`;
  });
  return response;
};

const staticResponses = {
  offside: `📏 **The Offside Rule**\n\nA player is offside if they are nearer to the opponent's goal line than both the ball and the second-to-last defender when the ball is played to them.\n\nKey points:\n• Only applies in the opponent's half\n• Applies at the moment the ball is played, not received\n• Being level with the last defender is NOT offside\n• VAR checks the exact moment of the pass`,

  var: `📺 **How VAR Works**\n\nVAR (Video Assistant Referee) reviews:\n• Goals and offenses before goals\n• Penalty decisions\n• Direct red card incidents\n• Mistaken identity\n\nThe VAR team watches replays and alerts the referee only for clear and obvious errors.`,

  champions_league: `🏆 **Champions League Winners (Most Titles)**\n\n1. Real Madrid — 15 titles\n2. AC Milan — 7 titles\n3. Liverpool — 6 titles\n4. Bayern Munich — 6 titles\n5. Barcelona — 5 titles\n6. Ajax — 4 titles`,

  tiki_taka: `🔄 **Tiki-Taka Football**\n\nTiki-taka is a style of play based on:\n• Short, quick passing\n• High possession\n• Pressing immediately after losing the ball\n• Movement and positioning\n\nPioneered by Johan Cruyff at Barcelona and perfected by Pep Guardiola's Barca (2008-2012) with Xavi, Iniesta and Messi.`,

  messi_ronaldo: `⭐ **Messi vs Ronaldo**\n\nLionel Messi:\n• 8x Ballon d'Or\n• 2022 World Cup winner\n• Champions League: 4 titles\n• Known for dribbling and vision\n\nCristiano Ronaldo:\n• 5x Ballon d'Or\n• Champions League: 5 titles\n• Known for athleticism and goals\n\nBoth are considered the greatest of their generation — the debate continues! 🐐`,

  goalkeeper: `🧤 **World Class Goalkeepers**\n\nCurrently considered among the best:\n• Alisson Becker (Liverpool)\n• Thibaut Courtois (Real Madrid)\n• Manuel Neuer (Bayern Munich)\n• Ederson (Manchester City)\n• Mike Maignan (AC Milan)\n\nEach brings different strengths to the position.`,

  striker: `⚽ **Best Strikers Right Now**\n\nTop strikers in world football:\n• Erling Haaland (Man City) — prolific goal scorer\n• Kylian Mbappe (Real Madrid) — pace and finishing\n• Harry Kane (Bayern) — complete centre forward\n• Victor Osimhen — powerful and clinical\n• Lautaro Martinez — technical and smart`,

  formation: `📋 **Common Football Formations**\n\n• **4-3-3** — Attacking wide play\n• **4-4-2** — Classic balanced shape\n• **4-2-3-1** — Defensive midfield protection\n• **3-5-2** — Wing-back dominance\n• **5-3-2** — Defensive solidity\n\nThe best formation depends on the players available and the opponent.`,

  hello: `👋 Hello! I am your Football AI Assistant.\n\nI can help you with:\n• 📊 Live standings — "Show Premier League standings"\n• ⚽ Top scorers — "Who is top scorer in La Liga?"\n• 🏆 Recent results — "Show recent Bundesliga results"\n• 📚 Football knowledge — Ask me anything!\n\nWhat would you like to know?`,
};

const getStaticResponse = (message) => {
  const lower = message.toLowerCase();
  if (lower.includes('offside')) return staticResponses.offside;
  if (lower.includes('var')) return staticResponses.var;
  if (lower.includes('champions league') && (lower.includes('win') || lower.includes('title') || lower.includes('most'))) return staticResponses.champions_league;
  if (lower.includes('tiki')) return staticResponses.tiki_taka;
  if (lower.includes('messi') && lower.includes('ronaldo')) return staticResponses.messi_ronaldo;
  if (lower.includes('goalkeeper') || lower.includes('keeper')) return staticResponses.goalkeeper;
  if (lower.includes('striker') || lower.includes('forward')) return staticResponses.striker;
  if (lower.includes('formation')) return staticResponses.formation;
  if (lower.match(/^(hi|hello|hey|what can you do|help)/)) return staticResponses.hello;
  return null;
};

// TO SWITCH TO CLAUDE: set USE_CLAUDE = true and add REACT_APP_ANTHROPIC_API_KEY to .env
const USE_CLAUDE = false;

const sendToClaude = async (message) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.REACT_APP_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: 'You are a football expert AI assistant. Answer questions about football stats, players, tactics and history.',
      messages: [{ role: 'user', content: message }]
    })
  });
  const data = await response.json();
  return data.content[0].text;
};

export const sendMessage = async (message) => {
  // If Claude is enabled use it
  if (USE_CLAUDE) return sendToClaude(message);

  const lower = message.toLowerCase();

  // Check static responses first
  const staticResponse = getStaticResponse(message);
  if (staticResponse) return staticResponse;

  const leagueCode = detectLeague(message);
  const leagueName = LEAGUE_NAMES[leagueCode];

  // Standings
  if (lower.includes('standing') || lower.includes('table') || lower.includes('top of') || lower.includes('league position')) {
    try {
      const res = await api.get(`/competitions/${leagueCode}/standings`);
      return formatStandings(res.data.standings[0].table, leagueName);
    } catch {
      return '❌ Could not fetch standings right now. Try again in a moment.';
    }
  }

  // Top scorers
  if (lower.includes('top scorer') || lower.includes('most goals') || lower.includes('golden boot') || lower.includes('who scored')) {
    try {
      const res = await api.get(`/competitions/${leagueCode}/scorers?limit=5`);
      return formatScorers(res.data.scorers, leagueName);
    } catch {
      return '❌ Could not fetch top scorers right now. Try again in a moment.';
    }
  }

  // Recent results
  if (lower.includes('result') || lower.includes('recent match') || lower.includes('latest match') || lower.includes('score')) {
    try {
      const res = await api.get(`/competitions/${leagueCode}/matches`);
      return formatMatches(res.data.matches, leagueName);
    } catch {
      return '❌ Could not fetch recent matches right now. Try again in a moment.';
    }
  }

  // Default response
  return `🤔 I can help you with:\n\n• 📊 **Standings** — "Show Premier League table"\n• ⚽ **Top Scorers** — "Who is top scorer in La Liga?"\n• 🏆 **Results** — "Show recent Bundesliga results"\n• 📚 **Football knowledge** — Ask about rules, tactics, players\n\nTry one of the quick questions above or ask me something specific!`;
};