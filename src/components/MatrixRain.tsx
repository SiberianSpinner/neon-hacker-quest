
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
    
    // Matrix column that creates a vertical sequence of characters
    class Column {
      x: number;
      chars: { y: number; value: string; opacity: number }[];
      speed: number;
      fontSize: number;
      length: number;
      
      constructor() {
        this.reset();
      }
      
      reset() {
        this.fontSize = Math.random() * 8 + 8; // 8-16px
        this.x = Math.floor(Math.random() * canvas.width);
        this.speed = 0.5 + Math.random() * 2;
        
        // Random length between 1-10 characters
        this.length = Math.floor(Math.random() * 10) + 1;
        
        // Initialize the column of characters
        this.chars = [];
        
        // Start position from bottom of the screen or slightly below
        const startY = canvas.height + this.fontSize * 2;
        
        // Create the sequence of characters in the column
        for (let i = 0; i < this.length; i++) {
          this.chars.push({
            y: startY - i * this.fontSize,
            value: this.getRandomChar(),
            opacity: Math.max(0.1, 1 - (i / this.length) * 0.8) // Head is brighter, tail fades
          });
        }
      }
      
      getRandomChar() {
        return chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      update() {
        // Move the entire column upward
        for (let i = 0; i < this.chars.length; i++) {
          this.chars[i].y -= this.speed;
          
          // Randomly change characters as they move (reduced frequency by 50%)
          if (Math.random() > 0.975) { // Changed from 0.95 to 0.975
            this.chars[i].value = this.getRandomChar();
          }
        }
        
        // If the entire column has moved off the top of the screen, reset it
        if (this.chars[this.chars.length - 1].y < -this.fontSize) {
          this.reset();
        }
      }
      
      draw() {
        for (let i = 0; i < this.chars.length; i++) {
          const char = this.chars[i];
          
          // First character (head) is brighter
          const isHead = i === 0;
          const glowIntensity = isHead ? 15 : 0;
          
          // Apply glow effect to the head of each column
          if (isHead) {
            ctx.shadowBlur = glowIntensity;
            ctx.shadowColor = 'rgba(0, 255, 204, 0.8)';
          } else {
            ctx.shadowBlur = 0;
          }
          
          ctx.fillStyle = `rgba(0, 255, 204, ${char.opacity})`;
          ctx.font = `${this.fontSize}px monospace`;
          ctx.fillText(char.value, this.x, char.y);
        }
      }
    }
    
    // Create columns (density depends on screen width)
    const columns: Column[] = [];
    const columnCount = Math.floor(canvas.width / 15); // Adjust density
    
    for (let i = 0; i < columnCount; i++) {
      columns.push(new Column());
    }
    
    // Animation frame
    const animate = () => {
      // Apply a semi-transparent black overlay to create trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      columns.forEach(column => {
        column.update();
        column.draw();
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
      style={{ opacity: 0.3, zIndex: 0 }} // Matrix will be displayed behind game elements
    />
  );
};

export default MatrixRain;
