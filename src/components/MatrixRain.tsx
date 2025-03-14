
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
      chars: string[]; // Array to hold multiple characters in a column
      
      constructor() {
        this.reset();
      }
      
      reset() {
        this.fontSize = Math.random() * 8 + 8; // 8-16px
        this.x = Math.floor(Math.random() * canvas.width);
        this.y = canvas.height + this.fontSize;
        this.speed = 0.5 + Math.random() * 2;
        
        // Generate 3-5 characters per column
        const charCount = Math.floor(Math.random() * 3) + 3; // 3-5 characters
        this.chars = [];
        for (let i = 0; i < charCount; i++) {
          this.chars.push(chars.charAt(Math.floor(Math.random() * chars.length)));
        }
        
        this.value = this.chars[0]; // The first character (for compatibility)
        this.opacity = 0.5 + Math.random() * 0.5;
      }
      
      update() {
        // Move from bottom to top (opposite direction of blocks)
        this.y -= this.speed;
        
        // Reset when it goes off the top
        if (this.y < -this.fontSize * this.chars.length) {
          this.reset();
        }
        
        // Randomly change one of the characters
        if (Math.random() > 0.95) {
          const charIndex = Math.floor(Math.random() * this.chars.length);
          this.chars[charIndex] = chars.charAt(Math.floor(Math.random() * chars.length));
        }
      }
      
      draw() {
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
      style={{ opacity: 0.35 }} // Slightly increased opacity
    />
  );
};

export default MatrixRain;
