
import React, { useRef, useEffect, useState } from 'react';
import { 
  GameState, 
  initGameState, 
  updateGameState, 
  getBlockColor,
  startGame
} from '@/utils/gameLogic';

interface GameCanvasProps {
  isActive: boolean;
  onGameOver: (score: number) => void;
  attemptsLeft: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  isActive, 
  onGameOver, 
  attemptsLeft 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [mouseX, setMouseX] = useState<number>(0);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  // Initialize game state
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      setGameState(
        initGameState(canvas.width, canvas.height)
      );

      const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        setGameState(prevState => {
          if (!prevState) return null;
          return {
            ...prevState,
            player: {
              ...prevState.player,
              y: canvas.height - 50
            }
          };
        });
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  // Update game state when active status changes
  useEffect(() => {
    if (gameState) {
      if (isActive && !gameState.gameActive) {
        // Start a new game when isActive changes to true
        setGameState(prevState => {
          if (!prevState) return null;
          return startGame(prevState);
        });
      } else {
        // Update the gameActive status
        setGameState(prevState => {
          if (!prevState) return null;
          return {
            ...prevState,
            gameActive: isActive,
            attemptsLeft
          };
        });
      }
    }
  }, [isActive, attemptsLeft]);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Game animation loop
  useEffect(() => {
    if (!gameState || !canvasRef.current) return;

    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        if (gameState.gameActive) {
          const canvas = canvasRef.current!;
          const ctx = canvas.getContext('2d')!;

          // Clear canvas
          ctx.fillStyle = '#0a0a0a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Update game state
          const { newState, collision } = updateGameState(
            gameState,
            canvas.width,
            canvas.height,
            mouseX
          );

          // Check for collision
          if (collision) {
            onGameOver(newState.score);
            setGameState({
              ...newState,
              gameActive: false
            });
            return;
          }

          // Draw maze blocks
          newState.maze.forEach(block => {
            ctx.fillStyle = getBlockColor(newState.score);
            ctx.fillRect(0, block.y, block.leftWidth, 50);
            ctx.fillRect(canvas.width - block.rightWidth, block.y, block.rightWidth, 50);
          });

          // Draw player
          ctx.fillStyle = '#00ffcc';
          ctx.beginPath();
          ctx.arc(newState.player.x, newState.player.y, newState.player.size, 0, Math.PI * 2);
          ctx.fill();

          // Add glowing effect to player
          ctx.shadowColor = '#00ffcc';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(newState.player.x, newState.player.y, newState.player.size - 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Draw score
          ctx.fillStyle = '#00ffcc';
          ctx.font = '16px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`SCORE: ${newState.score}`, 20, 30);
          ctx.textAlign = 'right';
          ctx.fillText(`ATTEMPTS: ${newState.attemptsLeft}`, canvas.width - 20, 30);

          // Draw grid lines for cyberpunk effect
          ctx.strokeStyle = 'rgba(0, 255, 204, 0.1)';
          ctx.lineWidth = 1;
          
          // Horizontal lines
          for (let i = 0; i < canvas.height; i += 50) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
          }
          
          // Vertical lines
          for (let i = 0; i < canvas.width; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
          }

          setGameState(newState);
        }
      }
      
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameState, mouseX, onGameOver]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0 transition-opacity duration-500"
      style={{ opacity: isActive ? 1 : 0 }}
    />
  );
};

export default GameCanvas;
