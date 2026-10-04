import { fail, ok, GENERIC_ERROR_MESSAGE } from "@/lib/api";
import { getWedding } from "@/lib/wedding";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const wedding = await getWedding();
    if (!wedding) return fail("Undangan tidak ditemukan.", 404);
    return ok(wedding);
  } catch {
    return fail(GENERIC_ERROR_MESSAGE, 500);
  }
}
