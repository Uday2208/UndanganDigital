"use client";

import { useState, type FormEvent } from "react";
import { CircleCheck, CircleX, Send } from "lucide-react";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { formatWishDate } from "@/lib/datetime";
import { MESSAGE_MAX, MESSAGE_MIN, NAME_MAX, NAME_MIN } from "@/lib/validation";
import type { ApiResponse, AttendanceValue, PublicWish, WishPage } from "@/lib/types";

interface WishesSectionProps {
  initialItems: PublicWish[];
  initialCursor: string | null;
  timezone: string;
  defaultName: string;
}

interface FieldErrors {
  name?: string;
  attendance?: string;
  message?: string;
}

const SEND_ERROR = "Maaf, ucapan belum dapat dikirim. Silakan coba kembali.";
const LOAD_ERROR = "Maaf, ucapan belum dapat dimuat. Silakan coba kembali.";

const inputClass =
  "mt-2 block w-full rounded-sm border border-mist/30 bg-ink px-4 py-3 text-base text-cream placeholder:text-mist/50 focus:border-gold focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light";

function WishItem({ wish, timezone }: { wish: PublicWish; timezone: string }) {
  const attending = wish.attendance === "hadir";
  return (
    <li className="border-t border-gold/25 py-5 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p className="break-words font-serif text-xl text-cream">{wish.guestName}</p>
        <p
          className={`inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.15em] ${
            attending ? "text-gold-light" : "text-mist"
          }`}
        >
          {attending ? (
            <CircleCheck aria-hidden="true" className="size-3.5" />
          ) : (
            <CircleX aria-hidden="true" className="size-3.5" />
          )}
          {attending ? "Hadir" : "Tidak Hadir"}
        </p>
      </div>
      {/* Plain text: React meng-escape otomatis, tidak ada dangerouslySetInnerHTML. */}
      <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-mist">{wish.message}</p>
      <p className="mt-2 text-[11px] text-mist/70">{formatWishDate(wish.createdAt, timezone)}</p>
    </li>
  );
}

