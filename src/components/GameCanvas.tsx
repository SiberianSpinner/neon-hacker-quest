import React, { useRef, useEffect, useState } from 'react';
import { 
  initGameState, 
  updateGameState, 
  getBlockColor,
  startGame,
  toggleCursorControl,
  formatScoreAsPercentage,
  getHackCounterColor
} from '@/utils/gameLogic';
import { getGlowColor, getOppositeColor } from '@/utils/mazeUtils';
import { BoosterType, GameState } from '@/utils/types';
import MatrixRain from './MatrixRain';

interface GameCanvasProps {
  isActive: boolean;
  onGameOver: (score: number) => void;
  onGameWin: (score: number) => void;
  attemptsLeft: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  isActive, 
  onGameOver,
  onGameWin,
  attemptsLeft 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const [previousActive, setPreviousActive] = useState(false);
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
  const [cursorPosition, setCursorPosition] = useState<{ x: number | null, y: number | null }>({ x: null, y: null });
  const pulseRef = useRef<number>(0);

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
          const { newState, collision, gameWon } = updateGameState(
            gameState,
            canvas.width,
            canvas.height,
            keys,
            cursorPosition
          );

          // Check for game win condition
          if (gameWon) {
            onGameWin(newState.score);
            setGameState({
              ...newState,
              gameActive: false
            });
            return;
          }

          // Check for collision
          if (collision) {
            onGameOver(newState.score);
            setGameState({
              ...newState,
              gameActive: false
            });
            return;
          }

          // Draw maze blocks with enhanced glow effect
          newState.maze.forEach(block => {
            const blockColor = getBlockColor(newState.score);
            const glowColor = getGlowColor(blockColor);
            
            ctx.save();
            
            // Enhanced glow effect with multiple layers
            // First layer - wider glow
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 25;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            // Draw the block with glow
            ctx.fillStyle = blockColor;
            ctx.fillRect(block.x, block.y, block.width, block.height);
            
            // Second layer - internal glow
            ctx.shadowBlur = 8;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(block.x + 2, block.y + 2, block.width - 4, block.height - 4);
            
            ctx.restore();
            
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

          // Draw boosters with reduced size (-30%)
          newState.boosters.forEach(booster => {
            if (booster.active) {
              if (booster.type === BoosterType.SAFETY_KEY) {
                // Draw key booster with glow effect
                ctx.save();
                
                // Use opposite color for the booster based on current score
                const oppositeColor = getOppositeColor(newState.score);
                
                // Glow effect
                ctx.shadowColor = oppositeColor;
                ctx.shadowBlur = 15;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                
                // Draw key icon with reduced size (70% of original)
                const reducedSize = booster.size * 0.7;
                ctx.fillStyle = oppositeColor;
                ctx.beginPath();
                ctx.arc(
                  booster.x + booster.size / 2, 
                  booster.y + booster.size / 2, 
                  reducedSize / 2, 
                  0, 
                  Math.PI * 2
                );
                ctx.fill();
                
                // Draw key symbol
                ctx.fillStyle = '#ffffff';
                ctx.font = `${reducedSize * 0.6}px "JetBrains Mono", monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🔑', booster.x + booster.size / 2, booster.y + booster.size / 2);
                
                ctx.restore();
              }
            }
          });

          // Update pulse effect
          pulseRef.current = (pulseRef.current + 1) % 30; // 0.5 sec at 60 FPS
          const pulseFactor = newState.player.invulnerable ? 
            1 + 0.3 * Math.sin(pulseRef.current * 0.2 * Math.PI) : 1;

          // Draw player with invulnerability effect if active
          ctx.save();
          
          // Invulnerability aura
          if (newState.player.invulnerable) {
            const auraSize = newState.player.size * 2.5 * pulseFactor;
            const gradient = ctx.createRadialGradient(
              newState.player.x, newState.player.y, newState.player.size,
              newState.player.x, newState.player.y, auraSize
            );
            gradient.addColorStop(0, 'rgba(0, 204, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(0, 204, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(newState.player.x, newState.player.y, auraSize, 0, Math.PI * 2);
            ctx.fill();
          }
          
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
          
          ctx.restore();

          // Draw score centered with increased size (+10%) and updated colors based on percentage
          const formattedScore = formatScoreAsPercentage(newState.score);
          const scoreColor = getHackCounterColor(newState.score);
          
          ctx.fillStyle = scoreColor;
          ctx.font = '17.6px "JetBrains Mono", monospace'; // 16px + 10%
          ctx.textAlign = 'center';
          ctx.fillText(`ВЗЛОМ: ${formattedScore}`, canvas.width / 2, 30);

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
  }, [gameState, keys, onGameOver, onGameWin, cursorPosition]);

  return (
    <>
      {/* Grid Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-10 transition-opacity duration-500"
        style={{ opacity: isActive ? 1 : 0 }}
      />
      
      {/* Matrix Rain effect that appears above the grid but below the blocks */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <MatrixRain className="z-20" />
      </div>
      
      {/* This is a transparent overlay for the blocks and player that will be drawn on top of the Matrix */}
      <div className="absolute inset-0 z-30 pointer-events-none" id="blocks-overlay" />
    </>
  );
};

export default GameCanvas;
