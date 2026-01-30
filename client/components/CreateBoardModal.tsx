'use client';

import React from "react"

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (boardName: string) => Promise<void>; // Updated to async function
}

export default function CreateBoardModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateBoardModalProps) {
  const [boardName, setBoardName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!boardName.trim()) {
      setError('ERROR: NULL_VALUE');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      await onSubmit(boardName);
      setBoardName('');
      onClose();
    } catch (err) {
      setError('ERROR: FAILED_TO_CREATE');
      console.error('Error creating board:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setBoardName('');
    setError('');
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBoardName(e.target.value);
    if (error) {
      setError('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md mx-4"
            >
              {/* Modal Container */}
              <div className="border-[1px] border-primary bg-card">
                {/* Header */}
                <div className="border-b-[1px] border-primary bg-card px-6 py-4">
                  <div className="text-sm font-mono text-primary tracking-widest">
                    /// SYSTEM_OVERRIDE: NEW_PARTITION
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-6">
                  {/* Input Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-mono text-muted-foreground">
                      &gt; INPUT_SECTOR_DESIGNATION:
                    </label>
                    <motion.input
                      type="text"
                      value={boardName}
                      onChange={handleInputChange}
                      placeholder="e.g. PROJECT_ALPHA"
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 bg-input border-[1px] border-muted text-foreground font-mono text-sm placeholder-muted-foreground transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(0,255,65,0.3)] disabled:opacity-50 disabled:cursor-not-allowed caret-block"
                      autoFocus
                    />
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-xs font-mono text-destructive"
                      >
                        {error}
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t-[1px] border-primary flex gap-3 px-6 py-4 bg-card">
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 py-2 text-destructive font-mono text-sm border-0 bg-transparent hover:bg-destructive/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    [ ABORT ]
                  </button>
                  <motion.button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    animate={isSubmitting ? { x: [0, -2, 2, -2, 0] } : {}}
                    transition={isSubmitting ? { duration: 0.4, repeat: Infinity } : {}}
                    className="flex-1 py-2 text-primary font-mono text-sm border-[1px] border-primary bg-transparent hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isSubmitting ? '[ ALLOCATING... ]' : '[ INITIALIZE ]'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
