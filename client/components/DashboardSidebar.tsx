'use client';

import { motion } from 'framer-motion';
import CyberpunkButton from './CyberpunkButton';
import { Plus, HardDrive, LogOut } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';

interface Board {
  _id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardSidebarProps {
  onCreateSector: () => void;
  onBoardSelect?: (boardId: string, boardTitle: string) => void;
  boards?: Board[];
  activeBoardId?: string | null;
}

export default function DashboardSidebar({ 
  onCreateSector, 
  onBoardSelect, 
  boards = [], 
  activeBoardId 
}: DashboardSidebarProps) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
        {boards.length > 0 ? (
          <div className="space-y-2">
            {boards.map((board) => (
              <motion.button
                key={board._id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onBoardSelect?.(board._id, board.title)}
                className={`w-full text-left p-2 rounded font-mono text-sm ${
                  activeBoardId === board._id
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <HardDrive className="w-3 h-3" />
                  <span className="truncate">{board.title}</span>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-sm text-muted-foreground font-mono"
          >
            {'> '}NO_SECTORS_FOUND
          </motion.div>
        )}
      </div>

      {/* Logout Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 p-2 rounded font-mono text-sm text-destructive hover:bg-destructive/10 border border-destructive/30"
      >
        <LogOut className="w-4 h-4" />
        LOGOUT
      </motion.button>

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
