import { fail, isSameOrigin, logError, ok, GENERIC_ERROR_MESSAGE } from "@/lib/api";
import { verifyManagementKey } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { getWedding } from "@/lib/wedding";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateWeddingSchema = z.object({
  key: z.string(),
  groomName: z.string().min(1).max(80),
  groomFullName: z.string().min(1).max(150),
  groomParents: z.string().min(1).max(200),
  groomPhoto: z.string().max(500).nullable().optional(),
  brideName: z.string().min(1).max(80),
  brideFullName: z.string().min(1).max(150),
  brideParents: z.string().min(1).max(200),
  bridePhoto: z.string().max(500).nullable().optional(),
  coverImage: z.string().max(500).nullable().optional(),
  quote: z.string().max(500).nullable().optional(),
  quoteSource: z.string().max(120).nullable().optional(),
  weddingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  akadDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal akad harus YYYY-MM-DD"),
  receptionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal resepsi harus YYYY-MM-DD"),
  akadTime: z.string().regex(/^\d{2}:\d{2}$/, "Format jam akad harus HH:mm"),
  receptionTime: z.string().regex(/^\d{2}:\d{2}$/, "Format jam resepsi harus HH:mm"),
  receptionEndTime: z.string().regex(/^\d{2}:\d{2}$/, "Format jam selesai resepsi harus HH:mm").nullable().optional(),
  timezone: z.string().default("Asia/Jakarta"),
  familyTitle: z.string().min(1).max(100).default("Turut Mengundang"),
  venueName: z.string().min(1).max(150),
  venueAddress: z.string().min(1).max(300),
  mapsUrl: z.string().max(500).nullable().optional(),
  bankName: z.string().max(60).nullable().optional(),
  bankAccountNumber: z.string().max(40).nullable().optional(),
  bankAccountHolder: z.string().max(120).nullable().optional(),
  ewalletName: z.string().max(60).nullable().optional(),
  ewalletNumber: z.string().max(40).nullable().optional(),
  ewalletHolder: z.string().max(120).nullable().optional(),
  qrisImage: z.string().max(500).nullable().optional(),
  musicUrl: z.string().max(500).nullable().optional(),
  musicTitle: z.string().max(150).nullable().optional(),
});

export async function PUT(request: Request) {
  try {
    if (!isSameOrigin(request)) return fail("Permintaan ditolak.", 403);

    const body: unknown = await request.json();
    const parsed = updateWeddingSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Data tidak valid.", 400);
    }

    const { key, ...data } = parsed.data;

    if (!verifyManagementKey(key)) {
      return fail("Akses ditolak. Kunci rahasia tidak valid.", 403);
    }

    const wedding = await getWedding();
    if (!wedding) return fail("Undangan tidak ditemukan.", 404);

    const akadTimeDate = new Date(`1970-01-01T${data.akadTime}:00.000Z`);
    const receptionTimeDate = new Date(`1970-01-01T${data.receptionTime}:00.000Z`);
    const receptionEndTimeDate = data.receptionEndTime
      ? new Date(`1970-01-01T${data.receptionEndTime}:00.000Z`)
      : null;

    const updated = await prisma.wedding.update({
      where: { id: BigInt(wedding.id) },
      data: {
        groomName: data.groomName,
        groomFullName: data.groomFullName,
        groomParents: data.groomParents,
        groomPhoto: data.groomPhoto || null,
        brideName: data.brideName,
        brideFullName: data.brideFullName,
        brideParents: data.brideParents,
        bridePhoto: data.bridePhoto || null,
        coverImage: data.coverImage || null,
        quote: data.quote || null,
        quoteSource: data.quoteSource || null,
        weddingDate: new Date(`${data.akadDate}T00:00:00.000Z`),
        akadDate: new Date(`${data.akadDate}T00:00:00.000Z`),
        receptionDate: new Date(`${data.receptionDate}T00:00:00.000Z`),
        akadTime: akadTimeDate,
        receptionTime: receptionTimeDate,
        receptionEndTime: receptionEndTimeDate,
        familyTitle: data.familyTitle || "Turut Mengundang",
        venueName: data.venueName,
        venueAddress: data.venueAddress,
        mapsUrl: data.mapsUrl || null,
        bankName: data.bankName || null,
        bankAccountNumber: data.bankAccountNumber || null,
        bankAccountHolder: data.bankAccountHolder || null,
        ewalletName: data.ewalletName || null,
        ewalletNumber: data.ewalletNumber || null,
        ewalletHolder: data.ewalletHolder || null,
        qrisImage: data.qrisImage || null,
        musicUrl: data.musicUrl || null,
        musicTitle: data.musicTitle || null,
      },
    });

    return ok({ id: Number(updated.id), updated: true });
  } catch (error) {
    logError("PUT /api/manage/wedding", error);
    return fail(GENERIC_ERROR_MESSAGE, 500);
  }
}
