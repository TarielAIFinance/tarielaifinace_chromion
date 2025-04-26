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

// easy NavLink-Component
const NavLink = ({ 
  href, 
  children, 
  className,
  isActive,
  onClick
}: { 
  href: string, 
  children: React.ReactNode, 
  className?: string,
  isActive?: boolean,
  onClick?: () => void
}) => (
  <a 
    href={href} 
    className={cn(
      "relative group flex items-center py-2 px-4 text-sm font-medium rounded-lg cursor-pointer",
      isActive ? "bg-[#262626] text-brand-purple" : "text-[#e8eaed] hover:bg-[#2d2d2d]",
      className
    )}
    onClick={(e) => {
      e.preventDefault();
      onClick?.();
    }}
  >
    <div className="relative z-10 w-full">
      {children}
    </div>
    <span className="absolute h-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 top-0 bg-gradient-to-r w-full mx-auto from-transparent via-[#7B60DD] to-transparent z-5" />
    <span className="absolute h-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 bottom-0 bg-gradient-to-r w-full mx-auto from-transparent via-[#7B60DD] to-transparent z-5" />
  </a>
);

const Sidebar = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('');

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
    setActiveSection('create');
    const newId = getOrCreateSessionId(true);
    setActiveSessionId(newId);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('session_created', { detail: newId }));
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#101010] text-[#e8eaed]">
      {/* Header */}
      <div className="px-4 py-4 mb-3">
        <h1 className="text-lg font-semibold text-[#e8eaed]">Tariel AI Studio</h1>
      </div>

      {/* Hauptnavigation mit klar definierten Abständen */}
      <div className="flex flex-col space-y-0.5 px-2 mb-3">
        <button className="relative group flex items-center justify-start h-10 px-4 rounded-lg bg-brand-purple text-white text-sm font-medium cursor-pointer hover:bg-brand-purple/90">
          <div className="relative z-10 flex items-center">
            <Key className="w-5 h-5 mr-4" /> Get API key
          </div>
          <span className="absolute h-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 top-0 bg-gradient-to-r w-full mx-auto from-transparent via-[#7B60DD] to-transparent z-5" />
          <span className="absolute h-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 bottom-0 bg-gradient-to-r w-full mx-auto from-transparent via-[#7B60DD] to-transparent z-5" />
        </button>
        
        <button 
          onClick={handleCreatePrompt}
          className={cn(
            "relative group flex items-center justify-start h-10 px-4 rounded-lg text-sm font-medium cursor-pointer",
            activeSection === 'create' 
              ? "bg-[#262626] text-brand-purple" 
              : "bg-gradient-to-r from-brand-purple/80 to-brand-purple text-white hover:from-brand-purple hover:to-brand-purple/90"
          )}
        >
          <div className="relative z-10 flex items-center">
            <MessageSquare className="w-5 h-5 mr-4" /> Start New Chat
          </div>
          <span className="absolute h-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 top-0 bg-gradient-to-r w-full mx-auto from-transparent via-white to-transparent z-5" />
          <span className="absolute h-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 bottom-0 bg-gradient-to-r w-full mx-auto from-transparent via-white to-transparent z-5" />
        </button>
      </div>

      {/* Hauptnavigation */} 
      <div className="flex-grow px-2 space-y-0">
        <NavLink 
          href="#" 
          isActive={activeSection === 'portfolio'}
          onClick={() => setActiveSection('portfolio')}
        >
          <Radio className="w-5 h-5 mr-4" /> Portfolio
        </NavLink>
        <NavLink 
          href="#" 
          isActive={activeSection === 'partner'} 
          onClick={() => setActiveSection('partner')}
        >
          <AppWindow className="w-5 h-5 mr-4" /> Partner Apps
        </NavLink>
        <NavLink 
          href="#" 
          isActive={activeSection === 'tune'} 
          onClick={() => setActiveSection('tune')}
        >
          <Settings2 className="w-5 h-5 mr-4" /> Tune a Model
        </NavLink>
        
        <NavLink 
          href="#" 
          isActive={activeSection === 'history'} 
          onClick={() => setActiveSection('history')}
        >
          <History className="w-5 h-5 mr-4" /> History
        </NavLink>
        
        {/* History Conversations mit klarer Einrückung */}
        {activeSection === 'history' && conversations.length > 0 && (
          <div className="border-l border-gray-700 ml-7 pl-3 py-1 my-1 space-y-1">
            {conversations.map(conv => (
              <div 
                key={conv.id} 
                className="flex items-center justify-between group text-sm text-gray-400 py-1.5 px-1.5"
              >
                <span className="flex-1 truncate">Session {conv.id.slice(-8)}</span>
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
        )}
      </div>

      {/* Zweite Navigation Gruppe */}
      <div className="px-2 mt-1">
        <div className="text-xs uppercase text-gray-500 mb-2 px-4">Tools</div>
        <div className="space-y-0">
          <NavLink 
            href="#" 
            isActive={activeSection === 'api'} 
            onClick={() => setActiveSection('api')}
          >
            <Webhook className="w-5 h-5 mr-4" /> API documentation
          </NavLink>
          <NavLink 
            href="https://discord.com/invite/HkmdWjfehC"
            isActive={activeSection === 'community'} 
            onClick={() => {
              window.open("https://discord.gg/HkmdWjfehC", "_blank");
              setActiveSection('community');
            }}
          >
            <Image 
              src="/brands/discord.svg" 
              alt="Discord" 
              width={20} 
              height={20} 
              className="mr-4"
            /> Community
          </NavLink>
          <NavLink 
            href="#" 
            isActive={activeSection === 'changelog'} 
            onClick={() => setActiveSection('changelog')}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <History className="w-5 h-5 mr-4" /> Changelog
              </div>
              <span className="px-2 py-0.5 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">NEW</span>
            </div>
          </NavLink>
        </div>
      </div>

      {/* Horizontale Linie */}
      <div className="h-px bg-gray-800 mx-4 my-3"></div>

      {/* Feedback Text */}
      <div className="px-4 py-3 text-xs text-gray-400">
        This experimental model is for feedback and testing only. No production use.
      </div>

      {/* Bottom Settings Link */}
      <div className="mt-1 mb-3 px-2">
        <NavLink 
          href="#" 
          isActive={activeSection === 'settings'} 
          onClick={() => setActiveSection('settings')}
        >
          <Settings className="w-5 h-5 mr-4" /> Settings
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;