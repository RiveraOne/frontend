// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

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
  it("shows Login + Get Started CTAs", () => {
    useAuth.mockReturnValue({ user: null, loading: false });
    render(<Navbar />);

    expect(screen.getAllByRole("link", { name: /login/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /get started/i }).length).toBeGreaterThan(0);
  });

  it("shows a skeleton placeholder while auth is loading", () => {
    useAuth.mockReturnValue({ user: null, loading: true });
    const { container } = render(<Navbar />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});

describe("Navbar — logged-in", () => {
  it("shows the user menu trigger when authenticated", () => {
    useAuth.mockReturnValue({
      user: { displayName: "Ada Lovelace", email: "ada@example.com", photoURL: null },
      loading: false,
    });
    render(<Navbar />);

    expect(screen.getByText("Ada")).toBeInTheDocument();
  });

  it("logs out and navigates to home when 'Sign out' is clicked", async () => {
    useAuth.mockReturnValue({
      user: { displayName: "Ada Lovelace", email: "ada@example.com", photoURL: null },
      loading: false,
    });
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
    useAuth.mockReturnValue({ user: null, loading: false });
    usePathname.mockReturnValue("/pricing");
    render(<Navbar />);

    const pricingLink = screen.getAllByRole("link", { name: /pricing/i })[0];
    expect(pricingLink.className).toMatch(/text-mw-primary/);
  });
});
