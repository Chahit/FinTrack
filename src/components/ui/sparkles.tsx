"use client";

import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { Engine, ISourceOptions } from 'tsparticles-engine';
import { loadFull } from 'tsparticles';
import { cn } from '@/lib/utils';

interface SparklesProps {
  id: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
}

export function SparklesCore({
  id,
  background = 'transparent',
  minSize = 0.6,
  maxSize = 1.4,
  speed = 1,
  particleDensity = 100,
  className = '',
  particleColor = '#fff',
}: SparklesProps) {
  const customInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  const options: ISourceOptions = {
    particles: {
      number: {
        value: particleDensity,
        density: {
          enable: true
        }
      },
      color: {
        value: particleColor,
      },
      shape: {
        type: "circle",
      },
      opacity: {
        value: { min: 0.1, max: 0.5 },
      },
      size: {
        value: { min: minSize, max: maxSize },
      },
      move: {
        enable: true,
        direction: "none",
        random: true,
        speed: speed,
        outModes: {
          default: "bounce"
        }
      }
    },
    interactivity: {
      detectsOn: "window",
      events: {
        onHover: {
          enable: true,
          mode: "repulse"
        },
        onClick: {
          enable: true,
          mode: "push"
        }
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4
        },
        push: {
          quantity: 4
        }
      }
    },
    background: {
      color: {
        value: background
      }
    },
    fullScreen: false,
    detectRetina: true
  };

  return (
    <Particles
      id={id}
      className={cn('h-full w-full', className)}
      options={options}
      init={customInit}
    />
  );
}
