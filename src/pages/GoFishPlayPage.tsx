import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DocumentHead } from '../components/seo/DocumentHead';
import { GoFishPassDeviceScreen } from '../games/goFish/components/GoFishPassDeviceScreen';
import { GoFishSetupPanel } from '../games/goFish/components/GoFishSetupPanel';
import { GoFishTable } from '../games/goFish/components/GoFishTable';
import {
  acknowledgeTurnEnd,
  confirmPassDevice,
  createGoFishGame,
  executeBotTurnStep,
  getPublicGoFishView,
  resolveRequest,
  type GoFishGameState,
  type GoFishSetupConfig,
} from '../games/goFish/engine/gameEngine';
import type { CardRank, CardTexture } from '../types/playingCard';
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

export function GoFishPlayPage() {
  const [setupConfig, setSetupConfig] = useState<GoFishSetupConfig | null>(
    null
  );
  const [gameState, setGameState] = useState<GoFishGameState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cardTexture, setCardTexture] = useState<CardTexture>(
    loadInitialCardTexture
  );

  const handleCardTextureChange = (texture: CardTexture) => {
    setCardTexture(texture);
    try {
      window.localStorage.setItem(TEXTURE_STORAGE_KEY, texture);
    } catch {
      // Ignore storage errors
    }
  };

  const playOutcomeAudio = (nextState: GoFishGameState) => {
    if (!nextState.rules.soundEnabled) return;
    if (nextState.status === 'GAME_OVER') {
      playGameTone('victory', true);
      return;
    }
    if (nextState.lastOutcome) {
      const positive =
        nextState.lastOutcome.kind === 'transferred' ||
        nextState.lastOutcome.kind === 'go-fish-match';
      playGameTone(positive ? 'correct' : 'reveal', true);
    }
  };

  const handleStartGame = (config: GoFishSetupConfig) => {
    setSetupConfig(config);
    setGameState(createGoFishGame(config));
    setErrorMessage(null);
  };

  const handlePlayAgain = () => {
    if (!setupConfig) return;
    setGameState(createGoFishGame(setupConfig));
    setErrorMessage(null);
  };

  const handleNewGame = () => {
    setGameState(null);
    setErrorMessage(null);
  };

  const handleSubmitRequest = (
    playerId: string,
    opponentId: string,
    rank: CardRank
  ) => {
    if (!gameState) return;
    const result = resolveRequest(gameState, playerId, opponentId, rank);
    setGameState(result.state);
    setErrorMessage(result.ok ? null : result.error ?? null);
    if (result.ok) {
      playOutcomeAudio(result.state);
    }
  };

  const handleAcknowledgeTurnEnd = () => {
    if (!gameState) return;
    const result = acknowledgeTurnEnd(gameState);
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

  // Drive automated Bot turns with configurable thinking delay
  useEffect(() => {
    if (!gameState || gameState.status !== 'PLAYING') return;
    if (gameState.awaitingPassConfirmation || gameState.pendingTurnAdvance) {
      return;
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.type !== 'bot' || gameState.phase !== 'bot-thinking') {
      return;
    }

    const timerId = window.setTimeout(() => {
      setGameState((prev) => {
        if (
          !prev ||
          prev.status !== 'PLAYING' ||
          prev.awaitingPassConfirmation ||
          prev.pendingTurnAdvance ||
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
    }, gameState.rules.botThinkingDelayMs);

    return () => window.clearTimeout(timerId);
  }, [gameState]);

  const view = gameState ? getPublicGoFishView(gameState) : null;

  return (
    <>
      <DocumentHead
        title="Play Go Fish – Interactive Card Game | Our Childhood"
        description="Play Go Fish with 2–4 human or bot players, Easy/Normal/Hard AI, Pass and Play privacy, automatic four-card book collection, and mobile-friendly controls."
      />

      <section className="border-b border-[#DDD4C7] bg-[#F4EFE7]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/games/go-fish"
              className="inline-flex min-h-[40px] items-center gap-2 text-sm font-medium text-[#524943] hover:text-[#7C2D36]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Go Fish Rules</span>
            </Link>
            <span className="hidden text-[#C6B8A6] sm:inline" aria-hidden="true">
              /
            </span>
            <h1 className="font-serif text-xl font-semibold text-[#1E1A18] sm:text-2xl">
              Play Go Fish
            </h1>
          </div>

          <Link
            to="/games/go-fish#how-to-play"
            className="inline-flex min-h-[40px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-4 py-2 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC] sm:text-sm"
          >
            Read Full Rules
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl overflow-x-hidden px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
        {!gameState || !view ? (
          <GoFishSetupPanel
            initialConfig={setupConfig ?? undefined}
            cardTexture={cardTexture}
            onChangeCardTexture={handleCardTextureChange}
            onStartGame={handleStartGame}
          />
        ) : view.awaitingPassConfirmation ? (
          <GoFishPassDeviceScreen
            view={view}
            onConfirmReady={() => {
              const result = confirmPassDevice(gameState);
              setGameState(result.state);
              setErrorMessage(null);
            }}
          />
        ) : (
          <GoFishTable
            view={view}
            cardTexture={cardTexture}
            errorMessage={errorMessage}
            onChangeCardTexture={handleCardTextureChange}
            onToggleSound={handleToggleSound}
            onSubmitRequest={handleSubmitRequest}
            onAcknowledgeTurnEnd={handleAcknowledgeTurnEnd}
            onPlayAgain={handlePlayAgain}
            onNewGame={handleNewGame}
          />
        )}
      </section>
    </>
  );
}
