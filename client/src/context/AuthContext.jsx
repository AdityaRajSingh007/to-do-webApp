'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { authSync } from '../services/api';
import '@/src/config/firebase'; // Import Firebase config to initialize it

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          // Immediately sync user with backend
          await authSync();
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error syncing user with backend:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    // Clean up subscription
    return unsubscribe;
  }, []);

  const logout = async () => {
    const auth = getAuth();
    await auth.signOut();
  };

  const value = {
    user,
    loading,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};