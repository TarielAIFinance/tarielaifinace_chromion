import { v4 as uuidv4 } from 'uuid';
import { STORAGE_KEYS } from './config';

const SESSION_ID_KEY = 'tariel_session_id';

// Helper to check if we're on the client side
const isClient = typeof window !== 'undefined';

// Helper to generate a new session ID
function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function getOrCreateSessionId(forceNew: boolean = false): string {
  if (!isClient) return '';

  // If force new is true, generate a new ID regardless
  if (forceNew) {
    const newId = generateSessionId();
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, newId);
    return newId;
  }

  // Otherwise, get existing or create new
  const existingId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
  if (existingId) {
    return existingId;
  }

  const newId = generateSessionId();
  localStorage.setItem(STORAGE_KEYS.SESSION_ID, newId);
  return newId;
}

export function getCurrentSessionId(): string | null {
  if (!isClient) {
    return null; // Return null for SSR
  }
  return localStorage.getItem(SESSION_ID_KEY);
}

export function clearSession(): void {
  if (!isClient) return;
  localStorage.removeItem(SESSION_ID_KEY);
}

// Event system for session updates
type SessionListener = (sessionId: string) => void;
const sessionListeners: SessionListener[] = [];

export function addSessionListener(listener: SessionListener) {
  sessionListeners.push(listener);
}

export function removeSessionListener(listener: SessionListener) {
  const index = sessionListeners.indexOf(listener);
  if (index > -1) {
    sessionListeners.splice(index, 1);
  }
}

function notifySessionListeners(sessionId: string) {
  sessionListeners.forEach(listener => listener(sessionId));
}

// Create a new session
export function createNewSession(): string {
  if (!isClient) {
    return ''; // Return empty string for SSR
  }
  const sessionId = uuidv4();
  localStorage.setItem(SESSION_ID_KEY, sessionId);
  notifySessionListeners(sessionId);
  return sessionId;
}

// Simple in-memory call tracking
const sessionCalls: { [key: string]: number } = {};

export function incrementSessionCalls(sessionId: string): boolean {
  if (!sessionCalls[sessionId]) {
    sessionCalls[sessionId] = 0;
  }
  
  if (sessionCalls[sessionId] >= 30) {
    return false;
  }
  
  sessionCalls[sessionId]++;
  notifyListeners(sessionId);
  return true;
}

export function getRemainingCalls(sessionId: string): number {
  return 30 - (sessionCalls[sessionId] || 0);
}

export function getCurrentSessionCalls(): number {
  const sessionId = getOrCreateSessionId();
  return sessionCalls[sessionId] || 0;
}

// Event system for session updates
type SessionUpdateListener = (sessionId: string, calls: number) => void;
const listeners: SessionUpdateListener[] = [];

export function addSessionUpdateListener(listener: SessionUpdateListener) {
  listeners.push(listener);
}

export function removeSessionUpdateListener(listener: SessionUpdateListener) {
  const index = listeners.indexOf(listener);
  if (index > -1) {
    listeners.splice(index, 1);
  }
}

function notifyListeners(sessionId: string) {
  const calls = sessionCalls[sessionId] || 0;
  listeners.forEach(listener => listener(sessionId, calls));
} 