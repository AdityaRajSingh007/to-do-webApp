'use client';

import { motion } from 'framer-motion';
import CyberpunkButton from './CyberpunkButton';
import { Plus } from 'lucide-react';

interface DashboardSidebarProps {
  onCreateSector: () => void;
}

export default function DashboardSidebar({ onCreateSector }: DashboardSidebarProps) {
  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-64 border-r border-primary/30 bg-card p-6 flex flex-col gap-8 h-screen"
    >
      {/* Header */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground tracking-widest">[ NAVIGATION ]</div>
        <h2 className="text-lg font-mono font-bold text-primary">NAV_ARRAY</h2>
      </div>

      {/* Create Sector Button */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <CyberpunkButton
          onClick={onCreateSector}
          className="w-full justify-start gap-2"
          variant="primary"
        >
          <Plus className="w-4 h-4" />
          INITIALIZE_SECTOR
        </CyberpunkButton>
      </motion.div>

      {/* Sectors List */}
      <div className="space-y-3 flex-1">
        <div className="text-xs text-muted-foreground tracking-widest">[ SECTORS ]</div>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-sm text-muted-foreground font-mono"
        >
          {'> '}NO_SECTORS_FOUND
        </motion.div>
      </div>

      {/* Footer Status */}
      <div className="text-xs text-muted-foreground border-t border-primary/20 pt-4">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="w-2 h-2 bg-primary rounded-full"
          />
          <span>SYSTEM_ONLINE</span>
        </div>
      </div>
    </motion.aside>
  );
}
