'use client';

import { motion } from 'framer-motion';
import CyberpunkButton from './CyberpunkButton';
import { Plus, HardDrive, LogOut, X } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useState } from 'react';

interface Board {
  _id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSector: () => void;
  onBoardSelect?: (boardId: string, boardTitle: string) => void;
  boards?: Board[];
  activeBoardId?: string | null;
}

export default function MobileDrawer({ 
  isOpen, 
  onClose, 
  onCreateSector, 
  onBoardSelect, 
  boards = [], 
  activeBoardId 
}: MobileDrawerProps) {
  const { logout } = useAuth();
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-64 h-full bg-gray-900 border-r border-primary/30 p-4 flex flex-col"
      >
        {/* Close Button */}
        <div className="flex justify-end mb-4">
          <button 
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Header */}
        <div className="space-y-2 mb-6">
          <div className="text-xs text-muted-foreground tracking-widest">[ NAVIGATION ]</div>
          <h2 className="text-lg font-mono font-bold text-primary">NAV_ARRAY</h2>
        </div>

        {/* Create Sector Button */}
        <motion.div 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
          className="mb-6"
        >
          <CyberpunkButton
            onClick={() => {
              onCreateSector();
              handleClose();
            }}
            className="w-full justify-start gap-2 py-3"
            variant="primary"
          >
            <Plus className="w-4 h-4" />
            INITIALIZE_SECTOR
          </CyberpunkButton>
        </motion.div>

        {/* Sectors List */}
        <div className="space-y-3 flex-1 mb-6">
          <div className="text-xs text-muted-foreground tracking-widest">[ SECTORS ]</div>
          {boards.length > 0 ? (
            <div className="space-y-2">
              {boards.map((board) => (
                <motion.button
                  key={board._id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onBoardSelect?.(board._id, board.title);
                    handleClose();
                  }}
                  className={`w-full text-left p-3 rounded font-mono text-sm ${
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
              className="text-sm text-muted-foreground font-mono py-2"
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
          className="w-full flex items-center justify-center gap-2 p-3 rounded font-mono text-sm text-destructive hover:bg-destructive/10 border border-destructive/30 mb-4"
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
      </motion.div>
    </motion.div>
  );
}