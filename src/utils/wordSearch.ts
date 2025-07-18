// Word search puzzle generation utilities

import {
  WordSearchPuzzle,
  WordSolution,
  Position,
  Direction,
} from "@/types/game";
import { WORD_LISTS, DIRECTIONS } from "@/config/game";

function getRandomWords(gridSize: number, count: number = 8): string[] {
  let wordList: string[];

  if (gridSize <= 10) {
    wordList = WORD_LISTS.small;
  } else if (gridSize <= 13) {
    wordList = [...WORD_LISTS.small, ...WORD_LISTS.medium];
  } else {
    wordList = [...WORD_LISTS.small, ...WORD_LISTS.medium, ...WORD_LISTS.large];
  }

  // Filter words that can fit in the grid
  const validWords = wordList.filter((word) => word.length <= gridSize - 1);

  // Shuffle and take the first 'count' words
  const shuffled = [...validWords].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function canPlaceWord(
  grid: string[][],
  word: string,
  start: Position,
  direction: Direction
): boolean {
  const delta = DIRECTIONS[direction];
  const gridSize = grid.length;

  for (let i = 0; i < word.length; i++) {
    const row = start.row + delta.row * i;
    const col = start.col + delta.col * i;

    // Check bounds
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
      return false;
    }

    // Check if cell is empty or contains the same letter
    if (grid[row][col] !== "" && grid[row][col] !== word[i]) {
      return false;
    }
  }

  return true;
}

function placeWord(
  grid: string[][],
  word: string,
  start: Position,
  direction: Direction
): WordSolution {
  const delta = DIRECTIONS[direction];

  for (let i = 0; i < word.length; i++) {
    const row = start.row + delta.row * i;
    const col = start.col + delta.col * i;
    grid[row][col] = word[i];
  }

  const end: Position = {
    row: start.row + delta.row * (word.length - 1),
    col: start.col + delta.col * (word.length - 1),
  };

  return { word, start, end, direction };
}

function fillEmptySpaces(grid: string[][]): void {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] === "") {
        grid[row][col] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
}

export function generateWordSearch(gridSize: number): WordSearchPuzzle {
  const grid: string[][] = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(""));
  const words = getRandomWords(gridSize);
  const solutions = new Map<string, WordSolution>();
  const directions: Direction[] = ["E", "S", "N", "W", "NE", "SE", "SW", "NW"];

  // Try to place each word
  for (const word of words) {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!placed && attempts < maxAttempts) {
      const direction =
        directions[Math.floor(Math.random() * directions.length)];
      const start: Position = {
        row: Math.floor(Math.random() * gridSize),
        col: Math.floor(Math.random() * gridSize),
      };

      if (canPlaceWord(grid, word, start, direction)) {
        const solution = placeWord(grid, word, start, direction);
        solutions.set(word, solution);
        placed = true;
      }

      attempts++;
    }

    // If we couldn't place the word, remove it from the word list
    if (!placed) {
      const index = words.indexOf(word);
      if (index > -1) {
        words.splice(index, 1);
      }
    }
  }

  // Fill empty spaces with random letters
  fillEmptySpaces(grid);

  return {
    grid,
    words,
    foundWords: new Set(),
    solutions,
    size: gridSize,
  };
}

export function isValidWordSelection(
  puzzle: WordSearchPuzzle,
  word: string,
  start: Position,
  end: Position
): boolean {
  const solution = puzzle.solutions.get(word);
  if (!solution) return false;

  // Check if the selection matches the solution (either direction)
  const matchesForward =
    solution.start.row === start.row &&
    solution.start.col === start.col &&
    solution.end.row === end.row &&
    solution.end.col === end.col;

  const matchesBackward =
    solution.start.row === end.row &&
    solution.start.col === end.col &&
    solution.end.row === start.row &&
    solution.end.col === start.col;

  return matchesForward || matchesBackward;
}
