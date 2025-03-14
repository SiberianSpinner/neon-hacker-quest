
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
    
    // Rain drops (only at top and bottom of screen)
    class Drop {
      x: number;
      y: number; 
      speed: number;
      value: string;
      isTop: boolean;
      fontSize: number;
      opacity: number;
      
      constructor(isTop: boolean) {
        this.isTop = isTop;
        this.reset();
      }
      
      reset() {
        this.fontSize = Math.random() * 8 + 8; // 8-16px
        this.x = Math.floor(Math.random() * canvas.width);
        
        // Position at top edge or bottom edge based on isTop
        if (this.isTop) {
          this.y = Math.random() * (canvas.height * 0.15); // Top 15% of screen
        } else {
          // Bottom 15% of screen
          this.y = canvas.height - Math.random() * (canvas.height * 0.15);
        }
        
        this.speed = 0.5 + Math.random() * 2;
        this.value = chars.charAt(Math.floor(Math.random() * chars.length));
        this.opacity = 0.5 + Math.random() * 0.5;
      }
      
      update() {
        // Top rain drops move down, bottom rain drops move up
        if (this.isTop) {
          this.y += this.speed;
          if (this.y > canvas.height * 0.15) {
            this.reset();
          }
        } else {
          this.y -= this.speed;
          if (this.y < canvas.height * 0.85) {
            this.reset();
          }
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
    
    // Create drops (50% at top, 50% at bottom)
    const drops: Drop[] = [];
    const dropCount = Math.floor(canvas.width / 15); // Density of drops
    
    for (let i = 0; i < dropCount; i++) {
      drops.push(new Drop(i % 2 === 0)); // Alternate between top and bottom
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
