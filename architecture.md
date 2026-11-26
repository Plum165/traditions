# Architecture – Our Childhood Digital Cultural Games Archive

## 1. Purpose & Architectural Philosophy

**Our Childhood** is a long-term digital cultural archive designed to preserve Coloured childhood games, traditions, house rules, and memories.

The architecture follows three core engineering principles:

1. **Separation of Content and Presentation**: Game rules, variations, and cultural notes live in strongly typed structured data modules (`src/content/games/`), completely decoupled from React UI components.
2. **Separation of Game Engine and UI**: Interactive gameplay logic (`src/games/sevens/engine/`, `src/games/porridge/engine/`, `src/games/redOrBlack/engine/`, `src/games/goFish/engine/`) is written as pure, immutable, deterministic TypeScript modules independent of React components and covered by automated unit tests (`vitest`).
3. **Template-Driven Scalability & CMS Readiness**: Every game entry renders dynamically through `GameDetailsTemplate`, and data access is abstracted behind `GameRepository` (`src/types/game.ts`).

---

## 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| Framework | React 19 + TypeScript | Component architecture and static type safety |
| Build Tool | Vite 8 | Fast bundling and route-based code splitting |
| Routing | React Router DOM 7 | Client-side navigation (`/`, `/games`, `/games/:slug`, `/games/sevens/learn`, `/games/sevens/play`, `/games/porridge/play`, `/games/red-or-black/play`, `/games/go-fish/play`, `/about`, `/contribute`) |
| Styling | Tailwind CSS v4 | Mobile-first responsive styling and archival design tokens |
| Icons | Lucide React | Accessible affordance icons |
| Animation | Motion (`motion/react`) | Subtle compositor-only transitions respecting `prefers-reduced-motion` |
| Testing | Vitest 5 | Automated unit tests for Sevens engine, Porridge engine, Red or Black engine, Go Fish engine, and archive registry |
| Hosting | Vercel (compatible) | Static SPA deployment with `vercel.json` fallback rewrites |

---

## 3. Repository Structure

```text
/
├── public/
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── assets/images/             # Generated illustrative photography assets
│   ├── components/
│   │   ├── games/
│   │   │   ├── ContentBlockRenderer.tsx
│   │   │   ├── GameCard.tsx
│   │   │   ├── GameCardTile.tsx   # Shared archival & multi-pip classic playing card component
│   │   │   ├── GameDetailsTemplate.tsx
│   │   │   ├── MultiplayerSetupForm.tsx   # Shared 2-4 player human/bot setup & validation
│   │   │   ├── SharedPassDeviceScreen.tsx # Shared Pass-and-Play privacy handover screen
│   │   │   └── SharedVictoryPanel.tsx     # Shared in-game victory standings & board toggle
│   │   ├── layout/
│   │   │   ├── Layout.tsx
│   │   │   ├── SiteFooter.tsx
│   │   │   └── SiteHeader.tsx
│   │   ├── seo/
│   │   │   └── DocumentHead.tsx
│   │   └── ui/
│   │       ├── ArchivalImage.tsx
│   │       └── PlayingCardDiagram.tsx
│   ├── content/
│   │   ├── README.md              # Guide to authoring new games
│   │   ├── __tests__/             # Registry & archival schema Vitest suite
│   │   └── games/
│   │       ├── goFish.ts          # Go Fish documentation
│   │       ├── index.ts           # Central game registry & query helpers
│   │       ├── omo.ts             # OMO grid word-building documentation
│   │       ├── porridge.ts        # Porridge (Sekaku) documentation
│   │       ├── redOrBlack.ts      # Red or Black (The Four Questions) documentation
│   │       └── sevens.ts          # Sevens baseline documentation
│   ├── games/
│   │   ├── goFish/
│   │   │   ├── README.md          # Go Fish engine, book collection, bot memory & strategy docs
│   │   │   ├── components/        # GoFishSetupPanel, GoFishPassDeviceScreen, GoFishVictory, FishPond, PlayerStatus, PlayerHand, OpponentSelector, RankSelector, RequestConfirmation, GameNotification, BookCollection, GoFishTable
│   │   │   └── engine/            # Pure 52-card deck, deal, hand/book/draw managers, requestValidator/Resolver, botMemory, Easy/Normal/Hard botStrategy, turnManager, scoring, and Vitest suite
│   │   ├── porridge/
│   │   │   ├── README.md          # Porridge engine, circle rules & configurable options docs
│   │   │   ├── components/        # PorridgeCircle, CircleCard, CentralPorridgePile, PlayerStatus, PorridgePassDeviceScreen, PorridgeVictory, PorridgeSetupPanel, PorridgeTable
│   │   │   └── engine/            # Pure 52-card deck, circle, Same-Suit/Highest-Colour rules, botStrategy, scoring, gameEngine, and Vitest suite
│   │   ├── redOrBlack/
│   │   │   ├── README.md          # Red or Black engine, bots & variant turn-manager docs
│   │   │   ├── components/        # RedOrBlackSetupPanel, RedOrBlackPassDeviceScreen, RedOrBlackVictory, RedOrBlackTable
│   │   │   └── engine/            # Pure 52-card deck, shared validation, Easy/Normal/Hard botStrategy, turnManager, gameEngine, and Vitest suite
│   │   └── sevens/
│   │       ├── README.md          # Sevens engine & configurable rules docs
│   │       ├── components/        # SevensSetupPanel, PassDeviceScreen, SevensTable, SevensReplayViewer (plus GameCardTile re-export)
│   │       ├── engine/            # Pure deck, validation, state machine, bot, and Vitest suite
│   │       └── tutorial/          # 7-lesson tutorial data and practice cards
│   ├── pages/
│   │   ├── AboutPage.tsx
│   │   ├── ContributePage.tsx
│   │   ├── GamePage.tsx
│   │   ├── GamesLibraryPage.tsx
│   │   ├── GoFishPlayPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── NotFoundPage.tsx
│   │   ├── PorridgePlayPage.tsx
│   │   ├── RedOrBlackPlayPage.tsx
│   │   ├── SevensPlayPage.tsx
│   │   └── SevensTutorialPage.tsx
│   ├── types/
│   │   ├── contribution.ts        # Future community submission & moderation types
│   │   ├── game.ts                # Core Game & ContentBlock schema
│   │   ├── multiplayer.ts         # Shared 2-4 player seat config, bot difficulty & validation
│   │   └── playingCard.ts         # Shared StandardCard, JokerCard, Suit & formatting helpers
│   ├── utils/
│   │   └── gameAudio.ts           # Optional Web Audio API feedback tones
│   ├── App.tsx                    # Route configuration + lazy code splitting
│   ├── index.css                  # Tailwind v4 tokens & accessibility defaults
│   └── main.tsx                   # React root mount
├── agents/                        # Synchronized engineering & content agent specs
├── architecture.md                # System architecture documentation
├── README.md                      # Project overview & setup guide
├── index.html                     # Base HTML, fonts & OpenGraph fallback
└── vercel.json                    # SPA rewrite rules for Vercel
```

