// Core game types and interfaces

export type Direction = "E" | "S" | "N" | "W" | "NE" | "SE" | "SW" | "NW";

export interface Position {
  row: number;
  col: number;
}

export interface WordSolution {
  word: string;
  start: Position;
  end: Position;
  direction: Direction;
}

export interface WordSearchPuzzle {
  grid: string[][];
  words: string[];
  foundWords: Set<string>;
  solutions: Map<string, WordSolution>;
  size: number;
}

export interface NancyState {
  currentWord: string | null;
  currentDirection: Direction | null;
  currentPosition: Position | null;
  searchPhase:
    | "selecting_word"
    | "searching"
    | "checking_letters"
    | "resting"
    | "between_puzzles";
  isThinking: boolean;
  letterIndex: number; // When checking letters in a word
}

export interface Upgrades {
  speed: number;
  quality: number;
}

export interface GameStatistics {
  wordsFound: number;
  totalXPEarned: number;
  puzzlesCompleted: number;
  timeSpentMs: number;
  ascensions: number;
}

export interface GameState {
  playerName: string;
  totalXP: number;
  currentXP: number;
  ascensionLevel: number;
  upgrades: Upgrades;
  currentPuzzle: WordSearchPuzzle | null;
  nancyState: NancyState;
  gameStats: GameStatistics;
  isGameStarted: boolean;
  lastSaveTime: number;
}

export interface UpgradeConfig {
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  effect: number; // Percentage improvement per level
}

export interface GameConfig {
  baseGridSize: number;
  baseXPMultiplier: number;
  upgrades: {
    speed: UpgradeConfig;
    quality: UpgradeConfig;
  };
  timings: {
    positionCheck: number; // ms
    letterCheck: number; // ms
    betweenWords: number; // ms
    betweenPuzzles: number; // ms
  };
  errorRates: {
    skipWord: number; // base percentage
    skipDirection: number;
    skipPosition: number;
    falsePositive: number;
  };
}
