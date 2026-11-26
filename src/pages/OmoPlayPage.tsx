import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DocumentHead } from '../components/seo/DocumentHead';
import { OmoPassDeviceScreen } from '../games/omo/components/OmoPassDeviceScreen';
import { OmoSetupPanel } from '../games/omo/components/OmoSetupPanel';
import { OmoTable } from '../games/omo/components/OmoTable';
import {
  confirmPassDevice,
  createOmoGame,
  executeBotTurn,
  getPublicOmoView,
  placeLetter,
  type OmoGameState,
  type OmoLetter,
  type OmoSetupConfig,
} from '../games/omo/engine/gameEngine';
import { playGameTone } from '../utils/gameAudio';

export function OmoPlayPage() {
  const [setupConfig, setSetupConfig] = useState<OmoSetupConfig | null>(null);
  const [gameState, setGameState] = useState<OmoGameState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const playOutcomeAudio = (nextState: OmoGameState) => {
    if (!nextState.rules.soundEnabled) return;
    if (nextState.status === 'GAME_OVER') {
      playGameTone('victory', true);
      return;
    }
    if (nextState.lastPlacement && nextState.lastPlacement.pointsEarned > 0) {
      playGameTone('correct', true);
      return;
    }
    playGameTone('reveal', true);
  };

  const handleStartGame = (config: OmoSetupConfig) => {
    setSetupConfig(config);
    setGameState(createOmoGame(config));
    setErrorMessage(null);
  };

  const handlePlayAgain = () => {
    if (!setupConfig) return;
    setGameState(createOmoGame(setupConfig));
    setErrorMessage(null);
  };

  const handleNewGame = () => {
    setGameState(null);
    setErrorMessage(null);
  };

  const handlePlaceLetter = (
    playerId: string,
    row: number,
    col: number,
    letter: OmoLetter
  ) => {
    if (!gameState) return;
    const result = placeLetter(gameState, playerId, row, col, letter);
    setGameState(result.state);
    setErrorMessage(result.ok ? null : result.error ?? null);
    if (result.ok) {
      playOutcomeAudio(result.state);
    }
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

  // Drive automated Bot turns (including consecutive bot bonus turns) without blocking UI
  useEffect(() => {
    if (!gameState || gameState.status !== 'PLAYING') return;
    if (gameState.awaitingPassConfirmation) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.type !== 'bot') return;

    const timerId = window.setTimeout(() => {
      setGameState((prev) => {
        if (
          !prev ||
          prev.status !== 'PLAYING' ||
          prev.awaitingPassConfirmation
        ) {
          return prev;
        }
        const active = prev.players[prev.currentPlayerIndex];
        if (!active || active.type !== 'bot') return prev;
        const result = executeBotTurn(prev);
        if (result.ok) {
          playOutcomeAudio(result.state);
        }
        return result.state;
      });
    }, gameState.rules.botThinkingDelayMs);

    return () => window.clearTimeout(timerId);
  }, [gameState]);

  const view = gameState ? getPublicOmoView(gameState) : null;

  return (
    <>
      <DocumentHead
        title="Play OMO – Interactive Grid Word Game | Our Childhood"
        description="Play OMO with configurable grid dimensions, Easy/Normal/Hard AI bots, Pass and Play privacy handovers, letter reuse, and bonus turns."
      />

      <section className="border-b border-[#DDD4C7] bg-[#F4EFE7]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/games/omo"
              className="inline-flex min-h-[40px] items-center gap-2 text-sm font-medium text-[#524943] hover:text-[#7C2D36]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to OMO Rules</span>
            </Link>
            <span className="hidden text-[#C6B8A6] sm:inline" aria-hidden="true">
              /
            </span>
            <h1 className="font-serif text-xl font-semibold text-[#1E1A18] sm:text-2xl">
              Play OMO
            </h1>
          </div>

          <Link
            to="/games/omo#letters-and-placement"
            className="inline-flex min-h-[40px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-4 py-2 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC] sm:text-sm"
          >
            Read Full Rules
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl overflow-x-hidden px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
        {!gameState || !view ? (
          <OmoSetupPanel
            initialConfig={setupConfig ?? undefined}
            onStartGame={handleStartGame}
          />
        ) : view.awaitingPassConfirmation ? (
          <OmoPassDeviceScreen
            view={view}
            onConfirmReady={() => {
              const result = confirmPassDevice(gameState);
              setGameState(result.state);
              setErrorMessage(null);
            }}
          />
        ) : (
          <OmoTable
            view={view}
            errorMessage={errorMessage}
            onPlaceLetter={handlePlaceLetter}
            onToggleSound={handleToggleSound}
            onPlayAgain={handlePlayAgain}
            onNewGame={handleNewGame}
          />
        )}
      </section>
    </>
  );
}
