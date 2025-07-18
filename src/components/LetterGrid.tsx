// Letter grid component for the word search puzzle

"use client";

import React, { useState, useCallback } from "react";
import { useGame } from "@/contexts/GameContext";
import { Position, WordSolution } from "@/types/game";

interface CellSelection {
  start: Position | null;
  end: Position | null;
}

export function LetterGrid() {
  const { state, dispatch } = useGame();
  const [selection, setSelection] = useState<CellSelection>({
    start: null,
    end: null,
  });
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  // Handle word selection from the word list
  const handleWordSelect = useCallback(
    (word: string) => {
      if (!state.currentPuzzle || state.currentPuzzle.foundWords.has(word))
        return;
      setSelectedWord(word);
      setSelection({ start: null, end: null });
    },
    [state.currentPuzzle]
  );

  // Handle cell click for player word selection
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (
        !selectedWord ||
        !state.currentPuzzle ||
        state.currentPuzzle.foundWords.has(selectedWord)
      )
        return;

      const position: Position = { row, col };

      if (!selection.start) {
        // First click - set start position
        setSelection({ start: position, end: null });
      } else if (!selection.end) {
        // Second click - set end position and validate
        const newSelection = { start: selection.start, end: position };
        setSelection(newSelection);

        // Try to find the word
        dispatch({
          type: "PLAYER_FIND_WORD",
          payload: {
            word: selectedWord,
            start: selection.start,
            end: position,
          },
        });

        // Reset selection
        setTimeout(() => {
          setSelection({ start: null, end: null });
          setSelectedWord(null);
        }, 500);
      } else {
        // Reset and start new selection
        setSelection({ start: position, end: null });
      }
    },
    [selectedWord, selection, state.currentPuzzle, dispatch]
  );

  // Get cell styling based on state
  const getCellStyle = useCallback(
    (row: number, col: number): string => {
      if (!state.currentPuzzle) return "";

      const { foundWords, solutions } = state.currentPuzzle;
      const { currentPosition, letterIndex, searchPhase } = state.nancyState;

      const baseStyle =
        "w-8 h-8 flex items-center justify-center text-lg font-bold cursor-pointer transition-all hover:bg-gray-100 rounded-md text-gray-800";

      // Check if this cell is part of a found word
      let isFoundCell = false;
      foundWords.forEach((word) => {
        const solution = solutions.get(word);
        if (solution && isCellInWord(row, col, solution)) {
          isFoundCell = true;
        }
      });

      if (isFoundCell) {
        return `${baseStyle} bg-green-200 text-green-900 font-extrabold`;
      }

      // Check if this is Nancy's current position
      if (
        currentPosition &&
        currentPosition.row === row &&
        currentPosition.col === col
      ) {
        return `${baseStyle} bg-blue-300 text-blue-900 font-extrabold ring-2 ring-blue-400`;
      }

      // Check if this cell is in Nancy's current word checking path
      if (
        searchPhase === "checking_letters" &&
        currentPosition &&
        state.nancyState.currentWord &&
        state.nancyState.currentDirection
      ) {
        const solution = solutions.get(state.nancyState.currentWord);
        if (
          solution &&
          isCellInWordPath(
            row,
            col,
            currentPosition,
            state.nancyState.currentDirection!,
            letterIndex
          )
        ) {
          return `${baseStyle} bg-blue-100 text-blue-800 font-extrabold`;
        }
      }

      // Check if this cell is part of player selection
      if (
        selectedWord &&
        ((selection.start &&
          selection.start.row === row &&
          selection.start.col === col) ||
          (selection.end &&
            selection.end.row === row &&
            selection.end.col === col))
      ) {
        return `${baseStyle} bg-yellow-300 text-yellow-900 font-extrabold`;
      }

      return baseStyle;
    },
    [state.currentPuzzle, state.nancyState, selection, selectedWord]
  );

  // Helper function to check if a cell is part of a found word
  const isCellInWord = (
    row: number,
    col: number,
    solution: WordSolution
  ): boolean => {
    const { start, end } = solution;

    // Calculate direction
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;
    const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));

    if (steps === 0) return row === start.row && col === start.col;

    const rowStep = rowDiff / steps;
    const colStep = colDiff / steps;

    for (let i = 0; i <= steps; i++) {
      const checkRow = start.row + Math.round(rowStep * i);
      const checkCol = start.col + Math.round(colStep * i);

      if (checkRow === row && checkCol === col) {
        return true;
      }
    }

    return false;
  };

  // Helper function to check if a cell is in Nancy's current word checking path
  const isCellInWordPath = (
    row: number,
    col: number,
    startPos: Position,
    direction: string,
    maxIndex: number
  ): boolean => {
    // This is a simplified version - you might want to make it more accurate
    return false; // For now, we'll just highlight Nancy's exact position
  };

  if (!state.currentPuzzle) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-96 flex items-center justify-center">
        <div className="text-gray-500">No puzzle loaded</div>
      </div>
    );
  }

  const { grid, foundWords } = state.currentPuzzle;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Letter Grid
        </h3>
        {selectedWord && (
          <div className="text-sm text-blue-600 font-medium">
            Click start and end letters for "{selectedWord}"
          </div>
        )}
      </div>

      <div
        className="grid gap-2 justify-center"
        style={{ gridTemplateColumns: `repeat(${grid.length}, 1fr)` }}
      >
        {grid.map((row, rowIndex) =>
          row.map((letter, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getCellStyle(rowIndex, colIndex)}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {letter}
            </div>
          ))
        )}
      </div>

      {/* Word selection UI */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Available Words:
        </h4>
        <div className="flex flex-wrap gap-2">
          {state.currentPuzzle.words
            .filter((word) => !foundWords.has(word))
            .map((word) => (
              <button
                key={word}
                onClick={() => handleWordSelect(word)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedWord === word
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {word}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
