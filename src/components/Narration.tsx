// Narration component for describing Nancy's actions

"use client";

import React from "react";

interface NarrationProps {
  text: string;
}

export function Narration({ text }: NarrationProps) {
  return (
    <div
      className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl shadow-lg p-6 border-4 border-pink-300"
      style={{ fontFamily: "Comic Sans MS, cursive" }}
    >
      <div className="text-center">
        <h3 className="text-2xl font-bold text-purple-700 mb-3">
          Nancy Says! 💬
        </h3>
        <div className="bg-white/80 backdrop-blur border-2 border-pink-200 rounded-2xl p-4">
          <p className="text-purple-800 text-lg leading-relaxed">
            {text || "I'm getting ready to start searching! 🔍✨"}
          </p>
        </div>
      </div>
    </div>
  );
}
