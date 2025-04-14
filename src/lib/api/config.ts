export const API_CONFIG = {
  BASE_URL: 'https://yieldmind.guru/chat',
  TIMEOUT: 15000,
  RETRY: {
    MAX_ATTEMPTS: 2,
    INITIAL_DELAY: 1500,
    MAX_DELAY: 5000,
  },
  // Development settings
  DEV: {
    ALLOW_INSECURE: process.env.NODE_ENV === 'development',
    CORS_CREDENTIALS: true
  }
} as const;

export const STORAGE_KEYS = {
  SESSION_ID: 'tariel_session_id'
} as const; 