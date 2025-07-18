// Main game component that orchestrates the entire game

"use client";

import React, { useEffect, useState, useRef } from "react";
import { useGame } from "@/contexts/GameContext";
import { GameHeader } from "@/components/GameHeader";
import { WordList } from "@/components/WordList";
import { LetterGrid } from "@/components/LetterGrid";
import { Narration } from "@/components/Narration";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { NancyAI, NancyUpdate } from "@/utils/nancyAI";

export function IdleWordSearchGame() {
  const { state, dispatch } = useGame();
  const [narrationText, setNarrationText] = useState("");
  const nancyRef = useRef<NancyAI | null>(null);
  const prevFoundWordsRef = useRef<Set<string>>(new Set());

  // Initialize Nancy AI when game starts
  useEffect(() => {
    if (state.isGameStarted && !nancyRef.current) {
      nancyRef.current = new NancyAI(state);
    }

    return () => {
      if (nancyRef.current) {
        nancyRef.current.cleanup();
      }
    };
  }, [state.isGameStarted]);

  // Update Nancy's game state when state changes
  useEffect(() => {
    if (nancyRef.current) {
      nancyRef.current.updateGameState(state);
    }
  }, [state]);

  // Generate initial puzzle
  useEffect(() => {
    if (state.isGameStarted && !state.currentPuzzle) {
      dispatch({ type: "GENERATE_PUZZLE" });
    }
  }, [state.isGameStarted, state.currentPuzzle, dispatch]);

  // Start Nancy's search when puzzle is ready
  useEffect(() => {
    if (
      state.currentPuzzle &&
      nancyRef.current &&
      state.nancyState.searchPhase === "selecting_word"
    ) {
      const handleNancyUpdate = (update: NancyUpdate) => {
        // Update Nancy's state
        if (update.nancyState) {
          dispatch({ type: "UPDATE_NANCY", payload: update.nancyState });
        }

        // Handle found words
        if (update.foundWord) {
          dispatch({ type: "FIND_WORD", payload: update.foundWord });
        }

        // Update narration
        if (update.narration) {
          setNarrationText(update.narration);
        }
      };

      nancyRef.current.startSearching(handleNancyUpdate);
    }
  }, [state.currentPuzzle, state.nancyState.searchPhase, dispatch]);

  // Detect when player finds a word and trigger Nancy's appreciation
  useEffect(() => {
    if (!state.currentPuzzle || !nancyRef.current) return;

    const currentFoundWords = state.currentPuzzle.foundWords;
    const prevFoundWords = prevFoundWordsRef.current;

    // Find newly found words
    const newWords = Array.from(currentFoundWords).filter(
      (word) => !prevFoundWords.has(word)
    );

    if (newWords.length > 0) {
      // Check if any of the new words was Nancy's current word
      newWords.forEach((word) => {
        const wasNancysWord = state.nancyState.currentWord === word;

        // Trigger Nancy's appreciation with a small delay to not interfere with existing narration
        setTimeout(() => {
          if (nancyRef.current) {
            nancyRef.current.playerFoundWord(word, wasNancysWord, (update) => {
              if (update.narration) {
                setNarrationText(update.narration);
              }
            });
          }
        }, 1000); // Small delay so player can see the word being found first
      });
    }

    // Update the ref for next comparison
    prevFoundWordsRef.current = new Set(currentFoundWords);
  }, [state.currentPuzzle?.foundWords, state.nancyState.currentWord]);

  // Generate new puzzle when current one is complete
  useEffect(() => {
    if (
      state.currentPuzzle &&
      state.currentPuzzle.foundWords.size ===
        state.currentPuzzle.words.length &&
      state.nancyState.searchPhase === "between_puzzles"
    ) {
      // Wait a bit then generate new puzzle
      const timeout = setTimeout(() => {
        dispatch({ type: "GENERATE_PUZZLE" });
        setNarrationText("Nancy is ready for a new puzzle!");
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [state.currentPuzzle, state.nancyState.searchPhase, dispatch]);

  // Show welcome screen if game not started
  if (!state.isGameStarted || !state.playerName) {
    return <WelcomeScreen />;
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100"
      style={{ fontFamily: "Comic Sans MS, cursive" }}
    >
      <GameHeader />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Word List */}
          <div className="lg:col-span-1">
            <WordList />
          </div>

          {/* Right Column - Letter Grid */}
          <div className="lg:col-span-2">
            <LetterGrid />
          </div>
        </div>

        {/* Bottom - Narration */}
        <div className="mt-8">
          <Narration text={narrationText} />
        </div>
      </main>
    </div>
  );
}
