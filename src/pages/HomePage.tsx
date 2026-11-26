import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import {
  getActiveCategories,
  getFeaturedGames,
  getRecentGames,
} from '../content/games';
import { DocumentHead } from '../components/seo/DocumentHead';
import { ArchivalImage } from '../components/ui/ArchivalImage';
import { GameCard } from '../components/games/GameCard';

export function HomePage() {
  const featuredGames = getFeaturedGames();
  const recentGames = getRecentGames(5);
  const activeCategories = getActiveCategories();

  return (
    <>
      <DocumentHead
        title="Our Childhood – Digital Cultural Games Archive"
        description="Preserving Coloured childhood games, house rules, and neighbourhood traditions. Explore documented rules for Sevens, Porridge (Sekaku), Red or Black, Go Fish, and OMO, and contribute family memories."
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Our Childhood – Digital Cultural Games Archive',
          description:
            'A digital cultural archive preserving Coloured childhood games, traditions, and house rules.',
        }}
      />

      {/* 1. Hero Section */}
      <section className="border-b border-[#DDD4C7] bg-[#F4EFE7]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="grid items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col justify-center lg:col-span-6"
            >
              <p className="font-sans text-xs font-medium tracking-wider text-[#6B6059] uppercase">
                Digital Cultural Games Archive
              </p>

              <h1 className="mt-3 font-serif text-4xl font-semibold leading-[1.12] tracking-tight text-[#1E1A18] sm:text-5xl">
                Remember the games we grew up playing?
              </h1>

              <p className="mt-5 max-w-xl text-base leading-[1.7] text-[#3F3833] sm:text-lg">
                The games, the rules, the arguments and the memories. A place to preserve the
                traditions that shaped our childhood.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/games"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-[#7C2D36] px-5 py-2.5 text-sm font-medium text-[#FAF7F2] transition-colors duration-150 hover:bg-[#64222A]"
                >
                  <span>Explore the Archive</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>

                <Link
                  to="/games/sevens"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-5 py-2.5 text-sm font-medium text-[#1E1A18] transition-colors duration-150 hover:bg-[#EFE8DC]"
                >
                  Read Sevens Rules
                </Link>
              </div>
            </motion.div>

            <div className="lg:col-span-6">
              <ArchivalImage
                src="/src/assets/images/hero_archive_cards_1795614813252.jpg"
                alt="A worn vintage deck of playing cards with two Jokers resting beside a ceramic teacup on a sunlit wooden table"
                caption="Illustrative photograph: A 54-card deck set out on an afternoon table. Not an archival family photograph."
                isIllustrative
                aspectRatio="16/9"
                priority
                className="h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Short Introduction to the Archive */}
      <section className="border-b border-[#DDD4C7] bg-[#FAF7F2]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-serif text-2xl font-semibold text-[#1E1A18] sm:text-3xl">
              Preserving traditions passed down by word of mouth
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#4A413B]">
              Many Coloured childhood games were learnt around kitchen tables, on stoeps, and in
              neighbourhood streets—never printed in a manual. This archive records how games are
              played while respecting how each family remembers them.
            </p>
          </div>

          <div className="mt-10 grid gap-8 border-t border-[#DDD4C7] pt-8 md:grid-cols-3">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#1E1A18]">
                01. Documented Rules
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4A413B]">
                Clear, step-by-step explanations written so younger generations and newcomers can
                sit down and play straight away.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#1E1A18]">
                02. Room for House Rules
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4A413B]">
                No single household owns the only correct version. The archive tracks alternative
                names, regional variations, and open rule questions honestly.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#1E1A18]">
                03. Built to Grow Carefully
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4A413B]">
                Each game—including Sevens, Porridge (Sekaku), Red or Black, Go Fish, and OMO—is
                added only after real community rules, variations, and open questions are documented
                honestly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Games */}
      <section className="border-b border-[#DDD4C7] bg-[#FAF7F2]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-sans text-xs font-medium tracking-wider text-[#6B6059] uppercase">
                Documented Archival Entries
              </p>
              <h2 className="mt-1 font-serif text-2xl font-semibold text-[#1E1A18] sm:text-3xl">
                Featured Games
              </h2>
            </div>
            <Link
              to="/games"
              className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-medium text-[#7C2D36] hover:text-[#5B1E25]"
            >
              <span>View Games Library</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8 grid items-start gap-8 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              {featuredGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>

            <aside className="rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] p-6 lg:col-span-5">
              <h3 className="font-serif text-xl font-semibold text-[#1E1A18]">
                Growing Game by Game
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#3F3833] sm:text-base">
                The archive currently documents{' '}
                <strong className="font-medium text-[#1E1A18]">Sevens</strong> (OC-001),{' '}
                <strong className="font-medium text-[#1E1A18]">Porridge / Sekaku</strong> (OC-002),{' '}
                <strong className="font-medium text-[#1E1A18]">Red or Black</strong> (OC-003),{' '}
                <strong className="font-medium text-[#1E1A18]">Go Fish</strong> (OC-004), and{' '}
                <strong className="font-medium text-[#1E1A18]">OMO</strong> (OC-005).
                Rather than filling the library with invented entries, each game is published only
                after its rules, variations, and unresolved edge cases are carefully recorded.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#524943]">
                More card games, street games, and playground traditions will be added over time
                through community contributions.
              </p>
              <div className="mt-5 border-t border-[#DDD4C7] pt-4">
                <Link
                  to="/contribute"
                  className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-medium text-[#7C2D36] hover:text-[#5B1E25]"
                >
                  <span>Suggest the next game to document</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* 4. Browse by Category & 5. Recently Added Games */}
      <section className="border-b border-[#DDD4C7] bg-[#F4EFE7]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Browse by Category */}
            <div className="lg:col-span-5">
              <h2 className="font-serif text-2xl font-semibold text-[#1E1A18]">
                Browse by Category
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#4A413B]">
                Categories appear as games are published in the archive.
              </p>

              <ul className="mt-6 divide-y divide-[#DDD4C7] rounded-lg border border-[#DDD4C7] bg-[#FAF7F2]">
                {activeCategories.map(({ category, count }) => (
                  <li key={category}>
                    <Link
                      to={`/games?category=${encodeURIComponent(category)}`}
                      className="flex min-h-[52px] items-center justify-between px-5 py-3 text-sm font-medium text-[#1E1A18] transition-colors hover:bg-[#EFE8DC]/60 hover:text-[#7C2D36]"
                    >
                      <span>{category}</span>
                      <span className="font-mono text-xs text-[#6B6059] tabular-nums">
                        {count} {count === 1 ? 'game' : 'games'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-xs leading-relaxed text-[#6B6059]">
                Future categories—including Street Games, Playground Games, and Outdoor
                Activities—will open as soon as verified entries are added.
              </p>
            </div>

            {/* Recently Added Games */}
            <div className="lg:col-span-7">
              <h2 className="font-serif text-2xl font-semibold text-[#1E1A18]">
                Recently Added
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#4A413B]">
                Latest documented entries and revisions in the collection.
              </p>

              <div className="mt-6 divide-y divide-[#DDD4C7] rounded-lg border border-[#DDD4C7] bg-[#FAF7F2]">
                {recentGames.map((game) => (
                  <Link
                    key={game.id}
                    to={`/games/${game.slug}`}
                    className="flex flex-col justify-between gap-2 px-5 py-4 transition-colors hover:bg-[#EFE8DC]/50 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="text-xs text-[#6B6059]">
                        <span className="font-mono tabular-nums">{game.accessionCode}</span>
                        <span aria-hidden="true"> · </span>
                        <span>{game.category}</span>
                      </p>
                      <h3 className="mt-0.5 font-serif text-lg font-semibold text-[#1E1A18]">
                        {game.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#6B6059]">
                      <span className="font-mono tabular-nums">Updated {game.lastUpdated}</span>
                      <ArrowRight className="h-4 w-4 text-[#7C2D36]" aria-hidden="true" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Cultural Preservation Message */}
      <section className="border-b border-[#DDD4C7] bg-[#FAF7F2]">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-18 lg:px-8">
          <blockquote className="font-serif text-2xl italic leading-relaxed text-[#1E1A18] sm:text-3xl">
            “Before anyone turns over a card, someone always asks: are we playing seven cards or
            eleven—and can you pick up from the middle?”
          </blockquote>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-[#524943] sm:text-base">
            Every neighbourhood and household carried its own version of these games. Our goal is
            not to declare one version official, but to make sure the memories, rules, and stories
            are written down before they fade.
          </p>
        </div>
      </section>

      {/* 7. Contribution Invitation */}
      <section className="bg-[#EFE8DC]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <h2 className="font-serif text-2xl font-semibold text-[#1E1A18] sm:text-3xl">
                Help grow the archive with your memories
              </h2>
              <p className="mt-2.5 text-base leading-relaxed text-[#3F3833]">
                Know a childhood game that belongs here, remember another variation of Sevens,
                Porridge (Sekaku), Red or Black, Go Fish, or OMO, or can confirm one of the open
                house-rule questions? Read how contributions are documented and reviewed.
              </p>
            </div>
            <div className="shrink-0">
              <Link
                to="/contribute"
                className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#7C2D36] px-6 py-3 text-sm font-medium text-[#FAF7F2] transition-colors hover:bg-[#64222A]"
              >
                How to Contribute
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
