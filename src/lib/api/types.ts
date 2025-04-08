export interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system'; // Expanded roles potentially useful later
    content: string;
  }>;
}

export interface ChatResponse {
  // Assuming the response still contains a main text field.
  // If the actual field name is different (e.g., 'result', 'completion'), adjust here.
  response: string; 
  // session_id likely removed, keeping it simple based on available info
}

export interface ApiError {
  message: string;
  status: number;
} 