import { API_CONFIG } from './config';
import { ChatRequest, ChatResponse, ChatContext, ClientMessage, ApiRequestMessage, SystemConfig } from './types';

// Re-export types needed by components
export type { ChatContext, ClientMessage, SystemConfig };

// Default system configuration (minimal version)
export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  identity: "",
  capabilities: [],
  constraints: []
};

export async function sendChatMessage(message: string, context?: ChatContext): Promise<{ response: string; context: ChatContext }> {
  try {
    const endpoint = API_CONFIG.BASE_URL;
    
    // Initialize or update context with required systemConfig
    const currentContext: ChatContext = context || {
      messages: [],
      systemConfig: DEFAULT_SYSTEM_CONFIG,
      lastUserMessage: undefined
    };

    // Add new user message
    const userMessage: ClientMessage = {
      role: 'user',
      content: message,
      timestamp: Date.now(),
      id: `msg_${Date.now()}`
    };
    
    // Prepare messages array - API handles system prompt internally
    const apiMessages = [
      ...currentContext.messages,
      userMessage
    ].map(({ role, content }) => ({ role, content }));

    // Make API request
    const request: ChatRequest = {
      messages: apiMessages,
      use_tools: false
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new ChatApiError(
        'Failed to get response from chat service',
        response.status
      );
    }

    const data = await response.json();
    
    // Add both messages to context
    currentContext.messages.push(userMessage);
    currentContext.messages.push({
      role: 'assistant',
      content: data.response,
      timestamp: Date.now(),
      id: `msg_${Date.now()}`
    });

    return {
      response: data.response,
      context: currentContext
    };

  } catch (error) {
    console.error('Chat API Error:', error);
    throw error instanceof ChatApiError ? error : new ChatApiError(
      'An unexpected error occurred',
      undefined,
      { originalError: error }
    );
  }
}

export class ChatApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ChatApiError';
  }
} 