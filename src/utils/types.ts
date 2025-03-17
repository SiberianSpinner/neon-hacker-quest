
// Core game objects
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
  colorPhase: number;
}

export enum BoosterType {
  SAFETY_KEY = 'SAFETY_KEY',
  BACKDOOR = 'BACKDOOR'
}

export interface Booster {
  x: number;
  y: number;
  size: number;
  type: BoosterType;
  active: boolean;
}

export enum PlayerSkin {
  DEFAULT = 'default',
  PURPLE = 'purple',
  RED = 'red',
  RAINBOW = 'rainbow'
}

export interface PlayerSkinInfo {
  id: PlayerSkin;
  name: string;
  description: string;
  color: string | 'rainbow';
  unlocked: boolean;
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
  cursorControl: boolean;
  gameWon: boolean;
  collectedSafetyKeys: number;
  collectedBackdoors: number;
  selectedSkin: PlayerSkin;
}

// Achievements
export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  imageSrc?: string;
}

// Add ShapeType enum for maze generation
export enum ShapeType {
  SINGLE = 'SINGLE',
  VERTICAL_DOUBLE = 'VERTICAL_DOUBLE',
  HORIZONTAL_DOUBLE = 'HORIZONTAL_DOUBLE',
  L_SHAPE = 'L_SHAPE'
}
