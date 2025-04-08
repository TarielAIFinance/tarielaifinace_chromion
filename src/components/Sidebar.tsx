import React from 'react';
import { 
  Key,
  FileEdit,
  Radio,
  AppWindow,
  Settings2,
  Library,
  Webhook,
  History,
  Settings
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const NavLink = ({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) => (
  <a 
    href={href} 
    className={cn(
      "relative group flex items-center px-2 py-2 text-sm font-medium rounded-md text-Tariel-text-light hover:bg-[#1a1b1e] cursor-pointer",
      className
    )}
  >
    {children}
    {/* Purple/violet neon border effect that only shows on hover */}
    <span className="absolute h-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 top-0 bg-gradient-to-r w-full mx-auto from-transparent via-[#7B60DD] to-transparent" />
    <span className="absolute h-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 bottom-0 bg-gradient-to-r w-full mx-auto from-transparent via-[#7B60DD] to-transparent" />
  </a>
);

const Sidebar = () => {
  return (
    <div className="h-full flex flex-col p-3 bg-Tariel-dark-bg text-Tariel-text-secondary space-y-4">
      {/* Header */}
      <div className="px-2 py-1 mb-2">
        <h1 className="text-lg font-semibold text-Tariel-text-light">Tariel AI Studio</h1>
      </div>

      {/* Buttons - Tariel Colors */}
      <button className="relative group w-full flex items-center justify-start px-3 py-2 rounded-md bg-brand-purple text-white text-sm font-medium cursor-pointer hover:bg-brand-purple/90">
        <Key className="w-5 h-5 mr-2" /> Get API key
        <span className="absolute h-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 top-0 bg-gradient-to-r w-full mx-auto from-transparent via-[#7B60DD] to-transparent" />
        <span className="absolute h-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 bottom-0 bg-gradient-to-r w-full mx-auto from-transparent via-[#7B60DD] to-transparent" />
      </button>
      <button className="relative group w-full flex items-center justify-start px-3 py-2 rounded-md bg-[#1a1b1e] text-Tariel-text-light text-sm font-medium cursor-pointer hover:bg-[#2a2b2e]">
        <FileEdit className="w-5 h-5 mr-2" /> Create Prompt
        <span className="absolute h-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 top-0 bg-gradient-to-r w-full mx-auto from-transparent via-[#7B60DD] to-transparent" />
        <span className="absolute h-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 bottom-0 bg-gradient-to-r w-full mx-auto from-transparent via-[#7B60DD] to-transparent" />
      </button>

      {/* Navigation Items - Tariel Colors */}
      <nav className="flex-grow px-2 space-y-1">
        <NavLink href="#">
          <Radio className="w-5 h-5 mr-2" /> Stream Realtime
        </NavLink>
        <NavLink href="#">
          <AppWindow className="w-5 h-5 mr-2" /> Starter Apps
        </NavLink>
        <NavLink href="#">
          <Settings2 className="w-5 h-5 mr-2" /> Tune a Model
        </NavLink>
        <NavLink href="#">
          <Library className="w-5 h-5 mr-2" /> Library
        </NavLink>
      </nav>

      {/* Divider/Space */}
      <div className="pt-4"></div>

      {/* Second Navigation Block - Tariel Colors */}
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

      {/* Spacer */}
      <div className="flex-grow"></div>

      {/* Feedback Text - Keep secondary text */}
      <div className="px-2 py-2 text-xs text-Tariel-text-secondary">
        This experimental model is for
        feedback and testing only. No
        production use.
      </div>

      {/* Bottom Settings Link - No border */}
      <div className="mt-auto pt-1 pb-1">
        <NavLink href="#">
          <Settings className="w-5 h-5 mr-2" /> Settings
        </NavLink>
      </div>

    </div>
  );
};

export default Sidebar; 