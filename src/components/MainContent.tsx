'use client'; // Mark as Client Component for potential hooks in AIInput

import React, { useState, useRef, useEffect, ReactElement, useCallback } from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/autoScroll/switch";
import { AIInputWithLoading } from "@/components/ui/ai-input-with-loading";
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Loader } from "@/components/ui/thinkingLoader/loader";
import { sendChatMessage, ChatContext, ChatApiError } from '@/lib/api/chat';
import { useTextStream } from "@/components/ui/responseStream/response-stream";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { MessageSquare, TrendingUp, Sparkles, BarChart3, ActivitySquare } from 'lucide-react';
import { ChatTable, parseContent } from '@/components/ui/tableIntegration';
import { SidebarSessionDisplay } from '@/components/ui/sidebar/session-display';
import { getOrCreateSessionId } from '@/lib/api/session';
import { getRemainingCalls, incrementSessionCalls } from '@/lib/api/session-calls';
import { DEFAULT_SYSTEM_CONFIG } from '@/lib/api/chat';
import { Dock } from "@/components/ui/dock-two";

// Define message structure
interface ChatMessage {
  id: number;
  type: 'user' | 'ai' | 'thinking';  // Add 'thinking' type
  text: string;
}

// Define custom events interfaces
interface SessionDeletedEvent extends CustomEvent {
  detail: string; // session ID
}

interface SessionCreatedEvent extends CustomEvent {
  detail: string; // session ID
}

// Text formatting components
const TextBlock = {
  heading1: (text: string, key?: string): ReactElement => (
    <div key={key} className="text-2xl font-semibold mb-6 text-Tariel-text-light">{text}</div>
  ),
  heading2: (text: string, key?: string): ReactElement => (
    <div key={key} className="text-xl font-semibold mb-2 text-Tariel-text-light">{text}</div>
  ),
  paragraph: (text: string, key?: string): ReactElement => (
    <div key={key} className="text-base leading-relaxed mb-1 text-Tariel-text-light">{text}</div>
  ),
  listItem: (text: string, key?: string): ReactElement => (
    <div key={key} className="flex items-start mb-2">
      <span className="mr-2 text-Tariel-text-light">•</span>
      <div className="text-base leading-relaxed text-Tariel-text-light">{text}</div>
    </div>
  ),
  numberedItem: (number: number, text: string, key?: string): ReactElement => (
    <div key={key} className="flex items-start mb-2">
      <span className="mr-2 min-w-[20px] text-Tariel-text-light">{number}.</span>
      <div className="text-base leading-relaxed text-Tariel-text-light">{text}</div>
    </div>
  )
};

// Custom component to combine streaming with formatted text
interface StreamingMarkdownProps {
  text: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  shouldAutoScroll: boolean;
}

