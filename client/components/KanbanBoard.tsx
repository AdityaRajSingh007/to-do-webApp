'use client';

import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import CreateTaskModal from './CreateTaskModal';
import TaskDetailsModal from './TaskDetailsModal';
import { Trash2, Plus } from 'lucide-react';
import { fetchBoardDetails, moveTask, createTask } from '@/src/services/api';
import { useToast } from '@/hooks/use-toast';

interface BoardTask {
  _id: string;
  id?: string; // fallback for backward compatibility
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  priority: 'CRIT' | 'MED' | 'LOW';
  position: number;
  boardId?: string;
}

interface ColumnTask {
  id: string;
  title: string;
  priority: 'HIGH' | 'MED' | 'LOW'; // Map backend priority to frontend priority
}

interface BoardApiResponse {
  success: boolean;
  message?: string; // Optional message field
  board: {
    _id: string;
    title: string;
    columns: string[];
    userId: string;
    createdAt: string;
    updatedAt: string;
  };
  tasks: {
    PENDING: BoardTask[];
    IN_PROGRESS: BoardTask[];
    DONE: BoardTask[];
  };
}

interface Column {
  id: string;
  title: string;
  borderColor: string;
  tasks: ColumnTask[];
}

interface KanbanBoardProps {
  boardId: string; // Changed from boardName to boardId to match API
  boardName?: string;
  onDeleteBoard?: () => void;
}

