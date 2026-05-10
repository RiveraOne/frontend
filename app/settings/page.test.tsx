// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { UserDoc } from "@/types/user";

const { useAuth, useRouter, useSearchParams, usePathname, logout, resetPassword, updateProfile } =
  vi.hoisted(() => ({
    useAuth: vi.fn(),
    useRouter: vi.fn(),
    useSearchParams: vi.fn(),
    usePathname: vi.fn(),
    logout: vi.fn(),
    resetPassword: vi.fn(),
    updateProfile: vi.fn(),
  }));

vi.mock("@/contexts/AuthContext", () => ({ useAuth }));
vi.mock("next/navigation", () => ({ useRouter, useSearchParams, usePathname }));
vi.mock("@/lib/firebase", () => ({
  logout,
  resetPassword,
  auth: { currentUser: { reload: vi.fn() } },
}));
vi.mock("firebase/auth", () => ({ updateProfile }));

import SettingsPage from "./page";

const push = vi.fn();
const fetchMock = vi.fn();

const baseDoc: UserDoc = {
  uid: "u-1",
  email: "ada@example.com",
  displayName: "Ada Lovelace",
  plan: "pro",
  stripeCustomerId: "cus_1",
  stripeSubscriptionId: "sub_1",
  subscriptionStatus: "active",
  advisorQueriesUsed: 5,
  advisorQueriesResetAt: "2025-04-01T00:00:00.000Z",
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-04-01T00:00:00.000Z",
};

beforeEach(() => {
  push.mockReset();
  fetchMock.mockReset();
  logout.mockReset();
  resetPassword.mockReset();
  updateProfile.mockReset();

  globalThis.fetch = fetchMock as unknown as typeof fetch;
  useRouter.mockReturnValue({ push, replace: vi.fn(), refresh: vi.fn() });
  useSearchParams.mockReturnValue(new URLSearchParams());
  usePathname.mockReturnValue("/settings");
  useAuth.mockReturnValue({
    user: {
      uid: "u-1",
      email: "ada@example.com",
      displayName: "Ada Lovelace",
      getIdToken: vi.fn().mockResolvedValue("good-token"),
    },
    loading: false,
    userDoc: baseDoc,
    userDocLoading: false,
  });
});

afterEach(() => {
  // @ts-expect-error reset
  delete globalThis.fetch;
  vi.clearAllMocks();
});

describe("SettingsPage", () => {
  it("renders the user's name and email", () => {
    render(<SettingsPage />);
    expect(screen.getAllByText(/Ada Lovelace/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/ada@example\.com/).length).toBeGreaterThan(0);
  });

  it("displays the current plan from userDoc", () => {
    render(<SettingsPage />);
    expect(document.body.textContent).toMatch(/pro/i);
  });

  it("shows the upgraded banner when ?upgraded=1 is present", () => {
    useSearchParams.mockReturnValue(new URLSearchParams({ upgraded: "1" }));
    render(<SettingsPage />);
    expect(document.body.textContent).toMatch(/upgraded|welcome|thanks/i);
  });

  it("signs out and redirects to / on Sign Out click", async () => {
    logout.mockResolvedValueOnce(undefined);
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole("button", { name: /sign out/i }));

    await waitFor(() => {
      expect(logout).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/");
    });
  });

  it("requests a password reset and shows confirmation", async () => {
    resetPassword.mockResolvedValueOnce(undefined);
    render(<SettingsPage />);

    // The page labels the password-reset action button "Change".
    fireEvent.click(screen.getByRole("button", { name: /^change$/i }));

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith("ada@example.com");
    });
    expect(await screen.findByText(/Reset link sent/i)).toBeInTheDocument();
  });

  it("opens the Stripe billing portal when 'Manage billing' is clicked", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ url: "https://billing.stripe.com/portal_x" }),
    });

    // Mock window.location with a writable href
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      writable: true,
      value: { href: "" },
    });

    render(<SettingsPage />);
    fireEvent.click(screen.getByRole("button", { name: /manage billing/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/stripe/portal",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ Authorization: "Bearer good-token" }),
        })
      );
    });

    await waitFor(() => {
      expect(window.location.href).toBe("https://billing.stripe.com/portal_x");
    });

    Object.defineProperty(window, "location", {
      configurable: true,
      writable: true,
      value: originalLocation,
    });
  });
});
