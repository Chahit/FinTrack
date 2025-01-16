'use client';

import dynamic from 'next/dynamic';

// Dynamically import TopNav with no SSR to avoid hydration issues
const TopNav = dynamic(() => import('./TopNav').then(mod => mod.TopNav), {
  ssr: false,
});

export function TopNavWrapper() {
  return <TopNav />;
} 