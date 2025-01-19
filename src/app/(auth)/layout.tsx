"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SideNav } from '@/components/layout/SideNav';
import { TopNav } from '@/components/layout/TopNav';
import { FloatingChat } from '@/components/FloatingChat';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchInterval: 60 * 1000, // 1 minute
    },
  },
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (!session) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen bg-background">
        <SideNav />
        <div className="flex-1 flex flex-col">
          <TopNav />
          <main className="flex-1 overflow-y-auto bg-muted/10">
            {children}
          </main>
          <FloatingChat />
        </div>
      </div>
    </QueryClientProvider>
  );
} 