// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const { useAuth, useRouter, useSearchParams, registerWithEmail, loginWithGoogle } =
  vi.hoisted(() => ({
    useAuth: vi.fn(),
    useRouter: vi.fn(),
    useSearchParams: vi.fn(),
    registerWithEmail: vi.fn(),
    loginWithGoogle: vi.fn(),
  }));

vi.mock("@/contexts/AuthContext", () => ({ useAuth }));
vi.mock("next/navigation", () => ({ useRouter, useSearchParams }));
vi.mock("@/lib/firebase", () => ({ registerWithEmail, loginWithGoogle, auth: {} }));

import RegisterPage from "./page";

const push = vi.fn();
const replace = vi.fn();

beforeEach(() => {
  push.mockReset();
  replace.mockReset();
  registerWithEmail.mockReset();
  loginWithGoogle.mockReset();
  useRouter.mockReturnValue({ push, replace, refresh: vi.fn() });
  useSearchParams.mockReturnValue(new URLSearchParams());
  useAuth.mockReturnValue({ user: null, loading: false });
});

afterEach(() => {
  vi.clearAllMocks();
});

function fillForm(name: string, email: string, password: string) {
  fireEvent.change(screen.getByLabelText(/^Full name|name/i), {
    target: { value: name },
  });
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } });
}

describe("RegisterPage — submit", () => {
  it("redirects an already-authenticated user to /dashboard by default", async () => {
    useAuth.mockReturnValue({ user: { uid: "u-1" }, loading: false });

    render(<RegisterPage />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("redirects an already-authenticated user to a safe redirect target", async () => {
    useAuth.mockReturnValue({ user: { uid: "u-1" }, loading: false });
    useSearchParams.mockReturnValue(new URLSearchParams({ redirect: "/settings" }));

    render(<RegisterPage />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/settings");
    });
  });

  it("calls registerWithEmail and navigates to /pricing on success", async () => {
    registerWithEmail.mockResolvedValueOnce(undefined);

    render(<RegisterPage />);
    fillForm("Ada Lovelace", "ada@example.com", "password123");
    fireEvent.click(screen.getByRole("button", { name: /create.*account|get started|sign up|register/i }));

    await waitFor(() => {
      expect(registerWithEmail).toHaveBeenCalledWith(
        "Ada Lovelace",
        "ada@example.com",
        "password123"
      );
    });
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/pricing");
    });
  });

  it("shows friendly error for auth/email-already-in-use", async () => {
    registerWithEmail.mockRejectedValueOnce({ code: "auth/email-already-in-use" });

    render(<RegisterPage />);
    fillForm("Ada", "taken@example.com", "password123");
    fireEvent.click(screen.getByRole("button", { name: /create.*account|get started|sign up|register/i }));

    expect(await screen.findByText(/already (in use|registered|exists)|email.*used/i)).toBeInTheDocument();
  });

  it("shows friendly error for auth/weak-password", async () => {
    registerWithEmail.mockRejectedValueOnce({ code: "auth/weak-password" });

    render(<RegisterPage />);
    fillForm("Ada", "a@b.c", "weak");
    fireEvent.click(screen.getByRole("button", { name: /create.*account|get started|sign up|register/i }));

    expect(await screen.findByText(/(weak|stronger|password)/i)).toBeInTheDocument();
  });

  it("shows friendly error for auth/invalid-email", async () => {
    registerWithEmail.mockRejectedValueOnce({ code: "auth/invalid-email" });

    render(<RegisterPage />);
    fillForm("Ada", "not-an-email", "password123");
    fireEvent.click(screen.getByRole("button", { name: /create.*account|get started|sign up|register/i }));

    expect(await screen.findByText(/email/i)).toBeInTheDocument();
  });

  it("respects safeAuthRedirect for the redirect query param", async () => {
    registerWithEmail.mockResolvedValueOnce(undefined);
    useSearchParams.mockReturnValue(new URLSearchParams({ redirect: "/dashboard" }));

    render(<RegisterPage />);
    fillForm("Ada", "ada@example.com", "password123");
    fireEvent.click(screen.getByRole("button", { name: /create.*account|get started|sign up|register/i }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("rejects an unsafe redirect target by falling back to /pricing", async () => {
    registerWithEmail.mockResolvedValueOnce(undefined);
    useSearchParams.mockReturnValue(
      new URLSearchParams({ redirect: "//evil.example.com" })
    );

    render(<RegisterPage />);
    fillForm("Ada", "ada@example.com", "password123");
    fireEvent.click(screen.getByRole("button", { name: /create.*account|get started|sign up|register/i }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/pricing");
    });
  });
});

describe("RegisterPage — Google sign-up", () => {
  it("calls loginWithGoogle and navigates on success", async () => {
    loginWithGoogle.mockResolvedValueOnce(undefined);

    render(<RegisterPage />);
    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));

    await waitFor(() => {
      expect(loginWithGoogle).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/pricing");
    });
  });
});
