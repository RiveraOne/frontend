/**
 * Shared helpers for API route tests. Tests in this directory exercise
 * Next.js route handlers directly: build a Request, invoke POST/GET, and
 * inspect the returned NextResponse.
 */

export type RequestInit_ = RequestInit & { headers?: Record<string, string> };

export function makeRequest(url: string, init: RequestInit_ = {}): Request {
  const headers = new Headers(init.headers ?? {});
  return new Request(url, { ...init, headers });
}

export function bearer(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export async function readJson<T = unknown>(response: Response): Promise<T> {
  return (await response.json()) as T;
}
