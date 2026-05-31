export const getFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem('footballapp_favorites')) || {
      teams: [],
      leagues: [],
      players: []
    };
  } catch {
    return { teams: [], leagues: [], players: [] };
  }
};

export const saveFavorites = (favorites) => {
  localStorage.setItem('footballapp_favorites', JSON.stringify(favorites));
};

export const toggleFavoriteTeam = (team) => {
  const favs = getFavorites();
  const exists = favs.teams.find(t => t.id === team.id);
  if (exists) {
    favs.teams = favs.teams.filter(t => t.id !== team.id);
  } else {
    favs.teams.push({ id: team.id, name: team.name, crest: team.crest });
  }
  saveFavorites(favs);
  return favs;
};

export const toggleFavoriteLeague = (code, name, flag) => {
  const favs = getFavorites();
  const exists = favs.leagues.find(l => l.code === code);
  if (exists) {
    favs.leagues = favs.leagues.filter(l => l.code !== code);
  } else {
    favs.leagues.push({ code, name, flag });
  }
  saveFavorites(favs);
  return favs;
};

export const toggleFavoritePlayer = (player) => {
  const favs = getFavorites();
  const exists = favs.players.find(p => p.id === player.id);
  if (exists) {
    favs.players = favs.players.filter(p => p.id !== player.id);
  } else {
    favs.players.push({ id: player.id, name: player.name, nationality: player.nationality });
  }
  saveFavorites(favs);
  return favs;
};

export const isFavoriteTeam = (teamId) => {
  return getFavorites().teams.some(t => t.id === teamId);
};

export const isFavoriteLeague = (code) => {
  return getFavorites().leagues.some(l => l.code === code);
};

export const isFavoritePlayer = (playerId) => {
  return getFavorites().players.some(p => p.id === playerId);
};