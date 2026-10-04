import { z } from "zod";
import { ATTENDANCE_VALUES } from "@/lib/types";

export const NAME_MIN = 2;
export const NAME_MAX = 80;
export const MESSAGE_MIN = 3;
export const MESSAGE_MAX = 500;

/** Tag HTML / skema berbahaya tidak diizinkan; ucapan adalah plain text. */
const MARKUP_PATTERN = /<\s*\/?\s*[a-z!?]/i;
const DANGEROUS_SCHEME = /(javascript|vbscript|data)\s*:/i;

export function containsMarkup(value: string): boolean {
  return MARKUP_PATTERN.test(value) || DANGEROUS_SCHEME.test(value);
}

/** Hapus karakter kontrol, normalisasi spasi. `multiline` mempertahankan baris baru. */
export function sanitizeText(value: string, multiline: boolean): string {
  let text = value.normalize("NFC");
  text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, "");

  text = text.replace(/\r\n?/g, "\n");
  if (multiline) {
    text = text
      .split("\n")
      .map((line) => line.replace(/[ \t]+/g, " ").trim())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");
  } else {
    text = text.replace(/\s+/g, " ");
  }
  return text.trim();
}

const guestName = z
  .string({ message: "Nama wajib diisi." })
  .max(400, "Nama terlalu panjang.")
  .transform((v) => sanitizeText(v, false))
  .pipe(
    z
      .string()
      .min(NAME_MIN, `Nama minimal ${NAME_MIN} karakter.`)
      .max(NAME_MAX, `Nama maksimal ${NAME_MAX} karakter.`)
      .refine((v) => !containsMarkup(v), "Nama tidak boleh berisi kode atau tag HTML."),
  );

const message = z
  .string({ message: "Ucapan wajib diisi." })
  .max(4000, "Ucapan terlalu panjang.")
  .transform((v) => sanitizeText(v, true))
  .pipe(
    z
      .string()
      .min(MESSAGE_MIN, `Ucapan minimal ${MESSAGE_MIN} karakter.`)
      .max(MESSAGE_MAX, `Ucapan maksimal ${MESSAGE_MAX} karakter.`)
      .refine((v) => !containsMarkup(v), "Ucapan tidak boleh berisi kode atau tag HTML."),
  );

/**
 * Whitelist field. strictObject menolak field tak dikenal (mis. wedding_id, id, created_at):
 * field tersebut hanya boleh ditentukan server.
 * `website` adalah honeypot; manusia tidak mengisinya.
 */
export const wishSchema = z.strictObject({
  guest_name: guestName,
  message,
  attendance: z.enum(ATTENDANCE_VALUES, { message: "Pilih kehadiran: hadir atau tidak hadir." }),
  website: z.string().max(200).optional(),
});

export type WishInput = z.infer<typeof wishSchema>;

export function parseLimit(value: string | null, fallback: number, max: number): number {
  if (value === null || !/^\d{1,4}$/.test(value)) return fallback;
  const n = Number(value);
  if (n < 1) return fallback;
  return Math.min(n, max);
}

/** Cursor = id numerik. Ditolak jika bukan digit. */
export function parseCursor(value: string | null): bigint | null {
  if (value === null || !/^\d{1,18}$/.test(value)) return null;
  return BigInt(value);
}
