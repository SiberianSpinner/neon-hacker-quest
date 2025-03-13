import React, { useRef, useEffect, useState } from 'react';
import { 
  GameState, 
  initGameState, 
  updateGameState, 
  getBlockColor,
  startGame,
  toggleCursorControl
} from '@/utils/gameLogic';
import { getGlowColor } from '@/utils/mazeUtils';

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
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const [previousActive, setPreviousActive] = useState(false);
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
  const [cursorPosition, setCursorPosition] = useState<{ x: number | null, y: number | null }>({ x: null, y: null });

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
              y: canvas.height - 100
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
    // Only trigger a state change when isActive status changes
    if (isActive !== previousActive) {
      setPreviousActive(isActive);
      
      if (gameState) {
        if (isActive) {
          console.log("Starting game...");
          // Start a new game when isActive changes to true
          setGameState(prevState => {
            if (!prevState) return null;
            const newState = startGame(prevState);
            console.log("New game state:", newState);
            return newState;
          });
        } else {
          // Update the gameActive status when game becomes inactive
          setGameState(prevState => {
            if (!prevState) return null;
            return {
              ...prevState,
              gameActive: false
            };
          });
        }
      }
    }
    
    // Always ensure attemptsLeft is updated
    if (gameState && gameState.attemptsLeft !== attemptsLeft) {
      setGameState(prevState => {
        if (!prevState) return null;
        return {
          ...prevState,
          attemptsLeft
        };
      });
    }
  }, [isActive, attemptsLeft, gameState, previousActive]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prevKeys => ({ ...prevKeys, [e.key]: true }));
      
      // Toggle cursor control with 'c' key
      if (e.key === 'c' && gameState) {
        setGameState(prevState => {
          if (!prevState) return null;
          return toggleCursorControl(prevState);
        });
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prevKeys => ({ ...prevKeys, [e.key]: false }));
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Handle mouse/touch movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCursorPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (canvasRef.current && e.touches.length > 0) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCursorPosition({
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        });
        e.preventDefault(); // Prevent scrolling on touch devices
      }
    };

    if (canvasRef.current) {
      canvasRef.current.addEventListener('mousemove', handleMouseMove);
      canvasRef.current.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('mousemove', handleMouseMove);
        canvasRef.current.removeEventListener('touchmove', handleTouchMove);
      }
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

          // Update game state
          const { newState, collision } = updateGameState(
            gameState,
            canvas.width,
            canvas.height,
            keys,
            cursorPosition
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

          // Draw maze blocks with glow effect
          newState.maze.forEach(block => {
            const blockColor = getBlockColor(newState.score);
            const glowColor = getGlowColor(blockColor);
            
            // Draw glow effect
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            ctx.fillStyle = blockColor;
            ctx.fillRect(block.x, block.y, block.width, block.height);
            
            // Reset shadow for other elements
            ctx.shadowBlur = 0;
            
            // Add circuit pattern
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 1;
            
            // Horizontal lines inside blocks
            for (let y = block.y + 5; y < block.y + block.height; y += 10) {
              ctx.beginPath();
              ctx.moveTo(block.x, y);
              ctx.lineTo(block.x + block.width, y);
              ctx.stroke();
            }
            
            // Random "connection" dots
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            for (let i = 0; i < block.width / 20; i++) {
              const dotX = block.x + Math.random() * block.width;
              const dotY = block.y + Math.random() * block.height;
              ctx.beginPath();
              ctx.arc(dotX, dotY, 1, 0, Math.PI * 2);
              ctx.fill();
            }
          });

          // Draw player
          // Glow effect
          ctx.shadowColor = '#00ffcc';
          ctx.shadowBlur = 15;
          ctx.fillStyle = '#00ffcc';
          ctx.beginPath();
          ctx.arc(newState.player.x, newState.player.y, newState.player.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Core
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(newState.player.x, newState.player.y, newState.player.size / 2, 0, Math.PI * 2);
          ctx.fill();
          
          // "Data stream" effect behind player
          ctx.strokeStyle = 'rgba(0, 255, 204, 0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(newState.player.x, newState.player.y);
          ctx.lineTo(
            newState.player.x - newState.player.speedX * 5, 
            newState.player.y - newState.player.speedY * 5
          );
          ctx.stroke();

          // Draw score
          ctx.fillStyle = '#00ffcc';
          ctx.font = '16px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`ВЗЛОМ: ${newState.score}`, 20, 30);
          ctx.textAlign = 'right';
          ctx.fillText(`ПОПЫТКИ: ${newState.attemptsLeft}`, canvas.width - 20, 30);
          
          // Show cursor control status
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(0, 255, 204, 0.7)';
          ctx.fillText(
            `Управление: ${newState.cursorControl ? 'Курсор' : 'Клавиатура'} (C для переключения)`, 
            canvas.width / 2, 
            canvas.height - 30
          );

          // Draw cursor target if cursor control is active
          if (newState.cursorControl && cursorPosition.x !== null && cursorPosition.y !== null) {
            ctx.strokeStyle = 'rgba(0, 255, 204, 0.6)';
            ctx.lineWidth = 1;
            
            // Draw crosshair
            const crossSize = 10;
            ctx.beginPath();
            ctx.moveTo(cursorPosition.x - crossSize, cursorPosition.y);
            ctx.lineTo(cursorPosition.x + crossSize, cursorPosition.y);
            ctx.moveTo(cursorPosition.x, cursorPosition.y - crossSize);
            ctx.lineTo(cursorPosition.x, cursorPosition.y + crossSize);
            ctx.stroke();
            
            // Draw circle
            ctx.beginPath();
            ctx.arc(cursorPosition.x, cursorPosition.y, crossSize, 0, Math.PI * 2);
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
  }, [gameState, keys, onGameOver, cursorPosition]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0 transition-opacity duration-500"
      style={{ opacity: isActive ? 1 : 0 }}
    />
  );
};

export default GameCanvas;
