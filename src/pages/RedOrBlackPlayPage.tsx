import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DocumentHead } from '../components/seo/DocumentHead';
import { RedOrBlackPassDeviceScreen } from '../games/redOrBlack/components/RedOrBlackPassDeviceScreen';
import { RedOrBlackSetupPanel } from '../games/redOrBlack/components/RedOrBlackSetupPanel';
import { RedOrBlackTable } from '../games/redOrBlack/components/RedOrBlackTable';
import {
  advanceAfterReveal,
  confirmPassDevice,
  createRedOrBlackGame,
  executeBotTurnStep,
  getPublicRedOrBlackView,
  submitPrediction,
} from '../games/redOrBlack/engine/gameEngine';
import type {
  RedOrBlackGameState,
  RedOrBlackPrediction,
  RedOrBlackSetupConfig,
} from '../games/redOrBlack/engine/types';
import type { CardTexture } from '../types/playingCard';
import { playGameTone } from '../utils/gameAudio';

const TEXTURE_STORAGE_KEY = 'our-childhood:sevens-card-texture';

function loadInitialCardTexture(): CardTexture {
  try {
    const stored = window.localStorage.getItem(TEXTURE_STORAGE_KEY);
    if (stored === 'classic' || stored === 'archival') {
      return stored;
    }
  } catch {
    // Ignore storage errors
  }
  return 'archival';
}

export function RedOrBlackPlayPage() {
  const [setupConfig, setSetupConfig] = useState<RedOrBlackSetupConfig | null>(null);
  const [gameState, setGameState] = useState<RedOrBlackGameState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cardTexture, setCardTexture] = useState<CardTexture>(loadInitialCardTexture);

  const handleCardTextureChange = (texture: CardTexture) => {
    setCardTexture(texture);
    try {
      window.localStorage.setItem(TEXTURE_STORAGE_KEY, texture);
    } catch {
      // Ignore storage errors
    }
  };

  const playOutcomeAudio = (nextState: RedOrBlackGameState) => {
    if (!nextState.rules.soundEnabled) return;
    if (nextState.status === 'GAME_OVER') {
      playGameTone('victory', true);
      return;
    }
    if (nextState.lastOutcome) {
      playGameTone(nextState.lastOutcome.correct ? 'correct' : 'wrong', true);
    }
  };

  const handleStartGame = (config: RedOrBlackSetupConfig) => {
    setSetupConfig(config);
    setGameState(createRedOrBlackGame(config));
    setErrorMessage(null);
  };

  const handlePlayAgain = () => {
    if (!setupConfig) return;
    setGameState(createRedOrBlackGame(setupConfig));
    setErrorMessage(null);
  };

  const handleNewGame = () => {
    setGameState(null);
    setErrorMessage(null);
  };

  const handleSubmitPrediction = (
    playerId: string,
    prediction: RedOrBlackPrediction
  ) => {
    if (!gameState) return;
    const result = submitPrediction(gameState, playerId, prediction);
    setGameState(result.state);
    setErrorMessage(result.ok ? null : result.error ?? null);
    if (result.ok) {
      playOutcomeAudio(result.state);
    }
  };

  const handleContinueTurn = () => {
    if (!gameState) return;
    const result = advanceAfterReveal(gameState);
    setGameState(result.state);
    setErrorMessage(result.ok ? null : result.error ?? null);
  };

  const handleToggleSound = () => {
    if (!gameState) return;
    setGameState((prev) =>
      prev
        ? {
            ...prev,
            rules: { ...prev.rules, soundEnabled: !prev.rules.soundEnabled },
          }
        : prev
    );
  };

  // Drive automated Bot turns & auto-advance after Bot misses (never skipping human-to-human review pause)
  useEffect(() => {
    if (!gameState || gameState.status !== 'PLAYING') return;
    if (gameState.awaitingPassConfirmation) return;

    const currentAnswerer = gameState.players[gameState.answererIndex];
    const delayMs = gameState.rules.botThinkingDelayMs;

    if (gameState.pendingRevealAdvance) {
      // If a Bot just missed, or if only 1 human is playing, advance automatically after a short beat
      // so the player can read the revealed card without stalling. In Pass-and-Play with 2+ humans,
      // wait for the human to tap Continue before hiding the board behind the Pass-and-Play screen.
      const humanCount = gameState.players.filter((p) => p.type === 'human').length;
      const shouldAutoAdvance = currentAnswerer.type === 'bot' || humanCount < 2;

      if (!shouldAutoAdvance) {
        return;
      }

      const timerId = window.setTimeout(() => {
        setGameState((prev) => {
          if (!prev || prev.status !== 'PLAYING' || !prev.pendingRevealAdvance) {
            return prev;
          }
          return advanceAfterReveal(prev).state;
        });
      }, delayMs + 250);

      return () => window.clearTimeout(timerId);
    }

    if (currentAnswerer.type !== 'bot' || gameState.phase !== 'bot-thinking') {
      return;
    }

    const botTimer = window.setTimeout(() => {
      setGameState((prev) => {
        if (
          !prev ||
          prev.status !== 'PLAYING' ||
          prev.awaitingPassConfirmation ||
          prev.pendingRevealAdvance ||
          prev.phase !== 'bot-thinking'
        ) {
          return prev;
        }
        const res = executeBotTurnStep(prev);
        if (res.ok) {
          playOutcomeAudio(res.state);
        }
        return res.state;
      });
    }, delayMs);

    return () => window.clearTimeout(botTimer);
  }, [gameState]);

  const view = gameState ? getPublicRedOrBlackView(gameState) : null;

  return (
    <>
      <DocumentHead
        title="Play Red or Black (The Four Questions) – Interactive Card Game | Our Childhood"
        description="Play Red or Black (The Four Questions) with 2–4 human or bot players, Easy/Normal/Hard AI, Pass and Play privacy, and both documented game variants."
      />

      <section className="border-b border-[#DDD4C7] bg-[#F4EFE7]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/games/red-or-black"
              className="inline-flex min-h-[40px] items-center gap-2 text-sm font-medium text-[#524943] hover:text-[#7C2D36]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Red or Black Rules</span>
            </Link>
            <span className="hidden text-[#C6B8A6] sm:inline" aria-hidden="true">
              /
            </span>
            <h1 className="font-serif text-xl font-semibold text-[#1E1A18] sm:text-2xl">
              Play Red or Black
            </h1>
          </div>

          <Link
            to="/games/red-or-black#the-four-questions"
            className="inline-flex min-h-[40px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-4 py-2 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC] sm:text-sm"
          >
            Read Full Rules
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl overflow-x-hidden px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
        {!gameState || !view ? (
          <RedOrBlackSetupPanel
            initialConfig={setupConfig ?? undefined}
            cardTexture={cardTexture}
            onChangeCardTexture={handleCardTextureChange}
            onStartGame={handleStartGame}
          />
        ) : view.awaitingPassConfirmation ? (
          <RedOrBlackPassDeviceScreen
            view={view}
            onConfirmReady={() => {
              const result = confirmPassDevice(gameState);
              setGameState(result.state);
              setErrorMessage(null);
            }}
          />
        ) : (
          <RedOrBlackTable
            view={view}
            cardTexture={cardTexture}
            errorMessage={errorMessage}
            onChangeCardTexture={handleCardTextureChange}
            onToggleSound={handleToggleSound}
            onSubmitPrediction={handleSubmitPrediction}
            onContinueTurn={handleContinueTurn}
            onPlayAgain={handlePlayAgain}
            onNewGame={handleNewGame}
          />
        )}
      </section>
    </>
  );
}
