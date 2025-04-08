'use client'; // Mark as Client Component for potential hooks in AIInput

import React, { useState, useRef, useEffect, ReactElement } from 'react';
// Removed old icons
import { Label } from "@/components/ui/label";   // Import Label
import { Switch } from "@/components/ui/autoScroll/switch"; // Added import for the new Switch location
import { AIInputWithLoading } from "@/components/ui/ai-input-with-loading"; // Import the new component
import { cn } from '@/lib/utils'; // Import cn utility
import Image from 'next/image'; // Re-enabled import for next/image
import { Loader } from "@/components/ui/thinkingLoader/loader"; // Add Loader import
import ReactMarkdown from 'react-markdown'; // <--- ADD THIS IMPORT
import { sendChatMessage } from '@/lib/api/chat';
// Removed unused import: getOrCreateSessionId
import { ChatApiError } from '@/lib/api/chat';
import { ResponseStream } from "@/components/ui/responseStream/response-stream"; // Add this import
import { Components } from 'react-markdown'; // Add this import
import { useTextStream } from "@/components/ui/responseStream/response-stream"; // Add this import
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { MessageSquare, TrendingUp } from 'lucide-react';
import { ChatTable, parseContent, type ContentSegment } from '@/components/ui/tableIntegration';

// Define message structure
interface ChatMessage {
  id: number;
  type: 'user' | 'ai' | 'thinking';  // Add 'thinking' type
  text: string;
}

