import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';
import { GeistSans } from 'geist/font/sans';
import { Providers } from "./providers";
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { NotificationBell } from "@/components/ui/notification-bell";
import { ChatBot } from "@/components/chat/ChatBot";

export const metadata = {
  title: 'FinTrack - Personal Finance Tracker',
  description: 'Track your investments and financial portfolio with ease',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={GeistSans.className}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ClerkProvider>
          <Providers>
            {/* Background Effects */}
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_50%,rgba(17,17,17,0)_0%,rgba(17,17,17,.4)_100%)] dark:bg-[radial-gradient(45%_40%_at_50%_50%,rgba(255,255,255,0)_0%,rgba(255,255,255,.05)_100%)]" />
            <div className="fixed inset-0 -z-10 grid-pattern opacity-[0.02] dark:opacity-[0.05]" />
            
            {/* Main Layout */}
            <div className="relative flex min-h-screen flex-col">
              {/* Header */}
              <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                  <div className="mr-4 hidden md:flex">
                    <a href="/" className="mr-6 flex items-center space-x-2">
                      <span className="hidden font-bold sm:inline-block">
                        FinTrack
                      </span>
                    </a>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                      <a href="/market" className="transition-colors hover:text-foreground/80 text-foreground/60">Market</a>
                      <a href="/portfolio" className="transition-colors hover:text-foreground/80 text-foreground/60">Portfolio</a>
                      <a href="/analytics" className="transition-colors hover:text-foreground/80 text-foreground/60">Analytics</a>
                      <a href="/settings" className="transition-colors hover:text-foreground/80 text-foreground/60">Settings</a>
                    </nav>
                  </div>
                  <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                      {/* Add search here if needed */}
                    </div>
                    <div className="flex items-center space-x-2">
                      <NotificationBell />
                      <ThemeToggle />
                      <SignedOut>
                        <SignInButton mode="modal">
                          <button className="btn-primary">
                            Sign In
                          </button>
                        </SignInButton>
                      </SignedOut>
                      <SignedIn>
                        <UserButton 
                          appearance={{
                            elements: {
                              avatarBox: "w-8 h-8 rounded-full ring-2 ring-primary/20"
                            }
                          }}
                        />
                      </SignedIn>
                    </div>
                  </div>
                </div>
              </header>

              {/* Main Content */}
              <main className="container py-6">
                {children}
              </main>

              {/* Footer */}
              <footer className="border-t">
                <div className="container flex h-14 items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    &copy; 2025 FinTrack. All rights reserved.
                  </p>
                  <nav className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <a href="/privacy">Privacy</a>
                    <a href="/terms">Terms</a>
                  </nav>
                </div>
              </footer>
            </div>

            {/* Notifications */}
            <NotificationCenter />
            <Toaster position="bottom-right" />
            <ChatBot />
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}