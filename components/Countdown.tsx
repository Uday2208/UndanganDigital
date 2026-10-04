"use client";

import { useMemo, useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
}

// Snapshot stabil per detik. Server selalu null => markup awal server = client (tanpa hydration mismatch).
const getSnapshot = (): number | null => Math.floor(Date.now() / 1000);
const getServerSnapshot = (): number | null => null;

const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown({ targetIso }: { targetIso: string }) {
  // targetIso = ISO 8601 dengan offset timezone wedding (mis. 2026-12-20T08:00:00+07:00).
  const target = useMemo(() => Date.parse(targetIso), [targetIso]);
  const nowSeconds = useSyncExternalStore<number | null>(subscribe, getSnapshot, getServerSnapshot);

  if (Number.isNaN(target)) return null;

  if (nowSeconds !== null && nowSeconds * 1000 >= target) {
    return (
      <p className="mx-auto max-w-xs text-center font-serif text-xl leading-relaxed text-gold-light">
        Terima kasih telah menjadi bagian dari hari bahagia kami.
      </p>
    );
  }

  const remaining = nowSeconds === null ? null : Math.max(0, Math.floor((target - nowSeconds * 1000) / 1000));
  const units = [
    { label: "Hari", value: remaining === null ? null : Math.floor(remaining / 86400) },
    { label: "Jam", value: remaining === null ? null : Math.floor((remaining % 86400) / 3600) },
    { label: "Menit", value: remaining === null ? null : Math.floor((remaining % 3600) / 60) },
    { label: "Detik", value: remaining === null ? null : remaining % 60 },
  ];

  return (
    <div role="timer" aria-label="Hitung mundur menuju hari pernikahan" className="grid grid-cols-4 gap-2 text-center">
      {units.map((unit) => (
        <div key={unit.label} className="border-t border-gold/40 pt-3">
          <div className="font-serif text-3xl font-medium tabular-nums text-gold-light min-[390px]:text-4xl">
            {unit.value === null ? "--" : pad(unit.value)}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-mist">{unit.label}</div>
        </div>
      ))}
    </div>
  );
}
