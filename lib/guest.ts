export const DEFAULT_GUEST_LABEL = "Bapak/Ibu/Saudara/i";
const MAX_GUEST_LENGTH = 60;
const BAD_VALUES = new Set(["undefined", "null", "nan", "[object object]"]);

/**
 * Nama tamu dari ?kpd= hanya untuk personalisasi tampilan.
 * Bukan identitas terverifikasi dan tidak disimpan ke database.
 */
export function sanitizeGuestName(raw: string | string[] | undefined): string {
  let value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string") return DEFAULT_GUEST_LABEL;

  // Next.js sudah decode sekali; decode lagi hanya jika masih ada %XX (double-encoded).
  if (/%[0-9A-Fa-f]{2}/.test(value)) {
    try {
      value = decodeURIComponent(value);
    } catch {
      // abaikan; pakai nilai apa adanya
    }
  }

  const cleaned = value
    .replace(/[\u0000-\u001F\u007F]/g, " ")

    .replace(/[<>]/g, "")
    .replace(/\+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_GUEST_LENGTH)
    .trim();

  if (!cleaned || BAD_VALUES.has(cleaned.toLowerCase()) || cleaned.includes("%")) {
    return DEFAULT_GUEST_LABEL;
  }
  return cleaned;
}
