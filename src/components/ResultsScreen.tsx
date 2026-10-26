"use client";
import { computeSdt, toCsv } from "@/lib/sdt";
import { SET_SIZES } from "@/lib/trials";
import { ELO_OPTIONS, type Participant, type TrialResponse } from "@/lib/types";

const f2 = (x: number) => (Number.isFinite(x) ? x.toFixed(2) : "—");
const pct = (x: number) => (Number.isFinite(x) ? x.toFixed(2) : "—");

type Props = { participant: Participant; responses: TrialResponse[]; onRestart: () => void };

export function ResultsScreen({ participant, responses, onRestart }: Props) {
  const rows = SET_SIZES.map((n) => computeSdt(responses, n));
  const eloLabel = ELO_OPTIONS.find((o) => o.value === participant.elo)?.label ?? participant.elo;

  const download = () => {
    const blob = new Blob([toCsv(participant.id, participant.elo, responses)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sdt_chess_${participant.id.replace(/[^\w-]/g, "_")}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Results</h1>
        <p className="text-gray-700">
          Participant ID: <b>{participant.id}</b> · Chess rating: <b>{eloLabel}</b>
        </p>
      </header>

      <section className="overflow-x-auto rounded-xl bg-white shadow">
        <table className="w-full text-right text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Set size</th>
              <th className="p-3">Hits / n</th>
              <th className="p-3">Hit rate (H)</th>
              <th className="p-3">FAs / n</th>
              <th className="p-3">FA rate (F)</th>
              <th className="p-3">d′ = Z(H) − Z(F)</th>
              <th className="p-3">c = −Z(F)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.setSize} className="border-t">
                <td className="p-3 text-left font-semibold">{r.setSize}</td>
                <td className="p-3">{r.hits} / {r.nSignal}</td>
                <td className="p-3">
                  {pct(r.hitRate)}
                  {r.hitRateAdj !== r.hitRate && (
                    <span className="ml-1 text-xs text-amber-700">→ {pct(r.hitRateAdj)}*</span>
                  )}
                </td>
                <td className="p-3">{r.falseAlarms} / {r.nNoise}</td>
                <td className="p-3">
                  {pct(r.faRate)}
                  {r.faRateAdj !== r.faRate && (
                    <span className="ml-1 text-xs text-amber-700">→ {pct(r.faRateAdj)}*</span>
                  )}
                </td>
                <td className="p-3 font-mono font-semibold">{f2(r.dPrime)}</td>
                <td className="p-3 font-mono">{f2(r.criterion)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="border-t p-3 text-xs text-gray-600">
          Hit = “Same” response (4–6) on a Same trial; False alarm = “Same” response (4–6) on a
          Different trial. * Rates of 0 or 1 are replaced by 1/(2n) or 1 − 1/(2n) before the
          z-transform (n = number of Same or Different trials at that set size). For reference, the
          conventional criterion −½[Z(H)+Z(F)] is:{" "}
          {rows.map((r) => `N=${r.setSize}: ${f2(r.criterionC)}`).join(" · ")}.
        </p>
      </section>

      <section className="overflow-x-auto rounded-xl bg-white shadow">
        <h2 className="p-3 text-lg font-semibold">Trial log</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2">#</th><th className="p-2">Set size</th><th className="p-2">Probe</th>
              <th className="p-2">Change</th><th className="p-2">Rating</th>
              <th className="p-2">Correct</th><th className="p-2">RT (ms)</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {responses.map(({ trial: t, confidence, saidSame, rtMs }) => (
              <tr key={t.index} className="border-t">
                <td className="p-2">{t.index}</td>
                <td className="p-2">{t.setSize}</td>
                <td className="p-2">{t.signalPresent ? "Same" : "Different"}</td>
                <td className="p-2 font-mono">{t.change ? `${t.change.from}→${t.change.to}` : "—"}</td>
                <td className="p-2">{confidence}</td>
                <td className="p-2">{saidSame === t.signalPresent ? "✓" : "✗"}</td>
                <td className="p-2">{Math.round(rtMs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="flex flex-wrap gap-3">
        <button onClick={download} className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700">
          Download data (CSV)
        </button>
        <button onClick={onRestart} className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-semibold hover:bg-gray-50">
          New participant
        </button>
      </div>
    </main>
  );
}
