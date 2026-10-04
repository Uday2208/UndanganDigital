import "server-only";
import { NextResponse } from "next/server";
import type { ApiFailure, ApiSuccess } from "@/lib/types";

export function ok<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data }, { status, headers: { "Cache-Control": "no-store" } });
}

export function fail(message: string, status: number, extraHeaders?: Record<string, string>): NextResponse<ApiFailure> {
  return NextResponse.json(
    { success: false, message },
    { status, headers: { "Cache-Control": "no-store", ...extraHeaders } },
  );
}

export const GENERIC_ERROR_MESSAGE = "Maaf, data belum dapat dimuat. Silakan coba kembali.";

/** Log aman: hanya scope, nama error, dan kode. Tidak pernah mencetak pesan/stack (bisa memuat kredensial/path). */
export function logError(scope: string, error: unknown): void {
  const name = error instanceof Error ? error.name : "UnknownError";
  const code =
    typeof error === "object" && error !== null && "code" in error && typeof (error as { code: unknown }).code === "string"
      ? (error as { code: string }).code
      : undefined;
  console.error(`[${scope}] ${name}${code ? ` (${code})` : ""}`);
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  return request.headers.get("x-real-ip")?.slice(0, 64) ?? "unknown";
}

/** Tolak POST lintas-origin: jika header Origin ada, host-nya harus sama dengan host aplikasi. */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
