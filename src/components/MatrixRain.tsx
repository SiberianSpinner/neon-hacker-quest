
import React, { useRef, useEffect } from 'react';

interface MatrixRainProps {
  className?: string;
}

const MatrixRain: React.FC<MatrixRainProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Character set (binary, hex, and cyber-related symbols)
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    
    // Rain drops (fill entire screen)
    class Drop {
      x: number;
      y: number; 
      speed: number;
      value: string;
      fontSize: number;
      opacity: number;
      
      constructor() {
        this.reset();
      }
      
      reset() {
        this.fontSize = Math.random() * 8 + 8; // 8-16px
        this.x = Math.floor(Math.random() * canvas.width);
        this.y = canvas.height + this.fontSize;
        this.speed = 0.5 + Math.random() * 2;
        this.value = chars.charAt(Math.floor(Math.random() * chars.length));
        this.opacity = 0.5 + Math.random() * 0.5;
      }
      
      update() {
        // Move from bottom to top (opposite direction of blocks)
        this.y -= this.speed;
        
        // Reset when it goes off the top
        if (this.y < -this.fontSize) {
          this.reset();
        }
        
        // Randomly change the character
        if (Math.random() > 0.95) {
          this.value = chars.charAt(Math.floor(Math.random() * chars.length));
        }
      }
      
      draw() {
        ctx.fillStyle = `rgba(0, 255, 204, ${this.opacity})`;
        ctx.font = `${this.fontSize}px monospace`;
        ctx.fillText(this.value, this.x, this.y);
      }
    }
    
    // Create drops (more dense to fill the screen)
    const drops: Drop[] = [];
    const dropCount = Math.floor(canvas.width / 10); // Increased density
    
    for (let i = 0; i < dropCount; i++) {
      drops.push(new Drop());
    }
    
    // Animation frame
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drops.forEach(drop => {
        drop.update();
        drop.draw();
      });
      
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className={`absolute inset-0 pointer-events-none ${className || ''}`}
      style={{ opacity: 0.3 }}
    />
  );
};

export default MatrixRain;
