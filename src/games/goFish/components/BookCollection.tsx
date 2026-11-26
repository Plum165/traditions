import { GameCardTile } from '../../../components/games/GameCardTile';
import type { CardTexture } from '../../../types/playingCard';
import { formatRankPlural } from '../engine/deck';
import type { PublicGoFishPlayerSummary } from '../engine/types';

interface BookCollectionProps {
  players: PublicGoFishPlayerSummary[];
  cardTexture: CardTexture;
}

export function BookCollection({ players, cardTexture }: BookCollectionProps) {
  const playersWithBooks = players.filter((p) => p.books.length > 0);

  return (
    <section
      aria-labelledby="go-fish-books-heading"
      className="rounded-lg border border-[#DDD4C7] bg-[#FAF7F2] p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#E6DED2] pb-3">
        <h2
          id="go-fish-books-heading"
          className="font-serif text-lg font-semibold text-[#1E1A18]"
        >
          Completed Books
        </h2>
        <p className="font-mono text-xs text-[#6B6059] tabular-nums">
          4 matching cards per book
        </p>
      </div>

      {playersWithBooks.length === 0 ? (
        <p className="mt-4 text-sm text-[#524943]">
          No books have been laid down yet. Whenever any player collects all four suits of a rank, their book appears face up here.
        </p>
      ) : (
        <div className="mt-4 space-y-5">
          {playersWithBooks.map((player) => (
            <div key={`books-${player.id}`}>
              <h3 className="text-xs font-semibold tracking-wider text-[#524943] uppercase">
                {player.name} ·{' '}
                <span className="font-mono tabular-nums">
                  {player.bookCount} {player.bookCount === 1 ? 'book' : 'books'}
                </span>
              </h3>
              <div className="mt-2.5 flex flex-wrap gap-3">
                {player.books.map((book) => (
                  <div
                    key={`book-${player.id}-${book.rank}`}
                    className="rounded-md border border-[#DDD4C7] bg-[#F4EFE7] p-2"
                  >
                    <p className="mb-1.5 font-mono text-[11px] font-semibold text-[#1E1A18] tabular-nums">
                      Book of {formatRankPlural(book.rank)}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {book.cards.map((c) => (
                        <GameCardTile
                          key={c.id}
                          card={c}
                          size="sm"
                          texture={cardTexture}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
