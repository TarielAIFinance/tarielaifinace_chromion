import { STORAGE_KEYS } from './api/config';

export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function getStoredSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.SESSION_ID);
}

export function storeSessionId(sessionId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
}

export function getOrCreateSessionId(): string {
  const existingSessionId = getStoredSessionId();
  if (existingSessionId) return existingSessionId;

  const newSessionId = generateSessionId();
  storeSessionId(newSessionId);
  return newSessionId;
} 