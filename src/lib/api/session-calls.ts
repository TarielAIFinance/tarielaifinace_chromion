// Local storage keys
const STORAGE_KEYS = {
  CALLS_COUNT: 'tariel_calls_count',
  SESSION_CALLS: 'tariel_session_calls'
};

const MAX_CALLS = 30;

// Helper to check if we're on the client side
const isClient = typeof window !== 'undefined';

// Store session calls in memory
const sessionCalls: { [key: string]: number } = {};
const listeners: ((sessionId: string, calls: number) => void)[] = [];

// Initialize or get calls count from storage
function getCallsCount(sessionId: string): number {
  if (!isClient) return 0;
  
  const storageKey = `${STORAGE_KEYS.CALLS_COUNT}_${sessionId}`;
  const stored = localStorage.getItem(storageKey);
  return stored ? parseInt(stored, 10) : 0;
}

export function getCurrentSessionCalls(sessionId: string): number {
  return sessionCalls[sessionId] || 0;
}

export function incrementSessionCalls(sessionId: string): void {
  sessionCalls[sessionId] = (sessionCalls[sessionId] || 0) + 1;
  notifyListeners(sessionId, sessionCalls[sessionId]);
}

export function resetSessionCalls(sessionId: string): void {
  sessionCalls[sessionId] = 0;
  notifyListeners(sessionId, 0);
}

export function addSessionUpdateListener(
  listener: (sessionId: string, calls: number) => void
): void {
  listeners.push(listener);
}

export function removeSessionUpdateListener(
  listener: (sessionId: string, calls: number) => void
): void {
  const index = listeners.indexOf(listener);
  if (index > -1) {
    listeners.splice(index, 1);
  }
}

function notifyListeners(sessionId: string, calls: number): void {
  listeners.forEach(listener => listener(sessionId, calls));
}

export function getRemainingCalls(sessionId: string): number {
  const currentCalls = getCallsCount(sessionId);
  return MAX_CALLS - currentCalls;
} 