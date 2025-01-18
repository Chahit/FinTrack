'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export function UserInitializer() {
  const { userId, isLoaded } = useAuth();

  useEffect(() => {
    const initializeUser = async () => {
      if (userId) {
        try {
          await fetch('/api/auth/user', {
            method: 'POST',
          });
        } catch (error) {
          console.error('Error initializing user:', error);
        }
      }
    };

    if (isLoaded) {
      initializeUser();
    }
  }, [userId, isLoaded]);

  return null;
} 