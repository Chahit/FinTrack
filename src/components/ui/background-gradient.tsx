"use client";
import { cn } from "@/utils/cn";
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!animate || !gradientRef.current) return;

    gsap.to(gradientRef.current, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.inOut",
    });

    gsap.to(gradientRef.current, {
      background: "radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(147, 51, 234, 0.15), transparent 80%)",
      duration: 0.5,
    });
  }, [animate]);

  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPosition({ x, y });

    if (gradientRef.current) {
      gradientRef.current.style.setProperty("--mouse-x", `${x}px`);
      gradientRef.current.style.setProperty("--mouse-y", `${y}px`);
    }
  };

  useEffect(() => {
    if (!animate) return;
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [animate]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full w-full bg-primary",
        containerClassName
      )}
    >
      <div
        className={cn(
          "absolute inset-0 overflow-hidden rounded-[inherit]",
          className
        )}
      >
        <div
          ref={gradientRef}
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
          className="pointer-events-none absolute -inset-[100%] opacity-50 transition-transform"
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-purple-500 via-purple-700 to-purple-900 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]"
          />
        </div>
      </div>
      {children}
    </div>
  );
};