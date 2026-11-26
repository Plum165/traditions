import {
  ArrowRight,
  Bot,
  CheckCircle2,
  HelpCircle,
  Layers,
  RotateCcw,
  User,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';
import { GameCardTile } from '../../../components/games/GameCardTile';
import { BOT_DIFFICULTY_LABELS } from '../../../types/multiplayer';
import {
  STANDARD_SUITS,
  SUIT_NAMES,
  SUIT_SYMBOLS,
  type CardTexture,
} from '../../../types/playingCard';
import { formatCardLabel, getCardValue } from '../engine/deck';
import type {
  PublicRedOrBlackView,
  QuestionNumber,
  RedOrBlackPrediction,
} from '../engine/types';
import { RedOrBlackVictory } from './RedOrBlackVictory';

interface RedOrBlackTableProps {
  view: PublicRedOrBlackView;
  cardTexture: CardTexture;
  errorMessage: string | null;
  onChangeCardTexture: (texture: CardTexture) => void;
  onToggleSound: () => void;
  onSubmitPrediction: (
    playerId: string,
    prediction: RedOrBlackPrediction
  ) => void;
  onContinueTurn: () => void;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

const QUESTION_TITLES: Record<QuestionNumber, string> = {
  1: 'Question 1: Red or Black?',
  2: 'Question 2: Higher or Lower?',
  3: 'Question 3: Inside or Outside?',
  4: 'Question 4: Guess the Suit',
};

const QUESTION_SHORT_LABELS: Record<QuestionNumber, string> = {
  1: '1. Colour',
  2: '2. Higher / Lower',
  3: '3. Inside / Outside',
  4: '4. Suit',
};

export function RedOrBlackTable({
  view,
  cardTexture,
  errorMessage,
  onChangeCardTexture,
  onToggleSound,
  onSubmitPrediction,
  onContinueTurn,
  onPlayAgain,
  onNewGame,
}: RedOrBlackTableProps) {
  const isPlaying = view.status === 'PLAYING';
  const isHumanTurn =
    isPlaying &&
    !view.pendingRevealAdvance &&
    view.answerer.type === 'human';
  const isFourQuestions = view.variant === 'four-questions';

  const card1 = view.sequenceCards[0];
  const card2 = view.sequenceCards[1];

  let lowBoundaryLabel = '';
  let highBoundaryLabel = '';
  if (card1 && card2) {
    const v1 = getCardValue(card1, view.rules.aceRanking);
    const v2 = getCardValue(card2, view.rules.aceRanking);
    if (v1 <= v2) {
      lowBoundaryLabel = formatCardLabel(card1);
      highBoundaryLabel = formatCardLabel(card2);
    } else {
      lowBoundaryLabel = formatCardLabel(card2);
      highBoundaryLabel = formatCardLabel(card1);
    }
  }

  return (
    <div className="space-y-5 overflow-x-hidden">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] px-3.5 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="font-mono text-xs text-[#6B6059] tabular-nums">
            Turn {view.turnNumber} ·{' '}
            {isFourQuestions
              ? 'Four Questions Challenge'
              : 'Card Collection House Rule'}{' '}
            · <span className="capitalize">{view.direction}</span>
          </p>
          <p className="mt-0.5 text-sm font-medium text-[#1E1A18]">
            {view.lastActionSummary}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleSound}
            aria-pressed={view.rules.soundEnabled}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3 py-1.5 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
          >
            {view.rules.soundEnabled ? (
              <Volume2 className="h-4 w-4 text-[#7C2D36]" aria-hidden="true" />
            ) : (
              <VolumeX className="h-4 w-4 text-[#6B6059]" aria-hidden="true" />
            )}
            <span>{view.rules.soundEnabled ? 'Sound On' : 'Muted'}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onChangeCardTexture(
                cardTexture === 'classic' ? 'archival' : 'classic'
              )
            }
            className="inline-flex min-h-[44px] items-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3 py-1.5 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
          >
            Cards: {cardTexture === 'classic' ? 'Classic' : 'Archival'}
          </button>

          <button
            type="button"
            onClick={onNewGame}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3 py-1.5 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>New Game</span>
          </button>
        </div>
      </div>

      {/* Inline Victory Display (Board Remains Visible Below) */}
      {view.status === 'GAME_OVER' && (
        <RedOrBlackVictory
          view={view}
          onPlayAgain={onPlayAgain}
          onNewGame={onNewGame}
        />
      )}

      {/* Role Clarity Banner: Asker vs Answerer */}
      <div className="grid gap-3 rounded-lg border border-[#DDD4C7] bg-[#FAF7F2] p-3.5 sm:grid-cols-2 sm:p-4">
        <div className="flex items-center gap-3 rounded-md border border-[#E6DED2] bg-[#F4EFE7] px-3.5 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[#C6B8A6] bg-[#FAF7F2] text-[#6E4411]">
            <Layers className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-semibold tracking-wider text-[#6B6059] uppercase">
              Asking Questions (Holds Deck)
            </p>
            <p className="truncate font-serif text-base font-semibold text-[#1E1A18]">
              {view.asker.name}{' '}
              <span className="font-sans text-xs font-normal text-[#524943]">
                (
                {view.asker.type === 'bot'
                  ? `Bot · ${BOT_DIFFICULTY_LABELS[view.asker.difficulty ?? 'normal']}`
                  : 'Human'}
                )
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-md border border-[#7C2D36] bg-[#F4EFE7] px-3.5 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]">
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-semibold tracking-wider text-[#7C2D36] uppercase">
              Answering Now
            </p>
            <p className="truncate font-serif text-base font-semibold text-[#1E1A18]">
              {view.answerer.name}{' '}
              <span className="font-sans text-xs font-normal text-[#524943]">
                (
                {view.answerer.type === 'bot'
                  ? `Bot · ${BOT_DIFFICULTY_LABELS[view.answerer.difficulty ?? 'normal']}`
                  : 'Human'}
                )
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Player Information Strip */}
      <section aria-label="Players and current roles">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {view.players.map((player) => {
            const roleLabel = player.isAnswerer
              ? 'Answering'
              : player.isAsker
                ? 'Asking (Deck)'
                : 'Waiting';
            const turnStatus =
              view.status === 'GAME_OVER'
                ? view.winnerIds.includes(player.id)
                  ? 'Winner'
                  : 'Finished'
                : player.isAnswerer
                  ? view.pendingRevealAdvance
                    ? 'Reveal Shown'
                    : 'Active Turn'
                  : player.isAsker
                    ? 'Holding Deck'
                    : 'Standby';

            return (
              <div
                key={player.id}
                className={`rounded-lg border p-3.5 transition-colors ${
                  player.isAnswerer
                    ? 'border-[#7C2D36] bg-[#F4EFE7] ring-1 ring-[#7C2D36]'
                    : player.isAsker
                      ? 'border-[#8A5A19] bg-[#FAF7F2]'
                      : 'border-[#DDD4C7] bg-[#FAF7F2]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    {player.type === 'bot' ? (
                      <Bot
                        className="h-4 w-4 shrink-0 text-[#6E4411]"
                        aria-hidden="true"
                      />
                    ) : (
                      <User
                        className="h-4 w-4 shrink-0 text-[#7C2D36]"
                        aria-hidden="true"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-serif text-base font-semibold text-[#1E1A18]">
                        {player.name}
                      </p>
                      <p className="text-xs text-[#524943]">
                        #{player.turnOrder} ·{' '}
                        {player.type === 'bot'
                          ? `Bot (${BOT_DIFFICULTY_LABELS[player.difficulty ?? 'normal']})`
                          : 'Human'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1.5 border-t border-[#E6DED2] pt-2 text-xs">
                  <span
                    className={`font-semibold ${
                      player.isAnswerer
                        ? 'text-[#7C2D36]'
                        : player.isAsker
                          ? 'text-[#6E4411]'
                          : 'text-[#6B6059]'
                    }`}
                  >
                    Role: {roleLabel}
                  </span>
                  <span className="font-mono text-[11px] text-[#524943] tabular-nums">
                    {turnStatus}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between text-xs text-[#4A413B] tabular-nums">
                  {isFourQuestions ? (
                    <>
                      <span>Correct guesses: {player.correctAnswers}</span>
                      <span>Attempts: {player.attempts}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-[#1E1A18]">
                        Collected: {player.cardsCollected}{' '}
                        {player.cardsCollected === 1 ? 'card' : 'cards'}
                      </span>
                      <span>Hits: {player.correctAnswers}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Card Table & Question Area */}
      <section
        aria-label="Card table and question controls"
        className="rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] p-4 sm:p-6"
      >
        <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
          {/* Deck Pile Info */}
          <div className="flex items-center gap-4 lg:col-span-4">
            <div
              aria-label={`Face-down deck with ${view.drawPileCount} cards remaining`}
              className="flex h-28 w-20 shrink-0 flex-col items-center justify-center rounded-md border-2 border-[#7C2D36]/70 bg-[#7C2D36] p-2 text-center text-[#FAF7F2] shadow-sm sm:h-32 sm:w-22"
            >
              <span className="font-serif text-xs font-semibold tracking-wider uppercase">
                Deck
              </span>
              <span className="mt-1 font-mono text-2xl font-bold tabular-nums">
                {view.drawPileCount}
              </span>
              <span className="mt-0.5 text-[10px] opacity-90">cards left</span>
            </div>

            <div className="min-w-0 text-xs leading-relaxed text-[#4A413B] sm:text-sm">
              <p className="font-serif text-base font-semibold text-[#1E1A18]">
                {view.asker.name} holds the deck
              </p>
              <p className="mt-1 tabular-nums">
                Revealed so far: {view.knownRevealedCount} cards · Ace ={' '}
                {view.rules.aceRanking === 'ace-high' ? '14 (Highest)' : '1 (Lowest)'}
              </p>
              {isFourQuestions ? (
                <p className="mt-1">
                  Active Progress: Question {view.currentQuestion} of 4
                </p>
              ) : (
                <p className="mt-1">
                  Correct answers restart at Question 1; misses pass the deck.
                </p>
              )}
            </div>
          </div>

          {/* Card Sequence / Revealed Card Stage */}
          <div className="lg:col-span-8">
            {isFourQuestions ? (
              <div>
                <p className="mb-2.5 text-xs font-semibold tracking-wider text-[#6B6059] uppercase">
                  Four Questions Sequence
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {([1, 2, 3, 4] as const).map((qNum) => {
                    const card = view.sequenceCards[qNum - 1];
                    const isActiveSlot =
                      isPlaying &&
                      !view.pendingRevealAdvance &&
                      view.currentQuestion === qNum;

                    return (
                      <div
                        key={`q-slot-${qNum}`}
                        className={`flex flex-col items-center rounded-md border p-2.5 text-center transition-transform duration-200 ${
                          isActiveSlot
                            ? 'border-[#7C2D36] bg-[#FAF7F2] ring-1 ring-[#7C2D36]'
                            : 'border-[#DDD4C7] bg-[#FAF7F2]/75'
                        }`}
                      >
                        <span
                          className={`mb-2 text-[11px] font-semibold ${
                            isActiveSlot ? 'text-[#7C2D36]' : 'text-[#524943]'
                          }`}
                        >
                          {QUESTION_SHORT_LABELS[qNum]}
                        </span>

                        {card ? (
                          <div
                            className={
                              view.rules.animationsEnabled
                                ? 'transition-transform duration-200'
                                : ''
                            }
                          >
                            <GameCardTile
                              card={card}
                              texture={cardTexture}
                              size="md"
                              highlight={
                                view.lastOutcome?.revealedCard.id === card.id
                              }
                            />
                          </div>
                        ) : (
                          <div
                            aria-label={`Question ${qNum} unrevealed slot`}
                            className={`flex h-26 w-[4.5rem] items-center justify-center rounded-md border border-dashed text-xs font-medium sm:h-28 sm:w-20 ${
                              isActiveSlot
                                ? 'border-[#7C2D36] bg-[#F4EFE7] text-[#7C2D36]'
                                : 'border-[#C6B8A6] bg-[#EFE8DC]/60 text-[#6B6059]'
                            }`}
                          >
                            {isActiveSlot ? 'Next' : `Q${qNum}`}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 rounded-md border border-[#DDD4C7] bg-[#FAF7F2] p-4 sm:flex-row sm:justify-between">
                <div className="flex items-center gap-4">
                  {view.lastOutcome ? (
                    <GameCardTile
                      card={view.lastOutcome.revealedCard}
                      texture={cardTexture}
                      size="lg"
                      highlight={true}
                    />
                  ) : (
                    <div className="flex h-28 w-20 items-center justify-center rounded-md border border-dashed border-[#C6B8A6] bg-[#EFE8DC]/60 text-center text-xs text-[#6B6059] sm:h-32 sm:w-22">
                      First Card
                    </div>
                  )}

                  <div className="text-left">
                    <p className="font-mono text-xs font-semibold tracking-wider text-[#6B6059] uppercase">
                      Latest Card Reveal
                    </p>
                    {view.lastOutcome ? (
                      <>
                        <p className="mt-1 font-serif text-lg font-semibold text-[#1E1A18]">
                          {formatCardLabel(view.lastOutcome.revealedCard)}
                        </p>
                        <p className="mt-0.5 text-xs text-[#524943]">
                          Guessed {view.lastOutcome.predictionLabel} · Awarded to{' '}
                          <strong className="text-[#1E1A18]">
                            {view.lastOutcome.awardedToPlayerName}
                          </strong>
                        </p>
                      </>
                    ) : (
                      <p className="mt-1 text-sm text-[#524943]">
                        Waiting for {view.answerer.name}’s first Red or Black prediction.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Last Outcome Feedback Banner */}
        {view.lastOutcome && (
          <div
            role="status"
            aria-live="polite"
            className={`mt-5 flex items-start gap-2.5 rounded-md border p-3.5 text-sm ${
              view.lastOutcome.correct
                ? 'border-[#86B89A] bg-[#ECF5EF] text-[#184E34]'
                : 'border-[#D4A1A3] bg-[#FBF1F1] text-[#7C2D36]'
            }`}
          >
            {view.lastOutcome.correct ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            <p className="font-medium">{view.lastOutcome.summary}</p>
          </div>
        )}

        {errorMessage && (
          <p
            role="alert"
            className="mt-4 rounded-md border border-[#C98B8D] bg-[#FBF2F2] px-3.5 py-2.5 text-xs font-medium text-[#7C2D36]"
          >
            {errorMessage}
          </p>
        )}

        {/* Active Prediction Controls or Bot / Continue State */}
        {isPlaying && (
          <div className="mt-6 border-t border-[#DDD4C7] pt-5">
            {view.pendingRevealAdvance ? (
              <div className="flex flex-col items-start justify-between gap-3 rounded-md border border-[#C6B8A6] bg-[#FAF7F2] p-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-serif text-base font-semibold text-[#1E1A18]">
                    Turn Complete — Ready to Pass
                  </p>
                  <p className="mt-0.5 text-xs text-[#524943]">
                    {view.variant === 'card-collection'
                      ? `${view.asker.name} collected the card and the deck passes to the next player.`
                      : 'The attempt ended. Continue so the next player can take their turn.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onContinueTurn}
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md bg-[#7C2D36] px-5 py-2.5 text-sm font-medium text-[#FAF7F2] transition-colors hover:bg-[#64222A] sm:w-auto"
                >
                  <span>Continue to Next Turn</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ) : isHumanTurn ? (
              <div>
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-serif text-lg font-semibold text-[#1E1A18] sm:text-xl">
                    {QUESTION_TITLES[view.currentQuestion]}
                  </h3>
                  <p className="text-xs text-[#524943]">
                    {view.asker.name} asks {view.answerer.name}
                  </p>
                </div>

                {view.currentQuestion === 1 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        onSubmitPrediction(view.answerer.id, {
                          question: 1,
                          choice: 'red',
                        })
                      }
                      className="flex min-h-[56px] items-center justify-center gap-2.5 rounded-md border-2 border-[#9B1C2E] bg-[#FFFDF9] px-5 py-3 text-base font-semibold text-[#9B1C2E] transition-colors hover:bg-[#FBF1F1]"
                    >
                      <span aria-hidden="true">♥ ♦</span>
                      <span>Red</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onSubmitPrediction(view.answerer.id, {
                          question: 1,
                          choice: 'black',
                        })
                      }
                      className="flex min-h-[56px] items-center justify-center gap-2.5 rounded-md border-2 border-[#1E1A18] bg-[#FFFDF9] px-5 py-3 text-base font-semibold text-[#1E1A18] transition-colors hover:bg-[#EFE8DC]"
                    >
                      <span aria-hidden="true">♠ ♣</span>
                      <span>Black</span>
                    </button>
                  </div>
                )}

                {view.currentQuestion === 2 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        onSubmitPrediction(view.answerer.id, {
                          question: 2,
                          choice: 'higher',
                        })
                      }
                      className="flex min-h-[56px] items-center justify-center gap-2 rounded-md border-2 border-[#7C2D36] bg-[#FAF7F2] px-5 py-3 text-base font-semibold text-[#1E1A18] transition-colors hover:bg-[#EFE8DC]"
                    >
                      <span>Higher than {card1 ? formatCardLabel(card1) : 'First Card'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onSubmitPrediction(view.answerer.id, {
                          question: 2,
                          choice: 'lower',
                        })
                      }
                      className="flex min-h-[56px] items-center justify-center gap-2 rounded-md border-2 border-[#7C2D36] bg-[#FAF7F2] px-5 py-3 text-base font-semibold text-[#1E1A18] transition-colors hover:bg-[#EFE8DC]"
                    >
                      <span>Lower than {card1 ? formatCardLabel(card1) : 'First Card'}</span>
                    </button>
                  </div>
                )}

                {view.currentQuestion === 3 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        onSubmitPrediction(view.answerer.id, {
                          question: 3,
                          choice: 'inside',
                        })
                      }
                      className="flex min-h-[56px] items-center justify-center gap-2 rounded-md border-2 border-[#7C2D36] bg-[#FAF7F2] px-5 py-3 text-base font-semibold text-[#1E1A18] transition-colors hover:bg-[#EFE8DC]"
                    >
                      <span>
                        Inside ({lowBoundaryLabel} – {highBoundaryLabel})
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onSubmitPrediction(view.answerer.id, {
                          question: 3,
                          choice: 'outside',
                        })
                      }
                      className="flex min-h-[56px] items-center justify-center gap-2 rounded-md border-2 border-[#7C2D36] bg-[#FAF7F2] px-5 py-3 text-base font-semibold text-[#1E1A18] transition-colors hover:bg-[#EFE8DC]"
                    >
                      <span>
                        Outside ({lowBoundaryLabel} &amp; {highBoundaryLabel})
                      </span>
                    </button>
                  </div>
                )}

                {view.currentQuestion === 4 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {STANDARD_SUITS.map((suit) => {
                      const isRed = suit === 'hearts' || suit === 'diamonds';
                      return (
                        <button
                          key={`guess-suit-${suit}`}
                          type="button"
                          onClick={() =>
                            onSubmitPrediction(view.answerer.id, {
                              question: 4,
                              choice: suit,
                            })
                          }
                          className={`flex min-h-[56px] items-center justify-center gap-2 rounded-md border-2 bg-[#FFFDF9] px-4 py-3 text-base font-semibold transition-colors ${
                            isRed
                              ? 'border-[#9B1C2E] text-[#9B1C2E] hover:bg-[#FBF1F1]'
                              : 'border-[#1E1A18] text-[#1E1A18] hover:bg-[#EFE8DC]'
                          }`}
                        >
                          <span aria-hidden="true">{SUIT_SYMBOLS[suit]}</span>
                          <span>{SUIT_NAMES[suit]}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-md border border-[#DDD4C7] bg-[#FAF7F2] p-4 text-sm text-[#4A413B]">
                <Bot className="h-5 w-5 shrink-0 text-[#6E4411]" aria-hidden="true" />
                <p>
                  <strong className="font-semibold text-[#1E1A18]">
                    {view.answerer.name}
                  </strong>{' '}
                  ({BOT_DIFFICULTY_LABELS[view.answerer.difficulty ?? 'normal']} Bot) is answering{' '}
                  {QUESTION_TITLES[view.currentQuestion]}
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Recent Activity Log */}
      {view.outcomeHistory.length > 0 && (
        <section
          aria-label="Recent card reveals"
          className="rounded-lg border border-[#DDD4C7] bg-[#FAF7F2] p-4 sm:p-5"
        >
          <h3 className="font-sans text-xs font-semibold tracking-wider text-[#6B6059] uppercase">
            Recent Card Reveals
          </h3>
          <ul className="mt-2.5 divide-y divide-[#E6DED2] text-xs text-[#4A413B] sm:text-sm">
            {view.outcomeHistory.slice(0, 6).map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2"
              >
                <span>
                  <span className="font-mono text-xs text-[#6B6059] tabular-nums">
                    Turn {item.turnNumber} · Q{item.questionNumber}:
                  </span>{' '}
                  {item.answererName} predicted{' '}
                  <strong className="text-[#1E1A18]">{item.predictionLabel}</strong> →{' '}
                  {formatCardLabel(item.revealedCard)}
                </span>
                <span
                  className={`font-semibold ${
                    item.correct ? 'text-[#184E34]' : 'text-[#7C2D36]'
                  }`}
                >
                  {item.correct
                    ? item.awardedToPlayerName
                      ? `Correct (+${item.awardedToPlayerName})`
                      : 'Correct'
                    : item.awardedToPlayerName
                      ? `Missed (+${item.awardedToPlayerName})`
                      : 'Missed'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
