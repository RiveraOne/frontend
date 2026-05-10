import { beforeEach, describe, expect, it, vi } from "vitest";

// Hoisted mocks for the firebase/firestore SDK and the local config module.
// Tests import the firestore module dynamically so the mocks are in place
// before the module captures references to mocked functions.

const addDoc = vi.fn();
const getDoc = vi.fn();
const deleteDoc = vi.fn();
const onSnapshot = vi.fn();
const collection = vi.fn((..._args: unknown[]) => ({ __ref: _args }));
const doc = vi.fn((..._args: unknown[]) => ({ __doc: _args }));
const query = vi.fn((..._args: unknown[]) => ({ __query: _args }));
const orderBy = vi.fn((field: string, dir: string) => ({ __orderBy: [field, dir] }));

class FakeTimestamp {
  constructor(public seconds: number) {}
  static now() {
    return new FakeTimestamp(Math.floor(Date.now() / 1000));
  }
  toDate() {
    return new Date(this.seconds * 1000);
  }
}

vi.mock("./config", () => ({ default: { __app: true }, db: { __db: true }, auth: {} }));
vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(() => ({ __db: true })),
  collection,
  addDoc,
  getDoc,
  doc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp: FakeTimestamp,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("friendlyFirestoreError", () => {
  it("returns the deploy-rules hint for permission-denied errors", async () => {
    const { friendlyFirestoreError } = await import("./firestore");
    const error = Object.assign(new Error("permission denied"), {
      code: "permission-denied",
    });
    expect(friendlyFirestoreError(error)).toMatch(/Deploy firestore\.rules/);
  });

  it("returns the generic load-failed message for unknown errors", async () => {
    const { friendlyFirestoreError } = await import("./firestore");
    expect(friendlyFirestoreError(new Error("boom"))).toMatch(/Could not load transactions/);
  });

  it("returns the generic message when error.code is unrelated", async () => {
    const { friendlyFirestoreError } = await import("./firestore");
    const error = Object.assign(new Error("..."), { code: "unavailable" });
    expect(friendlyFirestoreError(error)).toMatch(/Could not load transactions/);
  });
});

describe("addTransaction", () => {
  it("writes the payload to users/{uid}/transactions with createdAt", async () => {
    addDoc.mockResolvedValueOnce({ id: "abc123" });
    const { addTransaction } = await import("./firestore");

    const id = await addTransaction("user-1", {
      date: "2025-01-15",
      type: "Expense",
      amount: 12.5,
      category: "Coffee",
      notes: "morning",
    });

    expect(id).toBe("abc123");
    expect(collection).toHaveBeenCalledWith({ __db: true }, "users", "user-1", "transactions");
    expect(addDoc).toHaveBeenCalledTimes(1);
    const payload = addDoc.mock.calls[0][1] as Record<string, unknown>;
    expect(payload).toMatchObject({
      date: "2025-01-15",
      type: "Expense",
      amount: 12.5,
      category: "Coffee",
      notes: "morning",
    });
    expect(payload.createdAt).toBeInstanceOf(FakeTimestamp);
  });
});

