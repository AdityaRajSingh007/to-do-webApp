'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { getTaskById, updateTask, deleteTask } from '@/src/services/api';

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string;
  taskTitle?: string;
  taskDescription?: string;
  taskPriority?: 'LOW' | 'MED' | 'CRIT';
  taskDeadline?: string;
  taskSubtasks?: SubTask[];
  onTaskUpdate?: () => void; // Callback to refresh board after task update
}

export default function TaskDetailsModal({
  isOpen,
  onClose,
  taskId,
  taskTitle,
  taskDescription,
  taskPriority,
  taskDeadline,
  taskSubtasks,
  onTaskUpdate,
}: TaskDetailsModalProps) {
  const [title, setTitle] = useState(taskTitle || '');
  const [description, setDescription] = useState(taskDescription || '');
  const [priority, setPriority] = useState(taskPriority || 'MED');
  const [subtasks, setSubtasks] = useState<SubTask[]>(taskSubtasks || []);
  const [deadline, setDeadline] = useState(taskDeadline || '');
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState({}); // Track original data to detect changes

  // Fetch task details when modal opens and taskId is provided
  useEffect(() => {
    if (isOpen && taskId) {
      const fetchTaskDetails = async () => {
        try {
          setLoading(true);
          const response = await getTaskById(taskId);
          const task = response.data.task;
          
          // Map the subtasks from the API response to match our interface
          const mappedSubtasks: SubTask[] = task.subtasks?.map((st: any) => ({
            id: st._id || st.id || Math.random().toString(36).substr(2, 9),
            title: st.title,
            completed: st.isCompleted || st.completed || false
          })) || [];

          setTitle(task.title);
          setDescription(task.description);
          setPriority(task.priority);
          setSubtasks(mappedSubtasks);
          
          // Set the deadline if provided in the task or fallback to prop
          setDeadline(task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : taskDeadline || '');
          
          // Store original data to detect changes
          setOriginalData({
            title: task.title,
            description: task.description,
            priority: task.priority,
            subtasks: mappedSubtasks,
            deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : taskDeadline || ''
          });
        } catch (error) {
          console.error('Error fetching task details:', error);
          // Fallback to props if API call fails
          setTitle(taskTitle || '');
          setDescription(taskDescription || '');
          setPriority(taskPriority || 'MED');
          setSubtasks(taskSubtasks || []);
          setDeadline(taskDeadline || '');
          
          // Store original data to detect changes
          setOriginalData({
            title: taskTitle || '',
            description: taskDescription || '',
            priority: taskPriority || 'MED',
            subtasks: taskSubtasks || [],
            deadline: taskDeadline || ''
          });
        } finally {
          setLoading(false);
        }
      };

      fetchTaskDetails();
    } else if (isOpen) {
      // If no taskId is provided, use the passed props directly
      setTitle(taskTitle || '');
      setDescription(taskDescription || '');
      setPriority(taskPriority || 'MED');
      setSubtasks(taskSubtasks || []);
      setDeadline(taskDeadline || '');
      
      // Store original data to detect changes
      setOriginalData({
        title: taskTitle || '',
        description: taskDescription || '',
        priority: taskPriority || 'MED',
        subtasks: taskSubtasks || [],
        deadline: taskDeadline || ''
      });
      
      setLoading(false);
    }
  }, [isOpen, taskId, taskTitle, taskDescription, taskPriority, taskSubtasks, taskDeadline]);

  const completedCount = subtasks.filter((s) => s.completed).length;
  const completionPercent = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((s) =>
        s.id === id ? { ...s, completed: !s.completed } : s
      )
    );
  };

  // Handle saving updated task data
  const saveTaskUpdates = async () => {
    if (!taskId) return;
    
    setIsSaving(true);
    try {
      // Convert subtasks back to the format expected by the API
      const apiSubtasks = subtasks.map(st => ({
        title: st.title,
        isCompleted: st.completed
      }));
      
      await updateTask(taskId, {
        title,
        description,
        priority,
        deadline: deadline || undefined,
        subtasks: apiSubtasks
      });
      
      // Update last saved time
      setLastSaved(new Date().toLocaleTimeString());
      
      // Call the callback to refresh the board
      if (onTaskUpdate) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle manual save button click
  const handleManualSave = async () => {
    await saveTaskUpdates();
  };

  const handleDelete = async () => {
    if (!taskId) return;
    
    setIsDeleting(true);
    try {
      await deleteTask(taskId);
      onClose();
    } catch (error) {
      console.error('Error deleting task:', error);
      // Still close the modal even if there's an error to allow user to try again
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Calculate days until deadline
  const daysUntilDue = () => {
    if (!deadline) return 0; // Return 0 if no deadline is set
    
    const today = new Date();
    const actualDeadline = new Date(deadline);
    const diffTime = actualDeadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
            onClick={onClose}
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
              className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden"
            >
              {/* Modal Container */}
              <div className="border-[1px] border-primary bg-card flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="border-b-[1px] border-primary bg-card px-6 py-4 flex items-center justify-between">
                  <div className="text-xs font-mono text-muted-foreground tracking-widest">
                    ID: {taskId} // STATUS: [ PENDING ]
                  </div>
                  <button
                    onClick={onClose}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto flex divide-x divide-primary">
                  {/* Left Column - 70% */}
                  <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-input">
                    {/* Title */}
                    <div className="space-y-2">
                       <input
                         type="text"
                         value={title}
                         onChange={(e) => setTitle(e.target.value)}
                         className="w-full text-2xl font-bold text-primary bg-transparent border-0 focus:outline-none p-0 font-mono"
                       />
                    </div>

                     {/* Description */}
                     <div className="space-y-2">
                       <label className="text-xs font-mono text-muted-foreground">
                         {'>'} DATA_LOG:
                       </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full min-h-32 px-4 py-3 bg-input border-[1px] border-muted text-foreground font-mono text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                          placeholder="Enter task details..."
                        />
                     </div>

                     {/* Deadline */}
                     <div className="space-y-2">
                       <label className="text-xs font-mono text-muted-foreground">
                         {'>'} DEADLINE:
                       </label>
                       <input
                         type="date"
                         value={deadline}
                         onChange={(e) => setDeadline(e.target.value)}
                         className="w-full px-4 py-2 bg-input border-[1px] border-muted text-foreground font-mono text-sm focus:outline-none focus:border-primary transition-colors"
                       />
                     </div>

                    {/* Checklist */}
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-mono text-muted-foreground mb-2">
                          SUB_ROUTINES_STATUS:
                        </div>
                        <div className="w-full h-[2px] bg-muted mb-4">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${completionPercent}%` }}
                            className="h-full bg-primary"
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        {subtasks.map((subtask) => (
                          <motion.div
                            key={subtask.id}
                            onClick={() => handleToggleSubtask(subtask.id)}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            <div
                              className={`font-mono text-sm transition-all ${
                                subtask.completed
                                  ? 'text-primary'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {subtask.completed ? '[x]' : '[ ]'}
                            </div>
                            <span
                              className={`font-mono text-sm transition-all ${
                                subtask.completed
                                  ? 'text-muted-foreground line-through'
                                  : 'text-foreground group-hover:text-primary'
                              }`}
                            >
                              {subtask.title}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - 30% */}
                  <div className="w-[30%] px-4 py-6 flex flex-col justify-between border-l-[1px] border-dashed border-primary">
                    {/* Priority Selector */}
                    <div className="space-y-2">
                      <div className="text-xs font-mono text-muted-foreground mb-3">
                        PRIORITY_LEVEL:
                      </div>
                      <div className="space-y-2">
                        {(['LOW', 'MED', 'CRIT'] as const).map((p) => (
                          <button
                            key={p}
                             onClick={() => setPriority(p)}
                            className={`w-full px-3 py-2 font-mono text-xs border-[1px] transition-all ${
                              priority === p
                                ? 'border-primary bg-primary/20 text-primary'
                                : p === 'CRIT'
                                  ? 'border-destructive text-destructive hover:bg-destructive/10'
                                  : 'border-muted text-muted-foreground hover:border-primary hover:text-primary'
                            }`}
                          >
                            [ {p} ]
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-2">
                       <div className="text-xs font-mono text-muted-foreground">
                         DUE_DATE:
                       </div>
                       <div className="text-sm font-mono text-primary">
                         {deadline ? `T-MINUS ${daysUntilDue()} DAYS` : 'NO DEADLINE SET'}
                       </div>
                       <div className="text-xs font-mono text-muted-foreground">
                         {deadline ? new Date(deadline).toLocaleDateString() : 'NOT SET'}
                       </div>
                    </div>

                    {/* Save Button */}
                    <div className="space-y-2">
                      <motion.button
                        onClick={handleManualSave}
                        disabled={isSaving}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-2 px-3 font-mono text-xs border-[1px] border-primary text-primary bg-primary/10 hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                      >
                        {isSaving ? (
                          <span>SAVING...</span>
                        ) : (
                          <>
                            <Save size={12} />
                            [ SAVE CHANGES ]
                          </>
                        )}
                      </motion.button>
                      
                      {lastSaved && (
                        <div className="text-xs font-mono text-muted-foreground text-center">
                          Last saved: {lastSaved}
                        </div>
                      )}
                    </div>

                    {/* Delete Button */}
                    <div>
                      {!showDeleteConfirm ? (
                        <motion.button
                          onHoverStart={() => setShowDeleteConfirm(false)}
                          onClick={() => setShowDeleteConfirm(true)}
                          whileHover="hover"
                          className="w-full py-2 px-3 font-mono text-xs border-[1px] border-destructive text-destructive bg-transparent hover:bg-destructive/10 transition-colors"
                        >
                          [ TERMINATE_PROTOCOL ]
                        </motion.button>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="space-y-2"
                        >
                          <div className="text-xs font-mono text-destructive text-center">
                            CONFIRM?
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowDeleteConfirm(false)}
                              className="flex-1 py-1 px-2 font-mono text-xs border-[1px] border-muted text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                            >
                              [ NO ]
                            </button>
                            <motion.button
                              onClick={handleDelete}
                              animate={isDeleting ? { x: [0, -2, 2, -2, 0] } : {}}
                              transition={
                                isDeleting ? { duration: 0.4 } : undefined
                              }
                              className="flex-1 py-1 px-2 font-mono text-xs border-[1px] border-destructive text-destructive hover:bg-destructive/20 transition-colors"
                            >
                              [ YES ]
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
