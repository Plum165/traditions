import { Link, useParams } from 'react-router-dom';
import { getGameBySlug } from '../content/games';
import { DocumentHead } from '../components/seo/DocumentHead';
import { GameDetailsTemplate } from '../components/games/GameDetailsTemplate';

export function GamePage() {
  const { slug } = useParams<{ slug: string }>();
  const game = slug ? getGameBySlug(slug) : undefined;

  if (!game) {
    return (
      <>
        <DocumentHead
          title="Game Not Found – Our Childhood Archive"
          description="The requested game could not be found in the Our Childhood digital cultural games archive."
        />
        <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <p className="font-mono text-xs text-[#6B6059] uppercase">Archive Lookup</p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-[#1E1A18] sm:text-4xl">
            This game has not been documented yet
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#4A413B]">
            We could not find an archive entry for “{slug}”. If you grew up playing it, consider
            sharing what you remember so it can be added.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/games"
              className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#7C2D36] px-5 py-2.5 text-sm font-medium text-[#FAF7F2] hover:bg-[#64222A]"
            >
              Browse Games Library
            </Link>
            <Link
              to="/contribute"
              className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-5 py-2.5 text-sm font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
            >
              How to Contribute
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <DocumentHead
        title={game.seo?.title ?? `${game.name} – Our Childhood Archive`}
        description={game.seo?.description ?? game.shortSummary}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: `${game.name} – Rules, Variations & Cultural Notes`,
          description: game.description,
          dateModified: game.lastUpdated,
          about: {
            '@type': 'Game',
            name: game.name,
            description: game.shortSummary,
          },
        }}
      />
      <GameDetailsTemplate game={game} />
    </>
  );
}
