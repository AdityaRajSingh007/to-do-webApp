'use client';

import { motion } from 'framer-motion';

export default function DashboardMain() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="flex-1 flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Scan line animation */}
      <motion.div
        animate={{ y: ['0%', '100%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 h-1 bg-gradient-to-b from-primary/50 to-transparent pointer-events-none"
      />

      {/* Empty state content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-center space-y-8 relative z-10"
      >
        {/* Animated grid visualization */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="flex gap-2 justify-center"
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ scaleY: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.1,
              }}
              className="w-1 h-12 bg-primary/40 border border-primary/50"
            />
          ))}
        </motion.div>

        {/* Status text */}
        <div className="space-y-3">
          <motion.div
            animate={{ textShadow: ['0 0 5px rgba(0, 255, 65, 0.3)', '0 0 15px rgba(0, 255, 65, 0.6)', '0 0 5px rgba(0, 255, 65, 0.3)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xl font-mono text-primary tracking-wider"
          >
            &gt; SYSTEM_STANDBY
          </motion.div>
          <div className="text-sm text-muted-foreground font-mono">
            SELECT_OR_CREATE_A_SECTOR_TO_BEGIN
          </div>
        </div>
      </motion.div>
    </motion.main>
  );
}
