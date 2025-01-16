"use client";
import { cn } from "@/lib/utils";
import React from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: React.ReactNode;
  showRadialGradient?: boolean;
}

export function AuroraBackground({
  children,
  showRadialGradient = true,
  className,
  ...props
}: AuroraBackgroundProps) {
  return (
    <main
      className={cn(
        "relative flex min-h-screen flex-col bg-background",
        className
      )}
      {...props}
    >
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: `
            linear-gradient(
              125deg,
              hsl(var(--color-1)),
              hsl(var(--color-2)),
              hsl(var(--color-3)),
              hsl(var(--color-4)),
              hsl(var(--color-5))
            )
          `,
          backgroundSize: "400% 400%",
          animation: "aurora 120s linear infinite",
          opacity: 0.15,
        }}
      />
      {showRadialGradient && (
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: "radial-gradient(circle at center, transparent 20%, var(--background) 80%)",
          }}
        />
      )}
      {children}
    </main>
  );
} 