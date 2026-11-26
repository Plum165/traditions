# Go Fish Engine

Pure, deterministic TypeScript rules engine for **Go Fish** (`src/games/goFish/`).

## Module Layout

- `engine/types.ts` — Strongly typed game state, phases, `PlayerMemory`, `BotObservation`, `CompletedBook`, and `PublicGoFishView`.
- `engine/deck.ts` — Standard 52-card deck generator (no Jokers), Fisher-Yates shuffle, rank sorting, and rank formatting helpers.
- `engine/deal.ts` — Initial deal logic (`7` cards each for 2–3 players, `5` cards each for 4 players, plus optional `always-five` house rule), Fish Pond creation, and starting book extraction.
- `engine/handManager.ts` — Immutable hand addition/removal and available rank extraction.
- `engine/bookManager.ts` — Automatic 4-of-a-kind book detection and extraction from player hands.
- `engine/requestValidator.ts` — Shared request validation enforcing held-rank checks, non-self requests, active turn checks, and eligible opponents.
- `engine/drawManager.ts` — Single-card Fish Pond drawing and automatic empty-hand refills (up to 5 cards or remaining pond, or 1-card house rule).
- `engine/scoring.ts` — Book totals, 13-book victory check, empty-pond stalemate round detection, and tie-aware standings.
- `engine/turnManager.ts` — Clockwise/anticlockwise turn rotation, empty-hand skip handling, and Pass-and-Play privacy confirmation.
- `engine/botMemory.ts` — Public event memory (`successfulRequests`, `failedRequests`, `knownBookCollections`) and restricted `BotObservation` builder that never exposes hidden hands or the undealt Fish Pond.
- `engine/botStrategy.ts` — Fair AI difficulty levels:
  - **Easy**: Random eligible opponent and legal held rank.
  - **Normal**: Remembers prior successful/failed requests and favours ranks with multiple held cards.
  - **Hard**: Combines public card conservation, memory recency/invalidation, book-completion urgency, and opponent hand sizes.
- `engine/requestResolver.ts` — Turn resolution (`resolveRequest`, `acknowledgeTurnEnd`, `executeBotTurnStep`, `getPublicGoFishView`).
- `engine/gameEngine.ts` — Unified barrel exporting all engine APIs.
- `components/` — `GoFishSetupPanel` (via `MultiplayerSetupForm`), `GoFishPassDeviceScreen` (via `SharedPassDeviceScreen`), `GoFishVictory` (via `SharedVictoryPanel`), `FishPond`, `PlayerStatus`, `PlayerHand`, `OpponentSelector`, `RankSelector`, `RequestConfirmation`, `GameNotification`, `BookCollection`, and `GoFishTable`.
