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
      <span className="text-xs text-google-text-secondary">{description}</span>
    </div>
  </SelectItem>
)

const RightPanel = () => {
  const modelSelectId = useId();
  const outputFormatId = useId();
  const [sessionCalls, setSessionCalls] = useState<number>(0);

  useEffect(() => {
    // Initialize session ID and set up listener
    const id = getOrCreateSessionId();

    // Initialize call count
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
  }, []);

  return (
    <div className="h-full flex flex-col p-4 bg-[#1a1b1e] text-[#9aa0a6] space-y-4 overflow-y-auto">
      {/* Run Settings Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold text-[#e8eaed] uppercase tracking-wide">Run settings</h2>
        <button className="text-[#9aa0a6] hover:text-[#e8eaed]">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Get Code - Google Blue */}
      <button className="flex items-center text-sm text-[#8ab4f8] hover:opacity-80">
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
        <label className="block text-xs font-medium text-google-text-secondary">Agent calls</label>
        <span className="flex items-center">
          <Coins className="w-5 h-5 mr-1 text-google-text-secondary" />
          <span className="text-sm text-google-text-light">{sessionCalls} / 30</span>
        </span>
      </div>

      {/* Temperature Section */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center justify-between">
          <label htmlFor="temperature-slider" className="flex items-center text-xs font-medium text-google-text-secondary">
            <Thermometer className="w-4 h-4 mr-1" />
            Temperature
          </label>
          <span className="text-sm font-medium text-google-text-light">1</span>
        </div>
        <input
          id="temperature-slider"
          type="range"
          min="0"
          max="1"
          step="0.1"
          defaultValue="1"
          className="w-full h-2 bg-google-border rounded-lg appearance-none cursor-pointer accent-google-blue"
        />
      </div>

      {/* Advanced Settings Section */}
      <div className="pt-4">
        <button className="flex items-center justify-between w-full text-left focus:outline-none group">
          <span className="text-xs font-medium text-google-text-secondary">Advanced settings</span>
          <ChevronDown className="h-5 w-5 text-google-text-secondary transition-transform group-hover:text-google-text-light" />
        </button>
        <div className="mt-2 pl-2 space-y-2 border-l border-google-border ml-1">
          <a href="#" className="flex items-center text-sm text-google-blue hover:opacity-80">
            <Shield className="w-4 h-4 mr-1" />
            Safety settings
          </a>
          <a href="#" className="flex items-center text-sm text-google-blue hover:opacity-80">
            <Shield className="w-4 h-4 mr-1" />
            Edit safety settings
          </a>
        </div>
      </div>

      {/* Add Stop Sequence Section */}
      <div className="pt-4">
        <label htmlFor="stop-sequence" className="flex items-center text-xs font-medium text-google-text-secondary mb-1.5">
          <Square className="w-4 h-4 mr-1" />
          Add stop sequence
        </label>
        <input
          type="text"
          name="stop-sequence"
          id="stop-sequence"
          className="block w-full bg-google-input-bg border border-google-border rounded-lg shadow-sm py-2 px-3 text-sm text-google-text-light placeholder-google-text-secondary focus:outline-none focus:ring-1 focus:ring-google-blue focus:border-google-blue transition-colors hover:bg-google-content-bg"
          placeholder="Add stop..."
        />
      </div>

      <div className="flex-grow"></div>
    </div>
  );
};

export default RightPanel; 