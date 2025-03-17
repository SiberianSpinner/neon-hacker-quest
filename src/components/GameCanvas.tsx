import React, { useRef, useEffect, useState } from 'react';
import { 
  initGameState, 
  updateGameState, 
  getBlockColor,
  startGame,
  toggleCursorControl,
  formatScoreAsPercentage
} from '@/utils/gameLogic';
import { getGlowColor, getOppositeColor } from '@/utils/mazeUtils';
import { Key, DoorOpen } from 'lucide-react';
import { BoosterType, GameState, PlayerSkin } from '@/utils/types';
import { getPlayerColor } from '@/utils/skinsUtils';
import MatrixRain from './MatrixRain';

interface GameCanvasProps {
  isActive: boolean;
  onGameOver: (score: number) => void;
  onGameWin: (score: number) => void;
  attemptsLeft: number;
  selectedSkin: PlayerSkin;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  isActive, 
  onGameOver,
  onGameWin,
  attemptsLeft,
  selectedSkin
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const [previousActive, setPreviousActive] = useState(false);
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
  const [cursorPosition, setCursorPosition] = useState<{ x: number | null, y: number | null }>({ x: null, y: null });
  const pulseRef = useRef<number>(0);
  
  // Matrix symbols pool to use for blocks
  const matrixSymbols = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンабвгдеёжзийклмнопрстуфхцчшщъыьэюя';
  
  // Function to get score color based on completion percentage
  const getScoreColor = (score: number): string => {
    const percentage = score / 1000; // 1000 points = 1%
    
    if (percentage < 25) return '#ff0000'; // Red (0-25%)
    if (percentage < 50) return '#ff9900'; // Orange (25-50%)
    if (percentage < 75) return '#cc00ff'; // Purple (50-75%)
    if (percentage < 90) return '#00ff00'; // Green (75-90%)
    return '#ffffff'; // White (90-100%)
  };
  
  // Function to generate a random matrix symbol
  const getRandomMatrixSymbol = () => {
    return matrixSymbols[Math.floor(Math.random() * matrixSymbols.length)];
  };
  