---

## 4. Interactive Game Engines & Privacy Architecture

### Sevens (`src/games/sevens/`)
- **Pure State Transitions (`src/games/sevens/engine/gameEngine.ts`)**: All actions (`drawFromDeck`, `drawFromDiscard`, `playNewSet`, `addCardsToSet`, `replaceJokerInSet`, `discardCard`, `confirmPassDevice`) return immutable `MoveResult` objects, track `lastDrawnCardId`, record `botTurnFeed` telegraph entries, and append `ReplayFrame` snapshots for every step.
- **Centralized Victory Detection (`detectAndApplyVictory`)**: Identifies human or bot winners identically, computes `standings`, locks post-game mutations, and preserves the complete table state in `SevensTable` without forced redirects while unlocking post-game replay (`SevensReplayViewer`).
- **Privacy Projection (`getPublicTableView`)**: In Pass-and-Play mode (including mixed tables with 2–4 humans plus optional bots), `awaitingPassConfirmation` sets `visibleHand` and `drawnCardId` to `null` until the incoming human player confirms **I'm Ready** on `PassDeviceScreen`, and bot turns run automatically with `visibleHand: null`. In solo `vs-bots` mode, bot hands are never exposed in `visibleHand`, and `replayFrames` remain `null` until `status === 'GAME_OVER'`.
- **Card Textures (`src/components/games/GameCardTile.tsx`)**: Supports switching between `archival` and `classic` (white stock, 1–10 multi-pip grids, framed courts, and classic Jokers) in both setup and live play across Sevens and Porridge.
- **Deterministic Bot Strategy & Telegraphing (`src/games/sevens/engine/bot.ts`)**: Bots inspect only their own hand and public table state, evaluate beneficial top-discard pickups, prioritise Matching Sets over Consecutive Runs, enforce at most one new set per turn, replace Jokers when holding the missing card, extend existing sets, and discard low-utility cards.
- **Configurable Unresolved Rules (`SevensRulesConfig`)**: Edge-case questions from `sevens.ts` (`allowDiscardJoker`, `allowImmediateJokerReuse`, `allowDiscardPickupTop`, `requireFinalDiscard`, `allowExtendJokerSets`) are exposed as setup toggles rather than silently invented as universal rules.

