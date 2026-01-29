'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import CyberpunkButton from './CyberpunkButton';
import { CheckCircle2 } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [bootComplete, setBootComplete] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const fullText = '> User_Briefing_Complete.';

  useEffect(() => {
    if (!isOpen || !shouldAnimate) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
        setBootComplete(true);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isOpen, shouldAnimate]);

  useEffect(() => {
    if (isOpen) {
      setShouldAnimate(true);
    } else {
      setDisplayedText('');
      setBootComplete(false);
      setShouldAnimate(false);
    }
  }, [isOpen]);

  const modules = [
    {
      title: 'MODULE_01: WORKSPACES',
      description: 'Organize tasks into isolated Boards.',
    },
    {
      title: 'MODULE_02: KINETIC_SORT',
      description: 'Drag and drop directives to re-prioritize.',
    },
    {
      title: 'MODULE_03: STATUS_TRACK',
      description: 'Monitor task completion in real-time.',
    },
  ];

  const handleGlitchExit = () => {
    onComplete();
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{
              scale: 0.9,
              opacity: 0,
              x: [0, -10, 10, -10, 10, 0],
              transition: { duration: 0.4 },
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <motion.div className="relative w-full max-w-2xl mx-4">
              {/* Modal Container */}
              <div className="border border-primary bg-card p-8 space-y-8">
                {/* Header with blinking animation */}
                <div className="space-y-3">
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-xs text-primary tracking-widest font-mono"
                  >
                    [ BOOT_SEQUENCE_INITIATED ]
                  </motion.div>
                  <div className="text-lg font-mono font-bold text-primary">
                    SYSTEM_INITIALIZATION
                  </div>
                </div>

                {/* Modules List */}
                <div className="space-y-4">
                  {modules.map((module, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 + index * 0.15 }}
                      className="flex gap-4 items-start border-l-2 border-primary/30 pl-4 py-2"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: index * 0.2,
                        }}
                        className="flex-shrink-0 mt-1"
                      >
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      </motion.div>
                      <div className="flex-1 space-y-1">
                        <div className="text-sm font-mono font-semibold text-primary">
                          {module.title}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {module.description}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Typing effect text */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-sm text-muted-foreground font-mono h-6"
                >
                  {displayedText}
                  {displayedText.length > 0 && displayedText.length < fullText.length && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-2 h-4 ml-1 bg-primary"
                    />
                  )}
                </motion.div>

                {/* Action Button */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: bootComplete ? 1 : 0.3,
                    scale: bootComplete ? 1 : 0.8,
                  }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-center pt-4"
                >
                  <CyberpunkButton
                    onClick={handleGlitchExit}
                    disabled={!bootComplete}
                    className="w-full sm:w-auto px-8"
                    variant="primary"
                  >
                    [ ENTER_COMMAND_CENTER ]
                  </CyberpunkButton>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
