import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UserDoc } from "@/types/user";

// Build a chainable fake adminDb where we can program get/set/update
// behavior per-test. The chain is: collection → doc → {get, set, update}.
type DocStub = {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
};

const docStub: DocStub = {
  get: vi.fn(),
  set: vi.fn(),
  update: vi.fn(),
};

const docFn = vi.fn(() => docStub);
const collectionFn = vi.fn(() => ({ doc: docFn }));

vi.mock("@/lib/firebase/admin", () => ({
  adminDb: { collection: collectionFn },
  adminAuth: {},
}));

const FieldValueIncrement = vi.fn((n: number) => ({ __increment: n }));
vi.mock("firebase-admin/firestore", () => ({
  FieldValue: { increment: FieldValueIncrement },
}));

// Reset adminDb mocks and restore real time between tests.
beforeEach(() => {
  docStub.get.mockReset();
  docStub.set.mockReset();
  docStub.update.mockReset();
  docFn.mockClear();
  collectionFn.mockClear();
  FieldValueIncrement.mockClear();
});

// `firstOfCurrentMonth` in userDoc.ts uses local-timezone month-start then
// converts to ISO/UTC, so the result depends on the test machine's TZ. Mirror
// the source so assertions are TZ-independent.
function expectedFirstOfMonth(now: Date): string {
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

afterEach(() => {
  vi.useRealTimers();
});

describe("getUserDoc", () => {
  it("returns null when the doc does not exist", async () => {
    docStub.get.mockResolvedValueOnce({ exists: false });
    const { getUserDoc } = await import("./userDoc");

    expect(await getUserDoc("user-1")).toBeNull();
    expect(collectionFn).toHaveBeenCalledWith("users");
    expect(docFn).toHaveBeenCalledWith("user-1");
  });

  it("returns the doc data when it exists", async () => {
    const data: UserDoc = {
      uid: "u",
      email: "a@b.c",
      displayName: "A",
      plan: "pro",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: null,
      advisorQueriesUsed: 3,
      advisorQueriesResetAt: "2025-01-01T00:00:00.000Z",
      createdAt: "2024-12-01T00:00:00.000Z",
      updatedAt: "2025-01-15T00:00:00.000Z",
    };
    docStub.get.mockResolvedValueOnce({ exists: true, data: () => data });
    const { getUserDoc } = await import("./userDoc");

    expect(await getUserDoc("u")).toEqual(data);
  });
});

describe("upsertUserDoc", () => {
  it("merges fields and stamps updatedAt", async () => {
    docStub.set.mockResolvedValueOnce(undefined);
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-03-15T10:00:00Z"));

    const { upsertUserDoc } = await import("./userDoc");
    await upsertUserDoc("u", { plan: "pro" });

    expect(docStub.set).toHaveBeenCalledWith(
      { plan: "pro", updatedAt: "2025-03-15T10:00:00.000Z" },
      { merge: true }
    );
  });
});

describe("ensureUserDoc — new user path", () => {
  it("creates a complete doc with sensible defaults when none exists", async () => {
    docStub.get.mockResolvedValueOnce({ exists: false, data: () => undefined });
    docStub.set.mockResolvedValueOnce(undefined);

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-04-10T00:00:00Z"));

    const { ensureUserDoc } = await import("./userDoc");
    const result = await ensureUserDoc("u", "a@b.c", "Ada");

    expect(result.uid).toBe("u");
    expect(result.email).toBe("a@b.c");
    expect(result.displayName).toBe("Ada");
    expect(result.plan).toBe("free");
    expect(result.stripeCustomerId).toBeNull();
    expect(result.stripeSubscriptionId).toBeNull();
    expect(result.subscriptionStatus).toBeNull();
    expect(result.advisorQueriesUsed).toBe(0);
    expect(result.advisorQueriesResetAt).toBe(
      expectedFirstOfMonth(new Date("2025-04-10T00:00:00Z"))
    );
    expect(result.createdAt).toBe("2025-04-10T00:00:00.000Z");
    expect(result.updatedAt).toBe("2025-04-10T00:00:00.000Z");
    expect(docStub.set).toHaveBeenCalledWith(result, { merge: true });
  });
});

describe("ensureUserDoc — existing user path", () => {
  it("preserves existing valid fields and only updates updatedAt", async () => {
    const existing: Partial<UserDoc> = {
      plan: "pro",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      subscriptionStatus: "active",
      advisorQueriesUsed: 5,
      advisorQueriesResetAt: "2025-04-01T00:00:00.000Z",
      createdAt: "2024-01-01T00:00:00.000Z",
      email: "stored@example.com",
      displayName: "Stored Name",
    };
    docStub.get.mockResolvedValueOnce({ exists: true, data: () => existing });
    docStub.set.mockResolvedValueOnce(undefined);

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-04-15T00:00:00Z"));

    const { ensureUserDoc } = await import("./userDoc");
    const result = await ensureUserDoc("u", "ignored@example.com", "Ignored");

    expect(result.plan).toBe("pro");
    expect(result.stripeCustomerId).toBe("cus_123");
    expect(result.stripeSubscriptionId).toBe("sub_123");
    expect(result.subscriptionStatus).toBe("active");
    expect(result.advisorQueriesUsed).toBe(5);
    expect(result.email).toBe("stored@example.com");
    expect(result.displayName).toBe("Stored Name");
    expect(result.createdAt).toBe("2024-01-01T00:00:00.000Z");
    expect(result.updatedAt).toBe("2025-04-15T00:00:00.000Z");
  });

  it("falls back to provided email/name when stored values are nullish", async () => {
    docStub.get.mockResolvedValueOnce({
      exists: true,
      data: () => ({ plan: "free" }),
    });
    docStub.set.mockResolvedValueOnce(undefined);

    const { ensureUserDoc } = await import("./userDoc");
    const result = await ensureUserDoc("u", "fallback@example.com", "Fallback");
    expect(result.email).toBe("fallback@example.com");
    expect(result.displayName).toBe("Fallback");
  });

  it("rejects invalid stored plan and resets to 'free'", async () => {
    docStub.get.mockResolvedValueOnce({
      exists: true,
      data: () => ({ plan: "platinum" }),
    });
    docStub.set.mockResolvedValueOnce(undefined);

    const { ensureUserDoc } = await import("./userDoc");
    expect((await ensureUserDoc("u", null, null)).plan).toBe("free");
  });

  it("rejects non-finite advisorQueriesUsed and resets to 0", async () => {
    docStub.get.mockResolvedValueOnce({
      exists: true,
      data: () => ({ advisorQueriesUsed: NaN }),
    });
    docStub.set.mockResolvedValueOnce(undefined);

    const { ensureUserDoc } = await import("./userDoc");
    expect((await ensureUserDoc("u", null, null)).advisorQueriesUsed).toBe(0);
  });

  it("rejects non-string advisorQueriesResetAt and synthesizes a fresh one", async () => {
    docStub.get.mockResolvedValueOnce({
      exists: true,
      data: () => ({ advisorQueriesResetAt: 12345 }),
    });
    docStub.set.mockResolvedValueOnce(undefined);

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-07-09T00:00:00Z"));

    const { ensureUserDoc } = await import("./userDoc");
    expect((await ensureUserDoc("u", null, null)).advisorQueriesResetAt).toBe(
      expectedFirstOfMonth(new Date("2025-07-09T00:00:00Z"))
    );
  });
});

describe("provisionUserDoc", () => {
  it("delegates to ensureUserDoc (creates if missing)", async () => {
    docStub.get.mockResolvedValueOnce({ exists: false, data: () => undefined });
    docStub.set.mockResolvedValueOnce(undefined);

    const { provisionUserDoc } = await import("./userDoc");
    await provisionUserDoc("u", "a@b.c", "Ada");
    expect(docStub.set).toHaveBeenCalled();
  });
});

describe("resetAdvisorUsageIfNeeded", () => {
  it("no-ops when the reset date is in the current month", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-03-15T00:00:00Z"));

    const userDoc: UserDoc = {
      uid: "u",
      email: null,
      displayName: null,
      plan: "free",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: null,
      advisorQueriesUsed: 3,
      advisorQueriesResetAt: "2025-03-01T00:00:00.000Z",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-03-10T00:00:00.000Z",
    };

    const { resetAdvisorUsageIfNeeded } = await import("./userDoc");
    const result = await resetAdvisorUsageIfNeeded("u", userDoc);

    expect(result).toBe(userDoc);
    expect(docStub.update).not.toHaveBeenCalled();
  });

  it("resets when the reset date is in a prior month", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-04-05T00:00:00Z"));

    const userDoc: UserDoc = {
      uid: "u",
      email: null,
      displayName: null,
      plan: "pro",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: null,
      advisorQueriesUsed: 47,
      advisorQueriesResetAt: "2025-03-01T00:00:00.000Z",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-03-10T00:00:00.000Z",
    };

    docStub.update.mockResolvedValueOnce(undefined);

    const { resetAdvisorUsageIfNeeded } = await import("./userDoc");
    const result = await resetAdvisorUsageIfNeeded("u", userDoc);

    const expectedResetAt = expectedFirstOfMonth(new Date("2025-04-05T00:00:00Z"));
    expect(docStub.update).toHaveBeenCalledWith({
      advisorQueriesUsed: 0,
      advisorQueriesResetAt: expectedResetAt,
      updatedAt: "2025-04-05T00:00:00.000Z",
    });
    expect(result.advisorQueriesUsed).toBe(0);
    expect(result.advisorQueriesResetAt).toBe(expectedResetAt);
    expect(result.plan).toBe("pro"); // unrelated fields preserved
  });

  it("resets when the reset date is in a prior year", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-05T00:00:00Z"));

    const userDoc: UserDoc = {
      uid: "u",
      email: null,
      displayName: null,
      plan: "free",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: null,
      advisorQueriesUsed: 2,
      advisorQueriesResetAt: "2025-12-01T00:00:00.000Z",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-12-15T00:00:00.000Z",
    };

    docStub.update.mockResolvedValueOnce(undefined);

    const { resetAdvisorUsageIfNeeded } = await import("./userDoc");
    const result = await resetAdvisorUsageIfNeeded("u", userDoc);
    expect(result.advisorQueriesUsed).toBe(0);
    expect(docStub.update).toHaveBeenCalled();
  });

  it("treats a NaN/invalid reset date as 'new month' and resets", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-03-15T00:00:00Z"));

    const userDoc: UserDoc = {
      uid: "u",
      email: null,
      displayName: null,
      plan: "free",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: null,
      advisorQueriesUsed: 2,
      advisorQueriesResetAt: "not-a-date",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-03-01T00:00:00.000Z",
    };

    docStub.update.mockResolvedValueOnce(undefined);

    const { resetAdvisorUsageIfNeeded } = await import("./userDoc");
    const result = await resetAdvisorUsageIfNeeded("u", userDoc);
    expect(result.advisorQueriesUsed).toBe(0);
  });
});

describe("incrementAdvisorUsage", () => {
  it("uses FieldValue.increment(1)", async () => {
    docStub.update.mockResolvedValueOnce(undefined);

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-05-05T00:00:00Z"));

    const { incrementAdvisorUsage } = await import("./userDoc");
    await incrementAdvisorUsage("u");

    expect(FieldValueIncrement).toHaveBeenCalledWith(1);
    expect(docStub.update).toHaveBeenCalledWith({
      advisorQueriesUsed: { __increment: 1 },
      updatedAt: "2025-05-05T00:00:00.000Z",
    });
  });
});

describe("setPlanFromStripe", () => {
  it("upserts plan / customer / subscription fields with merge", async () => {
    docStub.set.mockResolvedValueOnce(undefined);
    const { setPlanFromStripe } = await import("./userDoc");

    await setPlanFromStripe("u", "essential", "cus_X", "sub_Y", "active");

    const [payload, options] = docStub.set.mock.calls[0];
    expect(payload).toMatchObject({
      plan: "essential",
      stripeCustomerId: "cus_X",
      stripeSubscriptionId: "sub_Y",
      subscriptionStatus: "active",
    });
    expect(payload.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(options).toEqual({ merge: true });
  });
});
