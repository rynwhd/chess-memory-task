import { jStat } from "jstat";
import type { TrialResponse } from "./types";

/** Inverse of the standard normal CDF. */
export const z = (p: number) => jStat.normal.inv(p, 0, 1);

/** Correction for extreme proportions: 0 → 1/(2n), 1 → 1 − 1/(2n). */
export function correctRate(rate: number, n: number): number {
  if (rate <= 0) return 1 / (2 * n);
  if (rate >= 1) return 1 - 1 / (2 * n);
  return rate;
}

export type SdtRow = {
  setSize: number;
  nSignal: number;
  nNoise: number;
  hits: number;
  falseAlarms: number;
  hitRate: number;       // raw H
  faRate: number;        // raw F
  hitRateAdj: number;    // H used for z
  faRateAdj: number;     // F used for z
  zH: number;
  zF: number;
  dPrime: number;        // z(H) − z(F)
  criterion: number;     // −z(F), as specified for this study
  criterionC: number;    // −½[z(H) + z(F)], conventional c, for reference
};

export function computeSdt(responses: TrialResponse[], setSize: number): SdtRow {
  const rows = responses.filter((r) => r.trial.setSize === setSize);
  const signal = rows.filter((r) => r.trial.signalPresent);
  const noise = rows.filter((r) => !r.trial.signalPresent);
  const hits = signal.filter((r) => r.saidSame).length;
  const falseAlarms = noise.filter((r) => r.saidSame).length;

  const hitRate = signal.length ? hits / signal.length : NaN;
  const faRate = noise.length ? falseAlarms / noise.length : NaN;
  const hitRateAdj = correctRate(hitRate, signal.length);
  const faRateAdj = correctRate(faRate, noise.length);
  const zH = z(hitRateAdj);
  const zF = z(faRateAdj);

  return {
    setSize, nSignal: signal.length, nNoise: noise.length, hits, falseAlarms,
    hitRate, faRate, hitRateAdj, faRateAdj, zH, zF,
    dPrime: zH - zF,
    criterion: -zF,
    criterionC: -0.5 * (zH + zF),
  };
}

export function toCsv(participantId: string, elo: string, responses: TrialResponse[]): string {
  const header = [
    "participant_id", "elo_band", "trial", "set_size", "condition",
    "confidence", "said_same", "correct", "rt_ms",
    "changed_from", "changed_to", "memory_fen", "probe_fen",
  ];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = responses.map(({ trial: t, confidence, saidSame, rtMs }) =>
    [
      participantId, elo, t.index, t.setSize, t.signalPresent ? "same" : "different",
      confidence, saidSame ? 1 : 0, saidSame === t.signalPresent ? 1 : 0, Math.round(rtMs),
      t.change?.from, t.change?.to, t.memoryFen, t.probeFen,
    ].map(esc).join(","),
  );
  return [header.join(","), ...lines].join("\n");
}
