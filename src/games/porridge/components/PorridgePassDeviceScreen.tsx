import { SharedPassDeviceScreen } from '../../../components/games/SharedPassDeviceScreen';
import type { PublicPorridgeView } from '../engine/types';

interface PorridgePassDeviceScreenProps {
  view: PublicPorridgeView;
  onConfirmReady: () => void;
}

export function PorridgePassDeviceScreen({
  view,
  onConfirmReady,
}: PorridgePassDeviceScreenProps) {
  return (
    <SharedPassDeviceScreen
      headingId="porridge-pass-heading"
      nextPlayerName={view.currentPlayer.name}
      previousPlayerName={view.previousPlayerName}
      turnNumber={view.turnNumber}
      eyebrow={`Turn ${view.turnNumber} · Board Hidden for Privacy`}
      privacyNote={`${
        view.previousPlayerName
          ? `Make sure ${view.previousPlayerName} has finished before continuing.`
          : 'Make sure the previous player has finished before continuing.'
      } The circle and card selection details remain hidden until ${view.currentPlayer.name} taps Ready.`}
      readyLabel={`Ready (${view.currentPlayer.name})`}
      onConfirmReady={onConfirmReady}
    />
  );
}
