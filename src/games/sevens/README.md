# Sevens Game Engine & Interactive Module

This folder contains the pure game rules engine, deterministic bot logic, tutorial curriculum, and mobile-first UI components for **Sevens**.

## Modules

- `engine/types.ts` — Immutable `GameState`, `PlayingCard`, `TableSet`, `PlayerStanding`, `DrawSource`, `CardTexture`, `BotFeedEntry`, `ReplayFrame`, `SevensRulesConfig`, and `PublicTableView` definitions.
- `engine/deck.ts` — 54-card deck creation (52 standard + 2 Jokers), Fisher-Yates shuffle, sorting, and 7/11-card dealing.
- `engine/validation.ts` — Pure validators for Matching Sets, Consecutive Runs, set extensions, Joker replacements, and discards.
- `engine/gameEngine.ts` — Pure state transitions (`createGame`, `confirmPassDevice`, `drawFromDeck`, `drawFromDiscard`, `drawCard`, `playNewSet`, `addCardsToSet`, `replaceJokerInSet`, `discardCard`, `detectAndApplyVictory`, `getPublicTableView`), mixed human/bot Pass-and-Play support (`playerTypes`), drawn-card tracking (`lastDrawnCardId`), live `botTurnFeed` entries, and `replayFrames`.
- `engine/bot.ts` — Deterministic rule-based bot evaluating top-discard pickups, prioritizing Matching Sets over Consecutive Runs, creating at most 1 new set per turn, replacing Jokers, extending sets, and discarding strategically without inspecting other players' private hands.
- `engine/__tests__/sevensEngine.test.ts` — Automated Vitest suite verifying deck, rules, top-discard vs deck drawing, Joker logic, bot priorities, Pass-and-Play privacy (including mixed human + bot tables), drawn-card tracking, bot feed telegraphing, post-game replay unlocking, and persistent victory locking.
- `tutorial/tutorialData.ts` — 7-lesson interactive tutorial curriculum and practice hand cards.
- `components/` — Responsive touch-friendly UI components (`SevensSetupPanel`, `PassDeviceScreen`, `SevensTable`, `SevensReplayViewer`, plus shared `GameCardTile` from `src/components/games/GameCardTile.tsx` with `archival` and multi-pip `classic` card textures).

## Drawing, Telegraphing, Replay & Victory State Rules

1. **Single-Card Choice & Drawn-Card Shading**: At the start of each turn, the active player must draw exactly 1 card via `drawFromDeck` (face-down draw pile) or `drawFromDiscard` (face-up top card of the discard pile only). Drawing from both piles or drawing twice in one turn is blocked. The newly drawn card (`drawnCardId`) is visually shaded (`GameCardTile` `isNewlyDrawn`) and labeled in the active player's hand until played or discarded.
2. **Mixed Pass-and-Play + Optional Bots**: Tables support 2–4 humans sharing a device alongside 0–2 bot opponents (up to 4 total seats). Pass-device privacy screens pause only before human seats and skip automatically for bots while keeping all private hands hidden during bot turns.
3. **Selectable Card Textures**: Players can toggle between `Archival Minimal` and `Everyday Classic` (white stock, corner indices, traditional 1–10 multi-pip grids, court frames, and Jokers) during setup or live mid-game.
4. **Bot Move Telegraphing**: Bot actions append `BotFeedEntry` items to `botTurnFeed` and display live phase prompts during bot turns plus summaries on `PassDeviceScreen` and at the start of the human's turn, without revealing face-down deck draws.
5. **Post-Game Match Replay**: Every game step records a `ReplayFrame` snapshot containing all hands and table sets. `getPublicTableView` keeps `replayFrames` as `null` during active play and unlocks them once `status === 'GAME_OVER'` for inspection inside `SevensReplayViewer`.
6. **Persistent On-Table Victory State**: `detectAndApplyVictory` detects 0-card hands identically for humans and bots, records `winnerId`, `winnerType`, and `standings`, locks further draws/plays/discards/bot turns, and keeps the full game table visible until the user chooses **Continue Viewing Game**, **Watch Match Replay**, **New Game**, **Play Again**, or **Return to Games**.

## Configurable House Rules (`SevensRulesConfig`)

Instead of inventing universal answers to unresolved house-rule questions recorded in `src/content/games/sevens.ts`, the engine exposes five setup toggles:

1. `allowDiscardJoker` (default `false`) — Whether Jokers may be discarded while holding standard cards.
2. `allowImmediateJokerReuse` (default `true`) — Whether a retrieved Joker can be reused in the same turn.
3. `allowDiscardPickupTop` (default `true`) — Whether players can take the top face-up card of the discard pile instead of drawing from the deck.
4. `requireFinalDiscard` (default `false`) — Whether the final card must be discarded to win or emptying the hand during Play wins immediately.
5. `allowExtendJokerSets` (default `true`) — Whether sets containing a Joker can be extended with additional cards.
