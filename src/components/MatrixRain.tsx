
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
    const chars = '01アイウエオカキクケコサシスセソタチツテト';
    
    // Optimize Rain drops class
    class Drop {
      x: number;
      y: number; 
      speed: number;
      fontSize: number;
      opacity: number;
      chars: string[]; 
      
      constructor() {
        this.fontSize = Math.random() * 8 + 8; // 8-16px
        this.x = Math.floor(Math.random() * canvas.width);
        this.y = canvas.height + this.fontSize;
        this.speed = 0.5 + Math.random() * 2;
        
        // Use fewer characters per column for better performance
        const charCount = Math.floor(Math.random() * 2) + 2; // 2-3 characters
        this.chars = Array(charCount).fill('').map(() => 
          chars.charAt(Math.floor(Math.random() * chars.length))
        );
        
        this.opacity = 0.5 + Math.random() * 0.5;
      }
      
      update() {
        // Move from bottom to top (opposite direction of blocks)
        this.y -= this.speed;
        
        // Reset when it goes off the top
        if (this.y < -this.fontSize * this.chars.length) {
          this.reset();
          return;
        }
        
        // Randomly change one of the characters (less frequently)
        if (Math.random() > 0.98) {
          const charIndex = Math.floor(Math.random() * this.chars.length);
          this.chars[charIndex] = chars.charAt(Math.floor(Math.random() * chars.length));
        }
      }
      
      reset() {
        this.fontSize = Math.random() * 8 + 8;
        this.x = Math.floor(Math.random() * canvas.width);
        this.y = canvas.height + this.fontSize;
        this.speed = 0.5 + Math.random() * 2;
        
        // Use fewer characters for better performance
        const charCount = Math.floor(Math.random() * 2) + 2; // 2-3 characters
        this.chars = Array(charCount).fill('').map(() => 
          chars.charAt(Math.floor(Math.random() * chars.length))
        );
        
        this.opacity = 0.5 + Math.random() * 0.5;
      }
      
      draw() {
        // Only draw if drops are within visible canvas area
        if (this.y < -this.fontSize * this.chars.length || this.y > canvas.height) {
          return;
        }
        
        ctx.fillStyle = `rgba(0, 255, 204, ${this.opacity})`;
        ctx.font = `${this.fontSize}px monospace`;
        
        // Draw all characters in the column
        for (let i = 0; i < this.chars.length; i++) {
          const charY = this.y - (i * this.fontSize);
          // Only draw if in view
          if (charY > -this.fontSize && charY < canvas.height + this.fontSize) {
            ctx.fillText(this.chars[i], this.x, charY);
          }
        }
      }
    }
    
    // Create fewer drops for better performance
    const drops: Drop[] = [];
    const dropCount = Math.floor(canvas.width / 25); // Reduced density for better performance
    
    for (let i = 0; i < dropCount; i++) {
      drops.push(new Drop());
    }
    
    // Use requestAnimationFrame with throttling for consistent performance
    let lastFrameTime = 0;
    const targetFPS = 30; // Lower FPS for matrix background
    const frameInterval = 1000 / targetFPS;
    
    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastFrameTime;
      
      if (elapsed > frameInterval) {
        lastFrameTime = timestamp - (elapsed % frameInterval);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        drops.forEach(drop => {
          drop.update();
          drop.draw();
        });
      }
      
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
      style={{ opacity: 0.35 }} 
    />
  );
};

export default MatrixRain;
