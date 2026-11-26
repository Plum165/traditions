import type { Game, GameCategory, GameRepository } from '../../types/game';
import { porridgeGame } from './porridge';
import { redOrBlackGame } from './redOrBlack';
import { sevensGame } from './sevens';

/**
 * Central registry of documented games.
 * Adding a new game requires creating its content file and registering it here.
 */
export const ALL_GAMES: Game[] = [sevensGame, porridgeGame, redOrBlackGame];

export const PUBLISHED_GAMES: Game[] = ALL_GAMES.filter(
  (game) => game.status === 'published'
);

export const ALL_POTENTIAL_CATEGORIES: GameCategory[] = [
  'Card Games',
  'Street Games',
  'Playground Games',
  'Board Games',
  'Group Games',
  'Indoor Games',
  'Outdoor Games',
  'Traditional Activities',
];

export function getGameBySlug(slug: string): Game | undefined {
  return PUBLISHED_GAMES.find((game) => game.slug === slug);
}

export function getFeaturedGames(): Game[] {
  return PUBLISHED_GAMES.filter((game) => game.featured);
}

export function getRecentGames(limit = 4): Game[] {
  return [...PUBLISHED_GAMES]
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .slice(0, limit);
}

export function getActiveCategories(): { category: GameCategory; count: number }[] {
  const counts = new Map<GameCategory, number>();

  for (const game of PUBLISHED_GAMES) {
    counts.set(game.category, (counts.get(game.category) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([category, count]) => ({
    category,
    count,
  }));
}

export function searchGames(query: string, selectedCategory: GameCategory | 'All'): Game[] {
  const normalized = query.trim().toLowerCase();

  return PUBLISHED_GAMES.filter((game) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      game.category === selectedCategory ||
      game.secondaryCategories?.includes(selectedCategory);

    if (!matchesCategory) {
      return false;
    }

    if (!normalized) {
      return true;
    }

    const searchableText = [
      game.name,
      ...(game.alternativeNames ?? []),
      game.category,
      game.shortSummary,
      game.description,
    ]
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalized);
  });
}

export const localGameRepository: GameRepository = {
  getAllPublished: async () => PUBLISHED_GAMES,
  getBySlug: async (slug: string) => getGameBySlug(slug),
};
