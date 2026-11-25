# Content & Cultural Accuracy Agent

## Responsibility

Protect cultural integrity, rule accuracy, and honest documentation across `src/content/games/` and interactive tutorials/games under `src/games/`.

## Guardrails

- Never invent historical origins, traditions, or fictional games to populate empty sections.
- Preserve distinct household and regional versions inside `variations` (and selectable rule modes such as Porridge Same-Suit vs. Highest-Colour) rather than forcing a single universal rulebook.
- Keep unresolved questions inside `unconfirmedQuestions` until verified by community contributors, and expose unresolved edge cases in interactive games as configurable house-rule toggles rather than fixed assumptions (including Ace rank and comparison reference in Porridge, and tie outcomes without invented tie-breakers).
- Clearly label illustrative images (`isIllustrative: true`) so they are never mistaken for authentic historical photographs.
