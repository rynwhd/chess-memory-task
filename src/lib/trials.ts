import { displaceOnePiece, randomPlacement, shuffle, toFen } from "./positions";
import type { Trial } from "./types";

/** Progressive difficulty: 4 trials at each set size, in this fixed order. */
export const SET_SIZES = [2, 4, 6, 8] as const;
export const TRIALS_PER_SET_SIZE = 4;

export const TIMING = {
  fixationMs: 500,
  memoryMs: 3000,
  delayMs: 2000,
} as const;

function buildTrial(index: number, setSize: number, signalPresent: boolean): Trial {
  // Retry in the (very unlikely) case no legal displacement exists.
  for (;;) {
    const memory = randomPlacement(setSize);
    const memoryFen = toFen(memory);
    if (signalPresent) return { index, setSize, signalPresent, memoryFen, probeFen: memoryFen };
    const changed = displaceOnePiece(memory);
    if (!changed) continue;
    return {
      index, setSize, signalPresent, memoryFen,
      probeFen: toFen(changed.placement),
      change: { from: changed.from, to: changed.to, piece: changed.piece },
    };
  }
}

/** 16 trials: set sizes 2→4→6→8, each chunk = 2 Same + 2 Different in random order. */
export function buildTrialList(): Trial[] {
  const trials: Trial[] = [];
  for (const setSize of SET_SIZES) {
    const half = TRIALS_PER_SET_SIZE / 2;
    const conditions = shuffle([...Array(half).fill(true), ...Array(half).fill(false)]);
    for (const signalPresent of conditions)
      trials.push(buildTrial(trials.length + 1, setSize, signalPresent));
  }
  return trials;
}
