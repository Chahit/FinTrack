"use client";

import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardContainerProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  glowColor?: string;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface CardItemProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContainer = ({
  children,
  className,
  containerClassName,
  glowColor = 'hsl(var(--primary))',
}: CardContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['17.5deg', '-17.5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-17.5deg', '17.5deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsFocused(false);
  };

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsFocused(true)}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={cn(
        'relative w-full h-full transition-all duration-200 ease-linear',
        containerClassName
      )}
    >
      <div
        style={{
          backgroundImage: `
            radial-gradient(
              ${glowColor} 0%,
              transparent 70%
            )
          `,
        }}
        className={cn(
          'absolute inset-0 opacity-0 transition-opacity duration-500',
          isFocused ? 'opacity-30' : 'opacity-0'
        )}
      />
      <div
        className={cn(
          'bg-background rounded-xl border shadow-sm p-6 h-full w-full',
          'transform-style-preserve-3d relative',
          className
        )}
        style={{
          transform: 'translateZ(75px)',
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </motion.div>
  );
};

export const CardBody = ({ children, className }: CardBodyProps) => {
  return (
    <div
      className={cn(
        'relative h-full w-full transform-style-preserve-3d',
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardItem = ({ children, className }: CardItemProps) => {
  return (
    <div
      className={cn(
        'relative w-full transform-style-preserve-3d',
        className
      )}
      style={{
        transform: 'translateZ(50px)',
      }}
    >
      {children}
    </div>
  );
};