  // Function to render a block as matrix symbols
  const renderBlockAsMatrixSymbols = (
    ctx: CanvasRenderingContext2D, 
    block: { x: number; y: number; width: number; height: number; }, 
    blockColor: string,
    glowColor: string
  ) => {
    const symbolSize = 16; // Double the size of background matrix (which is typically 8px)
    const symbolsPerRow = 3; // 3x3 matrix of symbols per block
    const symbolsPerCol = 3;
    
    // Calculate the width and height of each grid cell within the block
    const cellWidth = block.width / symbolsPerRow;
    const cellHeight = block.height / symbolsPerCol;
    
    // Save the current context state
    ctx.save();
    
    // Glow effect for the entire block area
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 15;
    
    // Set font properties
    ctx.font = `bold ${symbolSize}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Use block color for text
    ctx.fillStyle = blockColor;
    
    // Fill the block with random matrix symbols
    for (let row = 0; row < symbolsPerRow; row++) {
      for (let col = 0; col < symbolsPerCol; col++) {
        const symbol = getRandomMatrixSymbol();
        const x = block.x + (col + 0.5) * cellWidth;
        const y = block.y + (row + 0.5) * cellHeight;
        
        // Draw the matrix symbol
        ctx.fillText(symbol, x, y);
      }
    }
    
    ctx.restore();
  };

  // Initialize game state
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const initialState = initGameState(canvas.width, canvas.height);
      initialState.selectedSkin = selectedSkin; // Set initial selected skin
      
      setGameState(initialState);

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

  // Update game state when active status or selectedSkin changes
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
            newState.selectedSkin = selectedSkin; // Update skin on new game
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
    
    // Always ensure attemptsLeft and selectedSkin are updated
    if (gameState) {
      if (gameState.attemptsLeft !== attemptsLeft || gameState.selectedSkin !== selectedSkin) {
        setGameState(prevState => {
          if (!prevState) return null;
          return {
            ...prevState,
            attemptsLeft,
            selectedSkin
          };
        });
      }
    }
  }, [isActive, attemptsLeft, gameState, previousActive, selectedSkin]);

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

          // Draw boosters - UPDATED TO RENDER DIAMOND SHAPE
          newState.boosters.forEach(booster => {
            if (booster.active) {
              // Common diamond shape rendering
              ctx.save();
              
              // Use color based on booster type
              const boosterColor = booster.type === BoosterType.SAFETY_KEY 
                ? getOppositeColor(newState.score) 
                : '#cc00ff'; // Purple for backdoor
              
              // Glow effect
              ctx.shadowColor = boosterColor;
              ctx.shadowBlur = 15;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
              
              // Calculate center and size
              const centerX = booster.x + booster.size / 2;
              const centerY = booster.y + booster.size / 2;
              const diamondSize = booster.size * 0.7; // Slightly smaller than hitbox
              
              // Draw diamond shape
              ctx.fillStyle = boosterColor;
              ctx.beginPath();
              // Diamond vertices
              ctx.moveTo(centerX, centerY - diamondSize/2); // Top
              ctx.lineTo(centerX + diamondSize/2, centerY); // Right
              ctx.lineTo(centerX, centerY + diamondSize/2); // Bottom
              ctx.lineTo(centerX - diamondSize/2, centerY); // Left
              ctx.closePath();
              ctx.fill();
              
              // Draw icon inside diamond
              ctx.fillStyle = '#ffffff';
              ctx.font = `${diamondSize * 0.5}px "JetBrains Mono", monospace`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              
              // Draw appropriate symbol based on booster type
              if (booster.type === BoosterType.SAFETY_KEY) {
                ctx.fillText('🔑', centerX, centerY);
              } else if (booster.type === BoosterType.BACKDOOR) {
                ctx.fillText('🚪', centerX, centerY);
              }
              
              ctx.restore();
            }
          });

          // Draw maze blocks as matrix symbols
          newState.maze.forEach(block => {
            const blockColor = getBlockColor(newState.score);
            const glowColor = getGlowColor(blockColor);
            
            // Render the block using matrix symbols
            renderBlockAsMatrixSymbols(ctx, block, blockColor, glowColor);
          });

          // Update pulse effect
          pulseRef.current = (pulseRef.current + 1) % 30; // 0.5 sec at 60 FPS
          const pulseFactor = newState.player.invulnerable ? 
            1 + 0.3 * Math.sin(pulseRef.current * 0.2 * Math.PI) : 1;

          // Get player color based on selected skin
          const playerColor = getPlayerColor(
            newState.selectedSkin, 
            newState.score, 
            time
          );

          // Draw player with skin color and invulnerability effect if active
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
          
          // Glow effect - using skin color
          ctx.shadowColor = playerColor;
          ctx.shadowBlur = 15;
          ctx.fillStyle = playerColor;
          ctx.beginPath();
          ctx.arc(newState.player.x, newState.player.y, newState.player.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Core
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(newState.player.x, newState.player.y, newState.player.size / 2, 0, Math.PI * 2);
          ctx.fill();
          
          // "Data stream" effect behind player - using skin color
          ctx.strokeStyle = `rgba(${playerColor.replace(/[^\d,]/g, '')}, 0.4)`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(newState.player.x, newState.player.y);
          ctx.lineTo(
            newState.player.x - newState.player.speedX * 5, 
            newState.player.y - newState.player.speedY * 5
          );
          ctx.stroke();
          
          ctx.restore();

          // Draw score centered with increased size and dynamic color based on percentage
          const scoreColor = getScoreColor(newState.score);
          ctx.fillStyle = scoreColor;
          ctx.font = '17.6px "JetBrains Mono", monospace'; // 16px + 10%
          
          // Format score as hack percentage (1000 points = 1%)
          const formattedScore = formatScoreAsPercentage(newState.score);
          
          // Center the score text
          ctx.textAlign = 'center';
          ctx.fillText(`ВЗЛОМ: ${formattedScore}`, canvas.width / 2, 30);
          
          // Draw invulnerability timer if active
          if (newState.player.invulnerable) {
            const secondsLeft = (newState.player.invulnerableTimer / 60).toFixed(1);
            ctx.fillStyle = '#00ccff'; // Light blue color
            ctx.textAlign = 'center';
            ctx.fillText(`НЕУЯЗВИМОСТЬ: ${secondsLeft}s`, canvas.width / 2, 55);
          }
          
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
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 transition-opacity duration-500"
        style={{ opacity: isActive ? 1 : 0 }}
      />
      
      {/* Matrix Rain overlay (always visible) */}
      <MatrixRain className="z-10" />
    </>
  );
};

export default GameCanvas;
