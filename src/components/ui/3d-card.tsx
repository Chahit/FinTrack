"use client";

import { cn } from "@/utils/cn";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { MouseEvent, PropsWithChildren, ReactNode, useRef } from "react";

export const CardContainer = ({
  children,
  className,
  containerClassName,
}: PropsWithChildren<{
  className?: string;
  containerClassName?: string;
}>) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useSpring(0, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(0, { stiffness: 500, damping: 100 });

  function onMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }
  
  const maskImage = useMotionTemplate`radial-gradient(240px at ${mouseX}px ${mouseY}px, white, transparent)`;
  const style = { maskImage, WebkitMaskImage: maskImage };

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      className={cn("relative w-full h-full", containerClassName)}
    >
      <div className={cn("group/card relative w-auto h-auto", className)}>
        {children}
      </div>
    </div>
  );
};

export const CardBody = ({
  children,
  className,
}: PropsWithChildren<{
  className?: string;
}>) => {
  return (
    <div className={cn("h-full w-full", className)}>
      <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-purple-500 via-purple-700 to-purple-900 opacity-0 group-hover/card:opacity-100 blur-sm transition duration-500" />
      <div className="relative h-full w-full backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
};

export const CardItem = ({
  as: Tag = "div",
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
}: PropsWithChildren<{
  as?: any;
  className?: string;
  translateX?: number | string;
  translateY?: number | string;
  translateZ?: number | string;
}>) => {
  const style = {
    transform: `perspective(1000px) translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px)`,
  };

  return (
    <Tag className={cn("transition duration-200 ease-linear", className)} style={style}>
      {children}
    </Tag>
  );
};
