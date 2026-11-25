import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { DocumentHead } from '../components/seo/DocumentHead';
import { GameCardTile } from '../games/sevens/components/GameCardTile';
import { formatCardLabel } from '../games/sevens/engine/deck';
import { validateNewSet } from '../games/sevens/engine/validation';
import {
  PRACTICE_HAND_CARDS,
  TUTORIAL_LESSONS,
} from '../games/sevens/tutorial/tutorialData';

export function SevensTutorialPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [practiceSelection, setPracticeSelection] = useState<string[]>([]);

  const lesson = TUTORIAL_LESSONS[currentIndex];
  const totalLessons = TUTORIAL_LESSONS.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalLessons) * 100);

  const selectedOptionId = selectedAnswers[lesson.id];
  const selectedOption = lesson.question?.options.find(
    (opt) => opt.id === selectedOptionId
  );

  const practiceCards = useMemo(
    () => PRACTICE_HAND_CARDS.filter((card) => practiceSelection.includes(card.id)),
    [practiceSelection]
  );

  const practiceValidation = useMemo(() => {
    if (practiceCards.length === 0) return null;
    return validateNewSet(practiceCards);
  }, [practiceCards]);

  const togglePracticeCard = (cardId: string) => {
    setPracticeSelection((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  return (
    <>
      <DocumentHead
        title="Learn to Play Sevens – Interactive Tutorial | Our Childhood"
        description="Step-by-step interactive Sevens tutorial covering matching sets, consecutive runs, Joker replacement, turn structure, and live set practice."
      />

      <section className="border-b border-[#DDD4C7] bg-[#F4EFE7]">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/games/sevens"
              className="inline-flex min-h-[40px] items-center gap-2 text-sm font-medium text-[#524943] hover:text-[#7C2D36]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Sevens Rules</span>
            </Link>

            <Link
              to="/games/sevens/play"
              className="inline-flex min-h-[40px] items-center justify-center rounded-md bg-[#7C2D36] px-4 py-2 text-xs font-medium text-[#FAF7F2] hover:bg-[#64222A] sm:text-sm"
            >
              Play Sevens Now
            </Link>
          </div>

          <div className="mt-5">
            <p className="font-sans text-xs font-medium tracking-wider text-[#6B6059] uppercase">
              Interactive Tutorial · Lesson {lesson.number} of{' '}
              {String(totalLessons).padStart(2, '0')}
            </p>
            <h1 className="mt-1.5 font-serif text-3xl font-semibold tracking-tight text-[#1E1A18] sm:text-4xl">
              Learn to Play Sevens
            </h1>
          </div>

          {/* Progress Bar & Step Switcher */}
          <div className="mt-6">
            <div
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Tutorial progress"
              className="h-2 w-full overflow-hidden rounded-full bg-[#DDD4C7]"
            >
              <div
                className="h-full bg-[#7C2D36] transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <nav
              aria-label="Tutorial lessons"
              className="mt-4 flex flex-wrap gap-1.5"
            >
              {TUTORIAL_LESSONS.map((item, idx) => {
                const isActive = idx === currentIndex;
                const isAnsweredCorrectly = item.question
                  ? item.question.options.some(
                      (o) => o.id === selectedAnswers[item.id] && o.isCorrect
                    )
                  : idx < currentIndex;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-current={isActive ? 'step' : undefined}
                    className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                        : isAnsweredCorrectly
                          ? 'border-[#B9AA98] bg-[#FAF7F2] text-[#1E1A18] hover:bg-[#EFE8DC]'
                          : 'border-[#DDD4C7] bg-[#FAF7F2]/70 text-[#524943] hover:bg-[#EFE8DC]'
                    }`}
                  >
                    <span className="font-mono tabular-nums">{item.number}</span>
                    <span className="hidden sm:inline">{item.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="rounded-lg border border-[#DDD4C7] bg-[#FAF7F2] p-6 sm:p-8">
          <p className="font-mono text-xs font-medium text-[#7C2D36]">
            Lesson {lesson.number}
          </p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-[#1E1A18] sm:text-3xl">
            {lesson.title}
          </h2>
          <p className="mt-2 text-sm font-medium text-[#6B6059] sm:text-base">
            {lesson.summary}
          </p>

          <div className="mt-6 space-y-4 border-t border-[#E6DED2] pt-6">
            {lesson.paragraphs.map((para) => (
              <p
                key={para}
                className="max-w-prose text-base leading-[1.75] text-[#2D2724]"
              >
                {para}
              </p>
            ))}
          </div>

          {/* Interactive Card Example */}
          {lesson.exampleCards && (
            <figure className="mt-6 rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] p-5">
              {lesson.exampleTitle && (
                <h3 className="font-serif text-lg font-semibold text-[#1E1A18]">
                  {lesson.exampleTitle}
                </h3>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                {lesson.exampleCards.map((card) => (
                  <GameCardTile
                    key={card.id}
                    card={card}
                    highlight={card.kind === 'joker'}
                  />
                ))}
              </div>
              {lesson.exampleCaption && (
                <figcaption className="mt-4 border-t border-[#DDD4C7] pt-3 text-xs italic text-[#6B6059]">
                  {lesson.exampleCaption}
                </figcaption>
              )}
            </figure>
          )}

          {/* Quick Check Question */}
          {lesson.question && (
            <div className="mt-8 rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] p-5 sm:p-6">
              <p className="font-sans text-xs font-semibold tracking-wider text-[#6B6059] uppercase">
                Quick Check
              </p>
              <h3 className="mt-1.5 font-serif text-lg font-semibold text-[#1E1A18]">
                {lesson.question.prompt}
              </h3>

              <div className="mt-4 space-y-2.5">
                {lesson.question.options.map((option) => {
                  const isChosen = selectedOptionId === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        setSelectedAnswers((prev) => ({
                          ...prev,
                          [lesson.id]: option.id,
                        }))
                      }
                      aria-pressed={isChosen}
                      className={`flex min-h-[44px] w-full items-center justify-between gap-3 rounded-md border px-4 py-3 text-left text-sm transition-colors ${
                        isChosen
                          ? option.isCorrect
                            ? 'border-[#14532D] bg-[#ECFDF3] text-[#14532D]'
                            : 'border-[#7C2D36] bg-[#FDF2F2] text-[#7C2D36]'
                          : 'border-[#CFC4B4] bg-[#FAF7F2] text-[#1E1A18] hover:bg-[#EFE8DC]'
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                      {isChosen &&
                        (option.isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
                        ) : (
                          <XCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                        ))}
                    </button>
                  );
                })}
              </div>

              {selectedOption && (
                <div
                  role="status"
                  className={`mt-4 flex items-start gap-2.5 rounded-md border p-3.5 text-sm ${
                    selectedOption.isCorrect
                      ? 'border-[#14532D]/30 bg-[#FAF7F2] text-[#14532D]'
                      : 'border-[#7C2D36]/30 bg-[#FAF7F2] text-[#7C2D36]'
                  }`}
                >
                  {selectedOption.isCorrect ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                  <p>{selectedOption.explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* Interactive Practice Lab (Lesson 7) */}
          {lesson.includePracticeLab && (
            <div className="mt-8 rounded-lg border border-[#C6B8A6] bg-[#1E3D2F] p-5 text-[#FAF7F2] sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-sans text-xs font-medium tracking-wider text-[#E6DED2] uppercase">
                    Interactive Set Tester
                  </p>
                  <h3 className="mt-1 font-serif text-xl font-semibold text-[#FAF7F2]">
                    Try building valid and invalid sets
                  </h3>
                  <p className="mt-1 text-sm text-[#E6DED2]">
                    Tap cards below to select 3 or more cards and see immediate rules-engine
                    feedback.
                  </p>
                </div>

                {practiceSelection.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPracticeSelection([])}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-[#FAF7F2]/30 bg-[#FAF7F2]/10 px-3 py-1.5 text-xs font-medium text-[#FAF7F2] hover:bg-[#FAF7F2]/20"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Clear Selection</span>
                  </button>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5 sm:gap-3">
                {PRACTICE_HAND_CARDS.map((card) => (
                  <GameCardTile
                    key={card.id}
                    card={card}
                    selected={practiceSelection.includes(card.id)}
                    onClick={() => togglePracticeCard(card.id)}
                  />
                ))}
              </div>

              <div
                role="status"
                className="mt-6 rounded-md border border-[#FAF7F2]/20 bg-[#FAF7F2] p-4 text-[#1E1A18]"
              >
                {practiceCards.length === 0 ? (
                  <p className="text-sm text-[#4A413B]">
                    Select cards above—try <strong>8♦, 8♥, 8♠</strong> for a Matching Set,{' '}
                    <strong>♦3, ♦4, ♦5</strong> for a Consecutive Run, or mix in{' '}
                    <strong>6♣</strong> to see why invalid sets are rejected.
                  </p>
                ) : (
                  <div className="flex items-start gap-2.5">
                    {practiceValidation?.valid ? (
                      <CheckCircle2
                        className="mt-0.5 h-5 w-5 shrink-0 text-[#14532D]"
                        aria-hidden="true"
                      />
                    ) : (
                      <XCircle
                        className="mt-0.5 h-5 w-5 shrink-0 text-[#7C2D36]"
                        aria-hidden="true"
                      />
                    )}
                    <div>
                      <p className="text-sm font-semibold">
                        Selected: {practiceCards.map(formatCardLabel).join(', ')}
                      </p>
                      <p className="mt-1 text-sm text-[#3F3833]">
                        {practiceValidation?.valid
                          ? `Valid ${
                              practiceValidation.setType === 'matching'
                                ? 'Matching Set'
                                : 'Consecutive Run'
                            }! You could lay this down on your Play step.`
                          : practiceValidation?.reason}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lesson Navigation */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#E6DED2] pt-6">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-4 py-2 text-sm font-medium text-[#1E1A18] transition-colors hover:bg-[#EFE8DC] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Previous Lesson</span>
            </button>

            {currentIndex < totalLessons - 1 ? (
              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((prev) => Math.min(totalLessons - 1, prev + 1))
                }
                className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-[#7C2D36] px-5 py-2 text-sm font-medium text-[#FAF7F2] transition-colors hover:bg-[#64222A]"
              >
                <span>Next Lesson</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/games/sevens"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-4 py-2 text-sm font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
                >
                  Read Full Rules
                </Link>
                <Link
                  to="/games/sevens/play"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-[#7C2D36] px-5 py-2 text-sm font-medium text-[#FAF7F2] hover:bg-[#64222A]"
                >
                  <span>Play Sevens</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
