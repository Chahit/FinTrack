'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

interface Particle {
  element: HTMLDivElement;
  animation: gsap.core.Tween;
}

export function Hero() {
  const router = useRouter();
  const particleContainerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    // Create GSAP timeline for content animations
    timelineRef.current = gsap.timeline();
    
    timelineRef.current.from('.hero-content', {
      duration: 1,
      y: 50,
      opacity: 0,
      ease: 'power3.out',
      stagger: 0.2,
    });

    return () => {
      // Cleanup timeline
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  useEffect(() => {
    // Particle effect animation
    const particleContainer = particleContainerRef.current;
    if (!particleContainer) return;

    // Clear any existing particles
    particlesRef.current.forEach(particle => {
      particle.animation.kill();
      particle.element.remove();
    });
    particlesRef.current = [];

    // Create new particles
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle absolute w-2 h-2 rounded-full bg-white/20';
      particleContainer.appendChild(particle);

      // Random initial position
      const startX = Math.random() * window.innerWidth;
      const startY = Math.random() * window.innerHeight;
      gsap.set(particle, { x: startX, y: startY });

      // Create animation
      const animation = gsap.to(particle, {
        duration: gsap.utils.random(2, 4),
        y: `random(-100, 100)`,
        x: `random(-100, 100)`,
        opacity: 0,
        repeat: -1,
        delay: gsap.utils.random(0, 2),
        ease: 'power1.inOut',
        yoyo: true,
      });

      particlesRef.current.push({ element: particle, animation });
    }

    return () => {
      // Cleanup particles
      particlesRef.current.forEach(particle => {
        particle.animation.kill();
        particle.element.remove();
      });
      particlesRef.current = [];
    };
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-black to-purple-900" />
      
      {/* Particle Container */}
      <div 
        ref={particleContainerRef}
        className="particle-container absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="hero-content text-5xl md:text-6xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Empower Your Portfolio With Cutting-Edge Hedging Tools
        </h1>
        
        <p className="hero-content text-xl text-gray-300 mb-8">
          Take control of your investments with advanced risk management and real-time analytics
        </p>
        
        <div className="hero-content flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push('/portfolio')}
            className="px-8 py-6 text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
          >
            Start Optimizing
          </Button>
          
          <Button
            onClick={() => router.push('/education')}
            variant="outline"
            className="px-8 py-6 text-lg border-2 hover:bg-white/10 transform hover:scale-105 transition-all duration-200"
          >
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
}
