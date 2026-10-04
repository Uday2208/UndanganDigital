import "server-only";

export function getManagementSecret(): string {
  return process.env.MANAGEMENT_SECRET?.trim() || "rahasia123";
}

/** Verifikasi key yang dikirim via URL / header / query param */
export function verifyManagementKey(providedKey: string | null | undefined): boolean {
  if (!providedKey) return false;
  const expected = getManagementSecret();
  return providedKey.trim() === expected;
}
