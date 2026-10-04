import { fail, isSameOrigin, logError, ok, GENERIC_ERROR_MESSAGE } from "@/lib/api";
import { verifyManagementKey } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { getWedding } from "@/lib/wedding";
import { z } from "zod";

export const dynamic = "force-dynamic";

const addGallerySchema = z.object({
  key: z.string(),
  imageUrl: z.string().min(1).max(500),
  altText: z.string().min(1).max(200),
  width: z.number().int().positive().default(1200),
  height: z.number().int().positive().default(1600),
  sortOrder: z.number().int().default(0),
});

const deleteGallerySchema = z.object({
  key: z.string(),
  id: z.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) return fail("Permintaan ditolak.", 403);

    const body: unknown = await request.json();
    const parsed = addGallerySchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Data tidak valid.", 400);
    }

    const { key, imageUrl, altText, width, height, sortOrder } = parsed.data;
    if (!verifyManagementKey(key)) return fail("Akses ditolak.", 403);

    const wedding = await getWedding();
    if (!wedding) return fail("Undangan tidak ditemukan.", 404);

    const created = await prisma.gallery.create({
      data: {
        weddingId: BigInt(wedding.id),
        imageUrl,
        altText,
        width,
        height,
        sortOrder,
      },
    });

    return ok({
      id: Number(created.id),
      imageUrl: created.imageUrl,
      altText: created.altText,
      width: created.width,
      height: created.height,
      sortOrder: created.sortOrder,
    }, 201);
  } catch (error) {
    logError("POST /api/manage/gallery", error);
    return fail(GENERIC_ERROR_MESSAGE, 500);
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isSameOrigin(request)) return fail("Permintaan ditolak.", 403);

    const body: unknown = await request.json();
    const parsed = deleteGallerySchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Data tidak valid.", 400);
    }

    const { key, id } = parsed.data;
    if (!verifyManagementKey(key)) return fail("Akses ditolak.", 403);

    await prisma.gallery.delete({
      where: { id: BigInt(id) },
    });

    return ok({ id, deleted: true });
  } catch (error) {
    logError("DELETE /api/manage/gallery", error);
    return fail(GENERIC_ERROR_MESSAGE, 500);
  }
}
