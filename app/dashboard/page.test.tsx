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
    friendlyFirestoreError: vi.fn(),
  }));

vi.mock("@/contexts/AuthContext", () => ({ useAuth }));
vi.mock("next/navigation", () => ({ useRouter, usePathname, useSearchParams }));
vi.mock("@/lib/firebase", () => ({
  subscribeToTransactions,
  friendlyFirestoreError,
  auth: {},
}));

import DashboardPage from "./page";

let nextCb: ((data: Transaction[]) => void) | undefined;
let errCb: ((err: Error) => void) | undefined;
const unsub = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  unsub.mockReset();

  useRouter.mockReturnValue({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() });
  usePathname.mockReturnValue("/dashboard");
  useSearchParams.mockReturnValue(new URLSearchParams());
  useAuth.mockReturnValue({
    user: { uid: "u-1", displayName: "Ada Lovelace", email: "ada@example.com" },
    loading: false,
  });

  subscribeToTransactions.mockImplementation((_uid, onNext, onError) => {
    nextCb = onNext;
    errCb = onError;
    return unsub;
  });

  friendlyFirestoreError.mockImplementation(
    (err: Error) =>
      "code" in err && (err as { code: string }).code === "permission-denied"
        ? "Missing Firestore permission. Deploy firestore.rules so signed-in users can read and write their own transactions."
        : "Could not load transactions. Please check your connection and try again."
  );
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

describe("DashboardPage", () => {
  it("greets the user with their first name", () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Good to see you, Ada/i)).toBeInTheDocument();
  });

  it("subscribes to the user's transactions", () => {
    render(<DashboardPage />);
    expect(subscribeToTransactions).toHaveBeenCalledTimes(1);
    expect(subscribeToTransactions.mock.calls[0][0]).toBe("u-1");
  });

  it("computes totals and balance from incoming transactions", () => {
    render(<DashboardPage />);

    act(() => {
      nextCb?.([
        tx({ id: "1", type: "Income", amount: 1000, category: "Salary" }),
        tx({ id: "2", type: "Expense", amount: 250, category: "Food" }),
        tx({ id: "3", type: "Expense", amount: 50, category: "Coffee" }),
      ]);
    });

    expect(screen.getByText("$1,000")).toBeInTheDocument();
    expect(screen.getByText("$300")).toBeInTheDocument();
    expect(screen.getByText("$700")).toBeInTheDocument();
  });

  it("shows 'No transactions yet' empty state when list is empty", () => {
    render(<DashboardPage />);
    act(() => {
      nextCb?.([]);
    });
    expect(screen.getByText(/no transactions yet/i)).toBeInTheDocument();
  });

  it("shows the deficit indicator when expenses exceed income", () => {
    render(<DashboardPage />);
    act(() => {
      nextCb?.([
        tx({ id: "1", type: "Income", amount: 100, category: "x" }),
        tx({ id: "2", type: "Expense", amount: 250, category: "y" }),
      ]);
    });
    expect(screen.getByText(/deficit/i)).toBeInTheDocument();
  });

  it("displays a friendly error when the subscription fails", () => {
    render(<DashboardPage />);
    act(() => {
      errCb?.(Object.assign(new Error("nope"), { code: "permission-denied" }));
    });
    expect(screen.getByText(/Deploy firestore\.rules/)).toBeInTheDocument();
  });

  it("unsubscribes on unmount", () => {
    const { unmount } = render(<DashboardPage />);
    unmount();
    expect(unsub).toHaveBeenCalledTimes(1);
  });
});
