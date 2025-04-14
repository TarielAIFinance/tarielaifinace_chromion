# Chat API Integration

## Overview
This implementation provides a chat interface between our React frontend and the OpenRouter-based AI backend. The key focus is on maintaining proper message history and context management while ensuring consistent AI responses.

## Current Implementation

### Core Components
- `chat.ts`: Main chat functionality and API communication
- `types.ts`: TypeScript interfaces and message types
- `config.ts`: API configuration and endpoints
- `session.ts`: Session management and call tracking

### Message Structure
```typescript
interface ClientMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  id?: string;
}
```

### Session Management
```typescript
interface ChatContext {
  messages: ClientMessage[];
}
```

## Known Issues & Solutions

### 1. Context Management
**Issue:** The AI sometimes fails to maintain proper conversation context
**Solution:** 
- Send complete message history with each request
- Maintain proper message role tagging
- Keep conversation history in frontend state

### 2. Language Consistency
**Issue:** AI responses switch between English and German
**Solution:**
- Add language preference to chat context
- Maintain consistent language throughout session

### 3. Call Limits
**Issue:** Agent calls exceed 30/30 limit
**Solution:**
- Implement strict call counting
- Add proper session management
- Clear warning when approaching limits

## API Integration

### Request Format
```typescript
{
  "messages": [
    { "role": "user", "content": "Hello" }
    // ... previous messages
  ],
  "use_tools": false
}
```

### Response Format
```typescript
{
  "response": string;  // AI's response
}
```

## Implementation Guidelines

### Frontend Responsibilities
- Maintain chat history state
- Track session calls (max 30)
- Handle language consistency
- Manage error states

### Backend (API) Responsibilities
- Process messages through OpenRouter
- Maintain session state
- Handle rate limiting
- Process responses

## Usage Example

```typescript
// Basic chat message
const { response, context } = await sendChatMessage(
  message,
  existingContext
);

// Error handling
try {
  const result = await sendChatMessage(message, context);
} catch (error) {
  if (error instanceof ChatApiError) {
    // Handle API errors
  }
}
```

## Session Management

### Call Tracking
```typescript
// Check remaining calls
const remaining = getRemainingCalls(sessionId);
if (remaining <= 0) {
  throw new ChatApiError('Session limit reached');
}
```

### Session Cleanup
```typescript
// Reset session
clearSession(sessionId);
```

## Error Handling

### Common Errors
1. Session Limits Exceeded
2. API Connection Issues
3. Context Management Failures

### Error Types
```typescript
class ChatApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ChatApiError';
  }
}
```

## Testing

Key test scenarios:
- Message history maintenance
- Session call limits
- Language consistency
- Error handling
- Context preservation

## Future Improvements

1. **Context Management**
   - Implement better history tracking
   - Add conversation summarization
   - Improve context retention

2. **Session Management**
   - Add session persistence
   - Implement call quotas
   - Add session recovery

3. **UI/UX**
   - Add language selection
   - Improve error messages
   - Add session status indicators

## Support
For issues or questions:
1. Check documentation
2. Review error logs
3. Contact development team 