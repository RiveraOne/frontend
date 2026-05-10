// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const { useAuth, useRouter, usePathname, useSearchParams, addTransaction } =
  vi.hoisted(() => ({
    useAuth: vi.fn(),
    useRouter: vi.fn(),
    usePathname: vi.fn(),
    useSearchParams: vi.fn(),
    addTransaction: vi.fn(),
  }));

vi.mock("@/contexts/AuthContext", () => ({ useAuth }));
vi.mock("next/navigation", () => ({ useRouter, usePathname, useSearchParams }));
vi.mock("@/lib/firebase", () => ({ addTransaction, auth: {} }));

import NewLedgerEntryPage from "./page";

const push = vi.fn();

beforeEach(() => {
  push.mockReset();
  addTransaction.mockReset();

  useRouter.mockReturnValue({ push, replace: vi.fn(), refresh: vi.fn() });
  usePathname.mockReturnValue("/ledger/new");
  useSearchParams.mockReturnValue(new URLSearchParams());
  useAuth.mockReturnValue({ user: { uid: "u-1" }, loading: false });
});

afterEach(() => {
  vi.clearAllMocks();
});

function fillForm(args: { amount: string; category: string; date: string; notes?: string }) {
  fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: args.amount } });
  fireEvent.change(screen.getByLabelText(/category/i), { target: { value: args.category } });
  fireEvent.change(screen.getByLabelText(/^date/i), { target: { value: args.date } });
  if (args.notes !== undefined) {
    fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: args.notes } });
  }
}

describe("NewLedgerEntryPage", () => {
  it("disables save when amount/category/date are missing", () => {
    render(<NewLedgerEntryPage />);
    const save = screen.getByRole("button", { name: /save|add transaction|submit/i });
    expect(save).toBeDisabled();
  });

  it("rejects non-positive amounts (validation matches Firestore rules)", () => {
    render(<NewLedgerEntryPage />);
    fillForm({ amount: "0", category: "Food", date: "2025-04-01" });
    expect(screen.getByRole("button", { name: /save|add transaction|submit/i })).toBeDisabled();

    fillForm({ amount: "-10", category: "Food", date: "2025-04-01" });
    expect(screen.getByRole("button", { name: /save|add transaction|submit/i })).toBeDisabled();
  });

  it("enables save and calls addTransaction with the normalized payload on submit", async () => {
    addTransaction.mockResolvedValueOnce("new-id");

    render(<NewLedgerEntryPage />);
    fillForm({ amount: "12.50", category: "  Coffee  ", date: "2025-04-01", notes: "  morning  " });

    const save = screen.getByRole("button", { name: /save|add transaction|submit/i });
    expect(save).not.toBeDisabled();
    fireEvent.click(save);

    await waitFor(() => {
      expect(addTransaction).toHaveBeenCalledWith("u-1", {
        type: "Expense",
        amount: 12.5,
        category: "Coffee",
        date: "2025-04-01",
        notes: "morning",
      });
    });
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/ledger");
    });
  });

  it("omits empty notes from the payload", async () => {
    addTransaction.mockResolvedValueOnce("new-id");

    render(<NewLedgerEntryPage />);
    fillForm({ amount: "5", category: "x", date: "2025-04-01", notes: "   " });
    fireEvent.click(screen.getByRole("button", { name: /save|add transaction|submit/i }));

    await waitFor(() => {
      expect(addTransaction).toHaveBeenCalled();
    });
    expect(addTransaction.mock.calls[0][1]).not.toHaveProperty("notes");
  });

  it("displays a friendly error on permission-denied (rules misconfigured)", async () => {
    addTransaction.mockRejectedValueOnce({ code: "permission-denied" });

    render(<NewLedgerEntryPage />);
    fillForm({ amount: "5", category: "x", date: "2025-04-01" });
    fireEvent.click(screen.getByRole("button", { name: /save|add transaction|submit/i }));

    expect(await screen.findByText(/permission denied/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
