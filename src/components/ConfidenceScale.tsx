"use client";
import { useEffect } from "react";
import type { Confidence } from "@/lib/types";

const OPTIONS: { value: Confidence; label: string }[] = [
  { value: 1, label: "Sure Different" },
  { value: 2, label: "Probably Different" },
  { value: 3, label: "Guess Different" },
  { value: 4, label: "Guess Same" },
  { value: 5, label: "Probably Same" },
  { value: 6, label: "Sure Same" },
];

/** 6-point confidence scale; also accepts keys 1–6. */
export function ConfidenceScale({ onSelect }: { onSelect: (c: Confidence) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= 6) onSelect(n as Confidence);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSelect]);

  return (
    <div className="grid w-full max-w-3xl grid-cols-3 gap-2 sm:grid-cols-6">
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          className={`flex flex-col items-center rounded-lg border-2 px-2 py-3 text-sm font-medium transition hover:scale-105 focus:outline-none focus-visible:ring-4 ${
            value <= 3
              ? "border-rose-300 bg-rose-50 text-rose-900 hover:bg-rose-100"
              : "border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
          }`}
        >
          <span className="text-lg font-bold">{value}</span>
          <span className="leading-tight">{label}</span>
        </button>
      ))}
    </div>
  );
}
