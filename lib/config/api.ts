export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  ENDPOINTS: {
    USERS: '/users',
    EVENTS: '/events',
    PARTICIPATIONS: '/participations',
    TRANSACTIONS: '/transactions',
    USER_EVENTS: (userId: string) => `/users/${userId}/events`,
    USER_BALANCE: (userId: string) => `/users/${userId}/balance`,
    USER_ACHIEVEMENTS: (userId: string) => `/users/${userId}/achievements`,
    USER_PROFILE: (userId: string) => `/users/${userId}`,
    EVENT_DETAILS: (eventId: string) => `/events/${eventId}`,
    EVENT_STATUS: (eventId: string) => `/events/${eventId}/status`,
    EVENT_CONDITIONS: (eventId: string) => `/events/${eventId}/conditions`,
    USER_PARTICIPATION: (userId: string, eventId: string) => `/participations/user/${userId}/event/${eventId}`,
  }
} as const;

type EndpointKey = keyof typeof API_CONFIG.ENDPOINTS;
type EndpointFunction = (...args: string[]) => string;

export const getApiUrl = (endpoint: EndpointKey, ...params: string[]): string => {
  const path = API_CONFIG.ENDPOINTS[endpoint];
  if (typeof path === 'function') {
    return `${API_CONFIG.BASE_URL}${(path as EndpointFunction)(...params)}`;
  }
  return `${API_CONFIG.BASE_URL}${path}`;
}; 