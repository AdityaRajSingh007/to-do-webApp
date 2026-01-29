import { Draggable } from '@hello-pangea/dnd';

interface KanbanTaskCardProps {
  id: string;
  title: string;
  priority: 'HIGH' | 'MED' | 'LOW';
  index: number;
}

const priorityConfig = {
  HIGH: { bg: 'bg-red-500', text: 'text-black', border: 'border-l-red-500' },
  MED: { bg: 'bg-yellow-500', text: 'text-black', border: 'border-l-yellow-500' },
  LOW: { bg: 'bg-gray-500', text: 'text-white', border: 'border-l-gray-500' },
};

export default function KanbanTaskCard({ id, title, priority, index }: KanbanTaskCardProps) {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            bg-gray-900 border-l-4 transition-all duration-200
            ${priorityConfig[priority].border}
            ${snapshot.isDragging ? 'opacity-50 rotate-1 shadow-lg shadow-green-500/30' : ''}
            hover:shadow-md hover:shadow-green-500/20 p-3 mb-2
          `}
        >
          <div className="text-xs text-gray-500 mb-2">
            {id}
          </div>
          <div className="text-white text-sm font-medium mb-2 break-words">
            {title}
          </div>
          <div className={`inline-block px-2 py-1 text-xs font-bold ${priorityConfig[priority].bg} ${priorityConfig[priority].text}`}>
            {priority}
          </div>
        </div>
      )}
    </Draggable>
  );
}
