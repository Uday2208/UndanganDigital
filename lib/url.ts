/** Validasi URL/path yang berasal dari database. Data tetap dianggap tidak dipercaya. */

const MAPS_HOSTS = new Set(["www.google.com", "google.com", "maps.google.com", "maps.app.goo.gl", "goo.gl"]);

/** Path lokal aman, mis. "/images/a.jpg". Menolak "//host", "..", skema, spasi. */
export function safeLocalPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!/^\/[A-Za-z0-9_\-./]+$/.test(value)) return null;
  if (value.startsWith("//") || value.includes("..")) return null;
  return value;
}

/** URL https saja. */
export function safeHttpsUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** URL Google Maps yang disediakan data wedding; harus https dan host Google Maps. */
export function safeMapsUrl(value: string | null | undefined): string | null {
  const url = safeHttpsUrl(value);
  if (!url) return null;
  const parsed = new URL(url);
  if (!MAPS_HOSTS.has(parsed.hostname)) return null;
  if ((parsed.hostname === "www.google.com" || parsed.hostname === "google.com") && !parsed.pathname.startsWith("/maps")) {
    return null;
  }
  return url;
}

/** Sumber audio: path lokal atau https. */
export function safeAudioSource(value: string | null | undefined): string | null {
  return safeLocalPath(value) ?? safeHttpsUrl(value);
}
