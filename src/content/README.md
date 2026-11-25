# Game Content Directory

All documented games live as structured TypeScript modules in `src/content/games/`.

## How to Add a New Game

1. Create a new file in `src/content/games/`, for example `src/content/games/kennetjie.ts`, exporting a typed `Game` object (`import type { Game } from '../../types/game'`).
2. Add only the sections and metadata that apply to that game type (Card Games, Street Games, Playground Games, etc.). Optional fields (`spaceRequired`, `setup`, `variations`, `unconfirmedQuestions`, `relatedGames`) are omitted automatically by `GameDetailsTemplate` when undefined or empty.
3. Clearly mark any uncertain rules inside `unconfirmedQuestions` rather than presenting guesses as established rules.
4. Register the new game inside `ALL_GAMES` in `src/content/games/index.ts`.
5. Set `status: 'published'` when verified.

The Homepage, Games Library, search index, category filter counts, and `/games/:slug` detail page will update automatically.
