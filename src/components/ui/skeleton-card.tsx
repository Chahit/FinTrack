'use client';

import { Card } from './card';
import { Skeleton } from './skeleton';
import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
}

interface SkeletonTableProps {
  rows?: number;
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-4">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </Card>
  );
}

export function SkeletonChartCard({ className }: SkeletonCardProps) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/6" />
        </div>
        <Skeleton className="h-[300px] w-full" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-1/5" />
          <Skeleton className="h-4 w-1/5" />
        </div>
      </div>
    </Card>
  );
}

export function SkeletonTableRow() {
  return (
    <div className="flex items-center space-x-4 py-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, className }: SkeletonTableProps) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-1/4" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} />
          ))}
        </div>
      </div>
    </Card>
  );
} 