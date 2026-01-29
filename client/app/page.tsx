'use client';

import { useState, useEffect } from 'react';
import KanbanBoard from '@/components/KanbanBoard';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="h-screen bg-background overflow-hidden">
      <KanbanBoard boardName="SECTOR_OMEGA" onDeleteBoard={() => alert('Board deleted')} />
    </div>
  );
}
