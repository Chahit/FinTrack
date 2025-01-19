'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function UserInitializer() {
  const router = useRouter();

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const response = await fetch('/api/auth/user', {
          method: 'POST',
        });
        
        if (!response.ok && response.status === 401) {
          router.push('/sign-in');
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      }
    };

    initializeUser();
  }, [router]);

  return null;
} 