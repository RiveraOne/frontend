import { beforeEach, describe, expect, it, vi } from "vitest";

class FakeAdminTimestamp {
  constructor(public _ms: number) {}
  toDate() {
    return new Date(this._ms);
  }
  get seconds() {
    return Math.floor(this._ms / 1000);
  }
}

vi.mock("firebase-admin/firestore", () => ({
  Timestamp: FakeAdminTimestamp,
  FieldValue: { increment: vi.fn() },
}));

const limitFn = vi.fn();
const orderByFn = vi.fn();
const txCollectionFn = vi.fn();
const userDocFn = vi.fn();
const usersCollectionFn = vi.fn();

vi.mock("@/lib/firebase/admin", () => ({
  adminAuth: {},
  adminDb: { collection: usersCollectionFn },
}));

beforeEach(() => {
  limitFn.mockReset();
  orderByFn.mockReset();
  txCollectionFn.mockReset();
  userDocFn.mockReset();
  usersCollectionFn.mockReset();

  // Default chain: collection("users") → doc(uid) → collection("transactions") → orderBy → limit → get
  usersCollectionFn.mockImplementation(() => ({ doc: userDocFn }));
  userDocFn.mockImplementation(() => ({ collection: txCollectionFn }));
  txCollectionFn.mockImplementation(() => ({ orderBy: orderByFn }));
  orderByFn.mockImplementation(() => ({ limit: limitFn }));
});

function mockSnap(docs: Array<{ id: string; data: Record<string, unknown> }>) {
  limitFn.mockReturnValueOnce({
    get: vi.fn().mockResolvedValueOnce({
      docs: docs.map((d) => ({ id: d.id, data: () => d.data })),
    }),
  });
}

describe("getAdvisorTransactions", () => {
  it("respects the limit and orders by date desc", async () => {
    mockSnap([
      {
        id: "t1",
        data: { date: "2025-01-01", type: "Expense", amount: 10, category: "Food" },
      },
    ]);

    const { getAdvisorTransactions } = await import("./transactionsAdmin");
    const result = await getAdvisorTransactions("u", 50);

    expect(usersCollectionFn).toHaveBeenCalledWith("users");
    expect(userDocFn).toHaveBeenCalledWith("u");
    expect(txCollectionFn).toHaveBeenCalledWith("transactions");
    expect(orderByFn).toHaveBeenCalledWith("date", "desc");
    expect(limitFn).toHaveBeenCalledWith(50);
    expect(result).toHaveLength(1);
  });

  it("filters out documents with missing/invalid fields", async () => {
    mockSnap([
      // valid
      {
        id: "ok",
        data: { date: "2025-01-01", type: "Expense", amount: 1, category: "x" },
      },
      // missing date
      { id: "no-date", data: { type: "Expense", amount: 1, category: "x" } },
      // bad type
      {
        id: "bad-type",
        data: { date: "2025-01-01", type: "Transfer", amount: 1, category: "x" },
      },
      // non-finite amount
      {
        id: "bad-amount",
        data: { date: "2025-01-01", type: "Expense", amount: NaN, category: "x" },
      },
      // empty category
      {
        id: "empty-cat",
        data: { date: "2025-01-01", type: "Expense", amount: 1, category: "   " },
      },
      // non-string category
      {
        id: "non-string-cat",
        data: { date: "2025-01-01", type: "Expense", amount: 1, category: 12 },
      },
    ]);

    const { getAdvisorTransactions } = await import("./transactionsAdmin");
    const result = await getAdvisorTransactions("u", 100);
    expect(result.map((t) => t.id)).toEqual(["ok"]);
  });

  it("normalizes Timestamp date to YYYY-MM-DD", async () => {
    const ts = new FakeAdminTimestamp(new Date("2025-06-15T08:00:00Z").getTime());
    mockSnap([
      { id: "x", data: { date: ts, type: "Expense", amount: 1, category: "x" } },
    ]);

    const { getAdvisorTransactions } = await import("./transactionsAdmin");
    const [tx] = await getAdvisorTransactions("u", 100);
    expect(tx.date).toBe("2025-06-15");
  });

  it("normalizes {seconds} date to YYYY-MM-DD", async () => {
    const seconds = Math.floor(new Date("2024-12-25T00:00:00Z").getTime() / 1000);
    mockSnap([
      {
        id: "x",
        data: {
          date: { seconds },
          type: "Expense",
          amount: 1,
          category: "x",
        },
      },
    ]);

    const { getAdvisorTransactions } = await import("./transactionsAdmin");
    const [tx] = await getAdvisorTransactions("u", 100);
    expect(tx.date).toBe("2024-12-25");
  });

  it("preserves notes and receiptUrl when truthy", async () => {
    mockSnap([
      {
        id: "x",
        data: {
          date: "2025-01-01",
          type: "Expense",
          amount: 1,
          category: "Food",
          notes: "lunch",
          receiptUrl: "https://example.com/r.pdf",
        },
      },
    ]);

    const { getAdvisorTransactions } = await import("./transactionsAdmin");
    const [tx] = await getAdvisorTransactions("u", 100);
    expect(tx.notes).toBe("lunch");
    expect(tx.receiptUrl).toBe("https://example.com/r.pdf");
  });

  it("omits notes and receiptUrl when missing or empty", async () => {
    mockSnap([
      {
        id: "x",
        data: {
          date: "2025-01-01",
          type: "Expense",
          amount: 1,
          category: "Food",
          notes: "",
          receiptUrl: null,
        },
      },
    ]);

    const { getAdvisorTransactions } = await import("./transactionsAdmin");
    const [tx] = await getAdvisorTransactions("u", 100);
    expect(tx).not.toHaveProperty("notes");
    expect(tx).not.toHaveProperty("receiptUrl");
  });

  it("returns an empty array when there are no docs", async () => {
    mockSnap([]);

    const { getAdvisorTransactions } = await import("./transactionsAdmin");
    expect(await getAdvisorTransactions("u", 100)).toEqual([]);
  });
});
