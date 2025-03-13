
// Common type definitions used across game modules

export interface Player {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
}

export interface MazeBlock {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SideBarrier {
  side: 'left' | 'right';
  x: number;
  width: number;
  color: string;
}

export interface GameState {
  player: Player;
  maze: MazeBlock[];
  sideBarriers: SideBarrier[];
  score: number;
  gameSpeed: number;
  attemptsLeft: number;
  gameActive: boolean;
  colorPhase: number;
  cursorControl: boolean; // Track if cursor control is active
}

// Shape type enum
export enum ShapeType {
  SINGLE = 'SINGLE',
  VERTICAL_DOUBLE = 'VERTICAL_DOUBLE',
  HORIZONTAL_DOUBLE = 'HORIZONTAL_DOUBLE',
  L_SHAPE = 'L_SHAPE'
}

