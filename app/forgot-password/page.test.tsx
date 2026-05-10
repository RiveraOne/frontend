// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const { resetPassword } = vi.hoisted(() => ({ resetPassword: vi.fn() }));

vi.mock("@/lib/firebase", () => ({ resetPassword, auth: {} }));

import ForgotPasswordPage from "./page";

beforeEach(() => {
  resetPassword.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

function fillEmail(value: string) {
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value } });
}

describe("ForgotPasswordPage", () => {
  it("submits the email and shows the sent confirmation on success", async () => {
    resetPassword.mockResolvedValueOnce(undefined);

    render(<ForgotPasswordPage />);
    fillEmail("ada@example.com");
    fireEvent.click(screen.getByRole("button", { name: /reset|send|email/i }));

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith("ada@example.com");
    });
    // After success, the page renders some confirmation UI.
    // Multiple matches are fine — page may show the message in copy + heading.
    const matches = await screen.findAllByText(/check your (email|inbox)|sent|reset link/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("does NOT reveal account existence: user-not-found still shows the success state", async () => {
    resetPassword.mockRejectedValueOnce({ code: "auth/user-not-found" });

    render(<ForgotPasswordPage />);
    fillEmail("nope@example.com");
    fireEvent.click(screen.getByRole("button", { name: /reset|send|email/i }));

    // Multiple matches are fine — page may show the message in copy + heading.
    const matches = await screen.findAllByText(/check your (email|inbox)|sent|reset link/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("treats invalid-email the same as success (no enumeration)", async () => {
    resetPassword.mockRejectedValueOnce({ code: "auth/invalid-email" });

    render(<ForgotPasswordPage />);
    fillEmail("not-an-email");
    fireEvent.click(screen.getByRole("button", { name: /reset|send|email/i }));

    // Multiple matches are fine — page may show the message in copy + heading.
    const matches = await screen.findAllByText(/check your (email|inbox)|sent|reset link/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("surfaces a generic error for unexpected failures", async () => {
    resetPassword.mockRejectedValueOnce({ code: "auth/network-request-failed" });

    render(<ForgotPasswordPage />);
    fillEmail("ada@example.com");
    fireEvent.click(screen.getByRole("button", { name: /reset|send|email/i }));

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
  });
});
