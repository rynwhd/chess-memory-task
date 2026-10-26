import type { Color, PieceSymbol, Square } from "chess.js";

export type Piece = { type: PieceSymbol; color: Color };
/** Sparse board: only occupied squares are present. */
export type Placement = Partial<Record<Square, Piece>>;

export type EloBand = "beginner" | "intermediate" | "advanced" | "expert";

export const ELO_OPTIONS: { value: EloBand; label: string }[] = [
  { value: "beginner", label: "None/Beginner (< 1000)" },
  { value: "intermediate", label: "Intermediate (1000 - 1500)" },
  { value: "advanced", label: "Advanced (1500 - 2000)" },
  { value: "expert", label: "Expert/Titled (2000+)" },
];

export type Participant = { id: string; elo: EloBand };

export type Trial = {
  index: number; // 1-based
  setSize: number;
  /** true = probe identical to memory array ("Same", signal present) */
  signalPresent: boolean;
  memoryFen: string;
  probeFen: string;
  /** Only for signal-absent trials: which piece moved where. */
  change?: { from: Square; to: Square; piece: Piece };
};

/** 1 Sure Different ... 6 Sure Same */
export type Confidence = 1 | 2 | 3 | 4 | 5 | 6;

export type TrialResponse = {
  trial: Trial;
  confidence: Confidence;
  saidSame: boolean; // confidence >= 4
  rtMs: number; // from probe onset to click
};
