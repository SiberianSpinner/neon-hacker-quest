
import React from 'react';
import { Booster, BoosterType } from '@/utils/types';
import { getOppositeColor } from '@/utils/mazeUtils';

interface BoostersProps {
  boosters: Booster[];
  score: number;
}

const Boosters: React.FC<BoostersProps> = ({ boosters, score }) => {
  return (
    <>
      {boosters.filter(booster => booster.active).map((booster, index) => {
        // Use color based on booster type
        const boosterColor = booster.type === BoosterType.SAFETY_KEY 
          ? getOppositeColor(score) 
          : '#cc00ff'; // Purple for backdoor
          
        // Calculate center and size
        const centerX = booster.x + booster.size / 2;
        const centerY = booster.y + booster.size / 2;
        const diamondSize = booster.size * 0.7; // Slightly smaller than hitbox
        
        return (
          <g key={`booster-${index}-${booster.x}-${booster.y}`} filter="url(#boosterGlow)">
            {/* Draw diamond shape */}
            <path
              d={`
                M ${centerX} ${centerY - diamondSize/2}
                L ${centerX + diamondSize/2} ${centerY}
                L ${centerX} ${centerY + diamondSize/2}
                L ${centerX - diamondSize/2} ${centerY}
                Z
              `}
              fill={boosterColor}
            />
            
            {/* Add icon based on booster type */}
            <text
              x={centerX}
              y={centerY}
              fill="#ffffff"
              fontSize={diamondSize * 0.5}
              fontFamily='"JetBrains Mono", monospace'
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {booster.type === BoosterType.SAFETY_KEY ? '🔑' : '🚪'}
            </text>

            {/* Debug indicator for booster type */}
            <text
              x={centerX}
              y={centerY - diamondSize}
              fill="#ffffff"
              fontSize="10"
              fontFamily='"JetBrains Mono", monospace'
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {booster.type === BoosterType.SAFETY_KEY ? 'SAFETY' : 'BACKDOOR'}
            </text>
          </g>
        );
      })}
    </>
  );
};

export default Boosters;
