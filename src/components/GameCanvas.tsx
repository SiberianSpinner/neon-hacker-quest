
import React, { useRef, useEffect, useState } from 'react';
import { 
  initGameState, 
  updateGameState, 
  startGame,
  toggleCursorControl
} from '@/utils/gameLogic';
import { GameState, PlayerSkin } from '@/utils/types';
import MatrixRain from './MatrixRain';

// Import our newly created components
import PlayerEntity from './game/PlayerEntity';
import MazeBlocks from './game/MazeBlocks';
import Boosters from './game/Boosters';
import GameUI from './game/GameUI';
import GameGrid from './game/GameGrid';
import SVGFilters from './game/SVGFilters';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const [previousActive, setPreviousActive] = useState(false);
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
  const [cursorPosition, setCursorPosition] = useState<{ x: number | null, y: number | null }>({ x: null, y: null });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Initialize dimensions and game state
  useEffect(() => {
    if (containerRef.current) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setDimensions({ width, height });
      
      const initialState = initGameState(width, height);
      initialState.selectedSkin = selectedSkin; // Set initial selected skin
      setGameState(initialState);

      const handleResize = () => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        setDimensions({ width: newWidth, height: newHeight });
        
        setGameState(prevState => {
          if (!prevState) return null;
          return {
            ...prevState,
            player: {
              ...prevState.player,
              y: newHeight - 100
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
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCursorPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (containerRef.current && e.touches.length > 0) {
        const rect = containerRef.current.getBoundingClientRect();
        setCursorPosition({
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        });
        e.preventDefault(); // Prevent scrolling on touch devices
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, []);

  // Game animation loop
  useEffect(() => {
    if (!gameState || !containerRef.current) return;

    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        if (gameState.gameActive) {
          const width = dimensions.width;
          const height = dimensions.height;

          // Update game state
          const { newState, collision, gameWon } = updateGameState(
            gameState,
            width,
            height,
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

          // Update game state
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
  }, [gameState, keys, onGameOver, onGameWin, cursorPosition, dimensions]);

  return (
    <>
      <div 
        ref={containerRef}
        className="absolute inset-0 z-0 transition-opacity duration-500"
        style={{ opacity: isActive ? 1 : 0 }}
      >
        {gameState && (
          <svg 
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="absolute inset-0"
            style={{ background: '#0a0a0a' }}
          >
            {/* SVG filters for glow effects */}
            <SVGFilters />
            
            {/* Background grid */}
            <GameGrid canvasWidth={dimensions.width} canvasHeight={dimensions.height} />
            
            {/* Maze blocks */}
            <MazeBlocks blocks={gameState.maze} score={gameState.score} />
            
            {/* Boosters */}
            <Boosters boosters={gameState.boosters} score={gameState.score} />
            
            {/* Player */}
            <PlayerEntity 
              player={gameState.player} 
              time={previousTimeRef.current || 0} 
              selectedSkin={gameState.selectedSkin} 
            />
            
            {/* Game UI (score, invulnerability timer, etc.) */}
            <GameUI 
              score={gameState.score}
              invulnerable={gameState.player.invulnerable}
              invulnerableTimer={gameState.player.invulnerableTimer}
              cursorControl={gameState.cursorControl}
              cursorPosition={cursorPosition}
              canvasWidth={dimensions.width}
            />
          </svg>
        )}
      </div>
      
      {/* Matrix Rain overlay (always visible) */}
      <MatrixRain className="z-10" />
    </>
  );
};

export default GameCanvas;
