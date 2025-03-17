
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
    1 + 0.3 * Math.sin(time * 0.0004 * Math.PI) : 1;

  return (
    <g>
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
      
      {/* "Data stream" effect behind player */}
      <line
        x1={player.x}
        y1={player.y}
        x2={player.x - player.speedX * 5}
        y2={player.y - player.speedY * 5}
        stroke={playerColor}
        strokeOpacity="0.4"
        strokeWidth="2"
      />
    </g>
  );
};

export default PlayerEntity;
