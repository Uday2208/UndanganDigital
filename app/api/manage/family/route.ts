import { fail, isSameOrigin, logError, ok, GENERIC_ERROR_MESSAGE } from "@/lib/api";
import { verifyManagementKey } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { getWedding } from "@/lib/wedding";
import { FamilySide } from "@prisma/client";
import { z } from "zod";

export const dynamic = "force-dynamic";

const addFamilySchema = z.object({
  key: z.string(),
  side: z.enum(["pria", "wanita"]),
  name: z.string().min(1).max(120),
  role: z.string().min(1).max(120),
  sortOrder: z.number().int().default(0),
});

const deleteFamilySchema = z.object({
  key: z.string(),
  id: z.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) return fail("Permintaan ditolak.", 403);

    const body: unknown = await request.json();
    const parsed = addFamilySchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Data tidak valid.", 400);
    }

    const { key, side, name, role, sortOrder } = parsed.data;
    if (!verifyManagementKey(key)) return fail("Akses ditolak.", 403);

    const wedding = await getWedding();
    if (!wedding) return fail("Undangan tidak ditemukan.", 404);

    const created = await prisma.family.create({
      data: {
        weddingId: BigInt(wedding.id),
        side: side === "pria" ? FamilySide.pria : FamilySide.wanita,
        name,
        role,
        sortOrder,
      },
    });

    return ok({
      id: Number(created.id),
      side: created.side,
      name: created.name,
      role: created.role,
      sortOrder: created.sortOrder,
    }, 201);
  } catch (error) {
    logError("POST /api/manage/family", error);
    return fail(GENERIC_ERROR_MESSAGE, 500);
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isSameOrigin(request)) return fail("Permintaan ditolak.", 403);

    const body: unknown = await request.json();
    const parsed = deleteFamilySchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Data tidak valid.", 400);
    }

    const { key, id } = parsed.data;
    if (!verifyManagementKey(key)) return fail("Akses ditolak.", 403);

    await prisma.family.delete({
      where: { id: BigInt(id) },
    });

    return ok({ id, deleted: true });
  } catch (error) {
    logError("DELETE /api/manage/family", error);
    return fail(GENERIC_ERROR_MESSAGE, 500);
  }
}
