// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { UserDoc } from "@/types/user";

const { useAuth, useRouter, usePathname, logout } = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({ useAuth }));
vi.mock("next/navigation", () => ({ useRouter, usePathname }));
vi.mock("@/lib/firebase", () => ({ logout, auth: {} }));

import Navbar from "./navbar";

const push = vi.fn();
const baseDoc: UserDoc = {
  uid: "u-1",
  email: "ada@example.com",
  displayName: "Ada Lovelace",
  plan: "free",
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  subscriptionStatus: null,
  advisorQueriesUsed: 0,
  advisorQueriesResetAt: "2025-04-01T00:00:00.000Z",
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-04-01T00:00:00.000Z",
};

function mockLoggedOut() {
  useAuth.mockReturnValue({
    user: null,
    loading: false,
    userDoc: null,
    userDocLoading: false,
  });
}

function mockLoggedIn(userDoc: UserDoc = baseDoc) {
  useAuth.mockReturnValue({
    user: {
      displayName: "Ada Lovelace",
      email: "ada@example.com",
      photoURL: null,
    },
    loading: false,
    userDoc,
    userDocLoading: false,
  });
}

beforeEach(() => {
  push.mockReset();
  logout.mockReset();
  useRouter.mockReturnValue({ push, replace: vi.fn(), refresh: vi.fn() });
  usePathname.mockReturnValue("/");
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Navbar — logged-out", () => {
  it("shows marketing links and Login + Get Started CTAs", () => {
    mockLoggedOut();
    render(<Navbar />);

    expect(screen.getAllByRole("link", { name: /^home$/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /^pricing$/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /login/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /get started/i }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: /^dashboard$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^ledger$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^advisor$/i })).not.toBeInTheDocument();
  });

  it("shows a skeleton placeholder while auth is loading", () => {
    useAuth.mockReturnValue({ user: null, loading: true, userDoc: null, userDocLoading: true });
    const { container } = render(<Navbar />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});

describe("Navbar — logged-in", () => {
  it("shows the user menu trigger when authenticated", () => {
    mockLoggedIn();
    render(<Navbar />);

    expect(screen.getByText("Ada")).toBeInTheDocument();
  });

  it("shows app links plus Pricing for a free user", () => {
    mockLoggedIn({ ...baseDoc, plan: "free", subscriptionStatus: null });
    render(<Navbar />);

    expect(screen.getAllByRole("link", { name: /^dashboard$/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /^ledger$/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /^advisor$/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /^pricing$/i }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: /^home$/i })).not.toBeInTheDocument();
  });

  it("shows app links but hides primary Pricing for an active paid user", () => {
    mockLoggedIn({ ...baseDoc, plan: "pro", subscriptionStatus: "active" });
    render(<Navbar />);

    expect(screen.getAllByRole("link", { name: /^dashboard$/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /^ledger$/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /^advisor$/i }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: /^pricing$/i })).not.toBeInTheDocument();
  });

  it("uses the same link policy in the mobile menu", () => {
    mockLoggedIn({ ...baseDoc, plan: "essential", subscriptionStatus: "active" });
    render(<Navbar />);

    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));

    expect(screen.getAllByRole("link", { name: /^dashboard$/i }).length).toBeGreaterThan(1);
    expect(screen.getAllByRole("link", { name: /^ledger$/i }).length).toBeGreaterThan(1);
    expect(screen.getAllByRole("link", { name: /^advisor$/i }).length).toBeGreaterThan(1);
    expect(screen.queryByRole("link", { name: /^pricing$/i })).not.toBeInTheDocument();
  });

  it("logs out and navigates to home when 'Sign out' is clicked", async () => {
    mockLoggedIn();
    logout.mockResolvedValueOnce(undefined);

    render(<Navbar />);

    // Open the user menu
    fireEvent.click(screen.getByText("Ada"));
    const signOut = await screen.findByText(/sign out/i);
    fireEvent.click(signOut);

    await waitFor(() => {
      expect(logout).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/");
    });
  });
});

describe("Navbar — active link highlighting", () => {
  it("marks the current pathname as active", () => {
    mockLoggedOut();
    usePathname.mockReturnValue("/pricing");
    render(<Navbar />);

    const pricingLink = screen.getAllByRole("link", { name: /pricing/i })[0];
    expect(pricingLink.className).toMatch(/text-mw-primary/);
  });
});
