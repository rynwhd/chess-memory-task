"use client";
import { Chessboard } from "react-chessboard";

/** Static, non-interactive board used for both memory and probe arrays. */
export function Board({ fen, id }: { fen: string; id: string }) {
  return (
    <div className="aspect-square w-[min(85vw,60vh,520px)] shadow-lg">
      <Chessboard
        options={{
          id,
          position: fen,
          allowDragging: false,
          allowDrawingArrows: false,
          showAnimations: false,
          showNotation: false,
          darkSquareStyle: { backgroundColor: "#b58863" },
          lightSquareStyle: { backgroundColor: "#f0d9b5" },
        }}
      />
    </div>
  );
}
