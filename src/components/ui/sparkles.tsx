"use client";
import React, { useEffect, useRef, useState } from "react";
import { useMousePosition } from "@/hooks/useMousePosition";
import { cn } from "@/utils/cn";

export const SparklesCore = ({
  background,
  minSize,
  maxSize,
  particleDensity,
  particleColor,
  className,
  particleClassName,
}: {
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  particleColor?: string;
  className?: string;
  particleClassName?: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosition = useMousePosition();
  const [particles, setParticles] = useState<Array<Particle>>([]);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [renderingContext, setRenderingContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      setRenderingContext(ctx);
      initCanvas();
      generateParticles();
      render();
      window.addEventListener("resize", initCanvas);
    }

    return () => {
      window.removeEventListener("resize", initCanvas);
    };
  }, []);

  useEffect(() => {
    if (particles.length > 0) {
      render();
    }
  }, [particles, mousePosition]);

  const initCanvas = () => {
    if (canvasRef.current) {
      setWidth(canvasRef.current.offsetWidth);
      setHeight(canvasRef.current.offsetHeight);
      canvasRef.current.width = canvasRef.current.offsetWidth;
      canvasRef.current.height = canvasRef.current.offsetHeight;
    }
  };

  const generateParticles = () => {
    const newParticles: Array<Particle> = [];
    for (let i = 0; i < (particleDensity || 100); i++) {
      const particle = new Particle(
        width,
        height,
        minSize || 1,
        maxSize || 3,
        particleColor || "#FFF"
      );
      newParticles.push(particle);
    }
    setParticles(newParticles);
  };

  const render = () => {
    if (!renderingContext) return;
    renderingContext.clearRect(0, 0, width, height);
    particles.forEach((particle) => {
      particle.update(width, height, mousePosition);
      particle.draw(renderingContext);
    });
    requestAnimationFrame(render);
  };

  return (
    <div className={cn("h-full w-full", className)}>
      <canvas
        className={cn("absolute inset-0", particleClassName)}
        ref={canvasRef}
        style={{
          background: background || "transparent",
        }}
      />
    </div>
  );
};

class Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;

  constructor(
    width: number,
    height: number,
    minSize: number,
    maxSize: number,
    color: string
  ) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.random() * (maxSize - minSize) + minSize;
    this.speedX = Math.random() * 2 - 1;
    this.speedY = Math.random() * 2 - 1;
    this.color = color;
  }

  update(width: number, height: number, mousePosition: { x: number; y: number }) {
    if (mousePosition.x && mousePosition.y) {
      const dx = mousePosition.x - this.x;
      const dy = mousePosition.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 100) {
        const force = (100 - distance) / 100;
        this.speedX -= (dx / distance) * force * 0.2;
        this.speedY -= (dy / distance) * force * 0.2;
      }
    }

    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x < 0 || this.x > width) this.speedX *= -1;
    if (this.y < 0 || this.y > height) this.speedY *= -1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}
