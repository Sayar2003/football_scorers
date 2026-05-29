export const generateMatchSummary = (match) => {
  if (!match || match.status !== 'FINISHED') {
    return 'Match summary not available — match has not finished yet.';
  }

  const home = match.homeTeam.shortName || match.homeTeam.name;
  const away = match.awayTeam.shortName || match.awayTeam.name;
  const homeScore = match.score.fullTime.home;
  const awayScore = match.score.fullTime.away;
  const competition = match.competition.name;
  const date = new Date(match.utcDate).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const isHomeWin = homeScore > awayScore;
  const isAwayWin = awayScore > homeScore;
  const isDraw = homeScore === awayScore;
  const winner = isHomeWin ? home : isAwayWin ? away : null;
  const loser = isHomeWin ? away : isAwayWin ? home : null;
  const goalDiff = Math.abs(homeScore - awayScore);
  const totalGoals = homeScore + awayScore;

  // Opening line
  const openings = isHomeWin ? [
    `${home} secured a ${homeScore}-${awayScore} victory over ${away}`,
    `${home} claimed all three points with a ${homeScore}-${awayScore} win against ${away}`,
    `A dominant ${home} side defeated ${away} ${homeScore}-${awayScore}`,
  ] : isAwayWin ? [
    `${away} picked up a crucial away win, beating ${home} ${homeScore}-${awayScore}`,
    `${away} left with all three points after a ${homeScore}-${awayScore} victory at ${home}`,
    `${away} stunned ${home} with a ${homeScore}-${awayScore} away victory`,
  ] : [
    `${home} and ${away} shared the spoils in a ${homeScore}-${awayScore} draw`,
    `A ${homeScore}-${awayScore} stalemate saw both ${home} and ${away} take a point each`,
    `Honours were even as ${home} drew ${homeScore}-${awayScore} with ${away}`,
  ];

  const opening = openings[Math.floor(Math.random() * openings.length)];

  // Result description
  let resultDesc = '';
  if (goalDiff >= 3) {
    resultDesc = `It was a comprehensive victory for ${winner}, who were dominant throughout the ${competition} encounter.`;
  } else if (goalDiff === 2) {
    resultDesc = `${winner} were the better side on the day, running out comfortable winners in the ${competition} clash.`;
  } else if (goalDiff === 1 && !isDraw) {
    resultDesc = `It was a closely contested affair, with ${winner} edging past ${loser} in what was a tight ${competition} encounter.`;
  } else if (isDraw && totalGoals >= 3) {
    resultDesc = `It was an entertaining affair in the ${competition}, with both sides unable to be separated despite plenty of goals.`;
  } else if (isDraw) {
    resultDesc = `Both sides will feel they could have done more in this ${competition} fixture, with neither able to find a winner.`;
  }

  // Goal description
  let goalDesc = '';
  if (match.goals && match.goals.length > 0) {
    const homeGoals = match.goals.filter(g => g.team.id === match.homeTeam.id);
    const awayGoals = match.goals.filter(g => g.team.id === match.awayTeam.id);

    const homeScorers = homeGoals.map(g => `${g.scorer?.name} (${g.minute}')`).join(', ');
    const awayScorers = awayGoals.map(g => `${g.scorer?.name} (${g.minute}')`).join(', ');

    if (homeScorers && awayScorers) {
      goalDesc = `${home} got on the scoresheet through ${homeScorers}, while ${away} replied with goals from ${awayScorers}.`;
    } else if (homeScorers) {
      goalDesc = `${home} found the net through ${homeScorers}.`;
    } else if (awayScorers) {
      goalDesc = `${away} scored through ${awayScorers}.`;
    }
  } else {
    goalDesc = totalGoals === 0
      ? 'Neither side could find the back of the net throughout the match.'
      : `The goals were shared between both sides in an entertaining contest.`;
  }

  // Assist description
  let assistDesc = '';
  if (match.goals && match.goals.length > 0) {
    const withAssists = match.goals.filter(g => g.assist);
    if (withAssists.length > 0) {
      const assistMentions = withAssists.slice(0, 2).map(g => `${g.assist.name} assisted ${g.scorer?.name}`).join(', and ');
      assistDesc = `In terms of creativity, ${assistMentions}.`;
    }
  }

  // Closing line
  const closings = isDraw ? [
    `The point leaves both sides with work to do in ${competition}.`,
    `A share of the spoils was perhaps a fair result given the balance of play.`,
    `Both managers will have mixed feelings after this ${competition} stalemate.`,
  ] : [
    `A deserved ${goalDiff >= 2 ? 'comfortable' : 'narrow'} victory for ${winner} in ${competition}.`,
    `${winner} will be delighted with the three points from this ${competition} clash.`,
    `A vital ${competition} win for ${winner} as they continue their campaign.`,
  ];

  const closing = closings[Math.floor(Math.random() * closings.length)];

  // Build full summary
  const parts = [
    `📅 ${date} | 🏆 ${competition}\n`,
    `${opening} on ${date}.`,
    resultDesc,
    goalDesc,
    assistDesc,
    closing,
  ].filter(Boolean);

  return parts.join('\n\n');
};

export const generateShortSummary = (match) => {
  if (!match || match.status !== 'FINISHED') return '';

  const home = match.homeTeam.shortName || match.homeTeam.name;
  const away = match.awayTeam.shortName || match.awayTeam.name;
  const homeScore = match.score.fullTime.home;
  const awayScore = match.score.fullTime.away;

  const result = homeScore > awayScore
    ? `${home} win ${homeScore}-${awayScore}`
    : awayScore > homeScore
    ? `${away} win ${homeScore}-${awayScore}`
    : `${homeScore}-${awayScore} draw`;

  const scorers = match.goals?.slice(0, 3).map(g => g.scorer?.name).filter(Boolean).join(', ');

  return `${result}${scorers ? ` | Goals: ${scorers}` : ''}`;
};