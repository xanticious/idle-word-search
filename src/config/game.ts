// Game configuration constants

import { GameConfig } from "@/types/game";

export const GAME_CONFIG: GameConfig = {
  baseGridSize: 10,
  baseXPMultiplier: 1,
  upgrades: {
    speed: {
      maxLevel: 10,
      baseCost: 10,
      costMultiplier: 1.5,
      effect: 15, // 15% speed improvement per level
    },
    quality: {
      maxLevel: 10,
      baseCost: 15,
      costMultiplier: 1.4,
      effect: 20, // 20% error reduction per level
    },
  },
  timings: {
    positionCheck: 1000, // 1 second base
    letterCheck: 500, // 0.5 seconds base
    betweenWords: 2000, // 2 seconds base
    betweenPuzzles: 5000, // 5 seconds base
  },
  errorRates: {
    skipWord: 0.1, // 10% base chance
    skipDirection: 0.05, // 5% base chance
    skipPosition: 0.03, // 3% base chance
    falsePositive: 0.15, // 15% base chance
  },
};

// Word lists for different grid sizes
export const WORD_LISTS = {
  small: [
    // For 8x8 to 10x10 grids
    "CAT",
    "DOG",
    "SUN",
    "MOON",
    "STAR",
    "TREE",
    "BIRD",
    "FISH",
    "BOOK",
    "GAME",
    "PLAY",
    "JUMP",
    "SWIM",
    "SING",
    "DANCE",
    "SMILE",
    "HAPPY",
    "BRAVE",
    "QUICK",
    "LIGHT",
    "MAGIC",
    "DREAM",
    "OCEAN",
    "FOREST",
  ],
  medium: [
    // For 11x11 to 13x13 grids
    "CASTLE",
    "DRAGON",
    "WIZARD",
    "KNIGHT",
    "PRINCESS",
    "RAINBOW",
    "UNICORN",
    "ADVENTURE",
    "TREASURE",
    "MYSTERY",
    "JOURNEY",
    "FRIENDSHIP",
    "COURAGE",
    "FREEDOM",
    "WISDOM",
    "HARMONY",
    "CRYSTAL",
    "PHOENIX",
    "GALAXY",
    "PLANET",
  ],
  large: [
    // For 14x14+ grids
    "BUTTERFLY",
    "ELEPHANT",
    "GIRAFFE",
    "PENGUIN",
    "KANGAROO",
    "DOLPHIN",
    "THUNDERSTORM",
    "WATERFALL",
    "MOUNTAIN",
    "TELESCOPE",
    "MICROSCOPE",
    "CONSTELLATION",
    "IMAGINATION",
    "EXTRAORDINARY",
    "MAGNIFICENT",
    "SPECTACULAR",
  ],
};

export const DIRECTIONS = {
  E: { row: 0, col: 1 }, // East
  S: { row: 1, col: 0 }, // South
  N: { row: -1, col: 0 }, // North
  W: { row: 0, col: -1 }, // West
  NE: { row: -1, col: 1 }, // Northeast
  SE: { row: 1, col: 1 }, // Southeast
  SW: { row: 1, col: -1 }, // Southwest
  NW: { row: -1, col: -1 }, // Northwest
} as const;

// Nancy's appreciation phrases
export const NANCY_PHRASES = {
  foundMyWord: [
    "Thank you! 😊",
    "Thanks so much! 🎉",
    "You found it! 🌟",
    "Yay, that one was really tricky! 🎯",
    "Amazing! You're so helpful! 💖",
    "Wow, you're good at this! ⭐",
    "Perfect! I was having trouble with that one! 🎊",
  ],
  foundOtherWord: [
    "Thanks! 😄",
    "Thanks for helping! 💕",
    "Great job! 🌈",
    "Nice find! ✨",
    "You're so helpful! 🤗",
    "Awesome! 🎈",
  ],
  oopsWrongMatch: [
    "Oops! That didn't match! 😅",
    "Oops! Not quite right! 🤔",
    "Hmm, that's not it! 😊",
  ],
  skippedWord: [
    'Oops! Looks like I accidentally skipped "{word}"! 😮',
    'Oh no! I think I missed "{word}"! 🙈',
    'Whoops! I forgot about "{word}"! 😅',
  ],
};
