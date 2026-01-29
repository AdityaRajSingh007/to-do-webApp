'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CyberpunkPanelProps {
  children: ReactNode;
}

export default function CyberpunkPanel({ children }: CyberpunkPanelProps) {
  return (
    <div className="relative">
      {/* Main panel with green border */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative bg-card border-2 border-primary p-8 w-full max-w-md"
        style={{
          clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)',
        }}
      >
        {/* Neon glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent opacity-0" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Corner accent - top right cut */}
        <div className="absolute top-0 right-0 w-5 h-5 bg-background" />
      </motion.div>

      {/* Scanlines effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)',
            color: '#00FF41',
          }}
        />
      </div>
    </div>
  );
}
