import { describe, expect, it } from 'vitest';
import {
  PUBLISHED_GAMES,
  getActiveCategories,
  getGameBySlug,
  searchGames,
} from '../games';

describe('Archive Games Registry', () => {
  it('publishes both Sevens (OC-001) and Porridge / Sekaku (OC-002)', () => {
    expect(PUBLISHED_GAMES.map((g) => g.slug)).toEqual(['sevens', 'porridge']);
    expect(getActiveCategories()).toEqual([{ category: 'Card Games', count: 2 }]);
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
