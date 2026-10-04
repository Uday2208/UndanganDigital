"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Section } from "@/components/Section";
import { useModalBehavior } from "@/hooks/useModalBehavior";
import type { PublicGalleryItem } from "@/lib/types";

function Lightbox({
  items,
  index,
  onClose,
  onChange,
}: {
  items: PublicGalleryItem[];
  index: number;
  onClose: () => void;
  onChange: (next: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  useModalBehavior(onClose, containerRef);

  const count = items.length;
  const prev = useCallback(() => onChange((index - 1 + count) % count), [index, count, onChange]);
  const next = useCallback(() => onChange((index + 1) % count), [index, count, onChange]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") prev();
      if (event.key === "ArrowRight") next();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [prev, next]);

  const item = items[index];
  if (!item) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Foto galeri ${index + 1} dari ${count}`}
      tabIndex={-1}
      className="fixed inset-0 z-[60] flex flex-col bg-ink/95"
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchStartX.current;
        const end = e.changedTouches[0]?.clientX;
        touchStartX.current = null;
        if (start === null || end === undefined || count < 2) return;
        const delta = end - start;
        if (Math.abs(delta) > 50) (delta > 0 ? prev : next)();
      }}
    >
      <div className="flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <p className="text-xs tracking-widest text-mist" aria-hidden="true">
          {index + 1} / {count}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup foto"
          className="flex size-11 items-center justify-center rounded-full border border-gold/50 text-gold-light hover:bg-gold hover:text-ink"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2">
        <Image
          key={item.id}
          src={item.imageUrl}
          alt={item.altText}
          width={item.width}
          height={item.height}
          sizes="(max-width: 768px) 100vw, 768px"
          className="max-h-full w-auto max-w-full object-contain"
        />
      </div>

      {count > 1 ? (
        <div className="flex items-center justify-center gap-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            onClick={prev}
            aria-label="Foto sebelumnya"
            className="flex size-11 items-center justify-center rounded-full border border-gold/50 text-gold-light hover:bg-gold hover:text-ink"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Foto berikutnya"
            className="flex size-11 items-center justify-center rounded-full border border-gold/50 text-gold-light hover:bg-gold hover:text-ink"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>
      ) : (
        <div className="pb-[max(1rem,env(safe-area-inset-bottom))]" />
      )}
    </div>
  );
}

export function Gallery({ items }: { items: PublicGalleryItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const close = useCallback(() => setOpenIndex(null), []);

  if (items.length === 0) return null;

  return (
    <Section id="gallery" eyebrow="Momen Kami" title="Galeri">
      <ul className="grid grid-cols-2 gap-2">
        {items.map((item, i) => {
          const wide = items.length % 2 === 1 && i === items.length - 1;
          return (
            <li key={item.id} className={wide ? "col-span-2" : undefined}>
              <button
                type="button"
                onClick={() => setOpenIndex(i)}
                aria-label={`Perbesar foto: ${item.altText}`}
                aria-haspopup="dialog"
                className={`relative block w-full overflow-hidden bg-ink ${wide ? "aspect-[2/1]" : "aspect-square"}`}
              >
                <Image
                  src={item.imageUrl}
                  alt={item.altText}
                  fill
                  loading="lazy"
                  sizes={wide ? "(max-width: 520px) 100vw, 456px" : "(max-width: 520px) 50vw, 228px"}
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </button>
            </li>
          );
        })}
      </ul>

      {openIndex !== null ? <Lightbox items={items} index={openIndex} onClose={close} onChange={setOpenIndex} /> : null}
    </Section>
  );
}
