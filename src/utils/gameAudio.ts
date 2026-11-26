export type GameToneKind = 'reveal' | 'correct' | 'wrong' | 'victory';

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;

  if (!sharedAudioCtx) {
    sharedAudioCtx = new Ctx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

function scheduleTone(
  ctx: AudioContext,
  frequency: number,
  startOffsetSec: number,
  durationSec: number,
  gainPeak: number,
  type: OscillatorType = 'sine'
) {
  const start = ctx.currentTime + startOffsetSec;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainPeak, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + durationSec);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(start);
  osc.stop(start + durationSec + 0.02);
}

export function playGameTone(kind: GameToneKind, enabled: boolean): void {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    switch (kind) {
      case 'reveal':
        scheduleTone(ctx, 440, 0, 0.08, 0.04, 'triangle');
        break;
      case 'correct':
        scheduleTone(ctx, 523.25, 0, 0.11, 0.05, 'sine');
        scheduleTone(ctx, 659.25, 0.07, 0.14, 0.05, 'sine');
        break;
      case 'wrong':
        scheduleTone(ctx, 293.66, 0, 0.13, 0.05, 'triangle');
        scheduleTone(ctx, 220, 0.09, 0.18, 0.045, 'triangle');
        break;
      case 'victory':
        scheduleTone(ctx, 523.25, 0, 0.12, 0.05, 'sine');
        scheduleTone(ctx, 659.25, 0.09, 0.12, 0.05, 'sine');
        scheduleTone(ctx, 783.99, 0.18, 0.24, 0.06, 'sine');
        break;
    }
  } catch {
    // Ignore browser audio autoplay/context restrictions gracefully
  }
}
