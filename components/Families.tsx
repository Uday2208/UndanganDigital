import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import type { PublicFamily, PublicWedding } from "@/lib/types";

function Side({ title, members }: { title: string; members: PublicFamily[] }) {
  if (members.length === 0) return null;
  return (
    <Reveal className="text-center">
      <h3 className="text-[11px] uppercase tracking-[0.3em] text-gold">{title}</h3>
      <ul className="mt-4 space-y-4">
        {members.map((member) => (
          <li key={member.id}>
            <p className="font-serif text-xl text-cream">{member.name}</p>
            <p className="mt-0.5 text-xs text-mist">{member.role}</p>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

export function Families({ wedding, families }: { wedding: PublicWedding; families: PublicFamily[] }) {
  if (families.length === 0) return null;
  const groom = families.filter((f) => f.side === "pria");
  const bride = families.filter((f) => f.side === "wanita");

  const titleText = wedding.familyTitle || "Turut Mengundang";

  return (
    <Section id="family" eyebrow="Turut Mengundang" title={titleText}>
      <div className="space-y-10">
        <Side title={`Keluarga ${wedding.groomName}`} members={groom} />
        <Side title={`Keluarga ${wedding.brideName}`} members={bride} />
      </div>
    </Section>
  );
}
