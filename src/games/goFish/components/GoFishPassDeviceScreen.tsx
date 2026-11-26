import { SharedPassDeviceScreen } from '../../../components/games/SharedPassDeviceScreen';
import type { PublicGoFishView } from '../engine/types';

interface GoFishPassDeviceScreenProps {
  view: PublicGoFishView;
  onConfirmReady: () => void;
}

export function GoFishPassDeviceScreen({
  view,
  onConfirmReady,
}: GoFishPassDeviceScreenProps) {
  return (
    <SharedPassDeviceScreen
      headingId="go-fish-pass-heading"
      nextPlayerName={view.currentPlayer.name}
      previousPlayerName={view.previousHumanName}
      turnNumber={view.turnNumber}
      eyebrow={`Turn ${view.turnNumber} · Go Fish`}
      privacyNote={`Make sure ${
        view.previousHumanName ?? 'the previous player'
      } cannot see your cards. Your private hand remains hidden until ${
        view.currentPlayer.name
      } taps Ready.`}
      contextLines={[
        `Fish Pond Remaining: ${view.drawPileCount} ${
          view.drawPileCount === 1 ? 'card' : 'cards'
        }`,
        `Completed Books on Table: ${view.totalBooksCompleted} / 13`,
        `${view.currentPlayer.name}'s Hand: ${view.currentPlayer.handCount} ${
          view.currentPlayer.handCount === 1 ? 'card' : 'cards'
        }`,
      ]}
      readyLabel={`Ready (${view.currentPlayer.name})`}
      onConfirmReady={onConfirmReady}
    />
  );
}
