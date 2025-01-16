import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'light';
}

export function Loading({ className, size = 'md', variant = 'default' }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  const variantClasses = {
    default: 'border-primary border-t-transparent',
    light: 'border-white border-t-transparent',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    />
  );
}

interface LoadingOverlayProps extends LoadingProps {
  message?: string;
}

export function LoadingOverlay({ message, ...props }: LoadingOverlayProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loading {...props} />
      {message && (
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}

interface LoadingCardProps extends LoadingProps {
  message?: string;
  height?: string;
}

export function LoadingCard({ message, height = 'h-[200px]', ...props }: LoadingCardProps) {
  return (
    <div className={cn('relative w-full rounded-lg border bg-card', height)}>
      <LoadingOverlay message={message} {...props} />
    </div>
  );
} 