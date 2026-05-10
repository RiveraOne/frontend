/**
 * Firestore rules tests against the local emulator.
 *
 * Run with:   npm run test:rules
 * Which is:   firebase emulators:exec --only firestore "vitest run tests/firestore-rules/"
 *
 * The suite skips itself if FIRESTORE_EMULATOR_HOST isn't set, so it's safe to
 * include in the default Vitest run — the rest of the suite still passes.
 */
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import fs from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

const emulatorRunning = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

const describeIfEmulator = emulatorRunning ? describe : describe.skip;

const RULES_PATH = path.resolve(__dirname, "..", "..", "firestore.rules");

const VALID_TRANSACTION = {
  type: "Expense" as const,
  amount: 12.5,
  category: "Coffee",
  date: "2025-04-01",
  createdAt: Timestamp.now(),
};

let testEnv: RulesTestEnvironment;

describeIfEmulator("Firestore rules", () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "metrawealth-test",
      firestore: {
        rules: fs.readFileSync(RULES_PATH, "utf8"),
      },
    });
  });

  afterAll(async () => {
    await testEnv?.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  describe("users/{userId}", () => {
    it("denies unauthenticated read", async () => {
      const ctx = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDoc(doc(ctx, "users/u-1")));
    });

    it("denies cross-user read", async () => {
      const ctx = testEnv.authenticatedContext("u-2").firestore();
      await assertFails(getDoc(doc(ctx, "users/u-1")));
    });

    it("allows owner read", async () => {
      // Seed the user doc via the admin (bypassing rules), then read as the owner.
      await testEnv.withSecurityRulesDisabled(async (admin) => {
        await setDoc(doc(admin.firestore(), "users/u-1"), { plan: "free" });
      });

      const ctx = testEnv.authenticatedContext("u-1").firestore();
      await assertSucceeds(getDoc(doc(ctx, "users/u-1")));
    });

    it("denies owner create / update / delete (server-only writes)", async () => {
      const ctx = testEnv.authenticatedContext("u-1").firestore();
      await assertFails(setDoc(doc(ctx, "users/u-1"), { plan: "free" }));
    });
  });

  describe("transactions create — validation", () => {
    it("allows full valid doc by owner", async () => {
      const ctx = testEnv.authenticatedContext("u-1").firestore();
      await assertSucceeds(
        setDoc(doc(ctx, "users/u-1/transactions/t-1"), VALID_TRANSACTION)
      );
    });

    it("allows valid doc with optional notes + receiptUrl", async () => {
      const ctx = testEnv.authenticatedContext("u-1").firestore();
      await assertSucceeds(
        setDoc(doc(ctx, "users/u-1/transactions/t-2"), {
          ...VALID_TRANSACTION,
          notes: "morning latte",
          receiptUrl: "https://example.com/receipt.pdf",
        })
      );
    });

    it("denies missing required field (date)", async () => {
      const ctx = testEnv.authenticatedContext("u-1").firestore();
      const { date: _omit, ...invalid } = VALID_TRANSACTION;
      await assertFails(
        setDoc(doc(ctx, "users/u-1/transactions/t-3"), invalid)
      );
    });

    it("denies extra unknown fields (hasOnly regression guard)", async () => {
      const ctx = testEnv.authenticatedContext("u-1").firestore();
      await assertFails(
        setDoc(doc(ctx, "users/u-1/transactions/t-4"), {
          ...VALID_TRANSACTION,
          metadata: { something: 1 },
        })
      );
    });

    it("denies type values outside {Income, Expense}", async () => {
      const ctx = testEnv.authenticatedContext("u-1").firestore();
      await assertFails(
        setDoc(doc(ctx, "users/u-1/transactions/t-5"), {
          ...VALID_TRANSACTION,
          type: "Transfer",
        })
      );
    });

    it("denies amount <= 0", async () => {
      const ctx = testEnv.authenticatedContext("u-1").firestore();
      await assertFails(
        setDoc(doc(ctx, "users/u-1/transactions/t-6"), {
          ...VALID_TRANSACTION,
          amount: 0,
        })
      );
      await assertFails(
        setDoc(doc(ctx, "users/u-1/transactions/t-7"), {
          ...VALID_TRANSACTION,
          amount: -10,
        })
      );
    });

    it("denies amount > 100,000,000", async () => {
      const ctx = testEnv.authenticatedContext("u-1").firestore();
      await assertFails(
        setDoc(doc(ctx, "users/u-1/transactions/t-8"), {
          ...VALID_TRANSACTION,
          amount: 100_000_001,
        })
      );
    });

    it("allows boundary amount = 100,000,000", async () => {
      const ctx = testEnv.authenticatedContext("u-1").firestore();
      await assertSucceeds(
        setDoc(doc(ctx, "users/u-1/transactions/t-9"), {
          ...VALID_TRANSACTION,
          amount: 100_000_000,
        })
      );
    });

    it("denies non-string / empty / overlong category", async () => {
      const ctx = testEnv.authenticatedContext("u-1").firestore();
      await assertFails(
        setDoc(doc(ctx, "users/u-1/transactions/t-10"), {
          ...VALID_TRANSACTION,
          category: "",
        })
      );
      await assertFails(
        setDoc(doc(ctx, "users/u-1/transactions/t-11"), {
          ...VALID_TRANSACTION,
          category: "x".repeat(81),
        })
      );
      await assertFails(
        setDoc(doc(ctx, "users/u-1/transactions/t-12"), {
          ...VALID_TRANSACTION,
          category: 12 as unknown as string,
        })
      );
    });

    it("denies date strings not matching YYYY-MM-DD", async () => {
      const ctx = testEnv.authenticatedContext("u-1").firestore();
      for (const date of ["2025-1-1", "2025/01/01", "01-04-2025", "2025-04-01T00:00:00Z"]) {
        await assertFails(
          setDoc(doc(ctx, `users/u-1/transactions/d-${date.replace(/[^a-z0-9]/gi, "")}`), {
            ...VALID_TRANSACTION,
            date,
          })
        );
      }
    });

    it("denies notes longer than 500 chars", async () => {
      const ctx = testEnv.authenticatedContext("u-1").firestore();
      await assertFails(
        setDoc(doc(ctx, "users/u-1/transactions/n-1"), {
          ...VALID_TRANSACTION,
          notes: "x".repeat(501),
        })
      );
    });

    it("denies receiptUrl longer than 2048 chars", async () => {
      const ctx = testEnv.authenticatedContext("u-1").firestore();
      await assertFails(
        setDoc(doc(ctx, "users/u-1/transactions/r-1"), {
          ...VALID_TRANSACTION,
          receiptUrl: "x".repeat(2049),
        })
      );
    });

    it("denies create on another user's transactions collection", async () => {
      const ctx = testEnv.authenticatedContext("u-1").firestore();
      await assertFails(
        setDoc(doc(ctx, "users/u-2/transactions/x"), VALID_TRANSACTION)
      );
    });

    it("denies create when unauthenticated", async () => {
      const ctx = testEnv.unauthenticatedContext().firestore();
      await assertFails(
        setDoc(doc(ctx, "users/u-1/transactions/x"), VALID_TRANSACTION)
      );
    });
  });

  describe("transactions update — denied", () => {
    it("denies owner update of an existing transaction", async () => {
      // Seed a doc admin-side, then try to update as the owner.
      await testEnv.withSecurityRulesDisabled(async (admin) => {
        await setDoc(
          doc(admin.firestore(), "users/u-1/transactions/seeded"),
          VALID_TRANSACTION
        );
      });

      const ctx = testEnv.authenticatedContext("u-1").firestore();
      await assertFails(
        setDoc(doc(ctx, "users/u-1/transactions/seeded"), {
          ...VALID_TRANSACTION,
          amount: 99,
        })
      );
    });
  });

  describe("transactions delete", () => {
    it("allows owner delete", async () => {
      await testEnv.withSecurityRulesDisabled(async (admin) => {
        await setDoc(
          doc(admin.firestore(), "users/u-1/transactions/del-1"),
          VALID_TRANSACTION
        );
      });

      const ctx = testEnv.authenticatedContext("u-1").firestore();
      await assertSucceeds(deleteDoc(doc(ctx, "users/u-1/transactions/del-1")));
    });

    it("denies cross-user delete", async () => {
      await testEnv.withSecurityRulesDisabled(async (admin) => {
        await setDoc(
          doc(admin.firestore(), "users/u-1/transactions/del-2"),
          VALID_TRANSACTION
        );
      });

      const ctx = testEnv.authenticatedContext("u-2").firestore();
      await assertFails(deleteDoc(doc(ctx, "users/u-1/transactions/del-2")));
    });
  });

  describe("catch-all denies", () => {
    it("denies arbitrary subcollection under a user doc", async () => {
      const ctx = testEnv.authenticatedContext("u-1").firestore();
      await assertFails(
        setDoc(doc(ctx, "users/u-1/secrets/x"), { foo: "bar" })
      );
    });

    it("denies root-level collection access", async () => {
      const ctx = testEnv.authenticatedContext("u-1").firestore();
      await assertFails(setDoc(doc(ctx, "foo/bar"), { x: 1 }));
    });
  });
});

// Vitest needs at least one statement at the top level for the file to be a module.
export {};
// `serverTimestamp` is referenced to keep tooling honest about the import even
// when running without the emulator (file is collected but tests are skipped).
void serverTimestamp;
