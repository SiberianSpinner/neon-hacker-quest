
import React, { useRef, useEffect, useState } from 'react';
import { 
  initGameState, 
  updateGameState, 
  startGame,
  toggleCursorControl
} from '@/utils/gameLogic';
import { GameState, PlayerSkin } from '@/utils/types';
import MatrixRain from './MatrixRain';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  // Initialize dimensions and game state
  useEffect(() => {
    if (containerRef.current) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setDimensions({ width, height });
      
      const initialState = initGameState(width, height);
      initialState.selectedSkin = selectedSkin; // Set initial selected skin
      // On mobile, automatically enable cursor control at start
      if (isMobile) {
        initialState.cursorControl = true;
      }
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
  }, [isMobile, selectedSkin]);

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
            // On mobile, ensure cursor control is enabled
            if (isMobile) {
              newState.cursorControl = true;
            }
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
  }, [isActive, attemptsLeft, gameState, previousActive, selectedSkin, isMobile]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prevKeys => ({ ...prevKeys, [e.key]: true }));
      
      // Toggle cursor control with 'c' key (only on desktop)
      if (!isMobile && e.key === 'c' && gameState) {
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
  }, [gameState, isMobile]);

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
    
    const handleTouchStart = (e: TouchEvent) => {
      if (containerRef.current && e.touches.length > 0) {
        const rect = containerRef.current.getBoundingClientRect();
        setCursorPosition({
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        });
        e.preventDefault(); // Prevent default touch actions
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchstart', handleTouchStart, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchstart', handleTouchStart);
      }
    };
  }, []);

  // Game animation loop
  useEffect(() => {
    if (!gameState || !containerRef.current) return;

    const animate = (time: number) => {
      // Calculate time elapsed since last frame
      let deltaTime = 1; // Default to 1 for first frame
      if (previousTimeRef.current !== undefined) {
        // Calculate deltaTime in seconds (60fps = deltaTime of 1)
        deltaTime = (time - previousTimeRef.current) / (1000 / 60);
      }

      if (gameState.gameActive) {
        const width = dimensions.width;
        const height = dimensions.height;

        // Update game state with deltaTime
        const { newState, collision, gameWon } = updateGameState(
          gameState,
          width,
          height,
          keys,
          cursorPosition,
          deltaTime,
          isMobile // Pass isMobile to updateGameState
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
      
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameState, keys, onGameOver, onGameWin, cursorPosition, dimensions, isMobile]);

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
              cursorControl={gameState.cursorControl || isMobile}
              cursorPosition={cursorPosition}
              canvasWidth={dimensions.width}
              isMobile={isMobile}
            />
          </svg>
        )}
      </div>
      
      {/* Mobile control instruction (only shown at the beginning) */}
      {isMobile && gameState && isActive && (
        <div 
          className="absolute bottom-8 left-0 right-0 text-center text-cyber-foreground/70 text-sm px-4 py-2 bg-cyber-background/70 backdrop-blur-sm rounded-md mx-8 z-20"
          style={{ 
            opacity: gameState.score < 500 ? 0.8 : 0, 
            transition: 'opacity 0.5s ease-in-out'
          }}
        >
          Коснитесь экрана, чтобы управлять движением
        </div>
      )}
      
      {/* Matrix Rain overlay (always visible) */}
      <MatrixRain className="z-10" />
    </>
  );
};

export default GameCanvas;
