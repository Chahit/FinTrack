"use client";

import { cn } from '@/utils/cn';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient';
  title?: string;
  description?: string;
}

export function PageContainer({
  children,
  className,
  variant = 'default',
  title,
  description,
}: PageContainerProps) {
  return (
    <div className={cn(
      'container mx-auto px-4 py-8',
      variant === 'gradient' && 'bg-gradient-to-b from-background to-muted/50',
      className
    )}>
      {title && (
        <div className="mb-8">
          <h1 className="text-4xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
