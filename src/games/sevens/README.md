# Sevens Game Engine & Interactive Module

This folder contains the pure game rules engine, deterministic bot logic, tutorial curriculum, and mobile-first UI components for **Sevens**.

## Modules

- `engine/types.ts` — Immutable `GameState`, `PlayingCard`, `TableSet`, `PlayerStanding`, `DrawSource`, `SevensRulesConfig`, and `PublicTableView` definitions.
- `engine/deck.ts` — 54-card deck creation (52 standard + 2 Jokers), Fisher-Yates shuffle, sorting, and 7/11-card dealing.
- `engine/validation.ts` — Pure validators for Matching Sets, Consecutive Runs, set extensions, Joker replacements, and discards.
- `engine/gameEngine.ts` — Pure state transitions (`createGame`, `confirmPassDevice`, `drawFromDeck`, `drawFromDiscard`, `drawCard`, `playNewSet`, `addCardsToSet`, `replaceJokerInSet`, `discardCard`, `detectAndApplyVictory`, `getPublicTableView`).
- `engine/bot.ts` — Deterministic rule-based bot evaluating top-discard pickups, prioritizing Matching Sets over Consecutive Runs, creating at most 1 new set per turn, replacing Jokers, extending sets, and discarding strategically without inspecting other players' private hands.
- `engine/__tests__/sevensEngine.test.ts` — Automated Vitest suite verifying deck, rules, top-discard vs deck drawing, Joker logic, bot priorities, Pass-and-Play privacy, and persistent victory locking.
- `tutorial/tutorialData.ts` — 7-lesson interactive tutorial curriculum and practice hand cards.
- `components/` — Responsive touch-friendly UI components (`GameCardTile`, `SevensSetupPanel`, `PassDeviceScreen`, `SevensTable`).

## Drawing & Victory State Rules

1. **Single-Card Choice on Draw**: At the start of each turn, the active player must draw exactly 1 card via `drawFromDeck` (face-down draw pile) or `drawFromDiscard` (face-up top card of the discard pile only). Drawing from both piles or drawing twice in one turn is blocked.
2. **Persistent On-Table Victory State**: `detectAndApplyVictory` detects 0-card hands identically for humans and bots, records `winnerId`, `winnerType`, and `standings`, locks further draws/plays/discards/bot turns, and keeps the full game table visible until the user chooses **Continue Viewing Game**, **New Game**, **Play Again**, or **Return to Games**.

## Configurable House Rules (`SevensRulesConfig`)

Instead of inventing universal answers to unresolved house-rule questions recorded in `src/content/games/sevens.ts`, the engine exposes five setup toggles:

1. `allowDiscardJoker` (default `false`) — Whether Jokers may be discarded while holding standard cards.
2. `allowImmediateJokerReuse` (default `true`) — Whether a retrieved Joker can be reused in the same turn.
3. `allowDiscardPickupTop` (default `true`) — Whether players can take the top face-up card of the discard pile instead of drawing from the deck.
4. `requireFinalDiscard` (default `false`) — Whether the final card must be discarded to win or emptying the hand during Play wins immediately.
5. `allowExtendJokerSets` (default `true`) — Whether sets containing a Joker can be extended with additional cards.
