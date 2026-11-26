import { SharedPassDeviceScreen } from '../../../components/games/SharedPassDeviceScreen';
import type { PublicRedOrBlackView } from '../engine/types';

interface RedOrBlackPassDeviceScreenProps {
  view: PublicRedOrBlackView;
  onConfirmReady: () => void;
}

export function RedOrBlackPassDeviceScreen({
  view,
  onConfirmReady,
}: RedOrBlackPassDeviceScreenProps) {
  const variantLabel =
    view.variant === 'four-questions'
      ? 'Four Questions Challenge'
      : 'Card Collection House Rule';

  return (
    <SharedPassDeviceScreen
      headingId="red-or-black-pass-heading"
      nextPlayerName={view.answerer.name}
      previousPlayerName={view.previousHumanName}
      turnNumber={view.turnNumber}
      eyebrow={`Turn ${view.turnNumber} · ${variantLabel}`}
      privacyNote={`Pass the device to ${view.answerer.name}. The active game board and controls remain hidden until ${view.answerer.name} taps Ready.`}
      contextLines={[
        `Asking (Deck Holder): ${view.asker.name}`,
        `Answering Next: ${view.answerer.name}`,
        `Deck Remaining: ${view.drawPileCount} cards`,
      ]}
      readyLabel={`Ready (${view.answerer.name})`}
      onConfirmReady={onConfirmReady}
    />
  );
}
