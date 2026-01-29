'use client';

import { useState, useCallback } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import { Trash2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  priority: 'HIGH' | 'MED' | 'LOW';
}

interface Column {
  id: string;
  title: string;
  borderColor: string;
  tasks: Task[];
}

interface KanbanBoardProps {
  boardName?: string;
  onDeleteBoard?: () => void;
}

export default function KanbanBoard({ boardName = 'SECTOR_OMEGA', onDeleteBoard }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Record<string, Column>>({
    pending: {
      id: 'pending',
      title: 'PENDING_EXECUTION',
      borderColor: 'border-gray-500',
      tasks: [
        { id: 'TSK-0001', title: 'Setup authentication module', priority: 'HIGH' },
        { id: 'TSK-0002', title: 'Design database schema', priority: 'MED' },
        { id: 'TSK-0003', title: 'Initialize project structure', priority: 'LOW' },
      ],
    },
    processing: {
      id: 'processing',
      title: 'PROCESSING_NODE',
      borderColor: 'border-cyan-400',
      tasks: [
        { id: 'TSK-0004', title: 'Implement API endpoints', priority: 'HIGH' },
        { id: 'TSK-0005', title: 'Build UI components', priority: 'MED' },
      ],
    },
    completed: {
      id: 'completed',
      title: 'COMPLETED_LOGS',
      borderColor: 'border-green-400',
      tasks: [
        { id: 'TSK-0006', title: 'Project initialization', priority: 'LOW' },
        { id: 'TSK-0007', title: 'Environment setup', priority: 'LOW' },
      ],
    },
  });

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const task = sourceColumn.tasks[source.index];

    const newColumns = { ...columns };

    if (source.droppableId === destination.droppableId) {
      const columnTasks = Array.from(sourceColumn.tasks);
      columnTasks.splice(source.index, 1);
      columnTasks.splice(destination.index, 0, task);
      newColumns[source.droppableId].tasks = columnTasks;
    } else {
      sourceColumn.tasks.splice(source.index, 1);
      destColumn.tasks.splice(destination.index, 0, task);
      newColumns[source.droppableId] = sourceColumn;
      newColumns[destination.droppableId] = destColumn;
    }

    setColumns(newColumns);
  };

  const handleAddTask = useCallback((columnId: string, taskTitle: string) => {
    setColumns((prev) => {
      const newColumns = { ...prev };
      const taskId = `TSK-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      const priority = Math.random() > 0.7 ? 'HIGH' : Math.random() > 0.5 ? 'MED' : 'LOW';

      newColumns[columnId].tasks.push({
        id: taskId,
        title: taskTitle,
        priority: priority as 'HIGH' | 'MED' | 'LOW',
      });

      return newColumns;
    });
  }, []);

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
                onAddTask={handleAddTask}
              />
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
