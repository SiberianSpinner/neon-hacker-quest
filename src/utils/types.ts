
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
  BACKDOOR = 'BACKDOOR',
  MEMORY_CARD = 'MEMORY_CARD'
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

// New interface for boss core lines
export interface BossCoreLine {
  id: string;
  points: [number, number][]; // Array of x,y coordinates for the line
  isVulnerable: boolean;
  destroyed: boolean;
}

// New interface for boss core
export interface BossCore {
  active: boolean;
  x: number;
  y: number;
  level: 1 | 2 | 3; // 1 = 33k, 2 = 66k, 3 = 99k
  outerSquareSize: number;
  innerSquareSize: number;
  outerRotationAngle: number;
  innerRotationAngle: number;
  outerLines: BossCoreLine[];
  innerLines: BossCoreLine[];
  memoryCard: Booster;
  vulnerableLinesTimer: number;
  cooldownTimer: number; // Timer after boss is defeated
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
  // Add boss core to game state
  bossCore: BossCore | null;
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
