import { Chess, type Square } from "chess.js";
import type { Piece, Placement } from "./types";

const FILES = "abcdefgh";
const ALL_SQUARES: Square[] = [];
for (let r = 1; r <= 8; r++)
  for (const f of FILES) ALL_SQUARES.push(`${f}${r}` as Square);

/** The 32 pieces of a normal game. Sampling from this bag without
 *  replacement keeps material realistic (no 3 queens, at most 1 king per side). */
const PIECE_BAG: Piece[] = (["w", "b"] as const).flatMap((color) => [
  ...Array.from({ length: 8 }, () => ({ type: "p" as const, color })),
  { type: "n", color }, { type: "n", color },
  { type: "b", color }, { type: "b", color },
  { type: "r", color }, { type: "r", color },
  { type: "q", color },
  { type: "k", color },
]);

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const rankOf = (sq: Square) => Number(sq[1]);
const fileIdx = (sq: Square) => FILES.indexOf(sq[0]);

function pieceAllowedOn(piece: Piece, sq: Square): boolean {
  // Pawns can never stand on the first or last rank.
  if (piece.type === "p" && (rankOf(sq) === 1 || rankOf(sq) === 8)) return false;
  return true;
}

/** Uses chess.js to validate that the placement could plausibly occur:
 *  pawns not on back ranks, ≤1 king per colour, and no king in check
 *  (which also rules out adjacent kings). */
export function isLegalLooking(placement: Placement): boolean {
  const chess = new Chess();
  chess.clear();
  for (const [sq, piece] of Object.entries(placement) as [Square, Piece][]) {
    if (!pieceAllowedOn(piece, sq)) return false;
    if (!chess.put(piece, sq)) return false;
  }
  for (const [sq, piece] of Object.entries(placement) as [Square, Piece][]) {
    if (piece.type === "k" && chess.isAttacked(sq, piece.color === "w" ? "b" : "w"))
      return false;
  }
  return true;
}

/** FEN piece-placement field (all react-chessboard needs). */
export function toFen(placement: Placement): string {
  const chess = new Chess();
  chess.clear();
  for (const [sq, piece] of Object.entries(placement) as [Square, Piece][])
    chess.put(piece, sq);
  return chess.fen().split(" ")[0];
}

export function randomPlacement(n: number): Placement {
  for (let attempt = 0; attempt < 1000; attempt++) {
    const pieces = shuffle(PIECE_BAG).slice(0, n);
    const squares = shuffle(ALL_SQUARES);
    const placement: Placement = {};
    let ok = true;
    for (const piece of pieces) {
      const idx = squares.findIndex((sq) => pieceAllowedOn(piece, sq));
      if (idx === -1) { ok = false; break; }
      placement[squares[idx]] = piece;
      squares.splice(idx, 1);
    }
    if (ok && isLegalLooking(placement)) return placement;
  }
  throw new Error(`Could not generate a placement with ${n} pieces`);
}

function adjacentSquares(sq: Square): Square[] {
  const f = fileIdx(sq), r = rankOf(sq);
  const out: Square[] = [];
  for (let df = -1; df <= 1; df++)
    for (let dr = -1; dr <= 1; dr++) {
      if (!df && !dr) continue;
      const nf = f + df, nr = r + dr;
      if (nf >= 0 && nf < 8 && nr >= 1 && nr <= 8) out.push(`${FILES[nf]}${nr}` as Square);
    }
  return out;
}

/** Moves exactly one piece to an adjacent (king-step) empty square,
 *  keeping the resulting board legal-looking. */
export function displaceOnePiece(placement: Placement): {
  placement: Placement; from: Square; to: Square; piece: Piece;
} | null {
  for (const from of shuffle(Object.keys(placement) as Square[])) {
    const piece = placement[from]!;
    for (const to of shuffle(adjacentSquares(from))) {
      if (placement[to] || !pieceAllowedOn(piece, to)) continue;
      const next: Placement = { ...placement };
      delete next[from];
      next[to] = piece;
      if (isLegalLooking(next)) return { placement: next, from, to, piece };
    }
  }
  return null;
}
