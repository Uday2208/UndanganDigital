"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MailOpen } from "lucide-react";

export interface CoverProps {
  groomName: string;
  brideName: string;
  dateLabel: string;
  guest: string;
  coverImage: string | null;
  onOpen: () => void;
}

export function Cover({ groomName, brideName, dateLabel, guest, coverImage, onOpen }: CoverProps) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Sampul undangan pernikahan"
      className="fixed inset-0 z-50 overflow-y-auto bg-ink"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -32 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
    >
      <div className="flex min-h-full items-center justify-center">
        <div className="relative aspect-square w-full max-w-[520px]">
          {coverImage ? (
            <Image
              src={coverImage}
              alt=""
              fill
              priority
              sizes="(max-width: 520px) 100vw, 520px"
              className="object-cover"
            />
          ) : null}

          <div className="absolute inset-0 flex flex-col items-center justify-center px-[19%] text-center bg-black/30 backdrop-blur-[0.5px]">
            <p className="text-[10px] uppercase tracking-[0.35em] text-mist min-[390px]:text-xs">The Wedding of</p>

            <p className="mt-3 font-script text-[2.6rem] leading-[1.05] text-gold-light min-[390px]:text-5xl">
              {groomName}
              <span className="block text-2xl text-gold">&amp;</span>
              {brideName}
            </p>

            <p className="mt-4 text-[11px] tracking-[0.18em] text-cream min-[390px]:text-xs">{dateLabel}</p>

            <div className="mt-5 w-full">
              <p className="text-[10px] uppercase tracking-[0.25em] text-mist">Kepada Yth.</p>
              <p className="mt-1 line-clamp-2 break-words font-serif text-lg leading-tight text-cream min-[390px]:text-xl">
                {guest}
              </p>
            </div>

            <button
              type="button"
              onClick={onOpen}
              autoFocus
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-gold bg-gold px-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-gold-light focus-visible:bg-gold-light"
            >
              <MailOpen aria-hidden="true" className="size-4" />
              Buka Undangan
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
