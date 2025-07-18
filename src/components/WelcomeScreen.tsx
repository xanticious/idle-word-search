// Welcome screen component for game initialization

"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "@/contexts/GameContext";
import { getSaveNames, deleteSave } from "@/utils/storage";

export function WelcomeScreen() {
  const { dispatch } = useGame();
  const [playerName, setPlayerName] = useState("");
  const [existingSaves, setExistingSaves] = useState<string[]>([]);
  const [showNewGame, setShowNewGame] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Load existing saves on client-side mount
  useEffect(() => {
    setIsClient(true);
    setExistingSaves(getSaveNames());
  }, []);

  const handleNewGame = () => {
    if (playerName.trim()) {
      dispatch({ type: "NEW_GAME", payload: playerName.trim() });
      dispatch({ type: "START_GAME" });
    }
  };

  const handleLoadGame = (name: string) => {
    dispatch({ type: "NEW_GAME", payload: name });
    dispatch({ type: "START_GAME" });
  };

  const handleDeleteSave = (name: string) => {
    deleteSave(name);
    setExistingSaves(getSaveNames());
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center p-4"
      style={{ fontFamily: "Comic Sans MS, cursive" }}
    >
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full border-4 border-purple-200">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-2">
            🌟 Idle Word Search 🌟
          </h1>
          <p className="text-purple-600 text-lg">
            Help Nancy improve her word search skills!
          </p>
        </div>

        {/* Game Rules */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">How to Play:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Watch Nancy search for words automatically</li>
            <li>• Help her by finding words yourself</li>
            <li>• Earn XP to upgrade Nancy's speed and accuracy</li>
            <li>• Ascend to unlock bigger puzzles and more rewards</li>
          </ul>
        </div>

        {/* Existing Saves */}
        {isClient && existingSaves.length > 0 && !showNewGame && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">
              Continue Playing:
            </h3>
            <div className="space-y-2">
              {existingSaves.map((name) => (
                <div key={name} className="flex items-center justify-between">
                  <button
                    onClick={() => handleLoadGame(name)}
                    className="flex-1 text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="font-medium">{name}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteSave(name)}
                    className="ml-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete save"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Game Section */}
        {isClient && (showNewGame || existingSaves.length === 0) && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">
              {existingSaves.length > 0
                ? "Start New Game:"
                : "Enter Your Name:"}
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleNewGame()}
                className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-lg"
                maxLength={20}
              />
              <button
                onClick={handleNewGame}
                disabled={!playerName.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-bold text-lg hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:hover:scale-100"
              >
                🚀 Start Playing!
              </button>
            </div>
          </div>
        )}

        {/* Toggle between new game and existing saves */}
        {isClient && existingSaves.length > 0 && (
          <div className="text-center">
            <button
              onClick={() => setShowNewGame(!showNewGame)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showNewGame ? "Back to Saved Games" : "Start New Game Instead"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
