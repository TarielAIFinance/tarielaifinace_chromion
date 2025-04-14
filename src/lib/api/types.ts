// API Contract Types
export interface ApiRequestMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ApiRequestMessage[];
  use_tools: boolean;
}

export interface ChatResponse {
  response: string;
}

// Client-side Types
export interface ClientMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
  id?: string;
}

export interface SystemConfig {
  identity: string;
  capabilities: string[];
  constraints: string[];
}

export interface ChatContext {
  messages: ClientMessage[];
  systemConfig: SystemConfig;
  lastUserMessage?: string; // Track last user message for context validation
}

export interface ApiError {
  message: string;
  status?: number;
}

// Message role type
export type MessageRole = 'system' | 'user' | 'assistant'; 