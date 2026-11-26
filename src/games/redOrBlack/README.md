# Red or Black (The Four Questions) Engine

Pure, deterministic TypeScript rules engine for **Red or Black – The Four Questions** (`src/games/redOrBlack/`).

## Module Layout

- `engine/types.ts` — Strongly typed state, setup config, player roles, predictions, reveal outcomes, and privacy-projected views.
- `engine/deck.ts` — Standard 52-card deck generator (no Jokers), Fisher-Yates shuffle, Ace-high / Ace-low ranking, and formatting helpers.
- `engine/validation.ts` — Shared prediction evaluation used identically by both human and bot players (`Red/Black`, `Higher/Lower`, `Inside/Outside`, `Suit`).
- `engine/botStrategy.ts` — Fair AI prediction strategies (`easy` random, `normal` baseline probability, `hard` remaining-deck card counting) operating strictly without unrevealed `drawPile` inspection.
- `engine/turnManager.ts` — 2–4 player clockwise and anticlockwise role rotation keeping Questioner (`askerIndex`) and Answering Player (`answererIndex`) distinct.
- `engine/gameEngine.ts` — Immutable state transitions (`createRedOrBlackGame`, `submitPrediction`, `advanceAfterReveal`, `confirmPassDevice`, `executeBotTurnStep`, `getPublicRedOrBlackView`).
- `components/` — `RedOrBlackSetupPanel` (via shared `MultiplayerSetupForm`), `RedOrBlackPassDeviceScreen` (via shared `SharedPassDeviceScreen`), `RedOrBlackVictory` (via shared `SharedVictoryPanel`), and `RedOrBlackTable`.
