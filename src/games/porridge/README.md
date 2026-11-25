# Porridge (Sekaku) Game Engine & Interactive Module

This folder contains the pure game rules engine, random bot selection strategy, scoring logic, and mobile-first UI components for **Porridge (Sekaku)**.

## Modules

- `engine/types.ts` — Immutable `PorridgeGameState`, `CircleCardSlot`, `PorridgePlayer`, `PorridgeRuleVariation`, `PorridgeRulesConfig`, `PorridgeSetupConfig`, `PorridgeGamePhase`, and privacy-projected `PublicPorridgeView` definitions.
- `engine/deck.ts` — Standard 52-card deck creation (4 suits × 13 ranks, no Jokers) and pure Fisher-Yates shuffle.
- `engine/circle.ts` — Creates 52 stable face-down circle positions (`pos-01`–`pos-52`) and queries remaining available slots.
- `engine/rules.ts` — Pure evaluation for **Version 1: Same-Suit Porridge** (matches previous top card suit) and **Version 2: Highest-Colour Porridge** (Red vs Black and higher rank, with central configurable Ace ranking and comparison card reference).
- `engine/botStrategy.ts` — Uniformly random selection among remaining face-down slots without inspecting hidden card identities.
- `engine/scoring.ts` — Fewest-collected-cards winner calculation and tie detection without invented tie-breakers.
- `engine/gameEngine.ts` — Immutable state transitions (`createPorridgeGame`, `selectCard`, `chooseBotCardPosition`, `confirmBotSelection`, `collectCentralPile`, `advanceTurn`, `confirmPassDevice`, `getPublicPorridgeView`).
- `engine/__tests__/porridgeEngine.test.ts` — Automated Vitest suite verifying 52-card setup, direct selection & privacy, Same-Suit & Highest-Colour rules, bot strategy, custom turn sequence, Pass-and-Play handover hiding, ties, and post-game locks.
- `components/` — Responsive UI components (`PorridgeSetupPanel`, `PorridgeTable`, `PorridgeCircle`, `CircleCard`, `CentralPorridgePile`, `PlayerStatus`, `PorridgePassDeviceScreen`, `PorridgeVictory`, `circleLayouts`).

## Key Design & Cultural Boundaries

1. **Both Documented Variations Supported**: Players select between **Same-Suit Porridge** and **Highest-Colour Porridge** without treating either as the universal South African rule.
2. **Configurable Turn Sequence**: Setup lets players pick Play Against Bots, Pass and Play, or Mixed Human + Bot tables, choose whether they go 1st or later, and lay out the exact seat sequence (`1st`–`4th`) plus Clockwise / Anticlockwise direction.
3. **Direct Selection & Pass-and-Play Privacy**: Selecting an available face-down card immediately chooses, reveals, and resolves it without a secondary confirmation modal. In multi-human games, `getPublicPorridgeView` strips circle and pile state while `PorridgePassDeviceScreen` hides the board until **Ready** is pressed.
4. **Shared Card Face Rendering**: Reuses `src/components/games/GameCardTile.tsx` for both `'archival'` and multi-pip `'classic'` card faces.
