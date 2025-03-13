
// Common type definitions used across game modules

export interface Player {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  invulnerable: boolean;
  invulnerableTimer: number;
}

export interface MazeBlock {
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum BoosterType {
  SAFETY_KEY = 'SAFETY_KEY'
}

export interface Booster {
  x: number;
  y: number;
  size: number;
  type: BoosterType;
  active: boolean;
}

export interface GameState {
  player: Player;
  maze: MazeBlock[];
  boosters: Booster[];
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
