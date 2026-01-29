'use client';

import { useState } from 'react';
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
  onAddTask: (columnId: string, taskTitle: string) => void;
}

export default function KanbanColumn({
  id,
  title,
  borderColor,
  tasks,
  onAddTask,
}: KanbanColumnProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleAddTask = () => {
    if (inputValue.trim()) {
      onAddTask(id, inputValue);
      setInputValue('');
      setIsAddingTask(false);
    }
  };

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
              />
            ))}
            {provided.placeholder}

            {/* Inline Add Task Input */}
            {isAddingTask && (
              <div className="mb-2 p-3 bg-gray-900 border border-gray-700">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTask();
                    } else if (e.key === 'Escape') {
                      setIsAddingTask(false);
                      setInputValue('');
                    }
                  }}
                  placeholder="Enter task title..."
                  className="w-full bg-gray-800 border border-green-400 text-white placeholder-gray-500 px-2 py-1 text-xs font-mono focus:outline-none focus:border-green-300 focus:shadow-lg focus:shadow-green-500/30"
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleAddTask}
                    className="flex-1 bg-green-500 text-black px-2 py-1 text-xs font-mono font-bold hover:bg-green-400 transition-colors"
                  >
                    ADD
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingTask(false);
                      setInputValue('');
                    }}
                    className="flex-1 bg-gray-700 text-gray-300 px-2 py-1 text-xs font-mono hover:bg-gray-600 transition-colors"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Droppable>

      {/* Add Protocol Button */}
      <button
        onClick={() => setIsAddingTask(true)}
        className="w-full p-4 border-t border-dashed border-gray-600 text-gray-400 hover:text-green-400 font-mono text-sm transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        [ + ADD_PROTOCOL ]
      </button>
    </div>
  );
}
