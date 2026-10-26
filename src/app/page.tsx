"use client";
import { ResultsScreen } from "@/components/ResultsScreen";
import { TrialRunner } from "@/components/TrialRunner";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { useExperiment } from "@/hooks/useExperiment";

export default function Home() {
  const exp = useExperiment();

  if (exp.stage === "welcome") return <WelcomeScreen onStart={exp.start} />;

  if (exp.stage === "running" && exp.currentTrial)
    return (
      <TrialRunner
        key={exp.currentTrial.index} // remount → fresh timeline per trial
        trial={exp.currentTrial}
        total={exp.totalTrials}
        onRespond={exp.respond}
      />
    );

  if (exp.stage === "results" && exp.participant)
    return <ResultsScreen participant={exp.participant} responses={exp.responses} onRestart={exp.reset} />;

  return null;
}
