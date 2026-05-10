// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const { useAuth, useRouter, usePathname, useSearchParams } = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({ useAuth }));
vi.mock("next/navigation", () => ({ useRouter, usePathname, useSearchParams }));

import ProtectedRoute from "./protected-route";

const replace = vi.fn();

beforeEach(() => {
  replace.mockReset();
  useRouter.mockReturnValue({ replace, push: vi.fn(), refresh: vi.fn() });
  usePathname.mockReturnValue("/dashboard");
  useSearchParams.mockReturnValue(new URLSearchParams());
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("ProtectedRoute", () => {
  it("renders the loading skeleton while auth is initializing", () => {
    useAuth.mockReturnValue({ user: null, loading: true });

    render(
      <ProtectedRoute>
        <div data-testid="content">protected</div>
      </ProtectedRoute>
    );

    expect(screen.queryByTestId("content")).toBeNull();
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects to /login with the current path encoded when unauthenticated", () => {
    useAuth.mockReturnValue({ user: null, loading: false });
    usePathname.mockReturnValue("/ledger/abc-123");

    render(
      <ProtectedRoute>
        <div>x</div>
      </ProtectedRoute>
    );

    expect(replace).toHaveBeenCalledWith(
      `/login?redirect=${encodeURIComponent("/ledger/abc-123")}`
    );
  });

  it("preserves search params when redirecting", () => {
    useAuth.mockReturnValue({ user: null, loading: false });
    usePathname.mockReturnValue("/ledger");
    useSearchParams.mockReturnValue(new URLSearchParams("month=2025-04&type=Expense"));

    render(
      <ProtectedRoute>
        <div>x</div>
      </ProtectedRoute>
    );

    expect(replace).toHaveBeenCalledWith(
      `/login?redirect=${encodeURIComponent("/ledger?month=2025-04&type=Expense")}`
    );
  });

  it("renders children when authenticated", () => {
    useAuth.mockReturnValue({ user: { uid: "u-1" }, loading: false });

    render(
      <ProtectedRoute>
        <div data-testid="content">protected</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId("content").textContent).toBe("protected");
    expect(replace).not.toHaveBeenCalled();
  });

  it("does not redirect while loading is still true even with no user", () => {
    useAuth.mockReturnValue({ user: null, loading: true });

    render(
      <ProtectedRoute>
        <div>x</div>
      </ProtectedRoute>
    );

    expect(replace).not.toHaveBeenCalled();
  });
});
