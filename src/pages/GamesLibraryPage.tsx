import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import type { GameCategory } from '../types/game';
import {
  PUBLISHED_GAMES,
  getActiveCategories,
  searchGames,
} from '../content/games';
import { DocumentHead } from '../components/seo/DocumentHead';
import { GameCard } from '../components/games/GameCard';

export function GamesLibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = (searchParams.get('category') as GameCategory | null) ?? 'All';

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | 'All'>(
    initialCategory
  );

  const activeCategories = useMemo(() => getActiveCategories(), []);

  const filteredGames = useMemo(
    () => searchGames(query, selectedCategory),
    [query, selectedCategory]
  );

  const handleCategoryChange = (category: GameCategory | 'All') => {
    setSelectedCategory(category);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const handleResetFilters = () => {
    setQuery('');
    handleCategoryChange('All');
  };

  return (
    <>
      <DocumentHead
        title="Games Library – Our Childhood Archive"
        description="Browse documented Coloured childhood games including Sevens, Porridge (Sekaku), and Red or Black, filter by category, and explore verified rules and variations."
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Games Library – Our Childhood Archive',
          description:
            'Directory of documented childhood games and household variations.',
        }}
      />

      <section className="border-b border-[#DDD4C7] bg-[#F4EFE7]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <p className="font-sans text-xs font-medium tracking-wider text-[#6B6059] uppercase">
            Archive Directory
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#1E1A18] sm:text-4xl">
            Games Library
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#4A413B]">
            Explore documented childhood games, rules, and household variations—including{' '}
            <strong className="font-medium text-[#1E1A18]">Sevens</strong>,{' '}
            <strong className="font-medium text-[#1E1A18]">Porridge (Sekaku)</strong>, and{' '}
            <strong className="font-medium text-[#1E1A18]">Red or Black</strong>—with more entries
            added as community rules are verified and published.
          </p>

          {/* Search and Category Controls */}
          <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <label htmlFor="games-search-input" className="sr-only">
                Search games by name or description
              </label>
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#6B6059]"
                aria-hidden="true"
              />
              <input
                id="games-search-input"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search games by name..."
                className="min-h-[44px] w-full rounded-md border border-[#C6B8A6] bg-[#FAF7F2] py-2 pr-10 pl-10 text-sm text-[#1E1A18] placeholder:text-[#7A6F67] focus:border-[#7C2D36] focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search query"
                  className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-[#6B6059] hover:text-[#1E1A18]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Interactive Category Segmented Filter */}
            <div
              role="group"
              aria-label="Filter games by category"
              className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[#DDD4C7] bg-[#FAF7F2] p-1"
            >
              <button
                type="button"
                onClick={() => handleCategoryChange('All')}
                aria-pressed={selectedCategory === 'All'}
                className={`min-h-[38px] rounded-md px-3.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-[#7C2D36] text-[#FAF7F2]'
                    : 'text-[#4A413B] hover:bg-[#EFE8DC] hover:text-[#1E1A18]'
                }`}
              >
                All Games ({PUBLISHED_GAMES.length})
              </button>

              {activeCategories.map(({ category, count }) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryChange(category)}
                  aria-pressed={selectedCategory === category}
                  className={`min-h-[38px] rounded-md px-3.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                    selectedCategory === category
                      ? 'bg-[#7C2D36] text-[#FAF7F2]'
                      : 'text-[#4A413B] hover:bg-[#EFE8DC] hover:text-[#1E1A18]'
                  }`}
                >
                  {category} ({count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-6 flex items-center justify-between text-xs text-[#6B6059]">
          <p className="tabular-nums">
            Showing {filteredGames.length} of {PUBLISHED_GAMES.length} documented{' '}
            {PUBLISHED_GAMES.length === 1 ? 'game' : 'games'}
          </p>
        </div>

        {filteredGames.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}

            {/* Honest archival expansion note card */}
            <aside className="flex flex-col justify-between rounded-lg border border-dashed border-[#C6B8A6] bg-[#F4EFE7]/70 p-6 sm:p-8">
              <div>
                <p className="font-sans text-xs font-medium text-[#6B6059]">
                  Growing Archive
                </p>
                <h2 className="mt-2 font-serif text-2xl font-semibold text-[#1E1A18]">
                  More childhood games coming over time
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#4A413B] sm:text-base">
                  We do not publish placeholder or invented game entries. As families and
                  community members share verified rules for card games, street games, and
                  playground games, they will appear right here.
                </p>
              </div>
              <div className="mt-6 border-t border-[#DDD4C7] pt-4">
                <Link
                  to="/contribute"
                  className="inline-flex min-h-[40px] items-center text-sm font-medium text-[#7C2D36] hover:text-[#5B1E25]"
                >
                  See how to submit a game or variation
                </Link>
              </div>
            </aside>
          </div>
        ) : (
          <div className="rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] p-8 text-center sm:p-12">
            <h2 className="font-serif text-2xl font-semibold text-[#1E1A18]">
              No documented games matched “{query}”
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#4A413B] sm:text-base">
              The archive currently contains {PUBLISHED_GAMES.length} published{' '}
              {PUBLISHED_GAMES.length === 1 ? 'game' : 'games'}. If you remember the game you
              searched for, we would love to document it with your help.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-5 py-2.5 text-sm font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
              >
                Reset Search & Filters
              </button>
              <Link
                to="/contribute"
                className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#7C2D36] px-5 py-2.5 text-sm font-medium text-[#FAF7F2] hover:bg-[#64222A]"
              >
                Suggest This Game
              </Link>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
