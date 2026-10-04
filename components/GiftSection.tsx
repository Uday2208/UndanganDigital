"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Copy, QrCode, X } from "lucide-react";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { useModalBehavior } from "@/hooks/useModalBehavior";
import { copyText } from "@/lib/clipboard";

interface GiftSectionProps {
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountHolder: string | null;
  ewalletName: string | null;
  ewalletNumber: string | null;
  ewalletHolder: string | null;
  qrisImage: string | null;
}

interface Feedback {
  kind: "success" | "error";
  text: string;
}

function QrisModal({ src, onClose }: { src: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useModalBehavior(onClose, ref);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Kode QRIS"
      tabIndex={-1}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 p-6"
    >
      <div className="w-full max-w-sm rounded-sm bg-white p-4">
        <Image src={src} alt="Kode QRIS untuk hadiah pernikahan" width={640} height={640} sizes="(max-width: 384px) 90vw, 352px" className="h-auto w-full" />
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup QRIS"
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] flex size-11 items-center justify-center rounded-full border border-gold/50 text-gold-light hover:bg-gold hover:text-ink"
      >
        <X aria-hidden="true" className="size-5" />
      </button>
    </div>
  );
}

function AccountCard({
  title,
  number,
  holder,
  onCopy,
}: {
  title: string;
  number: string;
  holder: string | null;
  onCopy: () => void;
}) {
  return (
    <Reveal className="border border-gold/30 px-5 py-6 text-center">
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold">{title}</p>
      <p className="mt-3 break-all font-serif text-3xl tabular-nums tracking-wide text-cream">{number}</p>
      {holder ? <p className="mt-2 text-sm text-mist">a.n. {holder}</p> : null}
      <button
        type="button"
        onClick={onCopy}
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-gold px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-light transition-colors hover:bg-gold hover:text-ink"
      >
        <Copy aria-hidden="true" className="size-4" />
        Salin
        <span className="sr-only"> nomor {title}</span>
      </button>
    </Reveal>
  );
}

export function GiftSection({
  bankName,
  bankAccountNumber,
  bankAccountHolder,
  ewalletName,
  ewalletNumber,
  ewalletHolder,
  qrisImage,
}: GiftSectionProps) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [qrisOpen, setQrisOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const hasBank = Boolean(bankAccountNumber);
  const hasEwallet = Boolean(ewalletNumber);
  const hasQris = Boolean(qrisImage);
  if (!hasBank && !hasEwallet && !hasQris) return null;

  async function handleCopy(value: string, successText: string) {
    const copied = await copyText(value);
    setFeedback(
      copied
        ? { kind: "success", text: successText }
        : { kind: "error", text: "Nomor belum dapat disalin. Silakan salin secara manual." },
    );
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setFeedback(null), 4000);
  }

  return (
    <Section id="gift" eyebrow="Tanda Kasih" title="Hadiah">
      <Reveal className="mx-auto mb-8 max-w-xs text-center text-sm leading-relaxed text-mist">
        Doa restu Anda adalah hadiah terbaik bagi kami. Namun jika Anda berkenan memberikan tanda kasih, dapat melalui:
      </Reveal>

      <div className="space-y-5">
        {hasBank && bankAccountNumber ? (
          <AccountCard
            title={bankName ? `Rekening ${bankName}` : "Rekening Bank"}
            number={bankAccountNumber}
            holder={bankAccountHolder}
            onCopy={() => void handleCopy(bankAccountNumber, "Nomor rekening berhasil disalin.")}
          />
        ) : null}

        {hasEwallet && ewalletNumber ? (
          <AccountCard
            title={ewalletName ?? "E-Wallet"}
            number={ewalletNumber}
            holder={ewalletHolder}
            onCopy={() => void handleCopy(ewalletNumber, "Nomor e-wallet berhasil disalin.")}
          />
        ) : null}

        {hasQris ? (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setQrisOpen(true)}
              aria-haspopup="dialog"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-gold bg-gold px-7 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-gold-light"
            >
              <QrCode aria-hidden="true" className="size-4" />
              Buka QRIS
            </button>
          </div>
        ) : null}
      </div>

      <div aria-live="polite" role="status" className="mt-5 min-h-6 text-center text-sm">
        {feedback ? (
          <span className={feedback.kind === "success" ? "text-gold-light" : "text-cream"}>{feedback.text}</span>
        ) : null}
      </div>

      {qrisOpen && qrisImage ? <QrisModal src={qrisImage} onClose={() => setQrisOpen(false)} /> : null}
    </Section>
  );
}
