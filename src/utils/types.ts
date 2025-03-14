
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

export enum ShapeType {
  SINGLE = 'single',
  VERTICAL_DOUBLE = 'vertical_double',
  HORIZONTAL_DOUBLE = 'horizontal_double',
  L_SHAPE = 'l_shape'
}

export enum BoosterType {
  SAFETY_KEY = 'safety_key'
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
  cursorControl: boolean;
  gameWon?: boolean;
  collectedSafetyKeys: number;
}

// New achievement-related types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  imageSrc: string;
  unlocked: boolean;
  unlockCondition: () => boolean;
}
