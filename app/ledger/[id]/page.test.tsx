// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { Transaction } from "@/lib/firebase/firestore";

const {
  useAuth,
  useRouter,
  useParams,
  usePathname,
  useSearchParams,
  notFound,
  getTransaction,
  deleteTransaction,
  subscribeToTransactions,
} = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useRouter: vi.fn(),
  useParams: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  getTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
  subscribeToTransactions: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({ useAuth }));
vi.mock("next/navigation", () => ({
  useRouter,
  useParams,
  usePathname,
  useSearchParams,
  notFound,
}));
vi.mock("@/lib/firebase", () => ({
  getTransaction,
  deleteTransaction,
  subscribeToTransactions,
  auth: {},
}));

import TransactionDetailPage from "./page";

const push = vi.fn();
const tx = (overrides: Partial<Transaction> = {}): Transaction =>
  ({
    id: "tx-1",
    date: "2025-04-01",
    type: "Expense",
    amount: 12.5,
    category: "Coffee",
    notes: "morning latte",
    createdAt: { seconds: 0, nanoseconds: 0 } as unknown as Transaction["createdAt"],
    ...overrides,
  } as Transaction);

beforeEach(() => {
  vi.clearAllMocks();
  push.mockReset();

  useRouter.mockReturnValue({ push, replace: vi.fn(), refresh: vi.fn() });
  useParams.mockReturnValue({ id: "tx-1" });
  usePathname.mockReturnValue("/ledger/tx-1");
  useSearchParams.mockReturnValue(new URLSearchParams());
  useAuth.mockReturnValue({ user: { uid: "u-1" }, loading: false });

  subscribeToTransactions.mockImplementation(() => () => undefined);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("TransactionDetailPage", () => {
  it("loads and renders the transaction details", async () => {
    getTransaction.mockResolvedValueOnce(tx());

    render(<TransactionDetailPage />);

    const matches = await screen.findAllByText(/Coffee/);
    expect(matches.length).toBeGreaterThan(0);
    expect(screen.getByText(/morning latte/)).toBeInTheDocument();
  });

  it("calls notFound() when the transaction does not exist", async () => {
    getTransaction.mockResolvedValueOnce(null);

    expect(() => render(<TransactionDetailPage />)).not.toThrow();

    await waitFor(() => {
      expect(notFound).toHaveBeenCalled();
    });
  });

  it("deletes the transaction after confirmation and redirects to /ledger", async () => {
    getTransaction.mockResolvedValueOnce(tx());
    deleteTransaction.mockResolvedValueOnce(undefined);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<TransactionDetailPage />);
    const deleteButton = await screen.findByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteTransaction).toHaveBeenCalledWith("u-1", "tx-1");
    });
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/ledger");
    });
  });

  it("does NOT delete when confirmation is cancelled", async () => {
    getTransaction.mockResolvedValueOnce(tx());
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<TransactionDetailPage />);
    const deleteButton = await screen.findByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(deleteTransaction).not.toHaveBeenCalled();
  });

  it("shows a friendly error when getTransaction throws", async () => {
    getTransaction.mockRejectedValueOnce(new Error("firestore boom"));

    render(<TransactionDetailPage />);
    expect(await screen.findByText(/Could not load this transaction/i)).toBeInTheDocument();
  });
});
