/**
 * Helper tanggal & waktu deterministik (tanpa Intl / timezone browser),
 * sehingga output server dan client identik (tidak ada hydration mismatch).
 */

interface ZoneInfo {
  offset: string; // "+07:00"
  minutes: number;
  label: string; // WIB / WITA / WIT
}

const ZONES: Record<string, ZoneInfo> = {
  "Asia/Jakarta": { offset: "+07:00", minutes: 420, label: "WIB" },
  "Asia/Makassar": { offset: "+08:00", minutes: 480, label: "WITA" },
  "Asia/Jayapura": { offset: "+09:00", minutes: 540, label: "WIT" },
};

export function zoneInfo(timezone: string): ZoneInfo {
  return ZONES[timezone] ?? ZONES["Asia/Jakarta"];
}

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

/** Gabungkan tanggal (YYYY-MM-DD) + waktu (HH:mm) + timezone wedding menjadi ISO yang aman. */
export function toIsoWithOffset(date: string, time: string, timezone: string): string {
  return `${date}T${time}:00${zoneInfo(timezone).offset}`;
}

function parseDateParts(date: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
}

/** "2026-12-20" -> "20 Desember 2026" */
export function formatLongDate(date: string): string {
  const parts = parseDateParts(date);
  if (!parts) return "";
  return `${parts.d} ${MONTHS[parts.m - 1] ?? ""} ${parts.y}`.trim();
}

/** "2026-12-20" -> "Minggu" */
export function formatDayName(date: string): string {
  const parts = parseDateParts(date);
  if (!parts) return "";
  const dayIndex = new Date(Date.UTC(parts.y, parts.m - 1, parts.d)).getUTCDay();
  return DAYS[dayIndex] ?? "";
}

/** ("08:00","Asia/Jakarta") -> "08.00 WIB" */
export function formatTime(time: string, timezone: string): string {
  return `${time.replace(":", ".")} ${zoneInfo(timezone).label}`;
}

/** ("11:00","14:00","Asia/Jakarta") -> "11.00 – 14.00 WIB"; tanpa end -> "11.00 WIB" */
export function formatTimeRange(start: string, end: string | null, timezone: string): string {
  if (!end) return formatTime(start, timezone);
  return `${start.replace(":", ".")} – ${formatTime(end, timezone)}`;
}

/** ISO UTC -> "20 Des 2026, 10.32 WIB" menurut timezone wedding. */
export function formatWishDate(iso: string, timezone: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return "";
  const zone = zoneInfo(timezone);
  const local = new Date(ms + zone.minutes * 60_000);
  const hh = String(local.getUTCHours()).padStart(2, "0");
  const mm = String(local.getUTCMinutes()).padStart(2, "0");
  return `${local.getUTCDate()} ${MONTHS_SHORT[local.getUTCMonth()]} ${local.getUTCFullYear()}, ${hh}.${mm} ${zone.label}`;
}
