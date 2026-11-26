import { describe, expect, it } from 'vitest';
import {
  PUBLISHED_GAMES,
  getActiveCategories,
  getGameBySlug,
  searchGames,
} from '../games';

describe('Archive Games Registry', () => {
  it('publishes Sevens (OC-001), Porridge / Sekaku (OC-002), Red or Black (OC-003), Go Fish (OC-004), and OMO (OC-005)', () => {
    expect(PUBLISHED_GAMES.map((g) => g.slug)).toEqual([
      'sevens',
      'porridge',
      'red-or-black',
      'go-fish',
      'omo',
    ]);
    expect(getActiveCategories()).toEqual([
      { category: 'Card Games', count: 4 },
      { category: 'Board Games', count: 1 },
    ]);
  });

  it('resolves Porridge (Sekaku) by slug and alias search', () => {
    const porridge = getGameBySlug('porridge');
    expect(porridge).toBeDefined();
    expect(porridge?.accessionCode).toBe('OC-002');
    expect(porridge?.alternativeNames).toContain('Sekaku');
    expect(porridge?.unconfirmedQuestions).toHaveLength(6);
    expect(porridge?.variations).toHaveLength(2);
    expect(porridge?.coverImage.isIllustrative).toBe(true);
    expect(porridge?.interactiveExperiences?.playPath).toBe('/games/porridge/play');

    const aliasResults = searchGames('sekaku', 'Card Games');
    expect(aliasResults.map((g) => g.slug)).toEqual(['porridge']);
  });

  it('resolves Red or Black (The Four Questions) by slug and alias search', () => {
    const redOrBlack = getGameBySlug('red-or-black');
    expect(redOrBlack).toBeDefined();
    expect(redOrBlack?.accessionCode).toBe('OC-003');
    expect(redOrBlack?.alternativeNames).toContain('The Four Questions');
    expect(redOrBlack?.unconfirmedQuestions).toHaveLength(7);
    expect(redOrBlack?.variations).toHaveLength(2);
    expect(redOrBlack?.coverImage.isIllustrative).toBe(true);
    expect(redOrBlack?.interactiveExperiences?.playPath).toBe('/games/red-or-black/play');

    const aliasResults = searchGames('the four questions', 'Card Games');
    expect(aliasResults.map((g) => g.slug)).toEqual(['red-or-black']);
  });

  it('resolves Go Fish by slug and alias search', () => {
    const goFish = getGameBySlug('go-fish');
    expect(goFish).toBeDefined();
    expect(goFish?.accessionCode).toBe('OC-004');
    expect(goFish?.alternativeNames).toContain('Fish Pond');
    expect(goFish?.variations).toHaveLength(5);
    expect(goFish?.coverImage.isIllustrative).toBe(true);
    expect(goFish?.interactiveExperiences?.playPath).toBe('/games/go-fish/play');

    const aliasResults = searchGames('fish pond', 'Card Games');
    expect(aliasResults.map((g) => g.slug)).toEqual(['go-fish']);
  });

  it('resolves OMO (OC-005) by slug and Board Games category search', () => {
    const omo = getGameBySlug('omo');
    expect(omo).toBeDefined();
    expect(omo?.accessionCode).toBe('OC-005');
    expect(omo?.category).toBe('Board Games');
    expect(omo?.coverImage.isIllustrative).toBe(true);
    expect(omo?.sections.length).toBeGreaterThanOrEqual(6);

    const searchResults = searchGames('omo', 'Board Games');
    expect(searchResults.map((g) => g.slug)).toEqual(['omo']);
  });

  it('ensures every published game has required archival metadata', () => {
    for (const game of PUBLISHED_GAMES) {
      expect(game.accessionCode).toMatch(/^OC-\d{3}$/);
      expect(game.objective.length).toBeGreaterThan(20);
      expect(game.sections.length).toBeGreaterThan(0);
      expect(game.coverImage.src).toBeTruthy();
      expect(game.coverImage.alt).toBeTruthy();
    }
  });
});
