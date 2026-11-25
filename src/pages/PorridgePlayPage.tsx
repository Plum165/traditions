import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DocumentHead } from '../components/seo/DocumentHead';
import { PorridgePassDeviceScreen } from '../games/porridge/components/PorridgePassDeviceScreen';
import { PorridgeSetupPanel } from '../games/porridge/components/PorridgeSetupPanel';
import { PorridgeTable } from '../games/porridge/components/PorridgeTable';
import {
  advanceTurn,
  cancelSelection,
  chooseBotCardPosition,
  confirmBotSelection,
  confirmPassDevice,
  confirmSelection,
  createPorridgeGame,
  getPublicPorridgeView,
  selectCard,
} from '../games/porridge/engine/gameEngine';
import type {
  PorridgeGameState,
  PorridgeSetupConfig,
} from '../games/porridge/engine/types';
import type { CardTexture } from '../types/playingCard';

const TEXTURE_STORAGE_KEY = 'our-childhood:sevens-card-texture';

function loadInitialCardTexture(): CardTexture {
  try {
    const stored = window.localStorage.getItem(TEXTURE_STORAGE_KEY);
    if (stored === 'classic' || stored === 'archival') {
      return stored;
    }
  } catch {
    // Ignore storage errors in restricted iframes
  }
  return 'archival';
}

export function PorridgePlayPage() {
  const [setupConfig, setSetupConfig] = useState<PorridgeSetupConfig | null>(null);
  const [gameState, setGameState] = useState<PorridgeGameState | null>(null);
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

  const handleStartGame = (config: PorridgeSetupConfig) => {
    setSetupConfig(config);
    setGameState(createPorridgeGame(config));
    setErrorMessage(null);
  };

  const handlePlayAgain = () => {
    if (!setupConfig) return;
    setGameState(createPorridgeGame(setupConfig));
    setErrorMessage(null);
  };

  const handleResetToSetup = () => {
    setGameState(null);
    setErrorMessage(null);
  };

  // Two-step bot highlight -> reveal, plus automatic post-reveal turn transition
  useEffect(() => {
    if (!gameState || gameState.status !== 'PLAYING') return;
    if (gameState.awaitingPassConfirmation) return;

    if (gameState.pendingTurnAdvance) {
      const delayMs = gameState.phase === 'collecting-pile' ? 1500 : 1100;
      const timerId = window.setTimeout(() => {
        setGameState((prev) => {
          if (!prev || prev.status !== 'PLAYING' || !prev.pendingTurnAdvance) {
            return prev;
          }
          return advanceTurn(prev).state;
        });
      }, delayMs);

      return () => window.clearTimeout(timerId);
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.type !== 'bot' || gameState.phase !== 'bot-thinking') {
      return;
    }

    if (!gameState.selectedPositionId) {
      const pickTimer = window.setTimeout(() => {
        setGameState((prev) => {
          if (
            !prev ||
            prev.status !== 'PLAYING' ||
            prev.phase !== 'bot-thinking' ||
            prev.selectedPositionId
          ) {
            return prev;
          }
          return chooseBotCardPosition(prev).state;
        });
      }, 550);

      return () => window.clearTimeout(pickTimer);
    }

    const revealTimer = window.setTimeout(() => {
      setGameState((prev) => {
        if (
          !prev ||
          prev.status !== 'PLAYING' ||
          prev.phase !== 'bot-thinking' ||
          !prev.selectedPositionId
        ) {
          return prev;
        }
        return confirmBotSelection(prev).state;
      });
    }, 700);

    return () => window.clearTimeout(revealTimer);
  }, [gameState]);

  const view = gameState ? getPublicPorridgeView(gameState) : null;

  return (
    <>
      <DocumentHead
        title="Play Porridge (Sekaku) – Interactive Card Game | Our Childhood"
        description="Play Porridge (Sekaku) online with Same-Suit or Highest-Colour rules, bot opponents, Pass and Play privacy, and custom player turn order."
      />

      <section className="border-b border-[#DDD4C7] bg-[#F4EFE7]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/games/porridge"
              className="inline-flex min-h-[40px] items-center gap-2 text-sm font-medium text-[#524943] hover:text-[#7C2D36]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Porridge Rules</span>
            </Link>
            <span className="hidden text-[#C6B8A6] sm:inline" aria-hidden="true">
              /
            </span>
            <h1 className="font-serif text-xl font-semibold text-[#1E1A18] sm:text-2xl">
              Play Porridge (Sekaku)
            </h1>
          </div>

          <Link
            to="/games/porridge#same-suit-porridge"
            className="inline-flex min-h-[40px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-4 py-2 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC] sm:text-sm"
          >
            Read Full Rules
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl overflow-x-hidden px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
        {!gameState || !view ? (
          <PorridgeSetupPanel
            initialConfig={setupConfig ?? undefined}
            cardTexture={cardTexture}
            onChangeCardTexture={handleCardTextureChange}
            onStartGame={handleStartGame}
          />
        ) : view.awaitingPassConfirmation ? (
          <PorridgePassDeviceScreen
            view={view}
            onConfirmReady={() => {
              const result = confirmPassDevice(gameState);
              setGameState(result.state);
              setErrorMessage(null);
            }}
          />
        ) : (
          <PorridgeTable
            view={view}
            errorMessage={errorMessage}
            cardTexture={cardTexture}
            onChangeCardTexture={handleCardTextureChange}
            onSelectCard={(positionId, playerId) => {
              const result = selectCard(gameState, positionId, playerId);
              setGameState(result.state);
              setErrorMessage(result.ok ? null : result.error ?? null);
            }}
            onConfirmSelection={() => {
              const result = confirmSelection(gameState);
              setGameState(result.state);
              setErrorMessage(result.ok ? null : result.error ?? null);
            }}
            onCancelSelection={() => {
              const result = cancelSelection(gameState);
              setGameState(result.state);
              setErrorMessage(result.ok ? null : result.error ?? null);
            }}
            onContinueTurn={() => {
              const result = advanceTurn(gameState);
              setGameState(result.state);
              setErrorMessage(result.ok ? null : result.error ?? null);
            }}
            onPlayAgain={handlePlayAgain}
            onNewGame={handleResetToSetup}
          />
        )}
      </section>
    </>
  );
}
