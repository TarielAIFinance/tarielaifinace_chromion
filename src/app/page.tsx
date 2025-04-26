"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/ui/sidebar/Sidebar";
import MainContent from "@/components/MainContent";
import RightPanel from "@/components/RightPanel";
import { BeamsBackground } from "@/components/ui/background";
import { Menu, X, Settings } from "lucide-react";

export default function Home() {
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  
  // Check screen size on initial load and when resizing
  useEffect(() => {
    const handleResize = () => {
      // Auto-hide sidebars on mobile screens
      if (window.innerWidth < 768) {
        setShowLeftSidebar(false);
        setShowRightSidebar(false);
      } else {
        setShowLeftSidebar(true);
        setShowRightSidebar(true);
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add resize listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <main className="flex h-screen w-screen overflow-hidden relative">
      {/* Left sidebar */}
      <div 
        className={`${showLeftSidebar ? 'w-52' : 'w-0'} 
                   transition-all duration-300 flex-shrink-0 bg-google-dark-bg z-30
                   fixed md:relative h-full overflow-hidden ${showLeftSidebar ? 'left-0' : '-left-52'}`}
      >
        <Sidebar />
      </div>
      
      {/* Left sidebar toggle button (mobile only) */}
      <button 
        onClick={() => setShowLeftSidebar(!showLeftSidebar)}
        className="absolute top-3 left-3 z-40 p-2 rounded-full bg-google-dark-bg bg-opacity-80 text-white md:hidden"
      >
        {showLeftSidebar ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay when left sidebar is open on mobile */}
      {showLeftSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
          onClick={() => setShowLeftSidebar(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 overflow-y-auto relative">
        <BeamsBackground className="absolute inset-0 z-0" />
        <div className="relative z-10 h-full">
          <MainContent />
        </div>
      </div>

      {/* Right sidebar */}
      <div 
        className={`${showRightSidebar ? 'w-64' : 'w-0'} 
                   transition-all duration-300 flex-shrink-0 bg-google-dark-bg z-30
                   fixed md:relative h-full overflow-hidden ${showRightSidebar ? 'right-0' : '-right-64'}`}
      >
        <RightPanel />
      </div>
      
      {/* Right sidebar toggle button (mobile only) */}
      <button 
        onClick={() => setShowRightSidebar(!showRightSidebar)}
        className="absolute top-3 right-3 z-40 p-2 rounded-full bg-google-dark-bg bg-opacity-80 text-white md:hidden"
      >
        {showRightSidebar ? <X size={20} /> : <Settings size={20} />}
      </button>

      {/* Overlay when right sidebar is open on mobile */}
      {showRightSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
          onClick={() => setShowRightSidebar(false)}
        />
      )}
    </main>
  );
}
