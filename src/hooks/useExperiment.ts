"use client";
import { useCallback, useState } from "react";
import { buildTrialList } from "@/lib/trials";
import type { Confidence, Participant, Trial, TrialResponse } from "@/lib/types";

type Stage = "welcome" | "running" | "results";

export function useExperiment() {
  const [started, setStarted] = useState(false);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [responses, setResponses] = useState<TrialResponse[]>([]);

  const start = useCallback((p: Participant) => {
    setParticipant(p);
    setTrials(buildTrialList()); // all positions generated up front: no lag mid-trial
    setResponses([]);
    setStarted(true);
  }, []);

  const respond = useCallback(
    (trial: Trial, confidence: Confidence, rtMs: number) => {
      setResponses((prev) => [...prev, { trial, confidence, saidSame: confidence >= 4, rtMs }]);
    },
    [],
  );

  const reset = useCallback(() => {
    setStarted(false);
    setParticipant(null);
    setTrials([]);
    setResponses([]);
  }, []);

  const stage: Stage = !started ? "welcome"
    : responses.length < trials.length ? "running" : "results";

  return {
    stage, participant, responses, reset, start, respond,
    currentTrial: trials[responses.length] as Trial | undefined,
    totalTrials: trials.length,
  };
}
