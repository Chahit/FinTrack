'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

export function Hero() {
  const router = useRouter();

  useEffect(() => {
    // GSAP animations
    gsap.from('.hero-content', {
      duration: 1,
      y: 50,
      opacity: 0,
      ease: 'power3.out',
      stagger: 0.2,
    });

    // Particle effect animation
    const particleContainer = document.querySelector('.particle-container');
    if (particleContainer) {
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particleContainer.appendChild(particle);
        
        gsap.to(particle, {
          duration: 'random(2, 4)',
          y: 'random(-100, 100)',
          x: 'random(-100, 100)',
          opacity: 0,
          repeat: -1,
          delay: 'random(0, 2)',
          ease: 'power1.inOut',
        });
      }
    }
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-black to-purple-900" />
      
      {/* Particle Container */}
      <div className="particle-container absolute inset-0" />
      
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
