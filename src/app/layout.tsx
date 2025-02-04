'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import NextAuthProvider from "@/components/providers/session-provider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchInterval: 60 * 1000, // 1 minute
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextAuthProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <AuroraBackground className="min-h-screen">
                {children}
                <Toaster />
              </AuroraBackground>
            </ThemeProvider>
          </QueryClientProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}