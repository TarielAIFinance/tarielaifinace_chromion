export const API_CONFIG = {
  BASE_URL: 'http://95.216.197.123:8000',
  ENDPOINTS: {
    CHAT: '/chat',
  },
  TIMEOUT: 15000,
  RETRY: {
    MAX_ATTEMPTS: 2,
    INITIAL_DELAY: 1500,
    MAX_DELAY: 5000,
  }
} as const;

export const STORAGE_KEYS = {
  SESSION_ID: 'tariel_session_id'
} as const; 