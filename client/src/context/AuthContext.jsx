'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { authSync } from '../services/api';
import '@/src/config/firebase'; // Import Firebase config to initialize it

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false); // Moved this to the top

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          try {
            // Immediately sync user with backend
            await authSync();
            
            // Check if this is a first-time user by checking localStorage
            const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
            if (!hasSeenOnboarding) {
              setShowOnboarding(true);
            }
            
            setUser(currentUser);
          } catch (syncError) {
            console.error('Error syncing user with backend:', syncError);
            // Log the user out if sync fails to prevent inconsistent state
            await getAuth().signOut();
            setUser(null);
            setShowOnboarding(false);
          }
        } else {
          setUser(null);
          setShowOnboarding(false);
        }
      } catch (error) {
        console.error('Error syncing user with backend:', error);
        setUser(null);
        setShowOnboarding(false);
      } finally {
        setLoading(false);
      }
    });

    // Clean up subscription
    return unsubscribe;
  }, []); // Empty dependency array to ensure this only runs once

  const logout = async () => {
    const auth = getAuth();
    await signOut(auth);
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  const value = {
    user,
    loading,
    logout,
    showOnboarding,
    setShowOnboarding,
    completeOnboarding
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};