'use client';

import { Droppable } from '@hello-pangea/dnd';
import KanbanTaskCard from './KanbanTaskCard';
import { Plus } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  priority: 'HIGH' | 'MED' | 'LOW';
}

interface KanbanColumnProps {
  id: string;
  title: string;
  borderColor: string;
  tasks: Task[];
  onAddTask: (columnId: string) => void;
  onTaskClick?: (taskId: string) => void;
}

export default function KanbanColumn({
  id,
  title,
  borderColor,
  tasks,
  onAddTask,
  onTaskClick,
}: KanbanColumnProps) {
  return (
    <div className={`flex flex-col w-80 bg-transparent border ${borderColor} border-dashed rounded-none`}>
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b border-dashed border-gray-600">
        <h2 className="font-mono text-sm font-bold text-gray-300">{title}</h2>
        <div className="bg-gray-800 border border-gray-600 px-2 py-1 text-xs font-mono text-green-400">
          [ {String(tasks.length).padStart(2, '0')} ]
        </div>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-4 transition-colors ${
              snapshot.isDraggingOver ? 'bg-green-500/5' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <KanbanTaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                priority={task.priority}
                index={index}
                onClick={onTaskClick}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add Protocol Button - Opens CreateTaskModal */}
      <button
        onClick={() => onAddTask(id)}
        className="w-full p-4 border-t border-dashed border-gray-600 text-gray-400 hover:text-green-400 font-mono text-sm transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        [ + ADD_PROTOCOL ]
      </button>
    </div>
  );
}
