"use client";

import { useCallback } from 'react';
import { type Container, type Engine } from '@tsparticles/engine';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { cn } from '@/lib/utils';

interface SparklesProps {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleDensity?: number;
  particleColor?: string;
  particleGlow?: boolean;
  hoverEffect?: boolean;
  clickEffect?: boolean;
  interactive?: boolean;
}

export function SparklesCore({
  id = 'tsparticles',
  className,
  background = 'transparent',
  minSize = 0.6,
  maxSize = 1,
  speed = 1.5,
  particleDensity = 100,
  particleColor = '#FFFFFF',
  particleGlow = true,
  hoverEffect = true,
  clickEffect = true,
  interactive = true,
}: SparklesProps) {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id={id}
      className={cn('h-full w-full', className)}
      init={particlesInit}
      options={{
        background: {
          color: {
            value: background,
          },
        },
        fpsLimit: 60,
        particles: {
          bounce: {
            enable: true,
          },
          color: {
            value: particleColor,
          },
          links: {
            color: particleColor,
            distance: 150,
            enable: true,
            opacity: 0.5,
            width: 1,
          },
          move: {
            enable: true,
            random: true,
            speed: speed,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: particleDensity,
          },
          opacity: {
            value: { min: 0.1, max: 0.5 },
          },
          shape: {
            type: 'circle',
          },
          size: {
            value: { min: minSize, max: maxSize },
          },
          twinkle: {
            lines: {
              enable: particleGlow,
              frequency: 0.05,
              opacity: 0.5,
            },
            particles: {
              enable: particleGlow,
              frequency: 0.05,
              opacity: 0.5,
            },
          },
        },
        interactivity: interactive
          ? {
              events: {
                onClick: {
                  enable: clickEffect,
                  mode: 'push',
                },
                onHover: {
                  enable: hoverEffect,
                  mode: 'repulse',
                },
                resize: true,
              },
              modes: {
                push: {
                  quantity: 4,
                },
                repulse: {
                  distance: 100,
                  duration: 0.4,
                },
              },
            }
          : undefined,
        detectRetina: true,
      }}
    />
  );
}
