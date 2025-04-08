# DeFAI App Integration Guide

## Overview
This document outlines the integration of smart contract functionality with the Tariel AI chat interface. The goal is to enable users to perform DeFi operations through natural language interactions while receiving AI-powered analysis and guidance.

## Architecture

### Directory Structure
```
src/
├── deFAIApp/
│   ├── contracts/
│   │   ├── types.ts
│   │   ├── ContractService.ts
│   │   └── config.ts
│   ├── ai/
│   │   ├── AIContractBridge.ts
│   │   └── intentDetection.ts
│   ├── components/
│   │   ├── TransactionModal.tsx
│   │   └── ContractInteraction.tsx
│   └── hooks/
│       ├── useContract.ts
│       └── useTransaction.ts
```

### Core Components

1. **Contract Service Layer**
```typescript
// deFAIApp/contracts/ContractService.ts
export class ContractService {
  constructor(
    private provider: Provider,
    private contractAddress: string,
    private abi: ContractABI
  ) {}

  async executeMint(amount: number): Promise<TransactionResult>;
  async estimateGas(params: TransactionParams): Promise<BigNumber>;
  async validateTransaction(params: TransactionParams): Promise<ValidationResult>;
}
```

2. **AI-Contract Bridge**
```typescript
// deFAIApp/ai/AIContractBridge.ts
export class AIContractBridge {
  async processUserInput(input: string): Promise<UIAction> {
    const intent = await this.detectContractIntent(input);
    return intent ? this.prepareContractAction(intent) : this.getAIResponse(input);
  }
}
```

3. **Transaction UI Components**
```typescript
// deFAIApp/components/TransactionModal.tsx
export const TransactionModal: React.FC<{
  isOpen: boolean;
  details: TransactionDetails;
  onConfirm: (details: TransactionDetails) => Promise<void>;
}>;
```

## Implementation Steps

### Phase 1: Basic Setup (Can be done without API)
1. Set up directory structure
2. Implement mock ContractService
3. Create basic UI components
4. Add Wagmi/Viem configuration

### Phase 2: Contract Integration
1. Add ABI configuration
2. Implement real contract interactions
3. Add transaction validation
4. Set up gas estimation

### Phase 3: AI Integration
1. Implement intent detection
2. Create AI-Contract bridge
3. Add response processing
4. Integrate with chat interface

### Phase 4: UI/UX Enhancement
1. Add transaction modals
2. Implement loading states
3. Add error handling
4. Enhance user feedback

## Testing Without API

Yes, we can test most functionality without the AI API:

1. **Mockable Components:**
   - Contract interactions (using local hardhat/ganache)
   - Transaction flow
   - UI components
   - Wallet connection

2. **Test Implementation:**
```typescript
// Mock AI service for testing
class MockAIService implements AIService {
  async detectContractIntent(input: string): Promise<ContractIntent | null> {
    // Simple keyword detection
    if (input.includes('mint')) {
      return {
        action: 'mint',
        amount: 100, // Default amount
        token: 'USDai'
      };
    }
    return null;
  }
}
```

3. **Development Flow:**
   - Use mock AI responses
   - Test contract interactions independently
   - Validate UI flow with hardcoded responses
   - Test wallet integration

## Example Usage

```typescript
// Example implementation in chat component
const handleChatMessage = async (message: string) => {
  // 1. Process with bridge
  const result = await bridge.processUserInput(message);

  // 2. Handle different actions
  switch (result.type) {
    case 'contract_action':
      await handleContractAction(result.params);
      break;
    case 'ai_response':
      displayAIResponse(result.message);
      break;
  }
};
```

## Development Guidelines

1. **Separation of Concerns**
   - Keep contract logic isolated
   - Maintain clear boundaries between AI and DeFi functionality
   - Use typed interfaces for all interactions

2. **Error Handling**
   - Implement comprehensive error catching
   - Provide user-friendly error messages
   - Handle network and contract errors gracefully

3. **Testing Strategy**
   - Unit tests for contract interactions
   - Integration tests for user flows
   - Mock AI responses for development
   - E2E tests for critical paths

## Security Considerations

1. **Transaction Safety**
   - Always require explicit user confirmation
   - Show clear transaction details
   - Implement amount validation
   - Display gas estimates

2. **Error Prevention**
   - Validate inputs before sending
   - Check network status
   - Verify contract state

## Next Steps

1. **Immediate Actions:**
   - Set up basic folder structure
   - Implement mock contract service
   - Create basic UI components
   - Add Wagmi configuration

2. **When ABI is Available:**
   - Add contract configuration
   - Implement real contract methods
   - Test with test network

3. **When API is Ready:**
   - Integrate real AI responses
   - Enhance intent detection
   - Add advanced features 