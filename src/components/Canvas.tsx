'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface Sparkle {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const sparklesRef = useRef<Sparkle[]>([]);
  const pathsRef = useRef<Point[][]>([[]]);
  const currentPathRef = useRef<Point[]>([]);
  const animationFrameRef = useRef<number>();

  // Create refs for dynamic spacing
  const lineSpacingRef = useRef(25);
  const marginLeftRef = useRef(60);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      
      // Get the actual display size of the container
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;
      
      // Set the canvas size in pixels
      canvas.width = Math.floor(displayWidth * dpr);
      canvas.height = Math.floor(displayHeight * dpr);
      
      // Reset any previous transforms
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      
      // Scale for retina/high DPI displays
      ctx.scale(dpr, dpr);
      
      // Adjust spacing based on screen size
      const smallerDimension = Math.min(displayWidth, displayHeight);
      
      // Adjust line spacing and margin based on screen size
      lineSpacingRef.current = Math.max(20, Math.floor(smallerDimension / 30));
      marginLeftRef.current = Math.max(40, Math.floor(smallerDimension / 15));
      
      redrawCanvas();
    };

    const drawCompositionBackground = (smallerDimension: number) => {
      if (!ctx || !canvas) return;
      
      // Draw pink background
      ctx.fillStyle = '#FFB6C1';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Use dynamic spacing values
      const lineSpacing = lineSpacingRef.current;
      const marginLeft = marginLeftRef.current;
      
      // Add slight paper texture (reduced number of dots)
      ctx.globalAlpha = 0.05;
      const dotCount = Math.min(1000, Math.floor((canvas.width * canvas.height) / 5000));
      for (let i = 0; i < dotCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random();
        ctx.fillStyle = Math.random() > 0.5 ? '#000000' : '#888888';
        ctx.fillRect(x, y, size, size);
      }
      ctx.globalAlpha = 1.0;
      
      // Draw red margin line
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(marginLeft, 0);
      ctx.lineTo(marginLeft, canvas.height);
      ctx.stroke();
      
      // Draw horizontal lines
      ctx.strokeStyle = '#6699CC';
      ctx.lineWidth = 0.8;
      
      for (let y = lineSpacing; y < canvas.height; y += lineSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Draw header area
      const headerHeight = lineSpacing * 2;
      ctx.fillStyle = 'rgba(255, 182, 193, 0.3)';
      ctx.fillRect(0, 0, canvas.width, headerHeight);
      
      // Draw header line
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, headerHeight);
      ctx.lineTo(canvas.width, headerHeight);
      ctx.stroke();
      
      // Draw title text with responsive font size
      const fontSize = Math.max(14, Math.min(20, Math.floor(smallerDimension / 40)));
      ctx.fillStyle = '#000000';
      ctx.font = `${fontSize}px cursive`;
      ctx.textAlign = 'center';
      ctx.fillText('Kimberly Notes', canvas.width / 2, lineSpacing * 1.3);
    };

    const redrawCanvas = () => {
      if (!ctx) return;
      
      // Calculate smaller dimension for responsive sizing
      const smallerDimension = Math.min(window.innerWidth, window.innerHeight);
      
      // Draw composition background
      drawCompositionBackground(smallerDimension);

      // Draw all paths
      pathsRef.current.forEach(path => {
        if (path.length < 2) return;
        drawPath(ctx, path);
      });

      // Draw current path
      if (currentPathRef.current.length > 0) {
        drawPath(ctx, currentPathRef.current);
      }

      // Draw sparkles
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      sparklesRef.current.forEach(sparkle => {
        ctx.shadowBlur = 15;
        ctx.shadowColor = sparkle.color;
        ctx.fillStyle = sparkle.color;
        ctx.beginPath();
        ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    };

    const animate = () => {
      // Limit maximum number of sparkles
      if (sparklesRef.current.length > 100) {
        sparklesRef.current = sparklesRef.current.slice(-100);
      }

      // Update sparkles
      sparklesRef.current = sparklesRef.current
        .map(sparkle => ({
          ...sparkle,
          x: sparkle.x + sparkle.vx,
          y: sparkle.y + sparkle.vy,
          life: sparkle.life - 0.02, // Faster fade out
          size: sparkle.size * 0.97 // Faster size reduction
        }))
        .filter(sparkle => sparkle.life > 0);

      redrawCanvas();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();

    // Add clear function to window
    (window as any).clearDrawing = () => {
      pathsRef.current = [[]];
      currentPathRef.current = [];
      sparklesRef.current = [];
      redrawCanvas();
    };

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const createSparkles = (x: number, y: number, isMoving = false) => {
    const sparkles: Sparkle[] = [];
    const count = isMoving ? 1 : 6; // Reduced sparkle count
    const speed = isMoving ? 2 : 3; // Reduced speed

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      sparkles.push({
        x,
        y,
        size: Math.random() * 3 + 2, // Smaller size
        life: 1,
        vx: Math.cos(angle) * Math.random() * speed,
        vy: Math.sin(angle) * Math.random() * speed,
        color: ['#FFD700', '#FFA500'][Math.floor(Math.random() * 2)] // Reduced color options
      });
    }
    return sparkles;
  };

  const drawPath = (ctx: CanvasRenderingContext2D, points: Point[]) => {
    if (points.length < 2) return;

    ctx.save();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#FF69B4';
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 2; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }

    if (points.length > 2) {
      const last = points.length - 1;
      ctx.quadraticCurveTo(
        points[last - 1].x,
        points[last - 1].y,
        points[last].x,
        points[last].y
      );
    } else {
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    }

    ctx.stroke();
    ctx.restore();
  };

  const getPoint = (event: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    return {
      x: (clientX - rect.left),
      y: (clientY - rect.top)
    };
  };

  const startDrawing = (event: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const point = getPoint(event);
    setIsDrawing(true);
    setLastPoint(point);
    currentPathRef.current = [point];
    sparklesRef.current = [...sparklesRef.current, ...createSparkles(point.x, point.y)];
  };

  const draw = (event: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (!isDrawing) return;

    const point = getPoint(event);
    currentPathRef.current.push(point);
    
    // Only create sparkles every other point to reduce load
    if (currentPathRef.current.length % 2 === 0) {
      sparklesRef.current = [...sparklesRef.current, ...createSparkles(point.x, point.y, true)];
    }
    setLastPoint(point);
  };

  const stopDrawing = () => {
    if (currentPathRef.current.length > 0) {
      pathsRef.current.push([...currentPathRef.current]);
    }
    currentPathRef.current = [];
    setIsDrawing(false);
    setLastPoint(null);
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#FFB6C1]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{
          touchAction: 'none',
          width: '100%',
          height: '100%',
          display: 'block',
          transform: 'translateZ(0)', // Enable hardware acceleration
          imageRendering: 'pixelated', // Improve rendering quality
          WebkitFontSmoothing: 'antialiased',
        }}
      />
    </div>
  );
} 