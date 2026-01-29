import { useState, useCallback } from 'react';
import { moveTask } from '../services/api';

export const useKanbanLogic = (initialTasks) => {
  const [tasks, setTasks] = useState(initialTasks);

  // Calculate fractional index between two positions
  const calculateFractionalIndex = (prevPos, nextPos) => {
    if (prevPos === null && nextPos === null) return 1000; // First item
    if (prevPos === null) return nextPos / 2; // Top of list
    if (nextPos === null) return prevPos + 1000; // Bottom of list
    return (prevPos + nextPos) / 2; // Between items
  };

  // Handle drag end event
  const onDragEnd = useCallback(async (result) => {
    const { destination, source, draggableId } = result;

    // If no destination or same position, return
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    const taskId = draggableId;
    const newStatus = destination.droppableId;
    const sourceStatus = source.droppableId;

    // Find the task being moved
    const taskToMove = findTaskById(taskId);
    
    if (!taskToMove) return;

    // Get tasks in destination column
    const destinationTasks = tasks[newStatus] || [];
    
    // Calculate new position
    let newPosition;
    if (destination.index === 0) {
      // Moving to top
      const nextTask = destinationTasks[0];
      newPosition = nextTask 
        ? calculateFractionalIndex(null, nextTask.position) 
        : calculateFractionalIndex(null, null);
    } else if (destination.index === destinationTasks.length) {
      // Moving to bottom
      const prevTask = destinationTasks[destination.index - 1];
      newPosition = calculateFractionalIndex(prevTask.position, null);
    } else {
      // Moving between tasks
      const prevTask = destinationTasks[destination.index - 1];
      const nextTask = destinationTasks[destination.index];
      newPosition = calculateFractionalIndex(prevTask.position, nextTask.position);
    }

    // Optimistically update the UI
    setTasks(prevTasks => {
      // Remove task from source column
      const newSourceTasks = prevTasks[sourceStatus].filter(task => task._id !== taskId);
      
      // Add task to destination column with new position
      const updatedTask = { ...taskToMove, status: newStatus, position: newPosition };
      const newDestinationTasks = [...prevTasks[newStatus]];
      
      // Insert at correct position
      newDestinationTasks.splice(destination.index, 0, updatedTask);
      
      // Sort tasks by position in both columns
      const sortedSourceTasks = [...newSourceTasks].sort((a, b) => a.position - b.position);
      const sortedDestinationTasks = [...newDestinationTasks].sort((a, b) => a.position - b.position);
      
      return {
        ...prevTasks,
        [sourceStatus]: sortedSourceTasks,
        [newStatus]: sortedDestinationTasks
      };
    });

    // Update task on the backend
    try {
      await moveTask(taskId, taskToMove.boardId, newStatus, newPosition);
    } catch (error) {
      console.error('Failed to move task:', error);
      // Revert the optimistic update if API call fails
      setTasks(initialTasks);
    }
  }, [tasks]);

  // Helper to find task by ID
  const findTaskById = (id) => {
    for (const status in tasks) {
      const task = tasks[status]?.find(t => t._id === id);
      if (task) return task;
    }
    return null;
  };

  // Handler to add a new task
  const addTask = useCallback((newTask, status = 'PENDING') => {
    setTasks(prevTasks => ({
      ...prevTasks,
      [status]: [
        ...(prevTasks[status] || []),
        { ...newTask, status, position: (prevTasks[status]?.length || 0) * 1000 + 1000 }
      ].sort((a, b) => a.position - b.position)
    }));
  }, []);

  return {
    tasks,
    onDragEnd,
    addTask
  };
};