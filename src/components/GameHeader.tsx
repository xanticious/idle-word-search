// Game header component with title, XP, and upgrades

"use client";

import React from "react";
import { useGame } from "@/contexts/GameContext";

export function GameHeader() {
  const { state, dispatch, getUpgradeCost, canUpgrade, isMaxLevel } = useGame();

  const handleUpgrade = (type: "speed" | "quality") => {
    if (canUpgrade(type)) {
      dispatch({ type: "UPGRADE", payload: type });
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <header className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 shadow-lg border-b-4 border-purple-300 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Game Title */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            🌟 Idle Word Search
          </h1>
        </div>

        {/* Main Heading */}
        <div className="flex-1 text-center">
          <h2 className="text-xl font-bold text-white drop-shadow-md">
            Help Nancy Get Better at Word Searches! 👧
          </h2>
        </div>

        {/* XP and Upgrades */}
        <div className="flex-1 flex items-center justify-end space-x-6">
          {/* XP Counter */}
          <div className="text-right bg-white bg-opacity-90 rounded-lg px-4 py-2 shadow-lg">
            <div className="text-sm text-purple-600 font-semibold">
              Experience Points
            </div>
            <div className="text-2xl font-bold text-purple-800">
              ⭐ {formatNumber(state.currentXP)} XP
            </div>
            <div className="text-xs text-purple-500">
              Total: {formatNumber(state.totalXP)}
            </div>
          </div>

          {/* Upgrade Buttons */}
          <div className="flex space-x-3">
            {/* Speed Upgrade */}
            <div className="text-center bg-white bg-opacity-90 rounded-lg px-4 py-3 shadow-lg">
              <div className="text-sm font-bold text-blue-700 mb-1">
                🚀 Speed
              </div>
              <div className="text-xs text-blue-600 mb-2">
                Level {state.upgrades.speed}
                {isMaxLevel("speed") && (
                  <span className="text-green-600 font-medium"> (MAX)</span>
                )}
              </div>
              <button
                onClick={() => handleUpgrade("speed")}
                disabled={!canUpgrade("speed")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105 ${
                  canUpgrade("speed")
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isMaxLevel("speed")
                  ? "✅ MAX"
                  : `Upgrade (${formatNumber(getUpgradeCost("speed"))} XP)`}
              </button>
            </div>

            {/* Quality Upgrade */}
            <div className="text-center bg-white bg-opacity-90 rounded-lg px-4 py-3 shadow-lg">
              <div className="text-sm font-bold text-green-700 mb-1">
                ⭐ Quality
              </div>
              <div className="text-xs text-green-600 mb-2">
                Level {state.upgrades.quality}
                {isMaxLevel("quality") && (
                  <span className="text-green-600 font-medium"> (MAX)</span>
                )}
              </div>
              <button
                onClick={() => handleUpgrade("quality")}
                disabled={!canUpgrade("quality")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105 ${
                  canUpgrade("quality")
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isMaxLevel("quality")
                  ? "✅ MAX"
                  : `Upgrade (${formatNumber(getUpgradeCost("quality"))} XP)`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
