import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DocumentHead } from '../components/seo/DocumentHead';
import { PassDeviceScreen } from '../games/sevens/components/PassDeviceScreen';
import { SevensSetupPanel } from '../games/sevens/components/SevensSetupPanel';
import { SevensTable } from '../games/sevens/components/SevensTable';
import { applyBotAction, chooseBotNextAction } from '../games/sevens/engine/bot';
import {
  addCardsToSet,
  confirmPassDevice,
  createGame,
  discardCard,
  drawCard,
  getPublicTableView,
  playNewSet,
  replaceJokerInSet,
} from '../games/sevens/engine/gameEngine';
import type { GameSetupConfig, GameState } from '../games/sevens/engine/types';

export function SevensPlayPage() {
  const [setupConfig, setSetupConfig] = useState<GameSetupConfig | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStartGame = (config: GameSetupConfig) => {
    setSetupConfig(config);
    setGameState(createGame(config));
    setErrorMessage(null);
  };

  const handlePlayAgain = () => {
    if (!setupConfig) return;
    setGameState(createGame(setupConfig));
    setErrorMessage(null);
  };

  const handleResetToSetup = () => {
    setGameState(null);
    setErrorMessage(null);
  };

  // Automatic stepped bot turns with deterministic engine validation
  useEffect(() => {
    if (!gameState || gameState.status !== 'PLAYING') return;
    if (gameState.awaitingPassConfirmation) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.type !== 'bot') return;

    const timerId = window.setTimeout(() => {
      setGameState((prev) => {
        if (!prev || prev.status !== 'PLAYING') return prev;
        if (prev.players[prev.currentPlayerIndex].type !== 'bot') return prev;
        const action = chooseBotNextAction(prev);
        if (!action) return prev;
        return applyBotAction(prev, action);
      });
    }, 900);

    return () => window.clearTimeout(timerId);
  }, [gameState]);

  const tableView = gameState ? getPublicTableView(gameState) : null;

  return (
    <>
      <DocumentHead
        title="Play Sevens – Interactive Card Game | Our Childhood"
        description="Play the classic Sevens card game online against rule-based bots or Pass and Play with friends using a 54-card deck and configurable house rules."
      />

      <section className="border-b border-[#DDD4C7] bg-[#F4EFE7]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/games/sevens"
              className="inline-flex min-h-[40px] items-center gap-2 text-sm font-medium text-[#524943] hover:text-[#7C2D36]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Sevens Rules</span>
            </Link>
            <span className="hidden text-[#C6B8A6] sm:inline" aria-hidden="true">
              /
            </span>
            <h1 className="font-serif text-xl font-semibold text-[#1E1A18] sm:text-2xl">
              Play Sevens
            </h1>
          </div>

          <Link
            to="/games/sevens/learn"
            className="inline-flex min-h-[40px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-4 py-2 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC] sm:text-sm"
          >
            Learn to Play
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl overflow-x-hidden px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {!gameState || !tableView ? (
          <SevensSetupPanel
            initialConfig={setupConfig ?? undefined}
            onStartGame={handleStartGame}
          />
        ) : tableView.awaitingPassConfirmation ? (
          <PassDeviceScreen
            view={tableView}
            onConfirmReady={() => {
              const result = confirmPassDevice(gameState);
              setGameState(result.state);
              setErrorMessage(null);
            }}
          />
        ) : (
          <SevensTable
            view={tableView}
            errorMessage={errorMessage}
            onClearError={() => setErrorMessage(null)}
            allowDiscardPickupTop={gameState.rules.allowDiscardPickupTop}
            onDraw={(source) => {
              const result = drawCard(gameState, source);
              setGameState(result.state);
              setErrorMessage(result.ok ? null : result.error ?? null);
            }}
            onPlayNewSet={(cardIds) => {
              const result = playNewSet(gameState, cardIds);
              setGameState(result.state);
              setErrorMessage(result.ok ? null : result.error ?? null);
            }}
            onAddToSet={(setId, cardIds) => {
              const result = addCardsToSet(gameState, setId, cardIds);
              setGameState(result.state);
              setErrorMessage(result.ok ? null : result.error ?? null);
            }}
            onReplaceJoker={(setId, cardId) => {
              const result = replaceJokerInSet(gameState, setId, cardId);
              setGameState(result.state);
              setErrorMessage(result.ok ? null : result.error ?? null);
            }}
            onDiscard={(cardId) => {
              const result = discardCard(gameState, cardId);
              setGameState(result.state);
              setErrorMessage(result.ok ? null : result.error ?? null);
            }}
            onPlayAgain={handlePlayAgain}
            onChangeSetup={handleResetToSetup}
          />
        )}
      </section>
    </>
  );
}
