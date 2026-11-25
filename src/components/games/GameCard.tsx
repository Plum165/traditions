import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Game } from '../../types/game';
import { ArchivalImage } from '../ui/ArchivalImage';

interface GameCardProps {
  game: Game;
}

const STATUS_LABEL: Record<Game['status'], string> = {
  published: 'Documented entry',
  draft: 'Draft in preparation',
  'needs-confirmation': 'Awaiting rule confirmation',
};

export function GameCard({ game }: GameCardProps) {
  const variationCount = game.variations?.length ?? 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-[#DDD4C7] bg-[#FAF7F2] transition-colors duration-150 hover:border-[#B9AA98]">
      <Link to={`/games/${game.slug}`} className="block focus:outline-none">
        <div className="overflow-hidden border-b border-[#DDD4C7]">
          <ArchivalImage
            src={game.coverImage.src}
            alt={game.coverImage.alt}
            aspectRatio="16/9"
            isIllustrative={game.coverImage.isIllustrative}
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          <p className="font-sans text-xs font-medium text-[#6B6059]">
            <span className="font-mono tabular-nums">{game.accessionCode}</span>
            <span aria-hidden="true"> · </span>
            <span>{game.category}</span>
            {variationCount > 0 && (
              <>
                <span aria-hidden="true"> · </span>
                <span className="tabular-nums">
                  {variationCount} {variationCount === 1 ? 'variation' : 'variations'}
                </span>
              </>
            )}
          </p>

          <h3 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-[#1E1A18]">
            <Link
              to={`/games/${game.slug}`}
              className="transition-colors hover:text-[#7C2D36]"
            >
              {game.name}
            </Link>
          </h3>

          <p className="mt-2.5 text-sm leading-relaxed text-[#4A413B]">
            {game.shortSummary}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-[#E6DED2] pt-4 text-xs">
          <span className="text-[#6B6059]">{STATUS_LABEL[game.status]}</span>
          <Link
            to={`/games/${game.slug}`}
            className="inline-flex min-h-[40px] items-center gap-1.5 font-medium text-[#7C2D36] transition-colors hover:text-[#5B1E25]"
          >
            <span>Read documented rules</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
