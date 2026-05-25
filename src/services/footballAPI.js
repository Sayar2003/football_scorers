import axios from 'axios';

const api = axios.create({
  baseURL: '/v4',
  headers: {
    'X-Auth-Token': process.env.REACT_APP_FOOTBALL_API_KEY
  }
});

export const LEAGUES = {
  PL:  { name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  PD:  { name: 'La Liga',        flag: '🇪🇸' },
  BL1: { name: 'Bundesliga',     flag: '🇩🇪' },
  SA:  { name: 'Serie A',        flag: '🇮🇹' },
  FL1: { name: 'Ligue 1',        flag: '🇫🇷' },
};

export const getStandings = (leagueCode) =>
  api.get(`/competitions/${leagueCode}/standings`);