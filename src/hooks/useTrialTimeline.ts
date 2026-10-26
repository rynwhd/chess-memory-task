"use client";
import { useEffect, useRef, useState } from "react";
import { TIMING } from "@/lib/trials";

export type TrialPhase = "fixation" | "memory" | "delay" | "probe";

/** Drives fixation → memory → delay → probe for a single trial.
 *  Mount a fresh instance per trial (key={trial.index}). */
export function useTrialTimeline() {
  const [phase, setPhase] = useState<TrialPhase>("fixation");
  const probeOnset = useRef<number>(0);

  useEffect(() => {
    const t1 = TIMING.fixationMs;
    const t2 = t1 + TIMING.memoryMs;
    const t3 = t2 + TIMING.delayMs;
    const timers = [
      setTimeout(() => setPhase("memory"), t1),
      setTimeout(() => setPhase("delay"), t2),
      setTimeout(() => {
        setPhase("probe");
        probeOnset.current = performance.now();
      }, t3),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return { phase, rtSinceProbe: () => performance.now() - probeOnset.current };
}
