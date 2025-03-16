'use client';

import React from 'react';
import { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  life: number;
  vx: number;
  vy: number;
  color: string;
}

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingLayerRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const drawingLayer = drawingLayerRef.current;
    if (!canvas || !drawingLayer) return;

    const ctx = canvas.getContext('2d');
    const drawingCtx = drawingLayer.getContext('2d');
    if (!ctx || !drawingCtx) return;

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let particles: Particle[] = [];
    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawingLayer.width = window.innerWidth;
      drawingLayer.height = window.innerHeight;
      drawBackground();
    };

    const drawBackground = () => {
      // Pastel pink background
      ctx.fillStyle = '#FFB6C1';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Notebook lines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;
      for (let y = 20; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Red margin line
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, 0);
      ctx.lineTo(50, canvas.height);
      ctx.stroke();
    };

    const draw = (e: MouseEvent) => {
      if (!isDrawing) return;
      
      // Draw main line with gold color
      drawingCtx.beginPath();
      drawingCtx.strokeStyle = '#FFD700'; // Gold color
      drawingCtx.lineWidth = 3;
      drawingCtx.lineJoin = 'round';
      drawingCtx.lineCap = 'round';
      drawingCtx.shadowBlur = 10;
      drawingCtx.shadowColor = '#FF69B4';
      drawingCtx.moveTo(lastX, lastY);
      drawingCtx.lineTo(e.offsetX, e.offsetY);
      drawingCtx.stroke();

      // Add glitter particles
      for (let i = 0; i < 5; i++) {
        particles.push({
          x: e.offsetX,
          y: e.offsetY,
          size: Math.random() * 3 + 1,
          life: 1,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          color: ['#FF1493', '#FF69B4', '#FFD700'][Math.floor(Math.random() * 3)],
        });
      }

      [lastX, lastY] = [e.offsetX, e.offsetY];
    };

    const animate = () => {
      // Clear only the particle layer (temporary canvas)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Redraw background
      drawBackground();
      
      // Draw the permanent drawing layer
      ctx.drawImage(drawingLayer, 0, 0);

      // Update and draw particles
      ctx.globalCompositeOperation = 'lighter';
      particles = particles.filter(p => p.life > 0);
      particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.01; // Slower fade out
        p.size *= 0.99; // Slower size reduction
      });
      ctx.globalCompositeOperation = 'source-over';

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDrawing = true;
      [lastX, lastY] = [e.offsetX, e.offsetY];
    };

    const handleMouseUp = () => {
      isDrawing = false;
    };

    // Initialize canvas
    resizeCanvas();
    animate();

    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseout', handleMouseUp);

    // Expose clear method to window
    (window as any).clearDrawing = () => {
      drawingCtx.clearRect(0, 0, drawingLayer.width, drawingLayer.height);
    };

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseout', handleMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 touch-none"
        style={{ backgroundColor: '#FFB6C1' }}
      />
      <canvas
        ref={drawingLayerRef}
        className="absolute inset-0 touch-none"
        style={{ backgroundColor: 'transparent' }}
      />
    </div>
  );
} 