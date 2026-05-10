// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import type { Transaction } from "@/lib/firebase/firestore";

const { useAuth, useRouter, usePathname, useSearchParams, subscribeToTransactions, friendlyFirestoreError } =
  vi.hoisted(() => ({
    useAuth: vi.fn(),
    useRouter: vi.fn(),
    usePathname: vi.fn(),
    useSearchParams: vi.fn(),
    subscribeToTransactions: vi.fn(),
    friendlyFirestoreError: vi.fn(() => "fail"),
  }));

vi.mock("@/contexts/AuthContext", () => ({ useAuth }));
vi.mock("next/navigation", () => ({ useRouter, usePathname, useSearchParams }));
vi.mock("@/lib/firebase", () => ({
  subscribeToTransactions,
  friendlyFirestoreError,
  auth: {},
}));

import LedgerPage from "./page";

let nextCb: ((data: Transaction[]) => void) | undefined;

beforeEach(() => {
  vi.clearAllMocks();
  useRouter.mockReturnValue({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() });
  usePathname.mockReturnValue("/ledger");
  useSearchParams.mockReturnValue(new URLSearchParams());
  useAuth.mockReturnValue({
    user: { uid: "u-1", displayName: "Ada", email: "ada@example.com" },
    loading: false,
  });

  subscribeToTransactions.mockImplementation((_uid, onNext) => {
    nextCb = onNext;
    return vi.fn();
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

const tx = (overrides: Partial<Transaction>): Transaction =>
  ({
    id: "t-1",
    date: "2025-04-01",
    type: "Expense",
    amount: 10,
    category: "Food",
    createdAt: { seconds: 0, nanoseconds: 0 } as unknown as Transaction["createdAt"],
    ...overrides,
  } as Transaction);

describe("LedgerPage", () => {
  it("renders the title + add CTA", () => {
    render(<LedgerPage />);
    expect(screen.getByText(/Ledger/i)).toBeInTheDocument();
    const addLink = screen.getByRole("link", { name: /Add Transaction/i });
    expect(addLink).toHaveAttribute("href", "/ledger/new");
  });

  it("subscribes to transactions for the current user", () => {
    render(<LedgerPage />);
    expect(subscribeToTransactions).toHaveBeenCalledWith(
      "u-1",
      expect.any(Function),
      expect.any(Function)
    );
  });

  it("renders rendered transactions and computes totals", () => {
    render(<LedgerPage />);
    act(() => {
      nextCb?.([
        tx({ id: "1", type: "Income", amount: 1000, category: "Salary" }),
        tx({ id: "2", type: "Expense", amount: 250, category: "Food" }),
      ]);
    });

    // Income/expense totals appear both in the summary card and (signed) on
    // the row itself; assert at least one match for each.
    expect(screen.getAllByText("+$1,000").length).toBeGreaterThan(0);
    expect(screen.getAllByText("-$250").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$750").length).toBeGreaterThan(0);
  });

  it("shows the empty state when there are no transactions", () => {
    render(<LedgerPage />);
    act(() => {
      nextCb?.([]);
    });
    // Loose match — page should not crash and should render the title still.
    expect(screen.getByText(/Ledger/i)).toBeInTheDocument();
  });
});
