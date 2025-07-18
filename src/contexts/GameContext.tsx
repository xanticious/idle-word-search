// Game context and hook for state management

"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { GameState, WordSearchPuzzle, Position } from "@/types/game";
import { generateWordSearch, isValidWordSelection } from "@/utils/wordSearch";
import {
  saveGameState,
  loadGameState,
  createDefaultGameState,
} from "@/utils/storage";
import { GAME_CONFIG } from "@/config/game";

type GameAction =
  | { type: "LOAD_GAME"; payload: GameState }
  | { type: "NEW_GAME"; payload: string }
  | { type: "START_GAME" }
  | { type: "GENERATE_PUZZLE" }
  | { type: "FIND_WORD"; payload: string }
  | {
      type: "PLAYER_FIND_WORD";
      payload: { word: string; start: Position; end: Position };
    }
  | {
      type: "PLAYER_HELPED_NANCY";
      payload: { word: string; wasMyWord: boolean };
    }
  | { type: "UPDATE_NANCY"; payload: Partial<GameState["nancyState"]> }
  | { type: "UPGRADE"; payload: "speed" | "quality" }
  | { type: "SAVE_GAME" };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "LOAD_GAME":
      return action.payload;

    case "NEW_GAME":
      return createDefaultGameState(action.payload);

    case "START_GAME":
      return {
        ...state,
        isGameStarted: true,
      };

    case "GENERATE_PUZZLE": {
      const gridSize = GAME_CONFIG.baseGridSize + state.ascensionLevel;
      const puzzle = generateWordSearch(gridSize);
      return {
        ...state,
        currentPuzzle: puzzle,
        nancyState: {
          ...state.nancyState,
          currentWord: null,
          currentDirection: null,
          currentPosition: null,
          searchPhase: "selecting_word",
          isThinking: false,
          letterIndex: 0,
        },
      };
    }

    case "FIND_WORD": {
      if (!state.currentPuzzle) return state;

      const word = action.payload;
      const foundWords = new Set(state.currentPuzzle.foundWords);
      foundWords.add(word);

      const xpGained = 1 * (1 + state.ascensionLevel);

      return {
        ...state,
        currentPuzzle: {
          ...state.currentPuzzle,
          foundWords,
        },
        currentXP: state.currentXP + xpGained,
        totalXP: state.totalXP + xpGained,
        gameStats: {
          ...state.gameStats,
          wordsFound: state.gameStats.wordsFound + 1,
          totalXPEarned: state.gameStats.totalXPEarned + xpGained,
        },
      };
    }

    case "PLAYER_FIND_WORD": {
      if (!state.currentPuzzle) return state;

      const { word, start, end } = action.payload;

      // Validate the selection
      if (!isValidWordSelection(state.currentPuzzle, word, start, end)) {
        return state;
      }

      // Same logic as FIND_WORD but triggered by player
      const foundWords = new Set(state.currentPuzzle.foundWords);
      foundWords.add(word);

      const xpGained = 1 * (1 + state.ascensionLevel);

      return {
        ...state,
        currentPuzzle: {
          ...state.currentPuzzle,
          foundWords,
        },
        currentXP: state.currentXP + xpGained,
        totalXP: state.totalXP + xpGained,
        gameStats: {
          ...state.gameStats,
          wordsFound: state.gameStats.wordsFound + 1,
          totalXPEarned: state.gameStats.totalXPEarned + xpGained,
        },
      };
    }

    case "UPDATE_NANCY":
      return {
        ...state,
        nancyState: {
          ...state.nancyState,
          ...action.payload,
        },
      };

    case "UPGRADE": {
      const upgradeType = action.payload;
      const currentLevel = state.upgrades[upgradeType];
      const maxLevel =
        GAME_CONFIG.upgrades[upgradeType].maxLevel + state.ascensionLevel;

      if (currentLevel >= maxLevel) return state;

      const baseCost = GAME_CONFIG.upgrades[upgradeType].baseCost;
      const multiplier = GAME_CONFIG.upgrades[upgradeType].costMultiplier;
      const cost = Math.floor(baseCost * Math.pow(multiplier, currentLevel));

      if (state.currentXP < cost) return state;

      return {
        ...state,
        currentXP: state.currentXP - cost,
        upgrades: {
          ...state.upgrades,
          [upgradeType]: currentLevel + 1,
        },
      };
    }

    case "SAVE_GAME":
      // This is handled in the effect, just return current state
      return state;

    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  getUpgradeCost: (type: "speed" | "quality") => number;
  canUpgrade: (type: "speed" | "quality") => boolean;
  isMaxLevel: (type: "speed" | "quality") => boolean;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const initialState = createDefaultGameState("");
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load saved game on mount
  useEffect(() => {
    const savedState = loadGameState();
    if (savedState) {
      dispatch({ type: "LOAD_GAME", payload: savedState });
    }
  }, []);

  // Auto-save game state
  useEffect(() => {
    if (state.isGameStarted && state.playerName) {
      saveGameState(state);
    }
  }, [state]);

  const getUpgradeCost = useCallback(
    (type: "speed" | "quality"): number => {
      const currentLevel = state.upgrades[type];
      const baseCost = GAME_CONFIG.upgrades[type].baseCost;
      const multiplier = GAME_CONFIG.upgrades[type].costMultiplier;
      return Math.floor(baseCost * Math.pow(multiplier, currentLevel));
    },
    [state.upgrades]
  );

  const canUpgrade = useCallback(
    (type: "speed" | "quality"): boolean => {
      return state.currentXP >= getUpgradeCost(type) && !isMaxLevel(type);
    },
    [state.currentXP, getUpgradeCost]
  );

  const isMaxLevel = useCallback(
    (type: "speed" | "quality"): boolean => {
      const currentLevel = state.upgrades[type];
      const maxLevel =
        GAME_CONFIG.upgrades[type].maxLevel + state.ascensionLevel;
      return currentLevel >= maxLevel;
    },
    [state.upgrades, state.ascensionLevel]
  );

  const value: GameContextType = {
    state,
    dispatch,
    getUpgradeCost,
    canUpgrade,
    isMaxLevel,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
