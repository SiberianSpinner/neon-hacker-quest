
import React from 'react';
import { Player, PlayerSkin } from '@/utils/types';
import { getPlayerColor } from '@/utils/skinsUtils';

interface PlayerEntityProps {
  player: Player;
  time: number;
  selectedSkin: PlayerSkin;
}

const PlayerEntity: React.FC<PlayerEntityProps> = ({ player, time, selectedSkin }) => {
  // Get player color based on selected skin
  const playerColor = getPlayerColor(
    selectedSkin, 
    0, // Score doesn't affect player color directly
    time
  );

  // Calculate pulse effect for invulnerability
  const pulseFactor = player.invulnerable ? 
    1 + 0.2 * Math.sin(time * 0.008 * Math.PI) : 1;
    
  // Generate trail segments
  const trailSegments = [];
  const trailLength = 10; // Number of trail segments
  
  for (let i = 0; i < trailLength; i++) {
    // Calculate segment position based on player's movement
    const segmentX = player.x - player.speedX * (i * 0.7);
    const segmentY = player.y - player.speedY * (i * 0.7);
    
    // Calculate segment size (decreasing as it gets further from player)
    const segmentSize = player.size * (1 - i / trailLength) * 0.8;
    
    // Calculate opacity (decreasing as it gets further from player)
    const opacity = 0.8 * (1 - i / trailLength);
    
    // Add trail segment
    trailSegments.push(
      <circle
        key={`trail-${i}`}
        cx={segmentX}
        cy={segmentY}
        r={segmentSize}
        fill={playerColor}
        opacity={opacity}
        filter="url(#glow)"
      />
    );
  }

  return (
    <g>
      {/* Trail segments (rendered first so player appears on top) */}
      {trailSegments}
      
      {/* Invulnerability aura */}
      {player.invulnerable && (
        <circle
          cx={player.x}
          cy={player.y}
          r={player.size * 2.5 * pulseFactor}
          fill="url(#invulnerabilityGradient)"
        />
      )}
      
      {/* Player glow */}
      <circle
        cx={player.x}
        cy={player.y}
        r={player.size}
        fill={playerColor}
        filter="url(#glow)"
      />
      
      {/* Player core */}
      <circle
        cx={player.x}
        cy={player.y}
        r={player.size / 2}
        fill="#ffffff"
      />
    </g>
  );
};

export default PlayerEntity;
