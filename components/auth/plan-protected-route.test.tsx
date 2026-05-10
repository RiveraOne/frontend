// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { UserDoc } from "@/types/user";

const { useAuth, useRouter, usePathname, useSearchParams } = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({ useAuth }));
vi.mock("next/navigation", () => ({ useRouter, usePathname, useSearchParams }));

import PlanProtectedRoute from "./plan-protected-route";

const replace = vi.fn();

const baseDoc: UserDoc = {
  uid: "u-1",
  email: null,
  displayName: null,
  plan: "pro",
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  subscriptionStatus: "active",
  advisorQueriesUsed: 0,
  advisorQueriesResetAt: "2025-04-01T00:00:00.000Z",
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-04-01T00:00:00.000Z",
};

beforeEach(() => {
  replace.mockReset();
  useRouter.mockReturnValue({ replace, push: vi.fn(), refresh: vi.fn() });
  usePathname.mockReturnValue("/advisor");
  useSearchParams.mockReturnValue(new URLSearchParams());
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("PlanProtectedRoute — wraps in ProtectedRoute", () => {
  it("redirects to /login when unauthenticated (delegates to ProtectedRoute)", () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      userDoc: null,
      userDocLoading: false,
    });

    render(
      <PlanProtectedRoute>
        <div>x</div>
      </PlanProtectedRoute>
    );

    expect(replace).toHaveBeenCalledWith(
      expect.stringMatching(/^\/login\?redirect=/)
    );
  });
});

describe("PlanProtectedRoute — paid access", () => {
  it("renders children when user has an active paid plan", () => {
    useAuth.mockReturnValue({
      user: { uid: "u-1" },
      loading: false,
      userDoc: baseDoc,
      userDocLoading: false,
    });

    render(
      <PlanProtectedRoute>
        <div data-testid="content">advisor ui</div>
      </PlanProtectedRoute>
    );

    expect(screen.getByTestId("content").textContent).toBe("advisor ui");
    expect(replace).not.toHaveBeenCalled();
  });
});

describe("PlanProtectedRoute — unpaid access", () => {
  it("redirects to /pricing?reason=advisor when plan is free", () => {
    useAuth.mockReturnValue({
      user: { uid: "u-1" },
      loading: false,
      userDoc: { ...baseDoc, plan: "free", subscriptionStatus: null },
      userDocLoading: false,
    });

    render(
      <PlanProtectedRoute>
        <div>x</div>
      </PlanProtectedRoute>
    );

    expect(replace).toHaveBeenCalledWith("/pricing?reason=advisor");
  });

  it("redirects when paid plan but subscription is canceled", () => {
    useAuth.mockReturnValue({
      user: { uid: "u-1" },
      loading: false,
      userDoc: { ...baseDoc, plan: "pro", subscriptionStatus: "canceled" },
      userDocLoading: false,
    });

    render(
      <PlanProtectedRoute>
        <div>x</div>
      </PlanProtectedRoute>
    );

    expect(replace).toHaveBeenCalledWith("/pricing?reason=advisor");
  });

  it("renders the inline upgrade CTA fallback when no access", () => {
    useAuth.mockReturnValue({
      user: { uid: "u-1" },
      loading: false,
      userDoc: { ...baseDoc, plan: "free" },
      userDocLoading: false,
    });

    render(
      <PlanProtectedRoute>
        <div data-testid="content">x</div>
      </PlanProtectedRoute>
    );

    expect(screen.queryByTestId("content")).toBeNull();
    expect(screen.getByText(/View Pricing/i)).toBeInTheDocument();
  });
});

describe("PlanProtectedRoute — loading states", () => {
  it("does not redirect while userDocLoading is true", () => {
    useAuth.mockReturnValue({
      user: { uid: "u-1" },
      loading: false,
      userDoc: null,
      userDocLoading: true,
    });

    render(
      <PlanProtectedRoute>
        <div data-testid="content">x</div>
      </PlanProtectedRoute>
    );

    expect(replace).not.toHaveBeenCalled();
    expect(screen.queryByTestId("content")).toBeNull();
  });
});
