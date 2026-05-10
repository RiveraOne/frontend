import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getAppBaseUrl } from "./appUrl";

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env = { ...originalEnv };
  delete process.env.APP_URL;
  delete process.env.NEXT_PUBLIC_APP_URL;
});

afterEach(() => {
  process.env = { ...originalEnv };
});

const req = (url: string, originHeader?: string): Request => {
  const headers = new Headers();
  if (originHeader) headers.set("origin", originHeader);
  return new Request(url, { headers });
};

describe("getAppBaseUrl — APP_URL takes precedence", () => {
  it("returns the origin of APP_URL", () => {
    process.env.APP_URL = "https://metrawealth.com/some/path";
    expect(getAppBaseUrl(req("http://localhost:3000/"))).toBe(
      "https://metrawealth.com"
    );
  });

  it("strips trailing slashes / paths down to origin", () => {
    process.env.APP_URL = "https://app.example.com/";
    expect(getAppBaseUrl(req("http://localhost:3000/"))).toBe(
      "https://app.example.com"
    );
  });

  it("accepts http for explicit configuration (e.g. preview environments)", () => {
    process.env.APP_URL = "http://staging.internal:8080";
    expect(getAppBaseUrl(req("http://localhost:3000/"))).toBe(
      "http://staging.internal:8080"
    );
  });

  it("throws when APP_URL is not a valid URL", () => {
    process.env.APP_URL = "not a url";
    expect(() => getAppBaseUrl(req("http://localhost:3000/"))).toThrow(
      /APP_URL must be a valid http/
    );
  });

  it("throws when APP_URL uses a non-http(s) protocol", () => {
    process.env.APP_URL = "ftp://example.com";
    expect(() => getAppBaseUrl(req("http://localhost:3000/"))).toThrow(
      /APP_URL must be a valid http/
    );
  });
});

describe("getAppBaseUrl — NEXT_PUBLIC_APP_URL fallback", () => {
  it("uses NEXT_PUBLIC_APP_URL when APP_URL is unset", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://public.example.com";
    expect(getAppBaseUrl(req("http://localhost:3000/"))).toBe(
      "https://public.example.com"
    );
  });

  it("APP_URL wins when both are set", () => {
    process.env.APP_URL = "https://server.example.com";
    process.env.NEXT_PUBLIC_APP_URL = "https://public.example.com";
    expect(getAppBaseUrl(req("http://localhost:3000/"))).toBe(
      "https://server.example.com"
    );
  });
});

describe("getAppBaseUrl — production must require explicit config", () => {
  it("throws in production when no APP_URL is set", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    expect(() => getAppBaseUrl(req("http://localhost:3000/"))).toThrow(
      /APP_URL is required in production/
    );
  });
});

describe("getAppBaseUrl — development fallback", () => {
  it("returns the request origin when it is localhost", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";
    expect(getAppBaseUrl(req("http://localhost:3000/foo", "http://localhost:3000"))).toBe(
      "http://localhost:3000"
    );
  });

  it("returns http://localhost:3000 when origin is non-local in dev", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";
    expect(getAppBaseUrl(req("http://example.com/", "http://example.com"))).toBe(
      "http://localhost:3000"
    );
  });

  it("uses request URL origin when no Origin header is supplied", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";
    expect(getAppBaseUrl(req("http://127.0.0.1:3000/"))).toBe("http://127.0.0.1:3000");
  });
});
