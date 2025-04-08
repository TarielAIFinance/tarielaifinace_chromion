import { API_CONFIG } from './config';
import type { ChatRequest, ChatResponse, ApiError } from './types';

export class ChatApiError extends Error {
  constructor(public error: ApiError) {
    super(error.message);
    this.name = 'ChatApiError';
  }
}

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout = 10000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function sendChatMessage(userMessageContent: string): Promise<ChatResponse> {
  // Construct the new request payload
  const requestPayload: ChatRequest = {
    messages: [
      { role: 'user', content: userMessageContent }
    ]
  };

  console.log('Sending request to:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT}`);
  console.log('Request payload:', requestPayload);

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // Send the new payload structure
      body: JSON.stringify(requestPayload)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      // Attempt to get more detailed error message from response body
      let errorMessage = `Server error: ${response.status}`;
      try {
        const errorBody = await response.json(); // Try parsing JSON error
        errorMessage = errorBody.detail || errorBody.message || errorMessage;
      } catch (e) {
        // If JSON parsing fails, try reading as text
        try {
          errorMessage = await response.text();
        } catch (textError) {
          // Keep the original status code message if text also fails
        }
      }
      console.error('Server error response detail:', errorMessage);
      
      throw new ChatApiError({
        message: errorMessage,
        status: response.status
      });
    }

    // Assuming response structure { response: string } based on previous types.ts update
    const data: ChatResponse = await response.json(); 
    console.log('Received response:', data);
    return data;

  } catch (error) {
    // Log the raw error first
    console.error('Raw Chat API Error:', error);

    // Handle known ChatApiError
    if (error instanceof ChatApiError) {
      throw error; 
    }

    // Handle network errors specifically
    if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ChatApiError({
            message: 'Network error or CORS issue. Please check connection and server CORS configuration.',
            status: 0 // Indicate network-level issue
        });
    }

    // Catch-all for other unexpected errors
    throw new ChatApiError({
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      status: -1 // Indicate unknown client-side error
    });
  }
} 