function normalizeBaseUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

function isLocalOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
}

export function getAppBaseUrl(request: Request): string {
  const configured = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (configured) {
    const normalized = normalizeBaseUrl(configured);
    if (normalized) return normalized;
    throw new Error("APP_URL must be a valid http(s) URL.");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("APP_URL is required in production for payment redirects.");
  }

  const requestOrigin = request.headers.get("origin") ?? new URL(request.url).origin;
  return isLocalOrigin(requestOrigin) ? requestOrigin : "http://localhost:3000";
}