export function WishesSection({ initialItems, initialCursor, timezone, defaultName }: WishesSectionProps) {
  const [items, setItems] = useState<PublicWish[]>(initialItems);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [name, setName] = useState(defaultName);
  const [attendance, setAttendance] = useState<AttendanceValue | "">("");
  const [message, setMessage] = useState("");
  // Honeypot: tidak terlihat oleh manusia; bot yang mengisinya akan diabaikan server.
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formStatus, setFormStatus] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    if (trimmedName.length < NAME_MIN) next.name = `Nama minimal ${NAME_MIN} karakter.`;
    else if (trimmedName.length > NAME_MAX) next.name = `Nama maksimal ${NAME_MAX} karakter.`;
    if (attendance === "") next.attendance = "Silakan pilih konfirmasi kehadiran.";
    if (trimmedMessage.length < MESSAGE_MIN) next.message = `Ucapan minimal ${MESSAGE_MIN} karakter.`;
    else if (trimmedMessage.length > MESSAGE_MAX) next.message = `Ucapan maksimal ${MESSAGE_MAX} karakter.`;
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const found = validate();
    setErrors(found);
    setFormStatus(null);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guest_name: name, message, attendance, website }),
      });

      let body: ApiResponse<PublicWish | { saved: false }> | null = null;
      try {
        body = (await response.json()) as ApiResponse<PublicWish | { saved: false }>;
      } catch {
        body = null;
      }

      if (response.ok && body?.success) {
        if ("id" in body.data) {
          const created = body.data;
          setItems((current) => [created, ...current.filter((w) => w.id !== created.id)]);
        }
        setMessage("");
        setAttendance("");
        setFormStatus({ kind: "success", text: "Terima kasih, ucapan dan konfirmasi kehadiran Anda telah terkirim." });
      } else {
        setFormStatus({ kind: "error", text: body && !body.success ? body.message : SEND_ERROR });
      }
    } catch {
      setFormStatus({ kind: "error", text: SEND_ERROR });
    } finally {
      setSubmitting(false);
    }
  }

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    setListError(null);
    try {
      const response = await fetch(`/api/wishes?limit=10&cursor=${encodeURIComponent(cursor)}`);
      const body = (await response.json()) as ApiResponse<WishPage>;
      if (response.ok && body.success) {
        setItems((current) => {
          const known = new Set(current.map((w) => w.id));
          return [...current, ...body.data.items.filter((w) => !known.has(w.id))];
        });
        setCursor(body.data.nextCursor);
      } else {
        setListError(LOAD_ERROR);
      }
    } catch {
      setListError(LOAD_ERROR);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <Section id="wishes" eyebrow="RSVP" title="Ucapan & Doa">
      <Reveal>
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div>
            <label htmlFor="wish-name" className="text-[11px] uppercase tracking-[0.25em] text-gold">
              Nama
            </label>
            <input
              id="wish-name"
              name="guest_name"
              type="text"
              autoComplete="name"
              maxLength={NAME_MAX}
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "wish-name-error" : undefined}
              className={inputClass}
            />
            {errors.name ? (
              <p id="wish-name-error" className="mt-1.5 text-sm text-gold-light">
                {errors.name}
              </p>
            ) : null}
          </div>

          <fieldset aria-describedby={errors.attendance ? "wish-attendance-error" : undefined}>
            <legend className="text-[11px] uppercase tracking-[0.25em] text-gold">Konfirmasi Kehadiran</legend>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {(
                [
                  { value: "hadir", label: "Hadir" },
                  { value: "tidak_hadir", label: "Tidak Hadir" },
                ] as const
              ).map((option) => (
                <label
                  key={option.value}
                  className={`flex min-h-11 cursor-pointer items-center justify-center rounded-sm border px-3 text-sm transition-colors focus-within:ring-2 focus-within:ring-gold-light ${
                    attendance === option.value
                      ? "border-gold bg-gold text-ink"
                      : "border-mist/30 text-cream hover:border-gold"
                  }`}
                >
                  <input
                    type="radio"
                    name="attendance"
                    value={option.value}
                    checked={attendance === option.value}
                    onChange={() => setAttendance(option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {errors.attendance ? (
              <p id="wish-attendance-error" className="mt-1.5 text-sm text-gold-light">
                {errors.attendance}
              </p>
            ) : null}
          </fieldset>

          <div>
            <label htmlFor="wish-message" className="text-[11px] uppercase tracking-[0.25em] text-gold">
              Ucapan &amp; Doa
            </label>
            <textarea
              id="wish-message"
              name="message"
              rows={4}
              maxLength={MESSAGE_MAX}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={errors.message ? "wish-message-error wish-message-count" : "wish-message-count"}
              className={`${inputClass} resize-y`}
            />
            <div className="mt-1.5 flex items-start justify-between gap-3">
              <p id="wish-message-error" className="text-sm text-gold-light">
                {errors.message}
              </p>
              <p id="wish-message-count" className="shrink-0 text-[11px] text-mist/70">
                {message.length}/{MESSAGE_MAX}
              </p>
            </div>
          </div>

          {/* Honeypot */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="wish-website">Website</label>
            <input
              id="wish-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-gold bg-gold px-7 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send aria-hidden="true" className="size-4" />
            {submitting ? "Mengirim…" : "Kirim Ucapan"}
          </button>

          <div aria-live="polite" role="status" className="min-h-6 text-center text-sm">
            {formStatus ? (
              <span className={formStatus.kind === "success" ? "text-gold-light" : "text-cream"}>{formStatus.text}</span>
            ) : null}
          </div>
        </form>
      </Reveal>

      <div className="mt-12">
        {items.length === 0 ? (
          <p className="whitespace-pre-line text-center font-serif text-lg leading-relaxed text-mist">
            {"Belum ada ucapan.\nJadilah yang pertama memberikan doa."}
          </p>
        ) : (
          <>
            <h3 className="mb-6 text-center text-[11px] uppercase tracking-[0.3em] text-mist">
              Ucapan dari Tamu
            </h3>
            <ul>
              {items.map((wish) => (
                <WishItem key={wish.id} wish={wish} timezone={timezone} />
              ))}
            </ul>
          </>
        )}

        {listError ? (
          <p role="alert" className="mt-4 text-center text-sm text-cream">
            {listError}
          </p>
        ) : null}

        {cursor ? (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => void loadMore()}
              disabled={loadingMore}
              className="min-h-11 rounded-full border border-gold px-7 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-light transition-colors hover:bg-gold hover:text-ink disabled:opacity-60"
            >
              {loadingMore ? "Memuat…" : "Muat Lebih Banyak"}
            </button>
          </div>
        ) : null}
      </div>
    </Section>
  );
}
