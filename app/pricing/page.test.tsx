// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { UserDoc } from "@/types/user";

const { useAuth, useRouter, useSearchParams, usePathname } = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
  usePathname: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({ useAuth }));
vi.mock("next/navigation", () => ({ useRouter, useSearchParams, usePathname }));

import PricingPage from "./page";

const push = vi.fn();
const fetchMock = vi.fn();

const baseDoc: UserDoc = {
  uid: "u-1",
  email: null,
  displayName: null,
  plan: "free",
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  subscriptionStatus: null,
  advisorQueriesUsed: 0,
  advisorQueriesResetAt: "2025-04-01T00:00:00.000Z",
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-04-01T00:00:00.000Z",
};

beforeEach(() => {
  push.mockReset();
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;

  useRouter.mockReturnValue({ push, replace: vi.fn(), refresh: vi.fn() });
  useSearchParams.mockReturnValue(new URLSearchParams());
  usePathname.mockReturnValue("/pricing");
  useAuth.mockReturnValue({
    user: null,
    loading: false,
    userDoc: null,
    userDocLoading: false,
  });
});

afterEach(() => {
  // @ts-expect-error reset
  delete globalThis.fetch;
  vi.clearAllMocks();
});

describe("PricingPage", () => {
  it("shows both plan tiers", () => {
    render(<PricingPage />);
    expect(document.body.textContent).toMatch(/essential/i);
    expect(document.body.textContent).toMatch(/pro/i);
  });

  it("redirects unauthenticated users to /register?redirect=/pricing on plan click", async () => {
    render(<PricingPage />);
    // Find a button that initiates checkout
    const buttons = screen.getAllByRole("button");
    const ctaButton = buttons.find((b) => /essential|pro|upgrade|select|choose/i.test(b.textContent ?? ""));
    expect(ctaButton).toBeDefined();

    fireEvent.click(ctaButton!);

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/register?redirect=/pricing");
    });
  });

  it("calls /api/stripe/checkout and redirects to data.url for authenticated users", async () => {
    useAuth.mockReturnValue({
      user: {
        uid: "u-1",
        getIdToken: vi.fn().mockResolvedValue("good-token"),
      },
      loading: false,
      userDoc: { ...baseDoc, plan: "free" },
      userDocLoading: false,
    });

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ url: "https://checkout.stripe.com/session_x" }),
    });

    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      writable: true,
      value: { href: "" },
    });

    render(<PricingPage />);
    const buttons = screen.getAllByRole("button");
    const ctaButton = buttons.find((b) => /essential|pro|upgrade|select|choose/i.test(b.textContent ?? ""));
    fireEvent.click(ctaButton!);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/stripe/checkout",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ Authorization: "Bearer good-token" }),
        })
      );
    });
    await waitFor(() => {
      expect(window.location.href).toBe("https://checkout.stripe.com/session_x");
    });

    Object.defineProperty(window, "location", {
      configurable: true,
      writable: true,
      value: originalLocation,
    });
  });

  it("shows the API error message inline when /api/stripe/checkout fails", async () => {
    useAuth.mockReturnValue({
      user: { uid: "u-1", getIdToken: vi.fn().mockResolvedValue("good-token") },
      loading: false,
      userDoc: { ...baseDoc, plan: "free" },
      userDocLoading: false,
    });

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 500,
      json: async () => ({ error: "Stripe price not configured for this plan" }),
    });

    render(<PricingPage />);
    const buttons = screen.getAllByRole("button");
    const ctaButton = buttons.find((b) => /essential|pro|upgrade|select|choose/i.test(b.textContent ?? ""));
    fireEvent.click(ctaButton!);

    expect(await screen.findByText(/Stripe price not configured/i)).toBeInTheDocument();
  });

  it("shows the 'Current Plan ✓' badge when the user is already on that plan", () => {
    useAuth.mockReturnValue({
      user: { uid: "u-1", getIdToken: vi.fn() },
      loading: false,
      userDoc: { ...baseDoc, plan: "pro" },
      userDocLoading: false,
    });

    render(<PricingPage />);
    expect(screen.getAllByText(/Current Plan/).length).toBeGreaterThan(0);
  });
});
