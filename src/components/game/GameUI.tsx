
import React from 'react';
import { formatScoreAsPercentage } from '@/utils/gameLogic';

interface GameUIProps {
  score: number;
  invulnerable: boolean;
  invulnerableTimer: number;
  cursorControl: boolean;
  cursorPosition: { x: number | null; y: number | null };
  canvasWidth: number;
  isMobile?: boolean;
}

const GameUI: React.FC<GameUIProps> = ({ 
  score, 
  invulnerable, 
  invulnerableTimer, 
  cursorControl,
  cursorPosition,
  canvasWidth,
  isMobile = false
}) => {
  // Function to get score color based on completion percentage
  const getScoreColor = (score: number): string => {
    const percentage = score / 1000; // 1000 points = 1%
    
    if (percentage < 25) return '#ff0000'; // Red (0-25%)
    if (percentage < 50) return '#ff9900'; // Orange (25-50%)
    if (percentage < 75) return '#cc00ff'; // Purple (50-75%)
    if (percentage < 90) return '#00ff00'; // Green (75-90%)
    return '#ffffff'; // White (90-100%)
  };
  
  const scoreColor = getScoreColor(score);
  const formattedScore = formatScoreAsPercentage(score);
  
  return (
    <>
      {/* Score display */}
      <text
        x={canvasWidth / 2}
        y={30}
        fill={scoreColor}
        fontSize="17.6px"
        fontFamily='"JetBrains Mono", monospace'
        textAnchor="middle"
      >
        ВЗЛОМ: {formattedScore}
      </text>
      
      {/* Invulnerability timer */}
      {invulnerable && (
        <text
          x={canvasWidth / 2}
          y={55}
          fill="#00ccff"
          fontSize="17.6px"
          fontFamily='"JetBrains Mono", monospace'
          textAnchor="middle"
        >
          НЕУЯЗВИМОСТЬ: {(invulnerableTimer / 60).toFixed(1)}s
        </text>
      )}
      
      {/* Cursor/Touch crosshair - always show on mobile */}
      {(cursorControl || isMobile) && cursorPosition.x !== null && cursorPosition.y !== null && (
        <g stroke="rgba(0, 255, 204, 0.6)" strokeWidth="1">
          <line 
            x1={cursorPosition.x - 10} 
            y1={cursorPosition.y} 
            x2={cursorPosition.x + 10} 
            y2={cursorPosition.y} 
          />
          <line 
            x1={cursorPosition.x} 
            y1={cursorPosition.y - 10} 
            x2={cursorPosition.x} 
            y2={cursorPosition.y + 10} 
          />
          <circle 
            cx={cursorPosition.x} 
            cy={cursorPosition.y} 
            r={10} 
            fill="none" 
          />
          
          {/* Additional touch indicator for mobile */}
          {isMobile && (
            <circle 
              cx={cursorPosition.x} 
              cy={cursorPosition.y} 
              r={20} 
              fill="rgba(0, 255, 204, 0.1)" 
              stroke="rgba(0, 255, 204, 0.3)"
              strokeWidth="1"
            />
          )}
        </g>
      )}
    </>
  );
};

export default GameUI;