### Porridge / Sekaku (`src/games/porridge/`)
- **52-Card Circle & Direct Selection (`src/games/porridge/engine/gameEngine.ts`)**: Generates a shuffled 52-card deck (no Jokers) placed face down into 52 stable circle slots (`createCircle`). Selecting a slot (`selectCard`) immediately reveals the card, removes it from the circle, and evaluates the active rule variation. When a player collects the pile, they keep the turn by default (`collectorStartsNextPile: true`) to pick a card for the fresh pile without a self-handover screen.
- **Rule Variations (`src/games/porridge/engine/rules.ts`)**: Implements both **Same-Suit Porridge** (`resolveSameSuitRule`) and **Highest-Colour Porridge** (`resolveHighestColourRule`, with central configurable Ace ranking and comparison card reference).
- **Custom Turn Sequence & Mixed Modes (`PorridgeSetupPanel`)**: Supports Play Against Bots (with selectable 1st–4th human turn slot), Pass and Play, and Mixed Human + Bot tables (2–4 players) with seat reordering and Clockwise / Anticlockwise play direction.
- **Privacy & Random Bot Selection (`botStrategy.ts`, `getPublicPorridgeView`)**: Hidden face-down card identities are stripped from `PublicCircleSlot` projections, bots pick uniformly at random from remaining `face-down` positions without peeking, and `PorridgePassDeviceScreen` hides the entire board and selection state until the next human taps **Ready**.
- **Lowest-Count Victory & Ties (`scoring.ts`, `PorridgeVictory`)**: Awards victory to the player(s) with the fewest collected cards, detects ties without inventing tie-breakers, locks post-game mutations, and keeps the completed board inspectable on-screen.

### Red or Black – The Four Questions (`src/games/redOrBlack/`)
- **Shared Multiplayer Setup & Privacy (`MultiplayerSetupForm`, `SharedPassDeviceScreen`, `SharedVictoryPanel`)**: Reuses the shared 2–4 player setup component (`vs-bots`, `pass-and-play`, `mixed`), seat validation (`validateMultiplayerSeats`), full-screen Pass-and-Play privacy handover screen, and in-game victory standings panel alongside Porridge.
- **Variants & Dual-Role Turn Rotation (`turnManager.ts`, `gameEngine.ts`)**: Maintains distinct `askerIndex` (Questioner / Deck Holder) and `answererIndex` (Answering Player) IDs across 2, 3, and 4 players in Clockwise or Anticlockwise direction for both **Four Questions Challenge** and **Card Collection House Rule**.
- **Shared Validation & Fair AI Difficulties (`validation.ts`, `botStrategy.ts`)**: Both humans and bots evaluate guesses through `evaluatePrediction`. Bots (`easy` random, `normal` baseline probability, `hard` remaining-deck card counting) operate strictly on public revealed-card history without ever accessing `drawPile`.

### Go Fish (`src/games/goFish/`)
- **Shared Multiplayer & Private Hands (`getPublicGoFishView`, `GoFishPassDeviceScreen`)**: Reuses `MultiplayerSetupForm`, `SharedPassDeviceScreen`, `SharedVictoryPanel`, and `GameCardTile`. Private hands and non-matching drawn cards remain hidden during Pass-and-Play handovers and multi-human bot turns.
- **Book Collection, Refills & Stalemate (`bookManager.ts`, `drawManager.ts`, `scoring.ts`)**: Automatically extracts 4-of-a-kind books on initial deal, transfers, pond draws, and refills; refills empty hands up to 5 cards (or remaining pond, or 1-card house rule); marks empty-hand players inactive for asking when the Fish Pond is empty; and resolves 13-book victories, ties, and empty-pond round stalemates.
- **Public Memory & Fair Bot Intelligence (`botMemory.ts`, `botStrategy.ts`)**: `createBotObservation` omits opponent hands and `drawPile`. Easy bots pick randomly from legal options; Normal bots track public request/denial memory and prefer multi-card ranks; Hard bots combine public rank conservation, evidence decay/invalidation, book-completion urgency, and opponent hand sizes.

---

## 5. Responsive, Accessibility & SEO Architecture

- **Mobile-First Layout (320px–1440px+)**: Vertical mobile table stacking (`Player Seats` -> `Draw/Discard Choice` -> `Table Sets` -> `Horizontally Scrollable Touch Hand Rail` -> `Turn Action Bar`), `>= 44px` touch targets, `overflow-x-hidden` page guards, and collapsible mobile Table of Contents on game pages.
- **WCAG 2.2 AA Targets**: Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`), skip-to-content link, keyboard-accessible mobile drawer with `Escape` dismissal, visible focus rings, `prefers-reduced-motion` support, and color-independent suit/status cues.
- **SEO**: `DocumentHead` updates page `<title>`, `<meta name="description">`, OpenGraph tags, canonical URLs, and Schema.org JSON-LD per route, paired with `public/sitemap.xml`.
