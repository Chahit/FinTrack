import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const FlatCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg bg-card text-card-foreground shadow-sm dark:border-none light:border light:border-black",
        className
      )}
      {...props}
    />
  )
);
FlatCard.displayName = "FlatCard";

const FlatCardHeader = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
);
FlatCardHeader.displayName = "FlatCardHeader";

const FlatCardContent = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
FlatCardContent.displayName = "FlatCardContent";

export { FlatCard, FlatCardHeader, FlatCardContent }; 