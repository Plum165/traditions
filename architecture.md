# Architecture – Our Childhood Digital Cultural Games Archive

## 1. Purpose & Architectural Philosophy

**Our Childhood** is a long-term digital cultural archive designed to preserve Coloured childhood games, traditions, house rules, and memories.

The architecture follows three core engineering principles:

1. **Separation of Content and Presentation**: Game rules, variations, and cultural notes live in strongly typed structured data modules (`src/content/games/`), completely decoupled from React UI components.
2. **Separation of Game Engine and UI**: Interactive gameplay logic for Sevens (`src/games/sevens/engine/`) is written as pure, immutable, deterministic TypeScript modules independent of React components and covered by automated unit tests (`vitest`).
3. **Template-Driven Scalability & CMS Readiness**: Every game entry renders dynamically through `GameDetailsTemplate`, and data access is abstracted behind `GameRepository` (`src/types/game.ts`).

---

## 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| Framework | React 19 + TypeScript | Component architecture and static type safety |
| Build Tool | Vite 8 | Fast bundling and route-based code splitting |
| Routing | React Router DOM 7 | Client-side navigation (`/`, `/games`, `/games/:slug`, `/games/sevens/learn`, `/games/sevens/play`, `/about`, `/contribute`) |
| Styling | Tailwind CSS v4 | Mobile-first responsive styling and archival design tokens |
| Icons | Lucide React | Accessible affordance icons |
| Animation | Motion (`motion/react`) | Subtle compositor-only transitions respecting `prefers-reduced-motion` |
| Testing | Vitest 5 | Automated unit tests for deck, validation, Joker, turn, privacy, and bot logic |
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
│   │   │   └── GameDetailsTemplate.tsx
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
│   │   └── games/
│   │       ├── index.ts           # Central game registry & query helpers
│   │       └── sevens.ts          # Sevens baseline documentation
│   ├── games/
│   │   └── sevens/
│   │       ├── README.md          # Game engine & configurable rules docs
│   │       ├── components/        # GameCardTile, SevensSetupPanel, PassDeviceScreen, SevensTable
│   │       ├── engine/            # Pure deck, validation, state machine, bot, and Vitest suite
│   │       └── tutorial/          # 7-lesson tutorial data and practice cards
│   ├── pages/
│   │   ├── AboutPage.tsx
│   │   ├── ContributePage.tsx
│   │   ├── GamePage.tsx
│   │   ├── GamesLibraryPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── NotFoundPage.tsx
│   │   ├── SevensPlayPage.tsx
│   │   └── SevensTutorialPage.tsx
│   ├── types/
│   │   ├── contribution.ts        # Future community submission & moderation types
│   │   └── game.ts                # Core Game & ContentBlock schema
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

## 4. Sevens Engine & Interactive Architecture

- **Pure State Transitions (`src/games/sevens/engine/gameEngine.ts`)**: All actions (`drawCard`, `playNewSet`, `addCardsToSet`, `replaceJokerInSet`, `discardCard`, `confirmPassDevice`) return immutable `MoveResult` objects and reject illegal actions without modifying state.
- **Privacy Projection (`getPublicTableView`)**: In Pass-and-Play mode, `awaitingPassConfirmation` sets `visibleHand` to `null` until the incoming player explicitly confirms Ready on `PassDeviceScreen`. In Bot mode, bot hands are never exposed in `visibleHand`.
- **Deterministic Bot Strategy (`src/games/sevens/engine/bot.ts`)**: Bots inspect only their own hand and public table state, prioritise Matching Sets over Consecutive Runs, enforce at most one new set per turn, replace Jokers when holding the missing card, extend existing sets, and discard low-utility cards.
- **Configurable Unresolved Rules (`SevensRulesConfig`)**: Edge-case questions from `sevens.ts` (`allowDiscardJoker`, `allowImmediateJokerReuse`, `allowDiscardPickupTop`, `requireFinalDiscard`, `allowExtendJokerSets`) are exposed as setup toggles rather than silently invented as universal rules.

---

## 5. Responsive, Accessibility & SEO Architecture

- **Mobile-First Layout**: Single-column mobile stacks expanding to multi-column editorial grids at `md`/`lg` breakpoints, touch targets `>= 44px`, and collapsible mobile Table of Contents on game pages.
- **WCAG 2.2 AA Targets**: Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`), skip-to-content link, keyboard-accessible mobile drawer with `Escape` dismissal, visible focus rings, `prefers-reduced-motion` support, and color-independent suit/status cues.
- **SEO**: `DocumentHead` updates page `<title>`, `<meta name="description">`, OpenGraph tags, canonical URLs, and Schema.org JSON-LD per route, paired with `public/sitemap.xml`.
