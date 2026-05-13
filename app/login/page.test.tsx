// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const { useAuth, useRouter, useSearchParams, loginWithEmail, loginWithGoogle } =
  vi.hoisted(() => ({
    useAuth: vi.fn(),
    useRouter: vi.fn(),
    useSearchParams: vi.fn(),
    loginWithEmail: vi.fn(),
    loginWithGoogle: vi.fn(),
  }));

vi.mock("@/contexts/AuthContext", () => ({ useAuth }));
vi.mock("next/navigation", () => ({ useRouter, useSearchParams }));
vi.mock("@/lib/firebase", () => ({ loginWithEmail, loginWithGoogle, auth: {} }));

import LoginPage from "./page";

const push = vi.fn();
const replace = vi.fn();

beforeEach(() => {
  push.mockReset();
  replace.mockReset();
  loginWithEmail.mockReset();
  loginWithGoogle.mockReset();

  useRouter.mockReturnValue({ push, replace, refresh: vi.fn() });
  useSearchParams.mockReturnValue(new URLSearchParams());
  useAuth.mockReturnValue({ user: null, loading: false });
});

afterEach(() => {
  vi.clearAllMocks();
});

function fillForm(email: string, password: string) {
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } });
}

describe("LoginPage — submit", () => {
  it("redirects an already-authenticated user to /dashboard by default", async () => {
    useAuth.mockReturnValue({ user: { uid: "u-1" }, loading: false });

    render(<LoginPage />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("redirects an already-authenticated user to a safe redirect target", async () => {
    useAuth.mockReturnValue({ user: { uid: "u-1" }, loading: false });
    useSearchParams.mockReturnValue(new URLSearchParams({ redirect: "/settings" }));

    render(<LoginPage />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/settings");
    });
  });

  it("calls loginWithEmail and navigates to redirect target on success", async () => {
    loginWithEmail.mockResolvedValueOnce(undefined);
    useSearchParams.mockReturnValue(new URLSearchParams({ redirect: "/dashboard" }));

    render(<LoginPage />);
    fillForm("ada@example.com", "password123");
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(loginWithEmail).toHaveBeenCalledWith("ada@example.com", "password123");
    });
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("falls back to /pricing for unsafe redirect targets (open-redirect protection)", async () => {
    loginWithEmail.mockResolvedValueOnce(undefined);
    useSearchParams.mockReturnValue(
      new URLSearchParams({ redirect: "https://evil.example.com" })
    );

    render(<LoginPage />);
    fillForm("ada@example.com", "password123");
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/pricing");
    });
  });

  it("falls back to /pricing for /advisor (loop prevention)", async () => {
    loginWithEmail.mockResolvedValueOnce(undefined);
    useSearchParams.mockReturnValue(new URLSearchParams({ redirect: "/advisor" }));

    render(<LoginPage />);
    fillForm("ada@example.com", "password123");
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/pricing");
    });
  });

  it("displays a friendly error for auth/wrong-password", async () => {
    loginWithEmail.mockRejectedValueOnce({ code: "auth/wrong-password" });

    render(<LoginPage />);
    fillForm("ada@example.com", "wrong");
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/Incorrect email or password/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("displays a friendly error for auth/too-many-requests", async () => {
    loginWithEmail.mockRejectedValueOnce({ code: "auth/too-many-requests" });

    render(<LoginPage />);
    fillForm("a@b.c", "x");
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/Too many attempts/i)).toBeInTheDocument();
  });

  it("falls back to a generic error for unknown error codes", async () => {
    loginWithEmail.mockRejectedValueOnce({ code: "auth/unknown-thing" });

    render(<LoginPage />);
    fillForm("a@b.c", "x");
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/Something went wrong/i)).toBeInTheDocument();
  });

  it("disables the submit button while submitting", async () => {
    let resolve: (() => void) | undefined;
    loginWithEmail.mockImplementationOnce(
      () =>
        new Promise<void>((r) => {
          resolve = r;
        })
    );

    render(<LoginPage />);
    fillForm("a@b.c", "x");
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    const button = screen.getByRole("button", { name: /signing in/i });
    expect(button).toBeDisabled();

    resolve?.();
    await waitFor(() => {
      expect(loginWithEmail).toHaveBeenCalled();
    });
  });
});

describe("LoginPage — Google sign-in", () => {
  it("calls loginWithGoogle and navigates on success", async () => {
    loginWithGoogle.mockResolvedValueOnce(undefined);

    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));

    await waitFor(() => {
      expect(loginWithGoogle).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/pricing");
    });
  });

  it("shows a friendly error when the Google popup is closed", async () => {
    loginWithGoogle.mockRejectedValueOnce({ code: "auth/popup-closed-by-user" });

    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));

    expect(await screen.findByText(/popup was closed/i)).toBeInTheDocument();
  });
});

describe("LoginPage — already-logged-in redirect", () => {
  it("replaces with the redirect target when user is already authenticated", () => {
    useAuth.mockReturnValue({ user: { uid: "u-1" }, loading: false });
    useSearchParams.mockReturnValue(new URLSearchParams({ redirect: "/dashboard" }));

    render(<LoginPage />);
    expect(replace).toHaveBeenCalledWith("/dashboard");
  });
});
