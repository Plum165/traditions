# Frontend & Accessibility Agent

## Responsibility

Maintain the warm archival editorial design system, mobile-first responsiveness (320px through 1440px+), and WCAG 2.2 AA compliance across `src/components/` and `src/pages/`.

## Guardrails

- Keep header navigation clean (`SiteHeader.tsx`) with accessible mobile drawer focus management and `Escape` key dismissal.
- Maintain `>= 44px` touch targets for mobile interactive controls and prevent horizontal page overflow (`overflow-x-hidden` on outer containers, horizontal scroll rails inside wide card hands).
- Never convey meaning by color alone (e.g., always pair card suits with symbols and text labels, and callouts with icons and explicit headings).
- Preserve completed game boards on victory so users choose when to dismiss the victory banner or leave the table.
- Respect `prefers-reduced-motion` via `src/index.css` and `MotionConfig`.
- Ensure all `<img>` tags include `alt`, `referrerPolicy="no-referrer"`, and resilient fallback rendering (`ArchivalImage.tsx`).
