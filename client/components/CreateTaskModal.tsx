'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X } from 'lucide-react';

interface SubRoutine {
  id: string;
  text: string;
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: {
    title: string;
    priority: 'LOW' | 'MED' | 'CRIT';
    deadline: string;
    description: string;
    subtasks: SubRoutine[];
  }) => void;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MED' | 'CRIT'>('MED');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState<SubRoutine[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSubtask = () => {
    if (subtaskInput.trim()) {
      const newSubtask: SubRoutine = {
        id: Date.now().toString(),
        text: subtaskInput.trim(),
      };
      setSubtasks([...subtasks, newSubtask]);
      setSubtaskInput('');
    }
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleSubtaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubtask();
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        title,
        priority,
        deadline,
        description,
        subtasks,
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setPriority('MED');
    setDeadline('');
    setDescription('');
    setSubtasks([]);
    setSubtaskInput('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              {/* Modal Container */}
              <div className="border-[1px] border-primary bg-card max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="border-b-[1px] border-primary bg-card px-6 py-4 sticky top-0">
                  <div className="text-sm font-mono text-primary tracking-widest">
                    /// INITIALIZE_NEW_PROTOCOL
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-6">
                  {/* Title Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-mono text-muted-foreground">
                      &gt; DIRECTIVE_NAME:
                    </label>
                    <motion.input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. IMPLEMENT_AUTHENTICATION"
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 bg-input border-[1px] border-muted text-foreground font-mono text-base placeholder-muted-foreground transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(0,255,65,0.3)] disabled:opacity-50 disabled:cursor-not-allowed caret-block"
                      autoFocus
                    />
                  </div>

                  {/* Priority & Deadline Row */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Priority */}
                    <div className="space-y-3">
                      <label className="text-sm font-mono text-muted-foreground">
                        PRIORITY_LEVEL:
                      </label>
                      <div className="flex gap-2">
                        {(['LOW', 'MED', 'CRIT'] as const).map((p) => (
                          <motion.button
                            key={p}
                            onClick={() => setPriority(p)}
                            disabled={isSubmitting}
                            animate={
                              p === 'CRIT' && priority === 'CRIT'
                                ? { x: [0, -2, 2, -2, 0] }
                                : {}
                            }
                            transition={
                              p === 'CRIT' && priority === 'CRIT'
                                ? { duration: 0.5, repeat: Infinity }
                                : {}
                            }
                            className={`flex-1 py-2 text-xs font-mono border-[1px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                              priority === p
                                ? p === 'LOW'
                                  ? 'bg-muted text-foreground border-muted'
                                  : p === 'MED'
                                    ? 'bg-yellow-500/30 text-yellow-300 border-yellow-500'
                                    : 'bg-destructive/30 text-destructive border-destructive'
                                : p === 'LOW'
                                  ? 'border-muted text-muted-foreground bg-transparent hover:bg-muted/20'
                                  : p === 'MED'
                                    ? 'border-yellow-500/50 text-yellow-300/70 bg-transparent hover:bg-yellow-500/10'
                                    : 'border-destructive/50 text-destructive/70 bg-transparent hover:bg-destructive/10'
                            }`}
                          >
                            [ {p} ]
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Deadline */}
                    <div className="space-y-3">
                      <label className="text-sm font-mono text-muted-foreground">
                        EXECUTION_DEADLINE:
                      </label>
                      <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full px-4 py-2 bg-input border-[1px] border-muted text-foreground font-mono text-sm placeholder-muted-foreground transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(0,255,65,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-mono text-muted-foreground">
                      &gt; OPERATIONAL_DETAILS:
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter task description..."
                      disabled={isSubmitting}
                      rows={3}
                      className="w-full px-4 py-3 bg-input border-[1px] border-muted text-foreground font-mono text-sm placeholder-muted-foreground transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(0,255,65,0.3)] disabled:opacity-50 disabled:cursor-not-allowed resize-none caret-block"
                    />
                  </div>

                  {/* Sub-Routines */}
                  <div className="space-y-3">
                    <label className="text-sm font-mono text-muted-foreground">
                      SUB_ROUTINES:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={subtaskInput}
                        onChange={(e) => setSubtaskInput(e.target.value)}
                        onKeyDown={handleSubtaskKeyDown}
                        placeholder="e.g. Setup database connection"
                        disabled={isSubmitting}
                        className="flex-1 px-3 py-2 bg-input border-[1px] border-muted text-foreground font-mono text-sm placeholder-muted-foreground transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(0,255,65,0.3)] disabled:opacity-50 disabled:cursor-not-allowed caret-block"
                      />
                      <button
                        onClick={handleAddSubtask}
                        disabled={isSubmitting || !subtaskInput.trim()}
                        className="px-4 py-2 bg-primary text-primary-foreground font-mono text-sm border-[1px] border-primary transition-all duration-200 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        [ + ]
                      </button>
                    </div>

                    {/* Subtasks List */}
                    {subtasks.length > 0 && (
                      <motion.div className="space-y-2 mt-3 p-3 bg-input/50 border-[1px] border-muted/30">
                        {subtasks.map((task, idx) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex items-center justify-between gap-3 text-sm font-mono text-muted-foreground group"
                          >
                            <span>
                              // {String(idx + 1).padStart(2, '0')}. {task.text}
                            </span>
                            <button
                              onClick={() => handleRemoveSubtask(task.id)}
                              disabled={isSubmitting}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Remove subtask"
                            >
                              <X size={16} />
                            </button>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t-[1px] border-primary flex gap-3 px-6 py-4 bg-card sticky bottom-0">
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 py-2 text-destructive font-mono text-sm border-0 bg-transparent hover:bg-destructive/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    [ DISCARD_DRAFT ]
                  </button>
                  <motion.button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !title.trim()}
                    animate={isSubmitting ? { x: [0, -2, 2, -2, 0] } : {}}
                    transition={isSubmitting ? { duration: 0.4, repeat: Infinity } : {}}
                    className="flex-1 py-2 text-primary-foreground font-mono text-sm border-[1px] border-primary bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isSubmitting ? 'UPLOADING...' : '[ UPLOAD_PROTOCOL ]'}
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
