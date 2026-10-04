import { EthnicBorder } from "@/components/Ornament";
import { Reveal } from "@/components/Reveal";
import type { PublicWedding } from "@/lib/types";

export function Closing({ wedding }: { wedding: PublicWedding }) {
  return (
    <footer className="px-8 pb-8 pt-10 text-center">
      <Reveal>
        <p className="mx-auto max-w-xs font-serif text-lg leading-relaxed text-cream">
          Merupakan kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
        </p>
        <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-mist">Kami yang berbahagia</p>
        <p className="mt-3 font-script text-4xl text-gold-light">
          {wedding.groomName} &amp; {wedding.brideName}
        </p>
      </Reveal>
      <EthnicBorder patternId="rebung-bottom" className="mt-10" />
    </footer>
  );
}
