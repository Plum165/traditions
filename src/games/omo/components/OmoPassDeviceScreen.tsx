import { SharedPassDeviceScreen } from '../../../components/games/SharedPassDeviceScreen';
import type { OmoPublicView } from '../engine/types';

interface OmoPassDeviceScreenProps {
  view: OmoPublicView;
  onConfirmReady: () => void;
}

export function OmoPassDeviceScreen({
  view,
  onConfirmReady,
}: OmoPassDeviceScreenProps) {
  const scoreboardLine = view.players
    .map((p) => `${p.name}: ${p.score} pts`)
    .join(' · ');

  const contextLines = [
    `Board: ${view.rows} × ${view.cols} (${view.emptyCellsRemaining} empty ${
      view.emptyCellsRemaining === 1 ? 'cell' : 'cells'
    } remaining)`,
    `Scores: ${scoreboardLine}`,
  ];

  if (view.lastPlacement) {
    contextLines.unshift(
      `Last move: ${view.lastPlacement.playerName} placed ${view.lastPlacement.letter} at Row ${
        view.lastPlacement.row + 1
      }, Col ${view.lastPlacement.col + 1}.`
    );
  }

  return (
    <SharedPassDeviceScreen
      headingId="omo-pass-device-heading"
      nextPlayerName={view.activePlayer.name}
      previousPlayerName={view.previousPlayerName}
      turnNumber={view.moveNumber + 1}
      eyebrow={`Move ${view.moveNumber + 1} · Handover Turn`}
      privacyNote={`${
        view.previousPlayerName
          ? `${view.previousPlayerName}'s turn has ended.`
          : 'Previous turn ended.'
      } Pass the device to ${view.activePlayer.name} and tap Ready when you are set to place O or M.`}
      contextLines={contextLines}
      onConfirmReady={onConfirmReady}
    />
  );
}
