# Architecture – Our Childhood Digital Cultural Games Archive

## 1. Purpose & Architectural Philosophy

**Our Childhood** is a long-term digital cultural archive designed to preserve Coloured childhood games, traditions, house rules, and memories.

The architecture follows three core engineering principles:

1. **Separation of Content and Presentation**: Game rules, variations, and cultural notes live in strongly typed structured data modules (`src/content/games/`), completely decoupled from React UI components.
2. **Template-Driven Scalability**: Adding a new game does not require creating a new page component. Every game renders dynamically through `GameDetailsTemplate`.
3. **Future CMS / Database Readiness**: Data access is abstracted behind the `GameRepository` interface in `src/types/game.ts` (`localGameRepository` in `src/content/games/index.ts`), allowing seamless migration to a headless CMS or database later without rewriting frontend pages.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| Framework | React 19 + TypeScript | Component architecture and static type safety |
| Build Tool | Vite 8 | Fast bundling and route-based code splitting |
| Routing | React Router DOM 7 | Client-side navigation (`/`, `/games`, `/games/:slug`, `/about`, `/contribute`) |
| Styling | Tailwind CSS v4 | Mobile-first responsive styling and archival design tokens |
| Icons | Lucide React | Accessible affordance icons |
| Animation | Motion (`motion/react`) | Subtle compositor-only transitions respecting `prefers-reduced-motion` |
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
│   ├── pages/
│   │   ├── AboutPage.tsx
│   │   ├── ContributePage.tsx
│   │   ├── GamePage.tsx
│   │   ├── GamesLibraryPage.tsx
│   │   ├── HomePage.tsx
│   │   └── NotFoundPage.tsx
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

## 4. Data Model & Content Pipeline

Every game conforms to `Game` in `src/types/game.ts`:

- **Core Identity**: `id`, `slug`, `accessionCode`, `name`, `alternativeNames`, `category`, `secondaryCategories`, `status`.
- **Metadata**: `playerCount`, `equipment`, `difficulty`, `duration`, `spaceRequired`, `lastUpdated`.
- **Flexible Content Blocks (`ContentBlock`)**: Supports `paragraph`, `ordered-list`, `unordered-list`, `table`, `card-example`, `callout`, `image`, and `faq`.
- **Cultural Honesty Fields**:
  - `variations`: Documents parallel versions (e.g., 7-card and 11-card Sevens).
  - `unconfirmedQuestions`: Explicitly isolates unresolved edge-case questions so they are never presented as settled rules.
  - `culturalNotes`: Records household and community recollections with explicit verification labels (`documented-version`, `community-recollection`, `needs-confirmation`).

### Adding a New Game

1. Create `src/content/games/<slug>.ts` exporting a `Game` object.
2. Import and add it to `ALL_GAMES` in `src/content/games/index.ts`.
3. Add illustrative or verified imagery under `src/assets/images/` with clear attribution metadata.
4. Set `status: 'published'` when ready. The Homepage, Games Library, search, category filters, and `/games/:slug` route update automatically.

---

## 5. Responsive, Accessibility & SEO Architecture

- **Mobile-First Layout**: Single-column mobile stacks expanding to multi-column editorial grids at `md`/`lg` breakpoints, touch targets `>= 44px`, and collapsible mobile Table of Contents on game pages.
- **WCAG 2.2 AA Targets**: Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`), skip-to-content link, keyboard-accessible mobile drawer with `Escape` dismissal, visible focus rings, `prefers-reduced-motion` support, and color-independent suit/status cues.
- **SEO**: `DocumentHead` updates page `<title>`, `<meta name="description">`, OpenGraph tags, canonical URLs, and Schema.org JSON-LD per route, paired with `public/sitemap.xml`.

---

## 6. Planned Future Extensions

- Community contribution form and moderation workflow (`src/types/contribution.ts` already defines `ContributionDraft` and `ContributionRecord`).
- Search across alternative regional names (`searchGames` already indexes `alternativeNames`).
- Printable rule sheets, audio oral-history recordings, and multilingual support.
