'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import AuthForm from '@/components/AuthForm';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // If user is authenticated and not loading, redirect to dashboard
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Show auth form if not loading and user is not authenticated
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-primary font-mono">LOADING...</div>
      </div>
    );
  }

  if (user) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="h-screen bg-background overflow-hidden">
      <AuthForm />
    </div>
  );
}
