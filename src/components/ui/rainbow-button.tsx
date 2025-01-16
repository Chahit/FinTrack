import * as React from "react";
import { cn } from "@/lib/utils";

interface RainbowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  gradient?: boolean;
  children: React.ReactNode;
  className?: string;
  speed?: string;
}

const RainbowButton = React.forwardRef<HTMLButtonElement, RainbowButtonProps>(
  ({ className, gradient, children, speed = "2s", ...props }, ref) => {
    return (
      <button
        className={cn(
          "relative inline-flex h-10 items-center justify-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:hover:bg-neutral-800 dark:focus:ring-neutral-400 dark:focus:ring-offset-neutral-900",
          "before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:p-[2px]",
          gradient &&
            "before:animate-rainbow before:bg-[linear-gradient(to_right,theme(colors.color-1),theme(colors.color-2),theme(colors.color-3),theme(colors.color-4),theme(colors.color-5),theme(colors.color-1))] before:bg-[length:200%_auto]",
          className
        )}
        ref={ref}
        style={{ "--speed": speed } as React.CSSProperties}
        {...props}
      >
        {children}
      </button>
    );
  }
);

RainbowButton.displayName = "RainbowButton";

export { RainbowButton }; 