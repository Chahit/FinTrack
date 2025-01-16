'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-16 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Link
            href="/terms"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Terms
          </Link>
          <span className="hidden md:inline text-muted-foreground">•</span>
          <Link
            href="/privacy"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Privacy
          </Link>
          <span className="hidden md:inline text-muted-foreground">•</span>
          <Link
            href="/learn"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Learn More
          </Link>
        </div>
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} FinTrack. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
