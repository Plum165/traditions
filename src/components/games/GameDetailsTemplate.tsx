import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, ChevronDown, HelpCircle } from 'lucide-react';
import type { Game, VerificationLevel } from '../../types/game';
import { getGameBySlug } from '../../content/games';
import { ArchivalImage } from '../ui/ArchivalImage';
import { ContentBlockRenderer } from './ContentBlockRenderer';
import { GameCard } from './GameCard';

interface GameDetailsTemplateProps {
  game: Game;
}

const VERIFICATION_LABEL: Record<VerificationLevel, string> = {
  'documented-version': 'Documented baseline version',
  'community-recollection': 'Community recollection',
  'needs-confirmation': 'Needs community confirmation',
};

interface TocItem {
  id: string;
  label: string;
}

export function GameDetailsTemplate({ game }: GameDetailsTemplateProps) {
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  const tocItems: TocItem[] = [
    { id: 'objective', label: 'Objective' },
    ...(game.equipment || game.setup ? [{ id: 'equipment-and-setup', label: 'Equipment & Setup' }] : []),
    ...game.sections.map((section) => ({ id: section.id, label: section.title })),
    ...(game.variations && game.variations.length > 0
      ? [{ id: 'variations-and-house-rules', label: 'Variations & House Rules' }]
      : []),
    ...(game.unconfirmedQuestions && game.unconfirmedQuestions.length > 0
      ? [{ id: 'rules-requiring-confirmation', label: 'Rules Requiring Confirmation' }]
      : []),
    ...(game.culturalNotes && game.culturalNotes.length > 0
      ? [{ id: 'cultural-notes', label: 'Cultural Notes & Memories' }]
      : []),
    { id: 'contribute-to-entry', label: 'Contribute to This Entry' },
  ];

  const resolvedRelatedGames = (game.relatedGames ?? [])
    .map((slug) => getGameBySlug(slug))
    .filter((item): item is Game => Boolean(item));

  const metadataRows: { label: string; value: string }[] = [
    { label: 'Archive ID', value: game.accessionCode },
    { label: 'Category', value: game.category },
    ...(game.playerCount ? [{ label: 'Players', value: game.playerCount }] : []),
    ...(game.equipment && game.equipment.length > 0
      ? [{ label: 'Equipment', value: game.equipment.join(' · ') }]
      : []),
    ...(game.difficulty ? [{ label: 'Complexity', value: game.difficulty }] : []),
    ...(game.duration ? [{ label: 'Typical Duration', value: game.duration }] : []),
    ...(game.spaceRequired ? [{ label: 'Playing Space', value: game.spaceRequired }] : []),
    { label: 'Last Updated', value: game.lastUpdated },
  ];

  return (
    <article className="pb-16">
      {/* Archival Header */}
      <header className="border-b border-[#DDD4C7] bg-[#F4EFE7]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link
              to="/games"
              className="inline-flex min-h-[40px] items-center gap-2 text-sm font-medium text-[#524943] transition-colors hover:text-[#7C2D36]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Games Library</span>
            </Link>
          </nav>

          <div className="grid items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="flex flex-col justify-between lg:col-span-6">
              <div>
                <p className="font-sans text-xs font-medium tracking-wide text-[#6B6059]">
                  <span className="font-mono tabular-nums">{game.accessionCode}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{game.category}</span>
                  {game.secondaryCategories && game.secondaryCategories.length > 0 && (
                    <>
                      <span aria-hidden="true"> · </span>
                      <span>{game.secondaryCategories.join(', ')}</span>
                    </>
                  )}
                </p>

                <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[#1E1A18] sm:text-5xl">
                  {game.name}
                </h1>

                {game.alternativeNames && game.alternativeNames.length > 0 && (
                  <p className="mt-2 text-sm text-[#524943]">
                    Also known as: {game.alternativeNames.join(', ')}
                  </p>
                )}

                <p className="mt-4 max-w-xl text-base leading-relaxed text-[#3F3833] sm:text-lg">
                  {game.description}
                </p>

                {game.interactiveExperiences && (
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    {game.interactiveExperiences.playPath && (
                      <Link
                        to={game.interactiveExperiences.playPath}
                        className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#7C2D36] px-5 py-2.5 text-sm font-medium text-[#FAF7F2] whitespace-nowrap shrink-0 transition-colors hover:bg-[#64222A]"
                      >
                        {game.interactiveExperiences.playLabel ?? `Play ${game.name}`}
                      </Link>
                    )}
                    {game.interactiveExperiences.learnPath && (
                      <Link
                        to={game.interactiveExperiences.learnPath}
                        className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#B9AA98] bg-[#FAF7F2] px-5 py-2.5 text-sm font-medium text-[#1E1A18] whitespace-nowrap shrink-0 transition-colors hover:bg-[#EFE8DC]"
                      >
                        {game.interactiveExperiences.learnLabel ?? 'Learn to Play'}
                      </Link>
                    )}
                    {game.interactiveExperiences.rulesAnchorId && (
                      <a
                        href={`#${game.interactiveExperiences.rulesAnchorId}`}
                        className="inline-flex min-h-[44px] items-center justify-center px-3 py-2 text-sm font-medium text-[#7C2D36] underline underline-offset-4 whitespace-nowrap shrink-0 hover:text-[#5B1E25]"
                      >
                        {game.interactiveExperiences.rulesLabel ?? 'Read Full Rules'}
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Accession Metadata Definition List */}
              <dl className="mt-8 divide-y divide-[#DDD4C7] border-y border-[#DDD4C7] text-sm">
                {metadataRows.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-3 sm:gap-4"
                  >
                    <dt className="font-medium text-[#6B6059]">{row.label}</dt>
                    <dd className="text-[#1E1A18] sm:col-span-2 tabular-nums">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full">
                <ArchivalImage
                  src={game.coverImage.src}
                  alt={game.coverImage.alt}
                  caption={game.coverImage.caption}
                  isIllustrative={game.coverImage.isIllustrative}
                  aspectRatio="16/9"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Reading Canvas with Table of Contents */}
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        {/* Mobile Collapsible Table of Contents */}
        <div className="mb-8 rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] lg:hidden">
          <button
            type="button"
            onClick={() => setMobileTocOpen((prev) => !prev)}
            aria-expanded={mobileTocOpen}
            aria-controls="mobile-toc-list"
            className="flex min-h-[48px] w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[#1E1A18]"
          >
            <span className="inline-flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#7C2D36]" aria-hidden="true" />
              <span>Table of Contents</span>
            </span>
            <ChevronDown
              className={`h-4 w-4 text-[#6B6059] transition-transform duration-150 ${
                mobileTocOpen ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>
          {mobileTocOpen && (
            <nav
              id="mobile-toc-list"
              aria-label="Game documentation sections"
              className="border-t border-[#DDD4C7] px-4 py-3"
            >
              <ol className="space-y-1.5">
                {tocItems.map((item, idx) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={() => setMobileTocOpen(false)}
                      className="flex min-h-[40px] items-center gap-3 text-sm text-[#3F3833] hover:text-[#7C2D36]"
                    >
                      <span className="font-mono text-xs text-[#6B6059] tabular-nums">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Desktop Sticky Table of Contents */}
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24">
              <h2 className="font-sans text-xs font-semibold tracking-wider text-[#6B6059] uppercase">
                Contents
              </h2>
              <nav aria-label="Game documentation sections" className="mt-4 border-t border-[#DDD4C7] pt-4">
                <ol className="space-y-2">
                  {tocItems.map((item, idx) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="group flex items-baseline gap-2.5 py-1 text-sm text-[#4A413B] transition-colors hover:text-[#7C2D36]"
                      >
                        <span className="font-mono text-xs text-[#8A7D74] tabular-nums group-hover:text-[#7C2D36]">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span>{item.label}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </aside>

          {/* Main Game Documentation Column */}
          <div className="space-y-12 lg:col-span-9">
            {/* Objective */}
            <section id="objective" aria-labelledby="heading-objective" className="scroll-mt-24">
              <h2
                id="heading-objective"
                className="font-serif text-2xl font-semibold text-[#1E1A18] sm:text-3xl"
              >
                Objective
              </h2>
              <p className="mt-4 max-w-prose text-base leading-[1.75] text-[#2D2724] sm:text-lg">
                {game.objective}
              </p>
            </section>

            {/* Equipment & Setup */}
            {(game.equipment || game.setup) && (
              <section
                id="equipment-and-setup"
                aria-labelledby="heading-equipment"
                className="scroll-mt-24 border-t border-[#DDD4C7] pt-10"
              >
                <h2
                  id="heading-equipment"
                  className="font-serif text-2xl font-semibold text-[#1E1A18] sm:text-3xl"
                >
                  Equipment & Setup
                </h2>

                {game.equipment && game.equipment.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-sans text-xs font-semibold tracking-wider text-[#6B6059] uppercase">
                      What You Need
                    </h3>
                    <ul className="mt-2.5 list-disc space-y-1.5 pl-5 text-base text-[#2D2724]">
                      {game.equipment.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {game.setup && game.setup.length > 0 && (
                  <div className="mt-6">
                    <ContentBlockRenderer blocks={game.setup} />
                  </div>
                )}
              </section>
            )}

            {/* Dynamic Rule & Instruction Sections */}
            {game.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`heading-${section.id}`}
                className="scroll-mt-24 border-t border-[#DDD4C7] pt-10"
              >
                <div className="mb-5">
                  {section.verification && (
                    <p className="mb-1.5 font-sans text-xs text-[#6B6059]">
                      {VERIFICATION_LABEL[section.verification]}
                    </p>
                  )}
                  <h2
                    id={`heading-${section.id}`}
                    className="font-serif text-2xl font-semibold text-[#1E1A18] sm:text-3xl"
                  >
                    {section.title}
                  </h2>
                </div>
                <ContentBlockRenderer blocks={section.blocks} />
              </section>
            ))}

            {/* Variations & House Rules */}
            {game.variations && game.variations.length > 0 && (
              <section
                id="variations-and-house-rules"
                aria-labelledby="heading-variations"
                className="scroll-mt-24 border-t border-[#DDD4C7] pt-10"
              >
                <h2
                  id="heading-variations"
                  className="font-serif text-2xl font-semibold text-[#1E1A18] sm:text-3xl"
                >
                  Variations & House Rules
                </h2>
                <p className="mt-3 max-w-prose text-base leading-relaxed text-[#4A413B]">
                  Households and neighbourhoods often adapt games to fit the table. Documented
                  variations recorded for {game.name} are listed below.
                </p>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {game.variations.map((variation) => (
                    <div
                      key={variation.id}
                      className="rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] p-5"
                    >
                      <p className="text-xs font-medium text-[#6B6059]">
                        {VERIFICATION_LABEL[variation.verification]}
                      </p>
                      <h3 className="mt-1.5 font-serif text-xl font-semibold text-[#1E1A18]">
                        {variation.name}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#3F3833]">
                        {variation.summary}
                      </p>
                      {variation.details.length > 0 && (
                        <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm text-[#4A413B]">
                          {variation.details.map((detail) => (
                            <li key={detail}>{detail}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Rules Requiring Confirmation */}
            {game.unconfirmedQuestions && game.unconfirmedQuestions.length > 0 && (
              <section
                id="rules-requiring-confirmation"
                aria-labelledby="heading-unconfirmed"
                className="scroll-mt-24 border-t border-[#DDD4C7] pt-10"
              >
                <div className="rounded-lg border border-[#C8B08A] bg-[#F6EFE2] p-5 sm:p-7">
                  <div className="flex items-start gap-3">
                    <HelpCircle
                      className="mt-1 h-5 w-5 shrink-0 text-[#7B5218]"
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold tracking-wide text-[#7B5218] uppercase">
                        Unresolved Questions · Not Settled Rules
                      </p>
                      <h2
                        id="heading-unconfirmed"
                        className="mt-1 font-serif text-2xl font-semibold text-[#1E1A18]"
                      >
                        Rules Requiring Confirmation
                      </h2>
                      <p className="mt-2 max-w-prose text-sm leading-relaxed text-[#3F3833] sm:text-base">
                        The archive never invents or guesses unverified house rules. The following
                        questions remain open until contributors confirm how they are played in
                        their households or communities:
                      </p>

                      <ul className="mt-4 space-y-2.5">
                        {game.unconfirmedQuestions.map((question, idx) => (
                          <li
                            key={question}
                            className="flex items-baseline gap-3 border-t border-[#E2D3B9] pt-2.5 text-sm text-[#2D2724] sm:text-base"
                          >
                            <span className="font-mono text-xs font-medium text-[#7B5218] tabular-nums">
                              Q{idx + 1}
                            </span>
                            <span>{question}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-5 border-t border-[#E2D3B9] pt-4">
                        <Link
                          to="/contribute#share-variation"
                          className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-medium text-[#7C2D36] hover:text-[#5B1E25]"
                        >
                          <span>Help confirm one of these rules</span>
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Cultural Notes & Memories */}
            {game.culturalNotes && game.culturalNotes.length > 0 && (
              <section
                id="cultural-notes"
                aria-labelledby="heading-cultural-notes"
                className="scroll-mt-24 border-t border-[#DDD4C7] pt-10"
              >
                <h2
                  id="heading-cultural-notes"
                  className="font-serif text-2xl font-semibold text-[#1E1A18] sm:text-3xl"
                >
                  Cultural Notes & Memories
                </h2>
                <div className="mt-6 space-y-6">
                  {game.culturalNotes.map((note) => (
                    <div
                      key={note.title}
                      className="rounded-lg border border-[#DDD4C7] bg-[#FAF7F2] p-5 sm:p-6"
                    >
                      <p className="text-xs font-medium text-[#6B6059]">
                        {VERIFICATION_LABEL[note.verification]}
                      </p>
                      <h3 className="mt-1 font-serif text-xl font-semibold text-[#1E1A18]">
                        {note.title}
                      </h3>
                      <p className="mt-2.5 max-w-prose text-base leading-relaxed text-[#3F3833]">
                        {note.text}
                      </p>
                      {note.attribution && (
                        <p className="mt-3 text-xs text-[#6B6059]">— {note.attribution}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Related Games (only rendered when related games exist) */}
            {resolvedRelatedGames.length > 0 && (
              <section
                aria-labelledby="heading-related"
                className="border-t border-[#DDD4C7] pt-10"
              >
                <h2
                  id="heading-related"
                  className="font-serif text-2xl font-semibold text-[#1E1A18]"
                >
                  Related Games in the Archive
                </h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  {resolvedRelatedGames.map((related) => (
                    <GameCard key={related.id} game={related} />
                  ))}
                </div>
              </section>
            )}

            {/* Contribution Invitation */}
            <section
              id="contribute-to-entry"
              aria-labelledby="heading-contribute-entry"
              className="scroll-mt-24 border-t border-[#DDD4C7] pt-10"
            >
              <div className="rounded-lg border border-[#DDD4C7] bg-[#EFE8DC] p-6 sm:p-8">
                <h2
                  id="heading-contribute-entry"
                  className="font-serif text-2xl font-semibold text-[#1E1A18]"
                >
                  Did your family play {game.name} differently?
                </h2>
                <p className="mt-3 max-w-prose text-base leading-relaxed text-[#3F3833]">
                  If your household used a different name, different starting-hand rules, or
                  settled one of the open questions above, we would value preserving your version
                  alongside this entry.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/contribute"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#7C2D36] px-5 py-2.5 text-sm font-medium text-[#FAF7F2] transition-colors hover:bg-[#64222A]"
                  >
                    Learn How to Contribute
                  </Link>
                  <Link
                    to="/games"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-5 py-2.5 text-sm font-medium text-[#1E1A18] transition-colors hover:bg-[#F4EFE7]"
                  >
                    Return to Games Library
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}
