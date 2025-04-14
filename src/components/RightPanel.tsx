'use client';

import React, { useEffect, useState } from 'react';
import { 
  RefreshCw,
  Code,
  Thermometer,
  Coins,
  ChevronDown,
  Shield,
  Square
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";
import { Label } from "@/components/ui/select/label";
import { useId } from "react";
import { getOrCreateSessionId } from '@/lib/api/session';
import { getCurrentSessionCalls, addSessionUpdateListener, removeSessionUpdateListener } from '@/lib/api/session-calls';

// Helper component for select items with descriptions
const SelectItemWithDescription = ({
  value,
  title,
  description,
  disabled
}: {
  value: string
  title: string
  description: string
  disabled?: boolean
}) => (
  <SelectItem value={value} disabled={disabled}>
    <div className="flex flex-col">
      <span className="font-medium">{title}</span>
      <span className="text-xs text-Tariel-text-secondary">{description}</span>
    </div>
  </SelectItem>
)

const RightPanel = () => {
  const modelSelectId = useId();
  const outputFormatId = useId();
  const [sessionId, setSessionId] = useState<string>('');
  const [sessionCalls, setSessionCalls] = useState<number>(0);

  useEffect(() => {
    // Initialize session ID
    const id = getOrCreateSessionId();
    setSessionId(id);

    // Initialize call count only after we have a session ID
    if (id) {
      setSessionCalls(getCurrentSessionCalls(id));

      // Listen for updates
      const updateListener = (updatedSessionId: string, calls: number) => {
        if (updatedSessionId === id) {
          setSessionCalls(calls);
        }
      };

      addSessionUpdateListener(updateListener);

      return () => {
        removeSessionUpdateListener(updateListener);
      };
    }
  }, []);

  return (
    <div className="h-full flex flex-col p-4 bg-Tariel-dark-bg text-Tariel-text-secondary space-y-4 overflow-y-auto">
      {/* Run Settings Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold text-Tariel-text-light uppercase tracking-wide">Run settings</h2>
        <button className="text-Tariel-text-secondary hover:text-Tariel-text-light">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Get Code - Tariel Blue */}
      <button className="flex items-center text-sm text-Tariel-blue hover:opacity-80">
        <Code className="w-5 h-5 mr-1" />
        Get code
      </button>

      {/* Model Section */}
      <div className="space-y-1.5 pt-2">
        <Label htmlFor={modelSelectId}>Model</Label>
        <Select defaultValue="vili">
          <SelectTrigger id={modelSelectId}>
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItemWithDescription
              value="vili"
              title="Tariel Vili 1.0"
              description="Experimental"
            />
            <SelectItemWithDescription
              value="vili-pro"
              title="Tariel Vili Pro"
              description="Coming soon"
              disabled
            />
          </SelectContent>
        </Select>
      </div>

      {/* Output Format Section */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={outputFormatId}>Output format</Label>
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
            NEW
          </span>
        </div>
        <Select defaultValue="text-tables">
          <SelectTrigger id={outputFormatId}>
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItemWithDescription
              value="text-tables"
              title="Text & Tables"
              description="Standard output format"
            />
            <SelectItemWithDescription
              value="text-images"
              title="Text & Images"
              description="Coming soon"
              disabled
            />
          </SelectContent>
        </Select>
      </div>

      {/* Token Count - Updated to show actual session calls */}
      <div className="flex items-center justify-between pt-3">
        <label className="block text-xs font-medium text-Tariel-text-secondary">Agent calls</label>
        <span className="flex items-center">
          <Coins className="w-5 h-5 mr-1 text-Tariel-text-secondary" />
          <span className="text-sm text-Tariel-text-light">{sessionCalls} / 30</span>
        </span>
      </div>

      {/* Temperature Section */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center justify-between">
          <label htmlFor="temperature-slider" className="flex items-center text-xs font-medium text-Tariel-text-secondary">
            <Thermometer className="w-4 h-4 mr-1" />
            Temperature
          </label>
          <span className="text-sm font-medium text-Tariel-text-light">1</span>
        </div>
        <input
          id="temperature-slider"
          type="range"
          min="0"
          max="1"
          step="0.1"
          defaultValue="1"
          className="w-full h-2 bg-Tariel-border rounded-lg appearance-none cursor-pointer accent-Tariel-blue"
        />
      </div>

      {/* Advanced Settings Section */}
      <div className="pt-4">
        <button className="flex items-center justify-between w-full text-left focus:outline-none group">
          <span className="text-xs font-medium text-Tariel-text-secondary">Advanced settings</span>
          <ChevronDown className="h-5 w-5 text-Tariel-text-secondary transition-transform group-hover:text-Tariel-text-light" />
        </button>
        <div className="mt-2 pl-2 space-y-2 border-l border-Tariel-border ml-1">
          <a href="#" className="flex items-center text-sm text-Tariel-blue hover:opacity-80">
            <Shield className="w-4 h-4 mr-1" />
            Safety settings
          </a>
          <a href="#" className="flex items-center text-sm text-Tariel-blue hover:opacity-80">
            <Shield className="w-4 h-4 mr-1" />
            Edit safety settings
          </a>
        </div>
      </div>

      {/* Add Stop Sequence Section */}
      <div className="pt-4">
        <label htmlFor="stop-sequence" className="flex items-center text-xs font-medium text-Tariel-text-secondary mb-1.5">
          <Square className="w-4 h-4 mr-1" />
          Add stop sequence
        </label>
        <input
          type="text"
          name="stop-sequence"
          id="stop-sequence"
          className="block w-full bg-[#1a1b1e] border border-Tariel-border rounded-lg shadow-sm py-2 px-3 text-sm text-Tariel-text-light placeholder-Tariel-text-secondary focus:outline-none focus:ring-1 focus:ring-Tariel-blue focus:border-Tariel-blue transition-colors hover:bg-[#2a2b2e]"
          placeholder="Add stop..."
        />
      </div>

      <div className="flex-grow"></div>
    </div>
  );
};

export default RightPanel; 