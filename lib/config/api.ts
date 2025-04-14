export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  ENDPOINTS: {
    USERS: '/users',
    AUTH: '/auth',
    EVENTS: '/events',
    PARTICIPATIONS: '/participations'
  }
} as const;

export const getApiUrl = (endpoint: keyof typeof API_CONFIG.ENDPOINTS) => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS[endpoint]}`;
}; 