"use client";

import { StateScreen } from "@/components/StateScreen";

/** Pesan ke pengguna selalu generik: tidak menampilkan error.message / stack / detail database. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <StateScreen
      title="Terjadi Kendala"
      message={"Maaf, data belum dapat dimuat.\nSilakan coba kembali."}
      action={
        <button
          type="button"
          onClick={reset}
          className="min-h-11 rounded-full border border-gold px-8 text-xs font-medium uppercase tracking-[0.25em] text-gold-light transition-colors hover:bg-gold hover:text-ink"
        >
          Coba Lagi
        </button>
      }
    />
  );
}