export default function KanbanBoard({ boardId, boardName = 'SECTOR_OMEGA', onDeleteBoard }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Record<string, Column>>({
    pending: {
      id: 'PENDING',
      title: 'PENDING_EXECUTION',
      borderColor: 'border-gray-500',
      tasks: [],
    },
    processing: {
      id: 'IN_PROGRESS',
      title: 'PROCESSING_NODE',
      borderColor: 'border-cyan-400',
      tasks: [],
    },
    completed: {
      id: 'DONE',
      title: 'COMPLETED_LOGS',
      borderColor: 'border-green-400',
      tasks: [],
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string>('PENDING');
  const { toast } = useToast();

  // Helper function to map backend priority to frontend priority
  const mapPriority = (backendPriority: 'CRIT' | 'MED' | 'LOW'): 'HIGH' | 'MED' | 'LOW' => {
    switch (backendPriority) {
      case 'CRIT':
        return 'HIGH';
      case 'MED':
        return 'MED';
      case 'LOW':
        return 'LOW';
      default:
        return 'MED';
    }
  };

  // Fetch board data when component mounts or boardId changes
  useEffect(() => {
    const loadBoardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetchBoardDetails(boardId);
        const boardData: BoardApiResponse = response.data;

        if (!boardData.success) {
          throw new Error(boardData.message || 'Failed to load board data');
        }

        // Transform the tasks into the format expected by the UI
        const transformedColumns = {
          pending: {
            id: 'PENDING',
            title: 'PENDING_EXECUTION',
            borderColor: 'border-gray-500',
            tasks: (boardData.tasks.PENDING || []).map(task => ({
              id: task._id,
              title: task.title,
              priority: mapPriority(task.priority),
            })),
          },
          processing: {
            id: 'IN_PROGRESS',
            title: 'PROCESSING_NODE',
            borderColor: 'border-cyan-400',
            tasks: (boardData.tasks.IN_PROGRESS || []).map(task => ({
              id: task._id,
              title: task.title,
              priority: mapPriority(task.priority),
            })),
          },
          completed: {
            id: 'DONE',
            title: 'COMPLETED_LOGS',
            borderColor: 'border-green-400',
            tasks: (boardData.tasks.DONE || []).map(task => ({
              id: task._id,
              title: task.title,
              priority: mapPriority(task.priority),
            })),
          },
        };

        setColumns(transformedColumns);
      } catch (err) {
        console.error('Error loading board data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load board data');
        toast({
          title: 'Error',
          description: 'Failed to load board data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (boardId) {
      loadBoardData();
    }
  }, [boardId, toast]);

  // For proper drag and drop functionality, we need to maintain both frontend and backend task data
  // Let's store backend tasks separately to access their properties like position
  const [backendTasks, setBackendTasks] = useState<Record<string, BoardTask>>({});

  // Update backend tasks when board data loads
  useEffect(() => {
    const allBackendTasks: Record<string, BoardTask> = {};
    
    // Combine all tasks from all statuses
    Object.values(columns).forEach(column => {
      column.tasks.forEach(frontendTask => {
        // We need to map frontend task ID to backend task data
        // For this, we'll need to store the original backend data when loading
      });
    });
    
    // This is a simplified approach - in a real app, we'd need to store the original backend data
  }, [columns]);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Determine the new status based on the destination column
    let newStatus: 'PENDING' | 'IN_PROGRESS' | 'DONE';
    switch (destination.droppableId) {
      case 'PENDING':
        newStatus = 'PENDING';
        break;
      case 'IN_PROGRESS':
        newStatus = 'IN_PROGRESS';
        break;
      case 'DONE':
        newStatus = 'DONE';
        break;
      default:
        newStatus = 'PENDING';
    }

    // Calculate new position based on drag position
    // For simplicity, we'll use basic position calculations
    let newPosition = 0;

    // Make the API call to move the task
    try {
      await moveTask(draggableId, boardId, newStatus, newPosition);

      // Optimistically update the UI
      const newColumns = { ...columns };

      // Find source column and task
      let sourceColKey: string | undefined;
      for (const [key, col] of Object.entries(columns)) {
        if (col.tasks.some(t => t.id === draggableId)) {
          sourceColKey = key;
          break;
        }
      }

      if (sourceColKey) {
        // Remove from source
        const sourceCol = newColumns[sourceColKey];
        const [movedTask] = sourceCol.tasks.splice(source.index, 1);

        // Add to destination
        const destCol = newColumns[destination.droppableId];
        destCol.tasks.splice(destination.index, 0, movedTask);

        setColumns(newColumns);
      }

      toast({
        title: 'Success',
        description: 'Task moved successfully',
      });
    } catch (error) {
      console.error('Error moving task:', error);
      toast({
        title: 'Error',
        description: 'Failed to move task. Please try again.',
        variant: 'destructive',
      });
      
      // In a real implementation, we would revert the UI changes here
    }
  };

  const handleCreateTask = async (taskData: {
    title: string;
    priority: 'LOW' | 'MED' | 'CRIT';
    deadline: string;
    description: string;
    subtasks: { id: string; text: string }[];
  }) => {
    try {
      // Format subtasks for the backend (only send the text, not the id)
      const formattedSubtasks = taskData.subtasks.map(st => ({
        title: st.text,
        isCompleted: false
      }));

      // Call the API to create the task
      const response = await createTask(boardId, {
        title: taskData.title,
        description: taskData.description,
        status: selectedColumn as 'PENDING' | 'IN_PROGRESS' | 'DONE',
        priority: taskData.priority,
        subtasks: formattedSubtasks,
        position: Date.now(), // Simple positioning for now
      });

      if (response.data.success && response.data.task) {
        // Update the UI to include the new task
        const newTask = response.data.task;
        
        // Convert the backend task to the format expected by the UI
        const uiTask = {
          id: newTask._id,
          title: newTask.title,
          priority: mapPriority(newTask.priority),
        };

        // Add the task to the appropriate column
        setColumns(prev => ({
          ...prev,
          [selectedColumn.toLowerCase()]: {
            ...prev[selectedColumn.toLowerCase()],
            tasks: [...prev[selectedColumn.toLowerCase()].tasks, uiTask]
          }
        }));

        toast({
          title: 'Success',
          description: 'Task created successfully',
        });
      } else {
        throw new Error(response.data.message || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const openCreateTaskModal = (columnId: string) => {
    setSelectedColumn(columnId);
    setShowCreateTaskModal(true);
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowTaskDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h1 className="text-2xl font-mono font-bold text-green-400 tracking-wider">
            {boardName}
          </h1>
          <button
            onClick={onDeleteBoard}
            className="flex items-center gap-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black px-3 py-2 font-mono text-sm transition-all"
          >
            <Trash2 size={16} />
            [ DELETE_SECTOR ]
          </button>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-primary font-mono">LOADING BOARD...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h1 className="text-2xl font-mono font-bold text-green-400 tracking-wider">
            {boardName}
          </h1>
          <button
            onClick={onDeleteBoard}
            className="flex items-center gap-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black px-3 py-2 font-mono text-sm transition-all"
          >
            <Trash2 size={16} />
            [ DELETE_SECTOR ]
          </button>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-red-500 font-mono">ERROR: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
        <h1 className="text-2xl font-mono font-bold text-green-400 tracking-wider">
          {boardName}
        </h1>
        <button
          onClick={onDeleteBoard}
          className="flex items-center gap-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black px-3 py-2 font-mono text-sm transition-all"
        >
          <Trash2 size={16} />
          [ DELETE_SECTOR ]
        </button>
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 p-6 min-w-max">
            {Object.values(columns).map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                borderColor={column.borderColor}
                tasks={column.tasks}
                onAddTask={(columnId: string, taskTitle: string) => {
                  // For the modal, we only need the columnId, so we'll ignore the taskTitle
                  // and open the modal instead of creating a task directly
                  setSelectedColumn(columnId);
                  setShowCreateTaskModal(true);
                }}
                onTaskClick={handleTaskClick}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        onSubmit={handleCreateTask}
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        isOpen={showTaskDetailsModal}
        onClose={() => setShowTaskDetailsModal(false)}
        taskId={selectedTaskId || undefined}
      />
    </div>
  );
}
