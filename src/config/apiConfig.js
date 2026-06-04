const isProduction = process.env.NODE_ENV === 'production';

export const API_BASE_URL = isProduction
  ? process.env.REACT_APP_BACKEND_URL
  : '/v4';