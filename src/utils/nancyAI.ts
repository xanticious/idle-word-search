// Nancy AI logic for automated word searching

import { GameState, Direction, Position, WordSearchPuzzle } from "@/types/game";
import { GAME_CONFIG, DIRECTIONS, NANCY_PHRASES } from "@/config/game";

export interface NancyUpdate {
  nancyState: Partial<GameState["nancyState"]>;
  foundWord?: string;
  narration: string;
}

export class NancyAI {
  private gameState: GameState;
  private timeouts: Set<NodeJS.Timeout> = new Set();

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  public cleanup() {
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts.clear();
  }

  // Helper functions for Nancy's personality
  private getRandomPhrase(phraseArray: string[], word?: string): string {
    const phrase = phraseArray[Math.floor(Math.random() * phraseArray.length)];
    return word ? phrase.replace("{word}", word) : phrase;
  }

  private getFoundMyWordPhrase(): string {
    return this.getRandomPhrase(NANCY_PHRASES.foundMyWord);
  }

  private getFoundOtherWordPhrase(): string {
    return this.getRandomPhrase(NANCY_PHRASES.foundOtherWord);
  }

  private getOopsPhrase(): string {
    return this.getRandomPhrase(NANCY_PHRASES.oopsWrongMatch);
  }

  private getSkippedPhrase(word: string): string {
    return this.getRandomPhrase(NANCY_PHRASES.skippedWord, word);
  }

  public updateGameState(newState: GameState) {
    this.gameState = newState;
  }

  public playerFoundWord(
    word: string,
    wasMyWord: boolean,
    onUpdate: (update: NancyUpdate) => void
  ) {
    // Nancy appreciates the help!
    const appreciationPhrase = wasMyWord
      ? this.getFoundMyWordPhrase()
      : this.getFoundOtherWordPhrase();

    onUpdate({
      nancyState: {},
      narration: appreciationPhrase,
    });
  }

  public startSearching(onUpdate: (update: NancyUpdate) => void) {
    if (!this.gameState.currentPuzzle || !this.gameState.isGameStarted) {
      return;
    }

    // Start Nancy's search process
    this.selectNextWord(onUpdate);
  }

  private selectNextWord(onUpdate: (update: NancyUpdate) => void) {
    const puzzle = this.gameState.currentPuzzle!;
    const remainingWords = puzzle.words.filter(
      (word) => !puzzle.foundWords.has(word)
    );

    if (remainingWords.length === 0) {
      // Puzzle complete!
      this.completePuzzle(onUpdate);
      return;
    }

    // Nancy might skip a word due to quality issues
    const skipChance = this.getErrorRate("skipWord");
    if (Math.random() < skipChance && remainingWords.length > 1) {
      // Skip this word and try another
      const skippedWord = remainingWords[0];
      const nextWord = remainingWords[1];

      const timeout = setTimeout(() => {
        onUpdate({
          nancyState: {
            currentWord: nextWord,
            searchPhase: "selecting_word",
          },
          narration: `${this.getSkippedPhrase(
            skippedWord
          )} I'll look for "${nextWord}" instead.`,
        });
        this.startSearchingWord(nextWord, onUpdate);
      }, this.getTiming("betweenWords"));

      this.timeouts.add(timeout);
      return;
    }

    const targetWord = remainingWords[0];

    const timeout = setTimeout(() => {
      onUpdate({
        nancyState: {
          currentWord: targetWord,
          searchPhase: "selecting_word",
        },
        narration: `I'm looking for "${targetWord}" in the grid.`,
      });
      this.startSearchingWord(targetWord, onUpdate);
    }, this.getTiming("betweenWords"));

    this.timeouts.add(timeout);
  }

  private startSearchingWord(
    word: string,
    onUpdate: (update: NancyUpdate) => void
  ) {
    const directions: Direction[] = [
      "E",
      "S",
      "N",
      "W",
      "NE",
      "SE",
      "SW",
      "NW",
    ];
    let directionIndex = 0;

    const searchNextDirection = () => {
      if (directionIndex >= directions.length) {
        // Nancy couldn't find the word (this shouldn't happen in a valid puzzle)
        onUpdate({
          nancyState: {
            currentWord: null,
            currentDirection: null,
            currentPosition: null,
            searchPhase: "selecting_word",
          },
          narration: `I couldn't find "${word}" and moved on. 🤔`,
        });
        this.selectNextWord(onUpdate);
        return;
      }

      const direction = directions[directionIndex];

      // Nancy might skip a direction
      const skipChance = this.getErrorRate("skipDirection");
      if (Math.random() < skipChance) {
        directionIndex++;
        searchNextDirection();
        return;
      }

      onUpdate({
        nancyState: {
          currentDirection: direction,
          searchPhase: "searching",
        },
        narration: `I'm searching ${this.getDirectionName(
          direction
        )} for "${word}".`,
      });

      this.searchInDirection(word, direction, onUpdate, () => {
        directionIndex++;
        searchNextDirection();
      });
    };

    searchNextDirection();
  }

