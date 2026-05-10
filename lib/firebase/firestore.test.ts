import { describe, expect, it, vi } from "vitest";

// firestore.ts initializes the client SDK at module load. Mock its
// dependencies so we can import the module without Firebase env vars.
vi.mock("./config", () => ({ default: {}, db: {}, auth: {} }));
vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  addDoc: vi.fn(),
  getDoc: vi.fn(),
  doc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  Timestamp: class FakeTimestamp {
    static now() {
      return new FakeTimestamp();
    }
  },
}));

describe("friendlyFirestoreError", () => {
  it("returns the deploy-rules hint for permission-denied errors", async () => {
    const { friendlyFirestoreError } = await import("./firestore");
    const error = Object.assign(new Error("permission denied"), {
      code: "permission-denied",
    });
    expect(friendlyFirestoreError(error)).toMatch(
      /Deploy firestore\.rules/
    );
  });

  it("returns the generic load-failed message for unknown errors", async () => {
    const { friendlyFirestoreError } = await import("./firestore");
    expect(friendlyFirestoreError(new Error("boom"))).toMatch(
      /Could not load transactions/
    );
  });

  it("returns the generic message when error.code is unrelated", async () => {
    const { friendlyFirestoreError } = await import("./firestore");
    const error = Object.assign(new Error("..."), { code: "unavailable" });
    expect(friendlyFirestoreError(error)).toMatch(
      /Could not load transactions/
    );
  });
});
