// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";

const { useAuth, useRouter } = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({ useAuth }));
vi.mock("next/navigation", () => ({ useRouter }));

import HomeAuthRedirect from "./home-auth-redirect";

const replace = vi.fn();

beforeEach(() => {
  replace.mockReset();
  useRouter.mockReturnValue({ replace, push: vi.fn(), refresh: vi.fn() });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("HomeAuthRedirect", () => {
  it("redirects logged-in users from / to /dashboard", async () => {
    useAuth.mockReturnValue({ user: { uid: "u-1" }, loading: false });

    render(<HomeAuthRedirect />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("does not redirect logged-out users", () => {
    useAuth.mockReturnValue({ user: null, loading: false });

    render(<HomeAuthRedirect />);

    expect(replace).not.toHaveBeenCalled();
  });

  it("does not redirect while auth is loading", () => {
    useAuth.mockReturnValue({ user: null, loading: true });

    render(<HomeAuthRedirect />);

    expect(replace).not.toHaveBeenCalled();
  });
});
