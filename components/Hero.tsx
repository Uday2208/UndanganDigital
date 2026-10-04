import Image from "next/image";
import { Countdown } from "@/components/Countdown";
import { EthnicBorder } from "@/components/Ornament";
import { Reveal } from "@/components/Reveal";
import type { PublicWedding } from "@/lib/types";
import { formatDayName, formatLongDate } from "@/lib/datetime";

export function Hero({ wedding }: { wedding: PublicWedding }) {
  const dateLabel = `${formatDayName(wedding.weddingDate)}, ${formatLongDate(wedding.weddingDate)}`;

  return (
    <header id="home" aria-label="Pembuka" className="scroll-mt-4">
      <EthnicBorder patternId="rebung-top" />

      <div className="relative aspect-square w-full">
        {wedding.coverImage ? (
          <Image
            src={wedding.coverImage}
            alt=""
            fill
            sizes="(max-width: 520px) 100vw, 520px"
            className="object-cover"
          />
        ) : null}

        <Reveal className="absolute inset-0 flex flex-col items-center justify-center px-[19%] text-center bg-black/30 backdrop-blur-[0.5px]">
          <p className="text-[10px] uppercase tracking-[0.35em] text-mist min-[390px]:text-xs">The Wedding of</p>
          <h1 className="mt-3 font-script text-[2.75rem] leading-[1.05] text-gold-light min-[390px]:text-5xl">
            {wedding.groomName}
            <span className="block text-2xl text-gold">&amp;</span>
            {wedding.brideName}
          </h1>
          <p className="mt-4 text-[11px] tracking-[0.18em] text-cream min-[390px]:text-xs">{dateLabel}</p>
        </Reveal>
      </div>

      <div className="px-8 pb-6 pt-4">
        <Reveal>
          <p className="mb-5 text-center text-[11px] uppercase tracking-[0.35em] text-mist">Menuju Hari Bahagia</p>
          <Countdown targetIso={wedding.akadAt} />
        </Reveal>
      </div>
    </header>
  );
}
