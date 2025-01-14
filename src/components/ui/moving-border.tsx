"use client";
import { cn } from "@/utils/cn";
import React from "react";

export const Button = React.forwardRef<
	HTMLButtonElement,
	React.ButtonHTMLAttributes<HTMLButtonElement> & {
		borderRadius?: string;
	}
>(({ className, children, borderRadius = "1.75rem", ...props }, ref) => {
	return (
		<button
			ref={ref}
			className={cn(
				"relative inline-flex h-12 overflow-hidden bg-primary p-[1px] focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-bg-light dark:focus:ring-offset-bg-dark",
				className
			)}
			style={{ borderRadius }}
			{...props}
		>
			<span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#00B5A6_0%,#1F2A44_50%,#00B5A6_100%)]" />
			<span className="inline-flex h-full w-full cursor-pointer items-center justify-center bg-primary px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
				{children}
			</span>
		</button>
	);
});

Button.displayName = "Button";