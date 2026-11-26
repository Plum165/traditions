# OMO – Engine & Bot Intelligence

This module implements the pure TypeScript game engine and responsive interface for **OMO** (`/games/omo/play`), reusing Our Childhood's shared multiplayer setup, Pass-and-Play handover, and victory standings primitives.

## Engine Architecture (`src/games/omo/engine/`)

- **`types.ts`**: Pure domain types for grid coordinates, OMO axis directions, canonical combination IDs, player stats (`score`, `omosCreated`, `turnsTaken`, `bonusTurnsEarned`), and public view projections.
- **`gridManager.ts`**: Responsive device-tier grid limits (`getResponsiveGridLimits`) using both viewport width and usable height, presets (`5×5`, `7×7`, `9×9`, `11×11`), dimension validation (`validateGridDimensions`), and empty-cell utilities.
- **`omoDetector.ts`**: Efficient OMO detection (`detectNewOmosAtPlacement`) that inspects only the 4 straight-line axes passing through the newly placed cell (`horizontal`, `vertical`, `diagonal-down-right`, `diagonal-down-left`), assigns canonical coordinate-pair IDs (`row1,col1-row3,col3`) to prevent duplicate scoring regardless of forward/reverse read direction, and preserves letters for reuse.
- **`scoring.ts`**: Computes ranked standings, tied winners, and score differences (`computeOmoStandings`).
- **`turnManager.ts`**: Manages clockwise/anticlockwise turn rotation and Pass-and-Play handover triggers (`shouldRequirePassHandover`) without triggering handovers on bonus turns or 1-human solo bot matches.
- **`botStrategy.ts`**:
  - **Easy Bot**: 70% random legal empty cell + random `O`/`M`, 30% immediate OMO capture.
  - **Normal Bot**: Evaluates all empty cells for `O` and `M` using immediate multi-OMO scoring, threat blocking, safe future setups, and 1-move threat avoidance.
  - **Hard Bot**: Uses candidate pruning paired with bonus-turn-aware minimax lookahead and alpha-beta pruning, adapting search depth to board size so large boards remain responsive.
- **`gameEngine.ts`**: Single source of truth for game creation, move validation (`placeLetter`), bot turn execution (`executeBotTurn`), Pass-and-Play confirmation (`confirmPassDevice`), and immediate game-over resolution when the final empty cell is filled.

## UI Components (`src/games/omo/components/`)

- `OmoSetupPanel.tsx`: Wraps `MultiplayerSetupForm` with viewport-adaptive grid presets and custom row/column controls.
- `OmoPassDeviceScreen.tsx`: Wraps `SharedPassDeviceScreen` for multi-human turn handovers.
- `OmoVictoryPanel.tsx`: Wraps `SharedVictoryPanel` with draw detection, score differences, total OMOs, scoring move history, and **View Final Board** toggle.
- `OmoScoreboard.tsx`: Shows player turn order, Human/Bot difficulty, scores, OMOs created, bonus turns, and active/bonus turn status.
- `OmoBoard.tsx`: Contained scrollable grid with `>= 44px` touch targets, SVG connector lines for newly completed OMOs, and distinct highlighting separating newly scored combinations from previously scored reusable letters.
- `OmoTable.tsx`: Coordinates scoreboard, live scoring/bonus-turn feedback, accessible `O`/`M` placement controls (plus `O`/`M`/`Escape` keyboard shortcuts), and board layout.
