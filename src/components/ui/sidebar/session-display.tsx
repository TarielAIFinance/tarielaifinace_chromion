'use client';

import React, { useEffect, useState } from 'react';
import { getOrCreateSessionId } from '@/lib/api/session';
import { Copy } from 'lucide-react';

export function SidebarSessionDisplay() {
  const [sessionId, setSessionId] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-Tariel-text-secondary">Session ID:</span>
      <span className="text-sm font-mono text-Tariel-text-light">{sessionId.slice(0, 8)}...</span>
      <button
        onClick={copyToClipboard}
        className="p-1 hover:bg-Tariel-border rounded-md transition-colors"
        title="Copy session ID"
      >
        <Copy className="w-4 h-4 text-Tariel-text-secondary" />
      </button>
      {copied && (
        <span className="text-xs text-Tariel-text-secondary">Copied!</span>
      )}
    </div>
  );
} 