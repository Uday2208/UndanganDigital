import type { ReactNode } from "react";
import { DividerOrnament } from "@/components/Ornament";
import { Reveal } from "@/components/Reveal";

export function Section({
  id,
  eyebrow,
  title,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className={`scroll-mt-4 px-8 py-16 ${className}`}>
      <Reveal className="text-center">
        {eyebrow ? <p className="text-[11px] uppercase tracking-[0.35em] text-mist">{eyebrow}</p> : null}
        <h2 id={id ? `${id}-title` : undefined} className="mt-3 font-serif text-4xl text-gold-light">
          {title}
        </h2>
        <DividerOrnament className="mt-5" />
      </Reveal>
      <div className="mt-10">{children}</div>
    </section>
  );
}
