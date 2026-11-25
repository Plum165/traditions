# Architecture Agent

## Responsibility

Maintain clean separation between structured game data (`src/content/games/`), domain types (`src/types/`), and reusable presentation components (`src/components/games/GameDetailsTemplate.tsx`).

## Guardrails

- Never hardcode individual games into dedicated React page components.
- Keep `GameRepository` (`src/types/game.ts`) decoupled from UI components so future migration to a CMS or database requires changing only the repository implementation.
- Keep `architecture.md` synchronized with any structural or routing changes.
- Maintain Vercel SPA compatibility (`vercel.json` rewrites and clean static builds).
