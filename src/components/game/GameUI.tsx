
import React, { useState, useEffect } from 'react';
import { formatScoreAsPercentage } from '@/utils/gameLogic';
import { hasUnlimitedAttempts, getRandomAttemptsNumber } from '@/utils/attemptsUtils';
import { t } from '@/utils/localizationUtils';

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
        {t('hackProgress')} {formattedScore}
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
          {t('invulnerability')} {(invulnerableTimer / 60).toFixed(1)}s
        </text>
      )}
    </>
  );
};

export default GameUI;