describe("getTransaction", () => {
  it("returns null when the document doesn't exist", async () => {
    getDoc.mockResolvedValueOnce({ exists: () => false });
    const { getTransaction } = await import("./firestore");
    expect(await getTransaction("u", "t")).toBeNull();
  });

  it("normalizes a stored document into a Transaction", async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      id: "tx-1",
      data: () => ({
        date: "2025-02-10",
        type: "Income",
        amount: 1000,
        category: "Salary",
        createdAt: new FakeTimestamp(1700000000),
      }),
    });
    const { getTransaction } = await import("./firestore");

    const tx = await getTransaction("u", "tx-1");
    expect(tx).toMatchObject({
      id: "tx-1",
      date: "2025-02-10",
      type: "Income",
      amount: 1000,
      category: "Salary",
    });
    expect(tx?.createdAt).toBeInstanceOf(FakeTimestamp);
  });

  it("normalizes Timestamp date values to YYYY-MM-DD strings", async () => {
    const ts = new FakeTimestamp(Math.floor(new Date("2025-06-15T08:00:00Z").getTime() / 1000));
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      id: "x",
      data: () => ({
        date: ts,
        type: "Expense",
        amount: 1,
        category: "x",
        createdAt: ts,
      }),
    });

    const { getTransaction } = await import("./firestore");
    const tx = await getTransaction("u", "x");
    expect(tx?.date).toBe("2025-06-15");
  });

  it("normalizes {seconds:number} date shapes to YYYY-MM-DD", async () => {
    const seconds = Math.floor(new Date("2024-12-25T00:00:00Z").getTime() / 1000);
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      id: "x",
      data: () => ({
        date: { seconds },
        type: "Expense",
        amount: 1,
        category: "x",
        createdAt: new FakeTimestamp(seconds),
      }),
    });

    const { getTransaction } = await import("./firestore");
    const tx = await getTransaction("u", "x");
    expect(tx?.date).toBe("2024-12-25");
  });

  it("falls back to empty string for unrecognizable date shapes", async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      id: "x",
      data: () => ({
        date: 12345,
        type: "Expense",
        amount: 1,
        category: "x",
        createdAt: new FakeTimestamp(0),
      }),
    });

    const { getTransaction } = await import("./firestore");
    expect((await getTransaction("u", "x"))?.date).toBe("");
  });

  it("coerces unrecognized type to 'Expense'", async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      id: "x",
      data: () => ({
        date: "2025-01-01",
        type: "Transfer",
        amount: 1,
        category: "x",
        createdAt: new FakeTimestamp(0),
      }),
    });

    const { getTransaction } = await import("./firestore");
    expect((await getTransaction("u", "x"))?.type).toBe("Expense");
  });

  it("coerces non-finite amounts to 0", async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      id: "x",
      data: () => ({
        date: "2025-01-01",
        type: "Expense",
        amount: NaN,
        category: "x",
        createdAt: new FakeTimestamp(0),
      }),
    });

    const { getTransaction } = await import("./firestore");
    expect((await getTransaction("u", "x"))?.amount).toBe(0);
  });

  it("falls back to 'Uncategorized' when category is non-string", async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      id: "x",
      data: () => ({
        date: "2025-01-01",
        type: "Expense",
        amount: 1,
        category: 42,
        createdAt: new FakeTimestamp(0),
      }),
    });

    const { getTransaction } = await import("./firestore");
    expect((await getTransaction("u", "x"))?.category).toBe("Uncategorized");
  });

  it("includes notes/receiptUrl only when truthy strings", async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      id: "x",
      data: () => ({
        date: "2025-01-01",
        type: "Expense",
        amount: 1,
        category: "x",
        notes: "",
        receiptUrl: 0,
        createdAt: new FakeTimestamp(0),
      }),
    });

    const { getTransaction } = await import("./firestore");
    const tx = await getTransaction("u", "x");
    expect(tx).not.toHaveProperty("notes");
    expect(tx).not.toHaveProperty("receiptUrl");
  });

  it("synthesizes createdAt when missing", async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      id: "x",
      data: () => ({
        date: "2025-01-01",
        type: "Expense",
        amount: 1,
        category: "x",
      }),
    });

    const { getTransaction } = await import("./firestore");
    const tx = await getTransaction("u", "x");
    expect(tx?.createdAt).toBeInstanceOf(FakeTimestamp);
  });
});

describe("deleteTransaction", () => {
  it("calls deleteDoc with the per-user transaction ref", async () => {
    deleteDoc.mockResolvedValueOnce(undefined);
    const { deleteTransaction } = await import("./firestore");

    await deleteTransaction("user-1", "tx-1");
    expect(doc).toHaveBeenCalledWith({ __db: true }, "users", "user-1", "transactions", "tx-1");
    expect(deleteDoc).toHaveBeenCalledTimes(1);
  });
});

describe("subscribeToTransactions", () => {
  it("subscribes ordered by date desc and normalizes the batch", async () => {
    onSnapshot.mockImplementation((_q, onNext) => {
      onNext({
        docs: [
          {
            id: "a",
            data: () => ({
              date: "2025-02-01",
              type: "Income",
              amount: 100,
              category: "Salary",
              createdAt: new FakeTimestamp(0),
            }),
          },
          {
            id: "b",
            data: () => ({
              date: "2025-01-15",
              type: "Expense",
              amount: 12,
              category: "Coffee",
              createdAt: new FakeTimestamp(0),
            }),
          },
        ],
      });
      return () => undefined;
    });

    const { subscribeToTransactions } = await import("./firestore");
    const callback = vi.fn();
    const unsub = subscribeToTransactions("u", callback);

    expect(orderBy).toHaveBeenCalledWith("date", "desc");
    expect(callback).toHaveBeenCalledTimes(1);
    const list = callback.mock.calls[0][0] as Array<{ id: string }>;
    expect(list.map((t) => t.id)).toEqual(["a", "b"]);
    expect(typeof unsub).toBe("function");
  });

  it("propagates errors to the onError callback", async () => {
    onSnapshot.mockImplementation((_q, _onNext, onError) => {
      onError?.(new Error("boom"));
      return () => undefined;
    });

    const { subscribeToTransactions } = await import("./firestore");
    const callback = vi.fn();
    const onError = vi.fn();
    subscribeToTransactions("u", callback, onError);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toBe("boom");
  });
});
