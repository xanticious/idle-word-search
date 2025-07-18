"use client";

import { GameProvider } from "@/contexts/GameContext";
import { IdleWordSearchGame } from "@/components/IdleWordSearchGame";

export default function Home() {
  return (
    <GameProvider>
      <IdleWordSearchGame />
    </GameProvider>
  );
}
