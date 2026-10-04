import Image from "next/image";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import type { PublicWedding } from "@/lib/types";

interface PersonProps {
  name: string;
  fullName: string;
  parents: string;
  photo: string | null;
}

function Person({ name, fullName, parents, photo }: PersonProps) {
  return (
    <Reveal className="text-center">
      {photo ? (
        <div className="relative mx-auto mb-6 aspect-[3/4] w-44 overflow-hidden rounded-t-full border border-gold/40">
          <Image src={photo} alt={`Foto ${fullName}`} fill sizes="176px" className="object-cover" />
        </div>
      ) : null}
      <p className="font-script text-5xl text-gold-light">{name}</p>
      <h3 className="mt-3 font-serif text-2xl text-cream">{fullName}</h3>
      <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-mist">{parents}</p>
    </Reveal>
  );
}

export function Couple({ wedding }: { wedding: PublicWedding }) {
  return (
    <Section id="couple" eyebrow="Dengan Hormat" title="Mempelai">
      {wedding.quote ? (
        <Reveal className="mb-12 text-center">
          <blockquote>
            <p className="font-serif text-lg italic leading-relaxed text-cream">{wedding.quote}</p>
            {wedding.quoteSource ? (
              <footer className="mt-3 text-xs uppercase tracking-[0.2em] text-gold">{wedding.quoteSource}</footer>
            ) : null}
          </blockquote>
        </Reveal>
      ) : null}

      <div className="space-y-10">
        <Person
          name={wedding.groomName}
          fullName={wedding.groomFullName}
          parents={wedding.groomParents}
          photo={wedding.groomPhoto}
        />
        <p aria-hidden="true" className="text-center font-script text-4xl text-gold">
          &amp;
        </p>
        <Person
          name={wedding.brideName}
          fullName={wedding.brideFullName}
          parents={wedding.brideParents}
          photo={wedding.bridePhoto}
        />
      </div>
    </Section>
  );
}
