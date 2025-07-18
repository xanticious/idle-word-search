// Local storage utilities for game state persistence

import { GameState } from "@/types/game";

const STORAGE_KEY = "idle-word-search-game-state";
const SAVE_NAMES_KEY = "idle-word-search-save-names";

export function saveGameState(gameState: GameState): void {
  try {
    // Check if we're on the client side
    if (typeof window === "undefined") return;

    const serializedState = {
      ...gameState,
      currentPuzzle: gameState.currentPuzzle
        ? {
            ...gameState.currentPuzzle,
            foundWords: Array.from(gameState.currentPuzzle.foundWords),
            solutions: Array.from(gameState.currentPuzzle.solutions.entries()),
          }
        : null,
      lastSaveTime: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedState));

    // Also save the player name to the list of save names
    const saveNames = getSaveNames();
    if (!saveNames.includes(gameState.playerName)) {
      saveNames.push(gameState.playerName);
      localStorage.setItem(SAVE_NAMES_KEY, JSON.stringify(saveNames));
    }
  } catch (error) {
    console.error("Failed to save game state:", error);
  }
}

export function loadGameState(): GameState | null {
  try {
    // Check if we're on the client side
    if (typeof window === "undefined") return null;

    const savedState = localStorage.getItem(STORAGE_KEY);
    if (!savedState) return null;

    const parsedState = JSON.parse(savedState);

    // Restore Set and Map objects
    if (parsedState.currentPuzzle) {
      parsedState.currentPuzzle.foundWords = new Set(
        parsedState.currentPuzzle.foundWords
      );
      parsedState.currentPuzzle.solutions = new Map(
        parsedState.currentPuzzle.solutions
      );
    }

    return parsedState as GameState;
  } catch (error) {
    console.error("Failed to load game state:", error);
    return null;
  }
}

export function getSaveNames(): string[] {
  try {
    // Check if we're on the client side
    if (typeof window === "undefined") return [];

    const savedNames = localStorage.getItem(SAVE_NAMES_KEY);
    return savedNames ? JSON.parse(savedNames) : [];
  } catch (error) {
    console.error("Failed to load save names:", error);
    return [];
  }
}

export function deleteSave(playerName: string): void {
  try {
    // Check if we're on the client side
    if (typeof window === "undefined") return;

    // Remove from save names list
    const saveNames = getSaveNames().filter((name) => name !== playerName);
    localStorage.setItem(SAVE_NAMES_KEY, JSON.stringify(saveNames));

    // If this is the current save, clear it
    const currentState = loadGameState();
    if (currentState && currentState.playerName === playerName) {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error("Failed to delete save:", error);
  }
}

export function createDefaultGameState(playerName: string): GameState {
  return {
    playerName,
    totalXP: 0,
    currentXP: 0,
    ascensionLevel: 0,
    upgrades: {
      speed: 0,
      quality: 0,
    },
    currentPuzzle: null,
    nancyState: {
      currentWord: null,
      currentDirection: null,
      currentPosition: null,
      searchPhase: "selecting_word",
      isThinking: false,
      letterIndex: 0,
    },
    gameStats: {
      wordsFound: 0,
      totalXPEarned: 0,
      puzzlesCompleted: 0,
      timeSpentMs: 0,
      ascensions: 0,
    },
    isGameStarted: false,
    lastSaveTime: Date.now(),
  };
}