  private searchInDirection(
    word: string,
    direction: Direction,
    onUpdate: (update: NancyUpdate) => void,
    onComplete: () => void
  ) {
    const puzzle = this.gameState.currentPuzzle!;
    const gridSize = puzzle.size;
    let row = 0;
    let col = 0;

    const searchNextPosition = () => {
      // Find next valid position
      while (row < gridSize) {
        while (col < gridSize) {
          // Nancy might skip a position
          const skipChance = this.getErrorRate("skipPosition");
          if (Math.random() < skipChance) {
            col++;
            continue;
          }

          const position: Position = { row, col };

          if (this.canWordFitAt(word, position, direction, gridSize)) {
            onUpdate({
              nancyState: {
                currentPosition: position,
                isThinking: true,
              },
              narration: `I'm checking position (${row + 1}, ${col + 1})...`,
            });

            this.checkWordAtPosition(
              word,
              position,
              direction,
              onUpdate,
              () => {
                col++;
                const timeout = setTimeout(
                  searchNextPosition,
                  this.getTiming("positionCheck")
                );
                this.timeouts.add(timeout);
              }
            );
            return;
          }

          col++;
        }
        row++;
        col = 0;
      }

      // Finished searching this direction
      onComplete();
    };

    searchNextPosition();
  }

  private checkWordAtPosition(
    word: string,
    position: Position,
    direction: Direction,
    onUpdate: (update: NancyUpdate) => void,
    onComplete: () => void
  ) {
    const puzzle = this.gameState.currentPuzzle!;
    const delta = DIRECTIONS[direction];
    let letterIndex = 0;

    const checkNextLetter = () => {
      if (letterIndex >= word.length) {
        // Found the word!
        onUpdate({
          nancyState: {
            isThinking: false,
            letterIndex: 0,
          },
          foundWord: word,
          narration: `I found "${word}"! 🎉`,
        });
        return;
      }

      const currentRow = position.row + delta.row * letterIndex;
      const currentCol = position.col + delta.col * letterIndex;
      const gridLetter = puzzle.grid[currentRow][currentCol];
      const targetLetter = word[letterIndex];

      onUpdate({
        nancyState: {
          letterIndex,
          searchPhase: "checking_letters",
        },
        narration: `I'm checking letter ${
          letterIndex + 1
        } of "${word}": ${targetLetter}...`,
      });

      const timeout = setTimeout(() => {
        // Nancy might make a false positive
        const falsePositiveChance = this.getErrorRate("falsePositive");
        const actualMatch = gridLetter === targetLetter;

        if (
          !actualMatch ||
          (actualMatch && Math.random() < falsePositiveChance)
        ) {
          // Letter doesn't match or Nancy thinks it doesn't match
          onUpdate({
            nancyState: {
              isThinking: false,
              letterIndex: 0,
            },
            narration: actualMatch
              ? `Nancy thought the letter didn't match and moved on.`
              : `Letter doesn't match. Nancy continues searching.`,
          });
          onComplete();
          return;
        }

        // Letter matches, continue to next letter
        letterIndex++;
        checkNextLetter();
      }, this.getTiming("letterCheck"));

      this.timeouts.add(timeout);
    };

    checkNextLetter();
  }

  private completePuzzle(onUpdate: (update: NancyUpdate) => void) {
    onUpdate({
      nancyState: {
        currentWord: null,
        currentDirection: null,
        currentPosition: null,
        searchPhase: "between_puzzles",
        isThinking: false,
        letterIndex: 0,
      },
      narration: "I completed the puzzle! Generating a new one... 🌟",
    });

    const timeout = setTimeout(() => {
      onUpdate({
        nancyState: {
          searchPhase: "selecting_word",
        },
        narration: "I'm ready for a new puzzle! 🎯",
      });
    }, this.getTiming("betweenPuzzles"));

    this.timeouts.add(timeout);
  }

  private canWordFitAt(
    word: string,
    position: Position,
    direction: Direction,
    gridSize: number
  ): boolean {
    const delta = DIRECTIONS[direction];

    for (let i = 0; i < word.length; i++) {
      const row = position.row + delta.row * i;
      const col = position.col + delta.col * i;

      if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
        return false;
      }
    }

    return true;
  }

  private getTiming(type: keyof typeof GAME_CONFIG.timings): number {
    const baseTiming = GAME_CONFIG.timings[type];
    const speedLevel = this.gameState.upgrades.speed;
    const speedReduction =
      speedLevel * (GAME_CONFIG.upgrades.speed.effect / 100);
    return Math.max(100, baseTiming * (1 - speedReduction)); // Minimum 100ms
  }

  private getErrorRate(type: keyof typeof GAME_CONFIG.errorRates): number {
    const baseRate = GAME_CONFIG.errorRates[type];
    const qualityLevel = this.gameState.upgrades.quality;
    const errorReduction =
      qualityLevel * (GAME_CONFIG.upgrades.quality.effect / 100);
    return Math.max(0.01, baseRate * (1 - errorReduction)); // Minimum 1% error rate
  }

  private getDirectionName(direction: Direction): string {
    const names = {
      E: "east",
      S: "south",
      N: "north",
      W: "west",
      NE: "northeast",
      SE: "southeast",
      SW: "southwest",
      NW: "northwest",
    };
    return names[direction];
  }
}
