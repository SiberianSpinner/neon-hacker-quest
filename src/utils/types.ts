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
  SAFETY_KEY = 'safety_key',
  BACKDOOR = 'backdoor'
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
  collectedBackdoors: number; // New field to track backdoor boosters
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

// New type for tracking daily game play
export interface DailyGameStats {
  date: string;
  gamesPlayed: number;
}

// New enum for player skin types
export enum PlayerSkin {
  DEFAULT = 'default',
  PURPLE = 'purple',
  RED = 'red',
  RAINBOW = 'rainbow'
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
  collectedBackdoors: number;
  selectedSkin: PlayerSkin; // New field for selected skin
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

// New type for tracking daily game play
export interface DailyGameStats {
  date: string;
  gamesPlayed: number;
}

// New interface for player skins
export interface PlayerSkinInfo {
  id: PlayerSkin;
  name: string;
  description: string;
  color: string | ((score: number, time: number) => string);
  unlockCondition: () => boolean;
  unlocked: boolean;
}
