
import React, { useMemo } from 'react';
import { BossCore as BossCoreType, BossCoreLine } from '@/utils/types';

interface BossCoreProps {
  bossCore: BossCoreType;
  time: number;
}

const BossCore: React.FC<BossCoreProps> = ({ bossCore, time }) => {
  // Matrix symbols pool to use for boss lines
  const matrixSymbols = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンабвгдеёжзийклмнопрстуфхцчшщъыьэюя';
  
  // Generate random matrix symbol
  const getRandomMatrixSymbol = () => {
    return matrixSymbols[Math.floor(Math.random() * matrixSymbols.length)];
  };
  
  // Get boss color based on level
  const getBossColor = () => {
    switch (bossCore.level) {
      case 1: return '#00ff00'; // Green for level 1 (33k)
      case 2: return '#ff9900'; // Orange for level 2 (66k)
      case 3: return '#ff0000'; // Red for level 3 (99k)
      default: return '#00ff00';
    }
  };
  
  // Get negative color (for vulnerable lines)
  const getNegativeColor = () => {
    switch (bossCore.level) {
      case 1: return '#ff00ff'; // Magenta (opposite of green)
      case 2: return '#0066ff'; // Blue (opposite of orange)
      case 3: return '#00ffff'; // Cyan (opposite of red)
      default: return '#ff00ff';
    }
  };
  
  // Update symbols every second for animation effect
  const symbolKey = Math.floor(time / 1000);
  
  // Render the boss lines
  const renderLines = (lines: BossCoreLine[], isOuter: boolean) => {
    const baseColor = getBossColor();
    const negativeColor = getNegativeColor();
    const symbolSize = 16;
    
    return lines.map((line, lineIndex) => {
      if (line.destroyed) return null;
      
      const color = line.isVulnerable ? negativeColor : baseColor;
      
      return (
        <g key={`line-${lineIndex}`}>
          {line.points.map((point, pointIndex) => {
            if (pointIndex < line.points.length - 1) {
              const [x1, y1] = point;
              const [x2, y2] = line.points[pointIndex + 1];
              
              // Calculate midpoint for text positioning
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;
              
              // Calculate angle for proper text rotation
              const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
              
              // Calculate distance between points
              const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
              
              // Number of symbols to place based on distance (1 symbol per 15px)
              const symbolsCount = Math.max(1, Math.floor(distance / 15));
              
              return Array.from({ length: symbolsCount }).map((_, symbolIndex) => {
                // Calculate position for each symbol
                const t = symbolIndex / (symbolsCount - 1 || 1);
                const symbolX = x1 + (x2 - x1) * t;
                const symbolY = y1 + (y2 - y1) * t;
                
                return (
                  <text
                    key={`symbol-${pointIndex}-${symbolIndex}-${symbolKey}`}
                    x={symbolX}
                    y={symbolY}
                    fill={color}
                    fontSize={symbolSize}
                    fontWeight="bold"
                    fontFamily='"JetBrains Mono", monospace'
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${angle}, ${symbolX}, ${symbolY})`}
                    filter="url(#glow)"
                  >
                    {getRandomMatrixSymbol()}
                  </text>
                );
              });
            }
            return null;
          })}
        </g>
      );
    });
  };
  
  // Render memory card if inner lines are all destroyed
  const renderMemoryCard = () => {
    const activeInnerLines = bossCore.innerLines.filter(line => !line.destroyed);
    
    if (activeInnerLines.length === 0 && bossCore.memoryCard.active) {
      return (
        <g filter="url(#boosterGlow)">
          <circle
            cx={bossCore.memoryCard.x + bossCore.memoryCard.size / 2}
            cy={bossCore.memoryCard.y + bossCore.memoryCard.size / 2}
            r={bossCore.memoryCard.size / 2}
            fill="#ffffff"
          />
          <text
            x={bossCore.memoryCard.x + bossCore.memoryCard.size / 2}
            y={bossCore.memoryCard.y + bossCore.memoryCard.size / 2}
            fill="#000000"
            fontSize="10"
            fontFamily='"JetBrains Mono", monospace'
            textAnchor="middle"
            dominantBaseline="middle"
          >
            MEMORY
          </text>
        </g>
      );
    }
    
    return null;
  };
  
  // Only render if boss is active
  if (!bossCore.active) return null;
  
  return (
    <g>
      {/* Outer square lines */}
      <g transform={`rotate(${bossCore.outerRotationAngle}, ${bossCore.x}, ${bossCore.y})`}>
        {renderLines(bossCore.outerLines, true)}
      </g>
      
      {/* Inner square lines */}
      <g transform={`rotate(${bossCore.innerRotationAngle}, ${bossCore.x}, ${bossCore.y})`}>
        {renderLines(bossCore.innerLines, false)}
      </g>
      
      {/* Memory card */}
      {renderMemoryCard()}
    </g>
  );
};

export default BossCore;
