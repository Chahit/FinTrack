'use client';

import { NextUIProvider } from '@nextui-org/react';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ClerkProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
      >
        <NextUIProvider>
          <div className="page-transition">
            {children}
          </div>
        </NextUIProvider>
      </NextThemesProvider>
    </ClerkProvider>
  );
}
