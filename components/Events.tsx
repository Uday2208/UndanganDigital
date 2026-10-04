import { CalendarDays, Clock, MapPin } from "lucide-react";
import { DividerOrnament } from "@/components/Ornament";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { formatDayName, formatLongDate, formatTime, formatTimeRange } from "@/lib/datetime";
import type { PublicWedding } from "@/lib/types";

function EventBlock({
  title,
  dateLabel,
  timeLabel,
  venueName,
  venueAddress,
}: {
  title: string;
  dateLabel: string;
  timeLabel: string;
  venueName: string;
  venueAddress: string;
}) {
  return (
    <Reveal className="text-center">
      <h3 className="font-serif text-3xl text-cream">{title}</h3>
      <ul className="mt-5 space-y-3 text-sm text-mist">
        <li className="flex items-center justify-center gap-2">
          <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-gold" />
          <span>{dateLabel}</span>
        </li>
        <li className="flex items-center justify-center gap-2">
          <Clock aria-hidden="true" className="size-4 shrink-0 text-gold" />
          <span>{timeLabel}</span>
        </li>
      </ul>
      <p className="mt-5 font-serif text-xl text-gold-light">{venueName}</p>
      <p className="mx-auto mt-1 max-w-[18rem] text-sm leading-relaxed text-mist">{venueAddress}</p>
    </Reveal>
  );
}

export function Events({ wedding }: { wedding: PublicWedding }) {
  const akadDateLabel = `${formatDayName(wedding.akadDate)}, ${formatLongDate(wedding.akadDate)}`;
  const receptionDateLabel = `${formatDayName(wedding.receptionDate)}, ${formatLongDate(wedding.receptionDate)}`;
  const akadTime = formatTime(wedding.akadTime, wedding.timezone);
  const receptionTime = formatTimeRange(wedding.receptionTime, wedding.receptionEndTime, wedding.timezone);

  return (
    <Section id="event" eyebrow="Save the Date" title="Acara">
      <div className="space-y-12">
        <EventBlock
          title="Akad Nikah"
          dateLabel={akadDateLabel}
          timeLabel={akadTime}
          venueName={wedding.venueName}
          venueAddress={wedding.venueAddress}
        />
        <DividerOrnament />
        <EventBlock
          title="Resepsi"
          dateLabel={receptionDateLabel}
          timeLabel={receptionTime}
          venueName={wedding.venueName}
          venueAddress={wedding.venueAddress}
        />
      </div>

      {wedding.mapsUrl ? (
        <Reveal className="mt-12 text-center">
          <a
            href={wedding.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-gold px-7 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-light transition-colors hover:bg-gold hover:text-ink"
          >
            <MapPin aria-hidden="true" className="size-4" />
            Lihat Lokasi
            <span className="sr-only"> (membuka Google Maps di tab baru)</span>
          </a>
        </Reveal>
      ) : null}
    </Section>
  );
}
