'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const HEADER_TEXT = 'ESTABLISHING_CONNECTION...';

export default function TerminalHeader() {
  const [displayText, setDisplayText] = useState('');
  const [isForward, setIsForward] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayText((prev) => {
        if (isForward) {
          if (prev.length < HEADER_TEXT.length) {
            return HEADER_TEXT.substring(0, prev.length + 1);
          } else {
            setIsForward(false);
            return prev;
          }
        } else {
          if (prev.length > 0) {
            return prev.substring(0, prev.length - 1);
          } else {
            setIsForward(true);
            return prev;
          }
        }
      });
    }, 80);

    return () => clearInterval(interval);
  }, [isForward]);

  return (
    <div className="bg-primary/10 border-b border-primary px-4 py-3 mb-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1">
          <p className="font-mono text-sm text-primary neon-glow">
            {displayText}
            <span className="blink">_</span>
          </p>
        </div>
        <div className="flex gap-1 ml-4">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
