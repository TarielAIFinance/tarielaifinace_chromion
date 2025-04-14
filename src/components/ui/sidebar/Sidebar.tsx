'use client';

import React, { useState, useEffect } from 'react';
import { 
  Key,
  FileEdit,
  Radio,
  AppWindow,
  Settings2,
  History,
  Webhook,
  Settings,
  Trash2,
  MessageSquare
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getOrCreateSessionId } from '@/lib/api/session';
import { getCurrentSessionCalls, resetSessionCalls, addSessionUpdateListener, removeSessionUpdateListener } from '@/lib/api/session-calls';

interface Conversation {
  id: string;
  calls: number;
}

const NavLink = ({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) => (
  <a 
    href={href} 
    className={cn(
      "relative group flex items-center px-2 py-2 text-sm font-medium rounded-md text-Tariel-text-light hover:bg-[#1a1b1e] cursor-pointer",
      className
    )}
  >
    {children}
    <span className="absolute h-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 top-0 bg-gradient-to-r w-full mx-auto from-transparent via-[#7B60DD] to-transparent" />
    <span className="absolute h-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 bottom-0 bg-gradient-to-r w-full mx-auto from-transparent via-[#7B60DD] to-transparent" />
  </a>
);

const Sidebar = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');

  useEffect(() => {
    const id = getOrCreateSessionId();
    setActiveSessionId(id);

    // Set up listener for session updates
    const handleSessionUpdate = (sessionId: string, calls: number) => {
      setConversations(prev => {
        const existing = prev.find(c => c.id === sessionId);
        if (existing) {
          // Update existing conversation
          return prev.map(c => 
            c.id === sessionId ? { ...c, calls } : c
          );
        } else if (calls > 0) {
          // Add new conversation if it has calls
          return [...prev, { id: sessionId, calls }];
        }
        return prev;
      });
    };

    addSessionUpdateListener(handleSessionUpdate);

    // Initialize with current session if it has calls
    const currentCalls = getCurrentSessionCalls(id);
    if (currentCalls > 0) {
      handleSessionUpdate(id, currentCalls);
    }

    return () => {
      removeSessionUpdateListener(handleSessionUpdate);
    };
  }, []);

  const handleDeleteConversation = (id: string) => {
    resetSessionCalls(id);
    setConversations(prev => prev.filter(conv => conv.id !== id));
    
    // Dispatch event for session deletion
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('session_deleted', { detail: id }));
    }
  };

  const handleCreatePrompt = () => {
    const newId = getOrCreateSessionId(true); // Force new ID creation
    setActiveSessionId(newId);
    
    // Dispatch event for new session creation
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('session_created', { detail: newId }));
    }
  };

  return (
    <div className="h-full flex flex-col p-3 bg-Tariel-dark-bg text-Tariel-text-secondary space-y-4">
      {/* Header */}
      <div className="px-2 py-1 mb-2">
        <h1 className="text-lg font-semibold text-Tariel-text-light">Tariel AI Studio</h1>
      </div>

      {/* Buttons */}
      <button className="relative group w-full flex items-center justify-start px-3 py-2 rounded-md bg-brand-purple text-white text-sm font-medium cursor-pointer hover:bg-brand-purple/90">
        <Key className="w-5 h-5 mr-2" /> Get API key
        <span className="absolute h-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 top-0 bg-gradient-to-r w-full mx-auto from-transparent via-[#7B60DD] to-transparent" />
        <span className="absolute h-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 bottom-0 bg-gradient-to-r w-full mx-auto from-transparent via-[#7B60DD] to-transparent" />
      </button>
      <button 
        onClick={handleCreatePrompt}
        className="relative group w-full flex items-center justify-start px-3 py-2 rounded-md bg-[#1a1b1e] text-Tariel-text-light text-sm font-medium cursor-pointer hover:bg-[#2a2b2e]"
      >
        <FileEdit className="w-5 h-5 mr-2" /> Create Prompt
        <span className="absolute h-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 top-0 bg-gradient-to-r w-full mx-auto from-transparent via-[#7B60DD] to-transparent" />
        <span className="absolute h-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 bottom-0 bg-gradient-to-r w-full mx-auto from-transparent via-[#7B60DD] to-transparent" />
      </button>

      {/* Navigation Items */}
      <nav className="flex-grow px-2 space-y-1">
        <NavLink href="#">
          <Radio className="w-5 h-5 mr-2" /> Portfolio
        </NavLink>
        <NavLink href="#">
          <AppWindow className="w-5 h-5 mr-2" /> Partner Apps
        </NavLink>
        <NavLink href="#">
          <Settings2 className="w-5 h-5 mr-2" /> Tune a Model
        </NavLink>
        
        {/* History Section with Conversations */}
        <div className="space-y-1">
          <NavLink href="#" className="flex items-center">
            <History className="w-5 h-5 mr-2" /> History
          </NavLink>
          <div className="pl-7 space-y-2">
            {conversations.map(conv => (
              <div 
                key={conv.id} 
                className="flex items-center justify-between group text-sm text-Tariel-text-secondary py-1"
              >
                <span className="flex-1">Session {conv.id.slice(-8)}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-500"
                  title="Delete session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Second Navigation Block */}
      <nav className="px-2 space-y-1">
        <NavLink href="#">
          <Webhook className="w-5 h-5 mr-2" /> API documentation
        </NavLink>
        <NavLink 
          href="https://discord.com/invite/HkmdWjfehC" 
          className="group"
        >
          <Image 
            src="/brands/discord.svg" 
            alt="Discord" 
            width={20} 
            height={20} 
            className="mr-2"
          /> Community
        </NavLink>
        <NavLink href="#" className="justify-between">
          <div className="flex items-center">
            <History className="w-5 h-5 mr-2" /> Changelog
          </div>
          <span className="inline-block px-2 py-0.5 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">NEW</span>
        </NavLink>
      </nav>

      {/* Feedback Text */}
      <div className="px-2 py-2 text-xs text-Tariel-text-secondary">
        This experimental model is for
        feedback and testing only. No
        production use.
      </div>

      {/* Bottom Settings Link */}
      <div className="mt-auto pt-1 pb-1">
        <NavLink href="#">
          <Settings className="w-5 h-5 mr-2" /> Settings
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;