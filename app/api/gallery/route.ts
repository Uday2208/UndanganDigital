import { fail, ok, GENERIC_ERROR_MESSAGE } from "@/lib/api";
import { parseLimit } from "@/lib/validation";
import { GALLERY_DEFAULT_LIMIT, GALLERY_MAX_LIMIT, getGallery, getWedding } from "@/lib/wedding";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get("limit"), GALLERY_DEFAULT_LIMIT, GALLERY_MAX_LIMIT);

    const wedding = await getWedding();
    if (!wedding) return fail("Undangan tidak ditemukan.", 404);
    return ok(await getGallery(wedding.id, limit));
  } catch {
    return fail(GENERIC_ERROR_MESSAGE, 500);
  }
}
