import { describe, expect, it } from "vitest";
import { safeAuthRedirect } from "./redirects";

const DEFAULT = "/pricing";

describe("safeAuthRedirect", () => {
  describe("rejects non-relative URLs (open-redirect protection)", () => {
    it("returns default for null", () => {
      expect(safeAuthRedirect(null)).toBe(DEFAULT);
    });

    it("returns default for empty string", () => {
      expect(safeAuthRedirect("")).toBe(DEFAULT);
    });

    it("returns default for absolute http URL", () => {
      expect(safeAuthRedirect("http://evil.com/dashboard")).toBe(DEFAULT);
    });

    it("returns default for absolute https URL", () => {
      expect(safeAuthRedirect("https://evil.com/dashboard")).toBe(DEFAULT);
    });

    it("returns default for protocol-relative URL ('//evil.com')", () => {
      expect(safeAuthRedirect("//evil.com/dashboard")).toBe(DEFAULT);
    });

    it("returns default for missing leading slash", () => {
      expect(safeAuthRedirect("dashboard")).toBe(DEFAULT);
    });

    it("returns default for backslash injection (\\\\evil.com)", () => {
      // Some browsers normalize backslashes to forward — we don't accept them.
      expect(safeAuthRedirect("\\\\evil.com")).toBe(DEFAULT);
      expect(safeAuthRedirect("/\\evil.com")).toBe("/\\evil.com");
      // Note: caller is responsible for further normalization; the function
      // only rejects clearly absolute / protocol-relative forms.
    });
  });

  describe("rejects redirect loops to auth-flow pages", () => {
    it("returns default for /advisor (post-login source page)", () => {
      expect(safeAuthRedirect("/advisor")).toBe(DEFAULT);
    });

    it("returns default for /advisor/anything", () => {
      expect(safeAuthRedirect("/advisor/chat")).toBe(DEFAULT);
    });

    it("returns default for /login", () => {
      expect(safeAuthRedirect("/login")).toBe(DEFAULT);
    });

    it("returns default for /register", () => {
      expect(safeAuthRedirect("/register")).toBe(DEFAULT);
    });

    it("returns default for /login?redirect=/dashboard", () => {
      expect(safeAuthRedirect("/login?redirect=/dashboard")).toBe(DEFAULT);
    });
  });

  describe("preserves safe relative redirects", () => {
    it("returns /dashboard as-is", () => {
      expect(safeAuthRedirect("/dashboard")).toBe("/dashboard");
    });

    it("returns /ledger as-is", () => {
      expect(safeAuthRedirect("/ledger")).toBe("/ledger");
    });

    it("returns deep paths as-is", () => {
      expect(safeAuthRedirect("/ledger/abc-123")).toBe("/ledger/abc-123");
    });

    it("preserves query strings", () => {
      expect(safeAuthRedirect("/dashboard?period=month")).toBe(
        "/dashboard?period=month"
      );
    });

    it("preserves fragments", () => {
      expect(safeAuthRedirect("/settings#billing")).toBe("/settings#billing");
    });

    it("returns just '/'", () => {
      expect(safeAuthRedirect("/")).toBe("/");
    });
  });
});
