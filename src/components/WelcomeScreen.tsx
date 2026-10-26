"use client";
import { useState } from "react";
import { ELO_OPTIONS, type EloBand, type Participant } from "@/lib/types";
import { TIMING } from "@/lib/trials";

export function WelcomeScreen({ onStart }: { onStart: (p: Participant) => void }) {
  const [id, setId] = useState("");
  const [elo, setElo] = useState<EloBand | "">("");
  const ready = id.trim().length > 0 && elo !== "";

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 p-6">
      <header>
        <h1 className="text-3xl font-bold">Chessboard Memory Task</h1>
        <p className="mt-1 text-gray-600">A short working-memory experiment (about 2–3 minutes).</p>
      </header>

      <section className="space-y-3 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">What you will do</h2>
        <ol className="list-decimal space-y-2 pl-5 text-gray-800">
          <li>A cross <b>+</b> appears in the centre. Look at it.</li>
          <li>
            A chessboard with a few pieces appears for {TIMING.memoryMs / 1000} seconds.
            <b> Memorise where every piece is.</b>
          </li>
          <li>The screen goes gray for {TIMING.delayMs / 1000} seconds.</li>
          <li>
            A second board appears. It is either <b>exactly the same</b>, or <b>one piece has moved
            one square</b> to a neighbouring empty square.
          </li>
          <li>
            Rate how confident you are, from <b>1 = Sure Different</b> to <b>6 = Sure Same</b>.
          </li>
        </ol>
        <p className="text-gray-700">
          There are 16 trials. The number of pieces grows from 2 to 8 as you go. Answer as accurately
          as you can; it is fine to guess.
        </p>
      </section>

      <form
        className="space-y-4 rounded-xl bg-white p-6 shadow"
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) onStart({ id: id.trim(), elo: elo as EloBand });
        }}
      >
        <label className="block">
          <span className="font-medium">Participant ID</span>
          <input
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="e.g. P001"
            autoComplete="off"
          />
        </label>
        <label className="block">
          <span className="font-medium">Estimated chess rating (Elo)</span>
          <select
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={elo}
            onChange={(e) => setElo(e.target.value as EloBand)}
          >
            <option value="" disabled>Select…</option>
            {ELO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={!ready}
          className="w-full rounded-lg bg-indigo-600 py-3 text-lg font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          Start Experiment
        </button>
      </form>
    </main>
  );
}
