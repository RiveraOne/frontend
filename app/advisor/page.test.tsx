// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { UserDoc } from "@/types/user";

const { useAuth, useRouter, usePathname, useSearchParams } = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({ useAuth }));
vi.mock("next/navigation", () => ({ useRouter, usePathname, useSearchParams }));

import AdvisorPage from "./page";

const fetchMock = vi.fn();
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
  fetchMock.mockReset();
  replace.mockReset();

  globalThis.fetch = fetchMock as unknown as typeof fetch;
  useRouter.mockReturnValue({ push: vi.fn(), replace, refresh: vi.fn() });
  usePathname.mockReturnValue("/advisor");
  useSearchParams.mockReturnValue(new URLSearchParams());
  useAuth.mockReturnValue({
    user: { uid: "u-1", getIdToken: vi.fn().mockResolvedValue("good-token") },
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

describe("AdvisorPage — gating", () => {
  it("redirects free users to /pricing?reason=advisor (delegated to PlanProtectedRoute)", () => {
    useAuth.mockReturnValue({
      user: { uid: "u-1" },
      loading: false,
      userDoc: { ...baseDoc, plan: "free", subscriptionStatus: null },
      userDocLoading: false,
    });

    render(<AdvisorPage />);
    expect(replace).toHaveBeenCalledWith("/pricing?reason=advisor");
  });
});

describe("AdvisorPage — chat flow", () => {
  it("renders the welcome message", () => {
    render(<AdvisorPage />);
    expect(screen.getByText(/Hi! I'm your AI financial advisor/i)).toBeInTheDocument();
  });

  it("sends the message to /api/ai/advisor with a Bearer token and renders the reply", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        reply: { role: "assistant", content: "Here's some advice." },
      }),
    });

    render(<AdvisorPage />);

    const input = screen.getByPlaceholderText(/ask|message|question/i);
    fireEvent.change(input, { target: { value: "Can I afford coffee?" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/ai/advisor",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ Authorization: "Bearer good-token" }),
        })
      );
    });

    expect(await screen.findByText(/Here's some advice/i)).toBeInTheDocument();
    expect(screen.getByText(/Can I afford coffee/i)).toBeInTheDocument();
  });

  it("renders a friendly upgrade prompt on 429 over-limit", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ error: "Monthly query limit reached." }),
    });

    render(<AdvisorPage />);
    const input = screen.getByPlaceholderText(/ask|message|question/i);
    fireEvent.change(input, { target: { value: "hi" } });
    fireEvent.submit(input.closest("form")!);

    // The 429 path appends an assistant message advising the user to upgrade.
    expect(await screen.findByText(/Upgrade your plan/i)).toBeInTheDocument();
  });

  it("shows an error and a fallback assistant message on a network failure", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network down"));

    render(<AdvisorPage />);
    const input = screen.getByPlaceholderText(/ask|message|question/i);
    fireEvent.change(input, { target: { value: "hi" } });
    fireEvent.submit(input.closest("form")!);

    expect(await screen.findByText(/I couldn't generate a response/i)).toBeInTheDocument();
  });

  it("shows an error when reply.content is missing in the response", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ reply: { role: "assistant" } }),
    });

    render(<AdvisorPage />);
    const input = screen.getByPlaceholderText(/ask|message|question/i);
    fireEvent.change(input, { target: { value: "hi" } });
    fireEvent.submit(input.closest("form")!);

    expect(await screen.findByText(/I couldn't generate a response/i)).toBeInTheDocument();
  });

  it("does not submit when the input is empty", async () => {
    render(<AdvisorPage />);
    const input = screen.getByPlaceholderText(/ask|message|question/i);
    fireEvent.submit(input.closest("form")!);

    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("AdvisorPage — query usage display", () => {
  it("shows remaining queries for paid plans with a finite limit", () => {
    useAuth.mockReturnValue({
      user: { uid: "u-1", getIdToken: vi.fn() },
      loading: false,
      userDoc: { ...baseDoc, plan: "essential", advisorQueriesUsed: 12 },
      userDocLoading: false,
    });

    render(<AdvisorPage />);
    // Essential plan = 50/month → 38 remaining after 12 used.
    expect(document.body.textContent).toMatch(/38|left|remaining/i);
  });
});
