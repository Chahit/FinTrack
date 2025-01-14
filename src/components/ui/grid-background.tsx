"use client";
import React from "react";
import { cn } from "@/utils/cn";

export const GridBackground = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<div className={cn("h-full w-full bg-black", className)}>
			<div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px]" />
			<div className="absolute inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
			{children}
		</div>
	);
};