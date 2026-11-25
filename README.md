# Our Childhood – Digital Cultural Games Archive

A mobile-first digital cultural archive dedicated to documenting and preserving Coloured childhood games, traditions, house rules, and shared memories.

## Current Archive Scope

- **First Published Game**: **Sevens** (`/games/sevens`), documenting the 54-card deck (52 cards + 2 Jokers), 7-card and 11-card starting hand variations, matching sets, consecutive runs, Joker replacement rules, and open questions requiring community confirmation.
- **Interactive Sevens Experience**:
  - **Learn to Play** (`/games/sevens/learn`) — 7-lesson interactive tutorial with card examples, instant quiz feedback, and live set-validation practice.
  - **Play Sevens** (`/games/sevens/play`) — Mobile-first playable 2–4 player Sevens supporting Draw Pile or top Discard Pile drawing, differentiated shading for newly drawn cards, live bot move telegraphing, 7-card and 11-card hands, Pass and Play with turn-privacy screens, deterministic bots, persistent on-table victory standings, post-game step-by-step match replay revealing bots' cards, and configurable unresolved house rules.
- **Core Routes**:
  - `/` – Archive homepage and introduction
  - `/games` – Searchable, category-filtered Games Library
  - `/games/:slug` – Reusable game documentation template
  - `/games/sevens/learn` – Interactive Sevens tutorial
  - `/games/sevens/play` – Playable Sevens card game
  - `/about` – Project purpose and cultural preservation principles
  - `/contribute` – How visitors can contribute games, corrections, variations, and memories

## Cultural Principles

- Never assume every household or community plays a game the same way.
- Support variations and house rules side by side.
- Never fabricate historical claims or rule answers; clearly distinguish documented versions, community recollections, and unresolved questions.

## Local Development

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Run automated game engine tests
npm test

# Type-check with TypeScript
npm run lint

# Build production bundle
npm run build
```

## Adding a Game

See [`src/content/README.md`](src/content/README.md), [`src/games/sevens/README.md`](src/games/sevens/README.md), and [`architecture.md`](architecture.md) for the data-driven content model and game engine structure.

## Deployment (Vercel)

This application builds to a static Vite SPA (`npm run build` -> `dist/`) and includes `vercel.json` to rewrite all client-side routes (`/games/sevens`, `/games/sevens/learn`, `/games/sevens/play`, `/about`, `/contribute`) to `index.html`.
