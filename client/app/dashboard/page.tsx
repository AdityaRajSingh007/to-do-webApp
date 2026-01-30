'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardMain from '@/components/DashboardMain';
import KanbanBoard from '@/components/KanbanBoard';
import CreateBoardModal from '@/components/CreateBoardModal';
import OnboardingModal from '@/components/OnboardingModal';
import { fetchBoards, createBoard } from '@/src/services/api';

interface Board {
  _id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, showOnboarding, setShowOnboarding, completeOnboarding } = useAuth();
  const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [activeBoardTitle, setActiveBoardTitle] = useState<string | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [boardsLoading, setBoardsLoading] = useState(false);

  useEffect(() => {
    // If user is not authenticated and not loading, redirect to auth page
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Load boards when user is authenticated
  useEffect(() => {
    const loadBoards = async () => {
      // Only proceed if user is truly authenticated (has uid)
      if (user && user.uid && !boardsLoading) {
        try {
          setBoardsLoading(true);
          const response = await fetchBoards();
          if (response.data.success) {
            setBoards(response.data.boards || []);
          }
        } catch (error) {
          console.error('Error fetching boards:', error);
        } finally {
          setBoardsLoading(false);
        }
      }
    };

    // Only run if user is loaded and authenticated
    if (!loading) {
      loadBoards();
    }
  }, [user, loading]); // Added loading to dependency array

  // Show nothing while checking auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-primary font-mono">LOADING...</div>
      </div>
    );
  }

  // If user is not authenticated, don't render anything (redirect happens in useEffect)
  if (!user) {
    return null;
  }

  const handleCreateSector = () => {
    setShowCreateBoardModal(true);
  };

  const handleBoardCreated = async (boardTitle: string) => {
    try {
      // Create the board via API
      const response = await createBoard(boardTitle);
      if (response.data.success && response.data.board) {
        // Add the new board to our local state
        const newBoard = response.data.board;
        setBoards(prev => [...prev, newBoard]);
        
        // Set this as the active board
        setActiveBoardId(newBoard._id);
        setActiveBoardTitle(newBoard.title);
      } else {
        throw new Error(response.data.message || 'Failed to create board');
      }
    } catch (error) {
      console.error('Error creating board:', error);
      throw error; // Re-throw to be caught by the modal
    }
  };

  const handleSelectBoard = (boardId: string, boardTitle: string) => {
    setActiveBoardId(boardId);
    setActiveBoardTitle(boardTitle);
  };

  const handleDeleteBoard = () => {
    // Remove the deleted board from the boards list
    if (activeBoardId) {
      setBoards(prev => prev.filter(board => board._id !== activeBoardId));
    }
    setActiveBoardId(null);
    setActiveBoardTitle(null);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar 
        onCreateSector={handleCreateSector} 
        onBoardSelect={handleSelectBoard}
        boards={boards}
        activeBoardId={activeBoardId}
      />
      
      {activeBoardId ? (
        <KanbanBoard 
          boardId={activeBoardId} 
          boardName={activeBoardTitle || 'SECTOR_OMEGA'} 
          onDeleteBoard={handleDeleteBoard} 
        />
      ) : (
        <DashboardMain />
      )}

      <CreateBoardModal
        isOpen={showCreateBoardModal}
        onClose={() => setShowCreateBoardModal(false)}
        onSubmit={handleBoardCreated}
      />
      
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={completeOnboarding}
      />
    </div>
  );
}