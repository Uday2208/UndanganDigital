import "server-only";
import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/api";
import { toIsoWithOffset } from "@/lib/datetime";
import { safeAudioSource, safeLocalPath, safeMapsUrl } from "@/lib/url";
import type {
  AttendanceValue,
  PublicFamily,
  PublicGalleryItem,
  PublicWedding,
  PublicWish,
  WishPage,
} from "@/lib/types";
import type { WishInput } from "@/lib/validation";

export const GALLERY_DEFAULT_LIMIT = 12;
export const GALLERY_MAX_LIMIT = 24;
export const WISHES_DEFAULT_LIMIT = 10;
export const WISHES_MAX_LIMIT = 20;

/** Error aman untuk ditampilkan; detail asli hanya masuk log server (tanpa kredensial). */
export class DataLoadError extends Error {
  constructor() {
    super("DATA_LOAD_FAILED");
    this.name = "DataLoadError";
  }
}

function timeToString(value: Date): string {
  // Kolom TIME dikembalikan Prisma sebagai Date 1970-01-01T HH:mm:ss Z
  return value.toISOString().slice(11, 16);
}

type WeddingRow = Prisma.WeddingGetPayload<object>;

function toPublicWedding(row: WeddingRow): PublicWedding {
  const weddingDate = row.weddingDate.toISOString().slice(0, 10);
  const akadDate = row.akadDate ? row.akadDate.toISOString().slice(0, 10) : weddingDate;
  const receptionDate = row.receptionDate ? row.receptionDate.toISOString().slice(0, 10) : weddingDate;
  const akadTime = timeToString(row.akadTime);
  const receptionTime = timeToString(row.receptionTime);

  return {
    id: Number(row.id),
    slug: row.slug,
    groomName: row.groomName,
    groomFullName: row.groomFullName,
    groomParents: row.groomParents,
    groomPhoto: safeLocalPath(row.groomPhoto),
    brideName: row.brideName,
    brideFullName: row.brideFullName,
    brideParents: row.brideParents,
    bridePhoto: safeLocalPath(row.bridePhoto),
    coverImage: safeLocalPath(row.coverImage),
    quote: row.quote,
    quoteSource: row.quoteSource,
    weddingDate,
    akadDate,
    receptionDate,
    akadTime,
    receptionTime,
    receptionEndTime: row.receptionEndTime ? timeToString(row.receptionEndTime) : null,
    timezone: row.timezone,
    familyTitle: row.familyTitle || "Turut Mengundang",
    akadAt: toIsoWithOffset(akadDate, akadTime, row.timezone),
    receptionAt: toIsoWithOffset(receptionDate, receptionTime, row.timezone),
    venueName: row.venueName,
    venueAddress: row.venueAddress,
    mapsUrl: safeMapsUrl(row.mapsUrl),
    bankName: row.bankName,
    bankAccountNumber: row.bankAccountNumber,
    bankAccountHolder: row.bankAccountHolder,
    ewalletName: row.ewalletName,
    ewalletNumber: row.ewalletNumber,
    ewalletHolder: row.ewalletHolder,
    qrisImage: safeLocalPath(row.qrisImage),
    musicUrl: safeAudioSource(row.musicUrl),
    musicTitle: row.musicTitle,
  };
}

/**
 * Wedding ditentukan server dari WEDDING_SLUG; browser tidak pernah memilih wedding_id.
 * Mengembalikan null jika tidak ditemukan; melempar DataLoadError jika database gagal.
 */
export const getWedding = cache(async (): Promise<PublicWedding | null> => {
  const slug = process.env.WEDDING_SLUG?.trim();
  if (!slug) return null;

  try {
    const row = await prisma.wedding.findUnique({ where: { slug } });
    return row ? toPublicWedding(row) : null;
  } catch (error) {
    logError("getWedding", error);
    throw new DataLoadError();
  }
});

export async function getGallery(weddingId: number, limit = GALLERY_DEFAULT_LIMIT): Promise<PublicGalleryItem[]> {
  const take = Math.min(Math.max(1, limit), GALLERY_MAX_LIMIT);
  try {
    const rows = await prisma.gallery.findMany({
      where: { weddingId: BigInt(weddingId) },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      take,
    });
    return rows.flatMap((row) => {
      const imageUrl = safeLocalPath(row.imageUrl);
      if (!imageUrl) return [];
      return [
        {
          id: Number(row.id),
          imageUrl,
          altText: row.altText,
          width: row.width,
          height: row.height,
          sortOrder: row.sortOrder,
        },
      ];
    });
  } catch (error) {
    logError("getGallery", error);
    throw new DataLoadError();
  }
}

export async function getFamilies(weddingId: number): Promise<PublicFamily[]> {
  try {
    const rows = await prisma.family.findMany({
      where: { weddingId: BigInt(weddingId) },
      orderBy: [{ side: "asc" }, { sortOrder: "asc" }, { id: "asc" }],
      take: 50,
    });
    return rows.map((row) => ({
      id: Number(row.id),
      side: row.side,
      name: row.name,
      role: row.role,
      sortOrder: row.sortOrder,
    }));
  } catch (error) {
    logError("getFamilies", error);
    throw new DataLoadError();
  }
}

function toPublicWish(row: { id: bigint; guestName: string; message: string; attendance: AttendanceValue; createdAt: Date }): PublicWish {
  return {
    id: Number(row.id),
    guestName: row.guestName,
    message: row.message,
    attendance: row.attendance,
    createdAt: row.createdAt.toISOString(),
  };
}

/** Terbaru lebih dulu (created_at DESC). Cursor-based pagination memakai id. */
export async function getWishes(
  weddingId: number,
  options: { limit?: number; cursor?: bigint | null } = {},
): Promise<WishPage> {
  const limit = Math.min(Math.max(1, options.limit ?? WISHES_DEFAULT_LIMIT), WISHES_MAX_LIMIT);
  try {
    const rows = await prisma.wish.findMany({
      where: { weddingId: BigInt(weddingId) },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
    });
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map(toPublicWish);
    const last = items[items.length - 1];
    return { items, nextCursor: hasMore && last ? String(last.id) : null };
  } catch (error) {
    logError("getWishes", error);
    throw new DataLoadError();
  }
}

/**
 * Hanya field whitelist yang masuk ke Prisma. id, wedding_id, created_at dikontrol server.
 */
export async function createWish(weddingId: number, input: WishInput): Promise<PublicWish> {
  try {
    const row = await prisma.wish.create({
      data: {
        weddingId: BigInt(weddingId),
        guestName: input.guest_name,
        message: input.message,
        attendance: input.attendance,
      },
    });
    return toPublicWish(row);
  } catch (error) {
    logError("createWish", error);
    throw new DataLoadError();
  }
}
