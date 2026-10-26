"use client";
import { useCallback, useRef } from "react";
import { useTrialTimeline } from "@/hooks/useTrialTimeline";
import type { Confidence, Trial } from "@/lib/types";
import { Board } from "./Board";
import { ConfidenceScale } from "./ConfidenceScale";

type Props = {
  trial: Trial;
  total: number;
  onRespond: (trial: Trial, c: Confidence, rtMs: number) => void;
};

/** One trial. The board slot and the response slot have fixed sizes so
 *  nothing shifts on screen between memory and probe displays. */
export function TrialRunner({ trial, total, onRespond }: Props) {
  const { phase, rtSinceProbe } = useTrialTimeline();
  const answered = useRef(false);

  const handleSelect = useCallback(
    (c: Confidence) => {
      if (answered.current) return; // guard against double clicks / key repeat
      answered.current = true;
      onRespond(trial, c, rtSinceProbe());
    },
    [trial, onRespond, rtSinceProbe],
  );

  return (
    <div className="flex min-h-screen select-none flex-col items-center justify-center gap-6 bg-[#808080] p-4">
      <div className="flex aspect-square w-[min(85vw,60vh,520px)] items-center justify-center">
        {phase === "fixation" && (
          <span className="text-6xl font-light text-black" aria-label="fixation cross">+</span>
        )}
        {phase === "memory" && <Board id={`memory-${trial.index}`} fen={trial.memoryFen} />}
        {/* delay: intentionally empty gray screen */}
        {phase === "probe" && <Board id={`probe-${trial.index}`} fen={trial.probeFen} />}
      </div>

      <div className="flex min-h-36 w-full flex-col items-center gap-3">
        {phase === "probe" && (
          <>
            <p className="text-center text-lg font-medium text-white">
              Is this board the <b>same</b> as before, or is it <b>different</b>?
            </p>
            <ConfidenceScale onSelect={handleSelect} />
            <p className="text-xs text-gray-200">
              Trial {trial.index} of {total} · keys 1–6 also work
            </p>
          </>
        )}
      </div>
    </div>
  );
}