const StreamingMarkdown: React.FC<StreamingMarkdownProps> = ({
  text,
  containerRef,
  shouldAutoScroll
}) => {
  const { displayedText } = useTextStream({
    textStream: text,
    speed: 60,
    mode: "typewriter",
    onComplete: () => {
      if (containerRef.current && shouldAutoScroll) {
        const container = containerRef.current;
        const scrollHeight = container.scrollHeight;
        const height = container.clientHeight;
        const maxScroll = scrollHeight - height;
        container.scrollTo({
          top: maxScroll + 100,
          behavior: 'smooth'
        });
      }
    }
  });

  const segments = parseContent(displayedText);

  const formatText = (content: string): ReactElement[] => {
    const lines = content.split('\n');
    const formattedContent: ReactElement[] = [];
    let currentList: ReactElement[] = [];
    let listCounter = 0;
    let elementCounter = 0;

    const getUniqueKey = () => `element-${elementCounter++}`;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        formattedContent.push(
          <div key={getUniqueKey()} className="h-2" />
        );
        return;
      }

      // Check for numbered list items (e.g., "1. Something")
      const numberMatch = trimmedLine.match(/^(\d+)\.\s+(.+)/);
      if (numberMatch) {
        currentList.push(
          TextBlock.numberedItem(parseInt(numberMatch[1]), numberMatch[2], getUniqueKey())
        );
        return;
      }

      // Check for bullet points
      if (trimmedLine.startsWith('• ') || trimmedLine.startsWith('* ')) {
        currentList.push(
          TextBlock.listItem(trimmedLine.slice(2), getUniqueKey())
        );
        return;
      }

      // If we were building a list and now have something else, add the list
      if (currentList.length > 0) {
        formattedContent.push(
          <div key={getUniqueKey()} className="mb-4">
            {currentList.map((item, i) => (
              <div key={`list-item-${listCounter}-${i}`}>{item}</div>
            ))}
          </div>
        );
        currentList = [];
        listCounter++;
      }

      // Handle headings and paragraphs
      if (trimmedLine.endsWith(':')) {
        formattedContent.push(
          TextBlock.heading2(trimmedLine, getUniqueKey())
        );
      } else {
        formattedContent.push(
          TextBlock.paragraph(trimmedLine, getUniqueKey())
        );
      }
    });

    // Add any remaining list items
    if (currentList.length > 0) {
      formattedContent.push(
        <div key={getUniqueKey()} className="mb-4">
          {currentList.map((item, i) => (
            <div key={`list-item-${listCounter}-${i}`}>{item}</div>
          ))}
        </div>
      );
    }

    return formattedContent.map(element => {
      if (!element.key) {
        return React.cloneElement(element, { key: getUniqueKey() });
      }
      return element;
    });
  };

  return (
    <div className="space-y-1">
      {segments.map((segment) => {
        if (segment.type === 'table') {
          return <ChatTable key={segment.content} content={segment.content} />;
        }
        return (
          <div key={segment.content} className="space-y-1">
            {formatText(segment.content)}
          </div>
        );
      })}
    </div>
  );
};

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

