# Idle Word Search - Design Document

## Game Overview

"Idle Word Search" is a casual idle game where players watch Nancy, an AI character, solve word search puzzles. Players can passively watch or actively help Nancy find words to earn experience points and upgrade her abilities.

## Core Gameplay Loop

1. Nancy automatically searches for words using a naive algorithm
2. Players can help by manually finding words
3. Experience points (XP) are earned for each word found
4. XP is spent on upgrades to improve Nancy's performance
5. When max upgrades are reached, players can "Ascend" for bigger challenges

## UI Layout

### Header (Top Bar)

- **Top Left**: "Idle Word Search" title
- **Top Center**: "Help Nancy Get Better at Word Searches"
- **Top Right**: XP counter and Upgrade buttons (Speed, Quality)

### Main Game Area (Center)

- **Left Side**: Word list with current target highlighted
- **Right Side**: Letter grid with Nancy's current position highlighted in blue
- **Found words**: Strikethrough in list, highlighted in grid

### Footer (Bottom)

- **Narration**: Dynamic text describing Nancy's current action

### Modal Screens

- **Welcome Screen**: Name entry and progress selection
- **Ascension Screen**: Confirmation and benefits display

## Game Mechanics

### Nancy's Algorithm

Nancy follows a systematic naive search pattern:

```
for each target word:
  for direction in [E, S, N, W, NE, SE, SW, NW]:
    for each row in grid:
      for each column in grid:
        check letters sequentially until mismatch or complete word
```

### Timing System

- **Base speeds** (upgradeable):
  - Position checking: ~1 second
  - Letter comparison: ~0.5 seconds
  - Break between words: ~2 seconds
  - Break between puzzles: ~5 seconds

### Error System

Nancy makes mistakes that improve with Quality upgrades:

- Skip target words (5-20% chance)
- Miss directions (3-15% chance)
- Miss rows/columns (2-10% chance)
- False positive matches (5-25% chance, realizes mistake after 1-3 letters)

### Progression System

#### Experience Points

- 1 XP per word found (base)
- Multiplied by ascension level

#### Upgrades

- **Speed**: Reduces all timing intervals
- **Quality**: Reduces error rates
- **Cost**: Exponential scaling with diminishing returns
- **Max Level**: Increases with ascension

#### Ascension

- **Requirements**: Max both upgrades + complete 5 more puzzles
- **Effects**:
  - Grid size +1 (starts at 10x10)
  - XP reset to 0
  - XP multiplier increases
  - Max upgrade levels increase
  - New word lists for larger grids

### Player Interaction

- **Word Selection**: Click word in list to select target
- **Word Completion**: Click start letter, then end letter in grid
- **Validation**: Check if selection matches selected word
- **Reward**: Same XP as Nancy finding it

## Technical Architecture

### Data Structures

```typescript
interface GameState {
  playerName: string;
  totalXP: number;
  currentXP: number;
  ascensionLevel: number;
  upgrades: {
    speed: number;
    quality: number;
  };
  currentPuzzle: WordSearchPuzzle;
  nancyState: NancyState;
  gameStats: GameStatistics;
}

interface WordSearchPuzzle {
  grid: string[][];
  words: string[];
  foundWords: Set<string>;
  solutions: Map<string, WordSolution>;
}

interface NancyState {
  currentWord: string;
  currentDirection: Direction;
  currentPosition: Position;
  searchPhase: "selecting_word" | "searching" | "resting";
  isThinking: boolean;
}
```

### Storage

- **Local Storage**: Game state persistence
- **IndexedDB**: Puzzle generation cache and statistics

### Components Architecture

```
App
├── WelcomeScreen
├── GameHeader
│   ├── Title
│   ├── XPCounter
│   └── UpgradePanel
├── GameBoard
│   ├── WordList
│   ├── LetterGrid
│   └── NancyHighlight
├── GameFooter
│   └── NarrationText
└── AscensionModal
```

## Word Search Generation

### Puzzle Creation

1. **Word Selection**: Choose words based on grid size and difficulty
2. **Word Placement**: Randomly place words in valid directions
3. **Grid Filling**: Fill empty spaces with random letters
4. **Solution Mapping**: Store word positions for validation

### Word Lists

- **Themed Categories**: Animals, Food, Colors, etc.
- **Difficulty Scaling**: Longer words for larger grids
- **No Overlapping**: Simpler validation and visual clarity

## Performance Considerations

### Optimization Strategies

- **Puzzle Caching**: Pre-generate puzzles during idle time
- **Animation Throttling**: Limit Nancy's visual updates
- **State Batching**: Group state updates to prevent excessive re-renders
- **Memory Management**: Clean up completed puzzles

### Accessibility

- **High Contrast**: Clear visual distinction for highlights
- **Screen Reader**: Proper ARIA labels for dynamic content
- **Keyboard Navigation**: Full keyboard support for interactions
- **Reduced Motion**: Respect user motion preferences

## Visual Design

### Color Scheme

- **Primary**: Blue (#3B82F6) for Nancy's position
- **Success**: Green (#10B981) for found words
- **Warning**: Yellow (#F59E0B) for Nancy's target
- **Background**: Light gray (#F9FAFB) for grid
- **Text**: Dark gray (#374151) for readability

### Typography

- **Title**: Large, friendly font for game title
- **Grid**: Monospace font for letter alignment
- **UI**: Clean sans-serif for interface elements

### Animations

- **Nancy Movement**: Smooth transitions between positions
- **Word Discovery**: Satisfying highlight animations
- **XP Gain**: Particle effects or counter animations
- **Ascension**: Dramatic visual feedback

## Development Phases

### Phase 1: Core Game (MVP)

- [x] Project setup with Next.js + TypeScript + Tailwind
- [ ] Basic word search grid generation
- [ ] Nancy's search algorithm implementation
- [ ] Player word selection and validation
- [ ] XP system and basic upgrades
- [ ] Local storage persistence

### Phase 2: Polish & Features

- [ ] Welcome screen and name entry
- [ ] Advanced Nancy AI with errors
- [ ] Smooth animations and visual feedback
- [ ] Narration system
- [ ] Statistics tracking

### Phase 3: Ascension System

- [ ] Ascension mechanics
- [ ] Dynamic difficulty scaling
- [ ] Extended progression system
- [ ] Achievement system

### Phase 4: Quality of Life

- [ ] Accessibility improvements
- [ ] Performance optimizations
- [ ] Mobile responsiveness
- [ ] Audio effects (optional)

## Success Metrics

- **Engagement**: Time spent playing
- **Progression**: Ascension levels reached
- **Balance**: Upgrade purchase patterns
- **Accessibility**: Screen reader compatibility
- **Performance**: Smooth 60fps animations

This design provides a solid foundation for a engaging idle game that balances passive and active gameplay while maintaining the charming concept of helping Nancy improve at word searches.
