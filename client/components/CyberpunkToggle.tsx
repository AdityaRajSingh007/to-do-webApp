'use client';

import { motion } from 'framer-motion';

interface CyberpunkToggleProps {
  isActive: boolean;
  onChange: (active: boolean) => void;
  options: [string, string];
}

export default function CyberpunkToggle({
  isActive,
  onChange,
  options,
}: CyberpunkToggleProps) {
  return (
    <div className="flex gap-4 mb-8">
      {options.map((label, index) => (
        <motion.button
          key={index}
          onClick={() => onChange(index === 1)}
          className={`px-6 py-2 font-mono text-sm font-semibold transition-all duration-300 border-2 relative overflow-hidden ${
            isActive === (index === 1)
              ? 'border-primary text-primary bg-primary/10'
              : 'border-muted text-muted-foreground hover:border-muted-foreground'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="relative z-10">{label}</span>
          {isActive === (index === 1) && (
            <motion.div
              layoutId="toggle-bg"
              className="absolute inset-0 bg-primary/5"
              initial={false}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}
