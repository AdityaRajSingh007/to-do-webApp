import { Draggable } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';
import { useLongPress } from '@/src/hooks/useLongPress';

interface KanbanTaskCardProps {
  id: string;
  title: string;
  priority: 'HIGH' | 'MED' | 'LOW';
  index: number;
  onClick?: (taskId: string) => void;
  isMobile?: boolean;
}

const priorityConfig = {
  HIGH: { bg: 'bg-red-500', text: 'text-black', border: 'border-l-red-500' },
  MED: { bg: 'bg-yellow-500', text: 'text-black', border: 'border-l-yellow-500' },
  LOW: { bg: 'bg-gray-500', text: 'text-white', border: 'border-l-gray-500' },
};

export default function KanbanTaskCard({ id, title, priority, index, onClick, isMobile = false }: KanbanTaskCardProps) {
  // Use long press for mobile to avoid scroll conflicts
  const longPressEvent = useLongPress(() => {
    // Trigger drag start programmatically
    document.dispatchEvent(new CustomEvent('startDrag', { detail: { id } }));
  }, {
    threshold: 500,
    onStart: () => {
      if (isMobile) {
        // Add visual feedback for long press
        const element = document.getElementById(`card-${id}`);
        if (element) {
          element.classList.add('scale-95', 'ring-2', 'ring-green-500');
        }
      }
    },
    onFinish: () => {
      if (isMobile) {
        // Remove visual feedback
        const element = document.getElementById(`card-${id}`);
        if (element) {
          element.classList.remove('scale-95', 'ring-2', 'ring-green-500');
        }
      }
    },
    onCancel: () => {
      if (isMobile) {
        // Remove visual feedback
        const element = document.getElementById(`card-${id}`);
        if (element) {
          element.classList.remove('scale-95', 'ring-2', 'ring-green-500');
        }
      }
    }
  });

  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={(el) => {
            provided.innerRef(el);
            if (el) el.id = `card-${id}`;
          }}
          {...provided.draggableProps}
          className={`
            bg-gray-900 border-l-4 transition-all duration-200 cursor-pointer
            ${priorityConfig[priority].border}
            ${snapshot.isDragging ? 'opacity-50 rotate-1 shadow-lg shadow-green-500/30 z-50' : ''}
            ${isMobile ? '' : 'hover:shadow-md hover:shadow-green-500/20'} p-3 mb-2
            ${isMobile ? 'touch-none' : ''}
          `}
          onClick={() => onClick && onClick(id)}
          {...(isMobile ? longPressEvent : {})}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
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
            {/* Drag Handle - More prominent on mobile */}
            <div
              {...(isMobile ? {} : provided.dragHandleProps)}
              className={`text-gray-500 cursor-grab ${isMobile ? 'mt-1' : 'mt-0'} self-start ${isMobile ? 'opacity-70' : ''}`}
            >
              <GripVertical size={isMobile ? 16 : 14} />
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
