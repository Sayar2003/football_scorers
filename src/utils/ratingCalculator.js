// Base rating for every player who played
const BASE_RATING = 6.0;

export const calculatePlayerRating = (player, goals, isWin, isDraw, isLoss, isGoalkeeper) => {
  let rating = BASE_RATING;

  // Goals scored
  if (goals?.scorer?.id === player.id) rating += 1.5;

  // Win/loss adjustment
  if (isWin) rating += 0.5;
  if (isDraw) rating += 0.0;
  if (isLoss) rating -= 0.5;

  // Goalkeeper bonus for clean sheet
  if (isGoalkeeper && isWin) rating += 1.0;

  // Cap between 4.0 and 10.0
  return Math.min(10.0, Math.max(4.0, rating)).toFixed(1);
};

export const calculateSeasonRating = (goals, assists, matchesPlayed, wins) => {
  if (!matchesPlayed) return 'N/A';
  let rating = BASE_RATING;
  rating += (goals / matchesPlayed) * 2.0;
  rating += (assists / matchesPlayed) * 1.0;
  rating += (wins / matchesPlayed) * 0.5;
  return Math.min(10.0, Math.max(4.0, rating)).toFixed(1);
};

export const getRatingColor = (rating) => {
  const r = parseFloat(rating);
  if (r >= 8.0) return '#16a34a';
  if (r >= 7.0) return '#84cc16';
  if (r >= 6.0) return '#f59e0b';
  if (r >= 5.0) return '#f97316';
  return '#ef4444';
};

export const getRatingLabel = (rating) => {
  const r = parseFloat(rating);
  if (r >= 9.0) return 'World Class';
  if (r >= 8.0) return 'Excellent';
  if (r >= 7.0) return 'Good';
  if (r >= 6.0) return 'Average';
  if (r >= 5.0) return 'Poor';
  return 'Bad';
};