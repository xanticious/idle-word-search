// Word list component showing target words

"use client";

import React from "react";
import { useGame } from "@/contexts/GameContext";

export function WordList() {
  const { state } = useGame();

  if (!state.currentPuzzle) {
    return (
      <div
        className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl shadow-lg p-6 h-96 flex items-center justify-center border-4 border-yellow-300"
        style={{ fontFamily: "Comic Sans MS, cursive" }}
      >
        <div className="text-purple-600 text-lg">No puzzle loaded! 🧩</div>
      </div>
    );
  }

  const { words, foundWords } = state.currentPuzzle;
  const { currentWord } = state.nancyState;

  return (
    <div
      className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl shadow-lg p-6 h-96 overflow-auto border-4 border-blue-300"
      style={{ fontFamily: "Comic Sans MS, cursive" }}
    >
      <h3 className="text-2xl font-bold text-purple-700 mb-4">
        Words to Find! 🔍 ({foundWords.size}/{words.length})
      </h3>

      <div className="space-y-2">
        {words.map((word) => {
          const isFound = foundWords.has(word);
          const isCurrent = word === currentWord;

          return (
            <div
              key={word}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                isFound
                  ? "bg-green-100 text-green-800 line-through"
                  : isCurrent
                  ? "bg-yellow-100 text-yellow-800 ring-2 ring-yellow-300"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{word}</span>
                {isFound && <span className="text-green-600 text-xs">✓</span>}
                {isCurrent && (
                  <span className="text-yellow-600 text-xs">👀</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {foundWords.size === words.length && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="text-green-800 text-sm font-medium text-center">
            🎉 Puzzle Complete! 🎉
          </div>
        </div>
      )}
    </div>
  );
}
