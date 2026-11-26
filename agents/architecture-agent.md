# Architecture Agent

## Responsibility

Maintain clean separation between structured game data (`src/content/games/`), pure game-logic engines (`src/games/*/engine/`), domain types (`src/types/`), and reusable presentation components (`src/components/games/GameDetailsTemplate.tsx`).

## Guardrails

- Never hardcode individual archive entries into dedicated React page components—keep archive documentation data-driven through `GameDetailsTemplate`.
- Keep interactive game rules engines (`src/games/sevens/engine/`, `src/games/porridge/engine/`, `src/games/redOrBlack/engine/`, `src/games/goFish/engine/`) pure, immutable, and independent of React UI state so they can be unit-tested directly with Vitest.
- Enforce privacy projections (`getPublicTableView`, `getPublicPorridgeView`, `getPublicRedOrBlackView`, `getPublicGoFishView`) so Pass-and-Play screens and bots never expose private player hands or unrevealed face-down/deck cards.
- Reuse shared card and multiplayer UI primitives (`src/components/games/GameCardTile.tsx`, `MultiplayerSetupForm.tsx`, `SharedPassDeviceScreen.tsx`, `SharedVictoryPanel.tsx`, `src/types/playingCard.ts`, `src/types/multiplayer.ts`) across card games rather than duplicating card renderers or setup systems.
- Keep `GameRepository` (`src/types/game.ts`) decoupled from UI components for future CMS/database migration.
- Keep `architecture.md`, `src/games/sevens/README.md`, `src/games/porridge/README.md`, `src/games/redOrBlack/README.md`, and `src/games/goFish/README.md` synchronized with any structural or routing changes.