// Text formatting components
const TextBlock = {
  heading1: (text: string, key?: string): ReactElement => (
    <div key={key} className="text-2xl font-semibold mb-6 text-Tariel-text-light">{text}</div>
  ),
  heading2: (text: string, key?: string): ReactElement => (
    <div key={key} className="text-xl font-semibold mb-4 text-Tariel-text-light">{text}</div>
  ),
  paragraph: (text: string, key?: string): ReactElement => (
    <div key={key} className="text-base leading-relaxed mb-4 text-Tariel-text-light">{text}</div>
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
  const { displayedText, isComplete } = useTextStream({
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

  useEffect(() => {
    if (containerRef.current && shouldAutoScroll) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedText, containerRef, shouldAutoScroll]);

  // Parse segments from accumulated text
  const segments = parseContent(displayedText);

  const formatText = (content: string): ReactElement[] => {
    const lines = content.split('\n');
    const formattedContent: ReactElement[] = [];
    let currentList: ReactElement[] = [];
    let listCounter = 0;
    let elementCounter = 0;

    const getUniqueKey = () => `element-${elementCounter++}`;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        // Empty line - add spacing
        formattedContent.push(
          <div key={getUniqueKey()} className="h-4" />
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

    // Add unique keys to all elements that don't have them yet
    return formattedContent.map((element, index) => {
      if (!element.key) {
        return React.cloneElement(element, { key: `element-${index}` });
      }
      return element;
    });
  };

  return (
    <div className="space-y-1">
      {segments.map((segment, index) => {
        if (segment.type === 'table') {
          return <ChatTable key={index} content={segment.content} />;
        }
        return (
          <div key={index} className="space-y-1">
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
      className="relative w-80 h-48 cursor-pointer"
    >
      <div className="relative h-full rounded-xl border border-Tariel-border p-1">
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
          <p className="text-sm text-Tariel-text-secondary text-center leading-relaxed">{description}</p>
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

  // Combined handler for the AIInputWithLoading component
  const handleSubmit = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = { id: Date.now(), type: 'user', text: message };
    setIsAILoading(true);

    // Simplified chat history update
    setChatHistory(prev => [...prev, userMessage]);
    if (!isChatActive) {
      setIsChatActive(true); // Activate chat view on first message
    }
    
    const thinkingMessage: ChatMessage = {
      id: Date.now() + 1,
      type: 'thinking',
      text: 'Thinking...'
    };
    setChatHistory(prev => [...prev, thinkingMessage]);
    
    try {
      // Removed session ID logic
      // console.log('Using session ID:', sessionId); // No longer needed
      
      // Call updated sendChatMessage with only the message content
      const response = await sendChatMessage(message);

      console.log('API Response:', response);

      const aiResponse: ChatMessage = {
        id: Date.now() + 2,
        type: 'ai',
        // Assuming response structure { response: string }
        text: response.response 
      };
      
      setChatHistory(prev => 
        prev.filter(msg => msg.type !== 'thinking').concat(aiResponse)
      );
    } catch (error) {
      console.error('Detailed Chat API Error:', error);
      
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error instanceof ChatApiError) {
        // Use the message from the error object, which now contains more detail
        errorMessage = error.message; 
        // // Example of handling specific status codes if needed in the future
        // if (error.error.status === 429) {
        //   errorMessage = 'Too many requests. Please wait a moment before trying again.';
        // } else {
        //   errorMessage = error.error.message || errorMessage;
        // }
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

  // Enhanced scroll handling
  const scrollToBottom = () => {
    if (chatContainerRef.current && autoScroll) {
      const container = chatContainerRef.current;
      const scrollHeight = container.scrollHeight;
      const height = container.clientHeight;
      const maxScroll = scrollHeight - height;
      
      // Smooth scroll to bottom with padding
      container.scrollTo({
        top: maxScroll + 100, // Add padding to ensure content is visible
        behavior: 'smooth'
      });
    }
  };

  // Use the enhanced scroll handler
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, autoScroll]);

  const handleSentimentClick = () => {
    setIsChatActive(true);
    handleSubmit("Analyze the current regulatory landscape of USDT to assess potential risks and opportunities for DeFi protocols.");
  };

  const handleYieldOptimizationClick = () => {
    setIsChatActive(true);
    handleSubmit("Show me Tariel's AI-powered yield strategy for maximizing returns between USDC and USDT.");
  };

  return (
    <div className="h-full flex flex-col">
      
      {!isChatActive ? (
        // *******************
        // Initial View (Without Input Area)
        // *******************
        <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
          {/* Title and Subtitle */}
          <div className='mb-12'>
            <h1 className="text-5xl font-semibold text-Tariel-text-light mb-3">What will you use DeFAI for?</h1>
            <p className="text-lg text-Tariel-text-secondary">
              Push Tariels Agent to the limits of what AI can do using the Tariel Finance API
            </p>
          </div>
          {/* Cards Section - Restore Tariel Styling */}
          <div className="flex space-x-6 mb-12">
            <ActionCard
              icon={<Image src="/brands/MetaMask-icon-Fox.svg" alt="Metamask action icon" width={32} height={32} className="text-brand-purple" />}
              title="Mint USDai"
              description="Mint USDai tokens with a single message."
              onClick={() => console.log('Metamask action clicked')}
            />
            <ActionCard
              icon={<MessageSquare className="w-8 h-8 text-brand-purple" />}
              title="Regulatory Analysis"
              description="Get USDT's regulatory status and risks."
              onClick={handleSentimentClick}
            />
            <ActionCard
              icon={<TrendingUp className="w-8 h-8 text-brand-purple" />}
              title="Tariel Yield"
              description="Find best yields with Tariel's AI strategy."
              onClick={handleYieldOptimizationClick}
            />
          </div>
          
          {/* Input Field Container for Initial View */}
          <div className="w-full absolute bottom-0 left-0 right-0">
            <div className="h-24 bg-gradient-to-t from-Tariel-content-bg via-Tariel-content-bg to-transparent absolute inset-x-0 bottom-0" />
            <div className="relative max-w-[1600px] mx-auto px-12 py-4">
              <AIInputWithLoading 
                onSubmit={handleSubmit}
                isLoading={isAILoading}
                placeholder="Ask me anything..."
              />
            </div>
          </div>
        </div>

      ) : (
        // *******************
        // Chat View
        // *******************
        <div className="h-full flex flex-col flex-grow w-full mx-auto relative">
          {/* Top Bar with Chat Session and Auto-scroll Toggle */}
          <div className="flex justify-between items-center px-8 py-2 mb-4 border-b border-Tariel-border">
            <button className="flex items-center text-sm text-Tariel-text-light focus:outline-none">
              <span className="mr-2">⌄</span> 
              Chat Session
            </button>
            <div className="flex items-center space-x-2">
              <Switch 
                id="auto-scroll-switch"
                checked={autoScroll}
                onCheckedChange={setAutoScroll}
              />
              <Label htmlFor="auto-scroll-switch" className="text-sm text-Tariel-text-secondary">Auto-scroll</Label>
            </div>
          </div>

          {/* Main Content Area with proper padding for input field */}
          <div className="flex-1 relative">
            {/* Scrollable Content */}
            <div 
              ref={chatContainerRef} 
              className="absolute inset-0 overflow-y-auto px-12 scroll-smooth"
              style={{ paddingBottom: 'calc(4rem + 100px)' }}
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
                          : "bg-Tariel-input-bg text-Tariel-text-light border-[#5f6368] max-w-[98%]"
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
          <div className="sticky bottom-0 left-0 right-0 z-10">
            <div className="h-24 bg-gradient-to-t from-Tariel-content-bg via-Tariel-content-bg to-transparent absolute inset-x-0 bottom-0" />
            <div className="relative max-w-[1600px] mx-auto px-12 py-4">
              <AIInputWithLoading 
                onSubmit={handleSubmit}
                isLoading={isAILoading}
                placeholder={isChatActive ? "Send a message..." : "Ask me anything..."}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainContent; 