const ActionCard = ({ icon, title, description, onClick }: ActionCardProps) => {
  return (
    <div 
      onClick={onClick}
      className="relative w-full h-52 cursor-pointer"
    >
      <div className="relative h-full rounded-xl border border-[#3c3d3e] p-1">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={2}
          variant="default"
        />
        <div className="relative flex h-full flex-col items-center justify-center bg-[#1a1b1e] rounded-lg p-6 space-y-3 hover:bg-[#2a2b2e] transition-colors">
          <div className="w-12 h-12 flex items-center justify-center bg-brand-purple/10 rounded-lg p-2">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-brand-purple text-center">{title}</h3>
          <p className="text-sm text-[#9aa0a6] text-center leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

const MainContent = () => {
  // State to hold the entire chat history
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  // State to track if chat view is active
  const [isChatActive, setIsChatActive] = useState<boolean>(false);
  // State for auto-scroll toggle
  const [autoScroll, setAutoScroll] = useState<boolean>(true); 
  // State to track AI loading status
  const [isAILoading, setIsAILoading] = useState<boolean>(false);
  // Ref for the chat history container
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize session state safely
  const [sessionId, setSessionId] = useState<string>('');

  // New state for chat context
  const [chatContext, setChatContext] = useState<ChatContext>({
    messages: [],
    systemConfig: DEFAULT_SYSTEM_CONFIG,
    lastUserMessage: undefined
  });

  // Add state for selected token
  const [selectedToken, setSelectedToken] = useState<string>('');
  
  // Define crypto tokens for the dock
  const cryptoTokens = [
    { icon: "/brands/dai.svg", label: "DAI", onClick: () => handleTokenSelect("DAI") },
    { icon: "/brands/tether.svg", label: "USDT", onClick: () => handleTokenSelect("USDT") },
    { icon: "/brands/usdc.svg", label: "USDC", onClick: () => handleTokenSelect("USDC") },
    { icon: Sparkles, label: "Yield", onClick: () => handleTokenSelect("Yield"), iconColor: "text-yellow-400" },
    { icon: BarChart3, label: "Charts", onClick: () => handleTokenSelect("Charts"), iconColor: "text-blue-400" },
    { icon: ActivitySquare, label: "Stats", onClick: () => handleTokenSelect("Stats"), iconColor: "text-violet-400" },
  ];

  // Move session initialization to useEffect
  useEffect(() => {
    const id = getOrCreateSessionId();
    setSessionId(id);
  }, []);

  // Add listener for session deletion and creation
  useEffect(() => {
    const handleSessionDeleted = (deletedSessionId: string) => {
      if (deletedSessionId === sessionId) {
        // Reset chat state
        setChatHistory([]);
        setIsChatActive(false);
        setIsAILoading(false);
        
        // Get new session ID
        const newId = getOrCreateSessionId();
        setSessionId(newId);
      }
    };

    const handleSessionCreated = (e: SessionCreatedEvent) => {
      const newSessionId = e.detail;
      // Reset chat state
      setChatHistory([]);
      setIsChatActive(false);
      setIsAILoading(false);
      setSessionId(newSessionId);
    };

    // Listen for session events
    if (typeof window !== 'undefined') {
      // TypeScript doesn't natively support CustomEvent with detail typing
      // Using type assertions to properly handle the custom events
      const sessionDeletedHandler = ((e: Event) => {
        const customEvent = e as SessionDeletedEvent;
        handleSessionDeleted(customEvent.detail);
      }) as EventListener;
      
      window.addEventListener('session_deleted', sessionDeletedHandler);
      window.addEventListener('session_created', handleSessionCreated as EventListener);

      return () => {
        window.removeEventListener('session_deleted', sessionDeletedHandler);
        window.removeEventListener('session_created', handleSessionCreated as EventListener);
      };
    }
  }, [sessionId]);

  // Wrap scrollToBottom in useCallback
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current && autoScroll) {
      const container = chatContainerRef.current;
      const scrollHeight = container.scrollHeight;
      const height = container.clientHeight;
      const maxScroll = scrollHeight - height;
      
      container.scrollTo({
        top: maxScroll + 100,
        behavior: 'smooth'
      });
    }
  }, [autoScroll]);

  // Use the enhanced scroll handler with proper dependency
  useEffect(() => {
    if (chatHistory.length > 0) {
      scrollToBottom();
    }
  }, [chatHistory, scrollToBottom]);

  const handleSubmit = async (message: string) => {
    if (!message.trim() || !sessionId) return;

    const userMessage: ChatMessage = { id: Date.now(), type: 'user', text: message };
    setIsAILoading(true);

    // Update chat history with user message
    setChatHistory(prev => [...prev, userMessage]);
    if (!isChatActive) {
      setIsChatActive(true);
    }
    
    const thinkingMessage: ChatMessage = {
      id: Date.now() + 1,
      type: 'thinking',
      text: 'Thinking...'
    };
    setChatHistory(prev => [...prev, thinkingMessage]);
    
    try {
      // Check remaining calls before making the API request
      const remainingCalls = getRemainingCalls(sessionId);
      if (remainingCalls <= 0) {
        throw new ChatApiError('You have reached the maximum number of calls for this session. Please start a new session.');
      }

      // Make API call with context
      const { response, context } = await sendChatMessage(message, chatContext);
      
      // Update context
      setChatContext(context);
      
      // Increment call counter only on successful response
      incrementSessionCalls(sessionId);

      const aiResponse: ChatMessage = {
        id: Date.now() + 2,
        type: 'ai',
        text: response
      };
      
      setChatHistory(prev => 
        prev.filter(msg => msg.type !== 'thinking').concat(aiResponse)
      );
    } catch (error) {
      console.error('Chat Error:', error);
      
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error instanceof ChatApiError) {
        // Handle specific error types
        if (error.data?.type === 'CERTIFICATE_ERROR') {
          errorMessage = 'We\'re experiencing a temporary security certificate issue with our server. Our team is aware and working on fixing this. The chat service is functional but you may see this error until the certificate is updated.';
        } else if (error.data?.type === 'NETWORK_ERROR') {
          errorMessage = 'Unable to connect to the chat service. Please check your internet connection and try again.';
        } else if (error.data?.type === 'UNKNOWN_ERROR') {
          errorMessage = 'An unexpected error occurred. Our team has been notified and is investigating.';
        } else {
          errorMessage = error.message;
        }
      }

      const errorResponse: ChatMessage = {
        id: Date.now() + 2,
        type: 'ai',
        text: errorMessage
      };
      
      setChatHistory(prev => 
        prev.filter(msg => msg.type !== 'thinking').concat(errorResponse)
      );
    } finally {
      setIsAILoading(false);
    }
  };

  const handleSentimentClick = () => {
    setIsChatActive(true);
    handleSubmit("Analyze the current regulatory landscape of USDT to assess potential risks and opportunities for DeFi protocols.");
  };

  const handleYieldOptimizationClick = () => {
    setIsChatActive(true);
    handleSubmit("Show me Tariel's AI-powered yield strategy for maximizing returns between USDC and USDT.");
  };

  // Reset context when session changes
  useEffect(() => {
    setChatContext({ messages: [], systemConfig: DEFAULT_SYSTEM_CONFIG, lastUserMessage: undefined });
  }, [sessionId]);

  // Handler for token selection
  const handleTokenSelect = (token: string) => {
    setSelectedToken(token);
    
    // Auto-generate prompts based on selected token
    switch(token) {
      case "DAI":
        handleSubmit("Tell me about the current stability of DAI and its backing mechanism.");
        break;
      case "USDT":
        handleSubmit("What are the latest regulatory developments affecting USDT?");
        break;
      case "USDC":
        handleSubmit("Compare USDC's reserves and transparency to other stablecoins.");
        break;
      case "Yield":
        handleSubmit("What are the best yield opportunities for stablecoins right now?");
        break;
      case "Charts":
        handleSubmit("Show me price stability charts for major stablecoins over the past month.");
        break;
      case "Stats":
        handleSubmit("What's the total market cap and daily volume for the top stablecoins?");
        break;
      default:
        break;
    }
  };

  return (
    <div className="h-full flex flex-col">
      
      {!isChatActive ? (
        // *******************
        // Initial View - Fixed Layout
        // *******************
        <div className="h-full flex flex-col overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col items-center justify-start px-6 py-8 overflow-y-auto">
            {/* Title and Subtitle */}
            <div className="text-center mb-8 mt-4">
              <h1 className="text-5xl font-semibold text-[#e8eaed] mb-4">
                Your AI Financial Assistant
              </h1>
              <p className="text-lg text-[#9aa0a6] mb-8">
                Get instant answers about digital finance, investments, and market trends
              </p>
              <div className="bg-[#2d2e2f] border border-[#3c3d3e] rounded-lg p-4 max-w-xl mx-auto">
                <p className="text-sm text-[#e8eaed] mb-2">
                  <span className="font-semibold text-[#8ab4f8]">New to crypto?</span> No problem! 
                </p>
                <p className="text-sm text-[#9aa0a6]">
                  Ask questions like "What is cryptocurrency?" or "How do I start investing?" 
                  Our AI explains everything in simple terms.
                </p>
              </div>
            </div>
            
            {/* Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mb-8">
              <ActionCard
                icon={<Image src="/brands/MetaMask-icon-Fox.svg" alt="Digital wallet icon" width={32} height={32} className="text-brand-purple" />}
                title="💰 Create Digital Money"
                description="Learn how to create stable digital coins (like digital dollars) safely and easily."
                onClick={() => console.log('Digital money action clicked')}
              />
              <ActionCard
                icon={<MessageSquare className="w-8 h-8 text-brand-purple" />}
                title="📊 Market Safety Check"
                description="Check if your investments are safe and what the latest regulations mean for you."
                onClick={handleSentimentClick}
              />
              <ActionCard
                icon={<TrendingUp className="w-8 h-8 text-brand-purple" />}
                title="📈 Smart Investment Tips"
                description="Get AI-powered advice on how to grow your money with low-risk strategies."
                onClick={handleYieldOptimizationClick}
              />
            </div>
          </div>
          
          {/* Fixed Bottom Input Area */}
          <div className="flex-shrink-0 w-full border-t border-[#3c3d3e] bg-[#1a1b1e] min-h-[160px]">
            <div className="max-w-4xl mx-auto px-6 py-6">
              <AIInputWithLoading 
                onSubmit={handleSubmit}
                isLoading={isAILoading}
                placeholder="Try: 'What is cryptocurrency?' or 'How do I start investing?'"
              />
              
              {/* Dock below the input field */}
              <div className="mt-4 flex justify-center">
                <Dock 
                  items={cryptoTokens} 
                  variant="fixed" 
                  selected={selectedToken}
                  onSelect={setSelectedToken}
                  className="w-auto" 
                />
              </div>
            </div>
          </div>
        </div>

      ) : (
        // *******************
        // Chat View
        // *******************
        <div className="h-full flex flex-col flex-grow w-full mx-auto relative">
          {/* Top Bar with Chat Session and Auto-scroll Toggle */}
          <div className="flex justify-between items-center px-8 py-2 mb-4 border-b border-[#3c3d3e]">
            <SidebarSessionDisplay />
            <div className="flex items-center space-x-2">
              <Switch 
                id="auto-scroll-switch"
                checked={autoScroll}
                onCheckedChange={setAutoScroll}
              />
              <Label htmlFor="auto-scroll-switch" className="text-sm text-[#9aa0a6]">Auto-scroll</Label>
            </div>
          </div>

          {/* Main Content Area with proper padding for input field */}
          <div className="flex-1 relative">
            {/* Scrollable Content */}
            <div 
              ref={chatContainerRef} 
              className="absolute inset-0 overflow-y-auto px-12 scroll-smooth"
              style={{ paddingBottom: 'calc(4rem + 160px)' }}
            >
              <div className="max-w-[1600px] mx-auto space-y-6 py-4">
                {chatHistory.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex items-start space-x-3",
                      msg.type === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {(msg.type === 'ai' || msg.type === 'thinking') && (
                      <Image 
                        src="/tariel/tarielbw.png"
                        alt="AI Avatar" 
                        width={28}
                        height={28} 
                        className="rounded-full mt-1"
                      />
                    )}
                    
                    <div
                      className={cn(
                        "p-4 rounded-lg break-words border",
                        msg.type === 'user' 
                          ? "bg-brand-purple text-white border-[#7B60DD] max-w-[45%]"
                          : "bg-[#2d2e2f] text-[#e8eaed] border-[#3c3d3e] max-w-[98%]"
                      )}
                    >
                      {msg.type === 'thinking' ? (
                        <div className="flex items-center space-x-2">
                          <Loader variant="loading-dots" text="Thinking" size="sm" />
                        </div>
                      ) : (
                        <StreamingMarkdown 
                          text={msg.text}
                          containerRef={chatContainerRef}
                          shouldAutoScroll={autoScroll}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Input Field Container */}
          <div className="sticky bottom-0 left-0 right-0 z-10 border-t border-[#3c3d3e] bg-[#1a1b1e] min-h-[160px]">
            <div className="relative max-w-[1600px] mx-auto px-12 py-6">
              <AIInputWithLoading 
                onSubmit={handleSubmit}
                isLoading={isAILoading}
                placeholder={isChatActive ? "Send a message..." : "Ask me anything..."}
              />
              
              {/* Dock below the input field */}
              <div className="mt-4 flex justify-center">
                <Dock 
                  items={cryptoTokens} 
                  variant="fixed" 
                  selected={selectedToken}
                  onSelect={setSelectedToken}
                  className="w-auto" 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainContent; 