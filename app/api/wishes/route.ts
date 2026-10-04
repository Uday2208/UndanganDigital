import { fail, getClientIp, isSameOrigin, logError, ok, GENERIC_ERROR_MESSAGE } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { parseCursor, parseLimit, wishSchema } from "@/lib/validation";
import { createWish, getWedding, getWishes, WISHES_DEFAULT_LIMIT, WISHES_MAX_LIMIT } from "@/lib/wedding";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 4096;
// Proteksi dasar in-memory (lihat lib/rate-limit.ts): 5 ucapan per 10 menit per IP.
const POST_LIMIT = 5;
const POST_WINDOW_MS = 10 * 60 * 1000;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get("limit"), WISHES_DEFAULT_LIMIT, WISHES_MAX_LIMIT);

    const rawCursor = searchParams.get("cursor");
    const cursor = parseCursor(rawCursor);
    if (rawCursor !== null && cursor === null) return fail("Parameter cursor tidak valid.", 400);

    const wedding = await getWedding();
    if (!wedding) return fail("Undangan tidak ditemukan.", 404);
    return ok(await getWishes(wedding.id, { limit, cursor }));
  } catch {
    return fail(GENERIC_ERROR_MESSAGE, 500);
  }
}

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) return fail("Permintaan ditolak.", 403);

    const limited = rateLimit(`wish:${getClientIp(request)}`, POST_LIMIT, POST_WINDOW_MS);
    if (!limited.allowed) {
      return fail("Terlalu banyak percobaan. Silakan coba lagi beberapa menit lagi.", 429, {
        "Retry-After": String(limited.retryAfterSeconds),
      });
    }

    const raw = await request.text();
    if (raw.length === 0 || raw.length > MAX_BODY_BYTES) return fail("Data tidak valid.", 400);

    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return fail("Data tidak valid.", 400);
    }
    if (typeof json !== "object" || json === null || Array.isArray(json)) return fail("Data tidak valid.", 400);

    const parsed = wishSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Data tidak valid.", 400);
    }

    // Honeypot terisi => bot. Balas seolah berhasil tanpa menyimpan apa pun.
    if (parsed.data.website && parsed.data.website.trim() !== "") {
      return ok({ saved: false }, 201);
    }

    // wedding_id ditentukan server, tidak pernah dari request.
    const wedding = await getWedding();
    if (!wedding) return fail("Undangan tidak ditemukan.", 404);

    const wish = await createWish(wedding.id, parsed.data);
    return ok(wish, 201);
  } catch (error) {
    logError("POST /api/wishes", error);
    return fail("Maaf, ucapan belum dapat dikirim. Silakan coba kembali.", 500);
  }
}
