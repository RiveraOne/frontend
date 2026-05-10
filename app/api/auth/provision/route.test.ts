import { beforeEach, describe, expect, it, vi } from "vitest";
import { bearer, makeRequest, readJson } from "@/app/api/__test-helpers__";

const verifyIdToken = vi.fn();
const ensureUserDoc = vi.fn();

vi.mock("@/lib/firebase/admin", () => ({
  adminAuth: { verifyIdToken },
  adminDb: { collection: vi.fn() },
}));

vi.mock("@/lib/firebase/userDoc", () => ({
  ensureUserDoc,
  upsertUserDoc: vi.fn(),
}));

beforeEach(() => {
  verifyIdToken.mockReset();
  ensureUserDoc.mockReset();
});

const URL_ = "http://localhost:3000/api/auth/provision";

describe("POST /api/auth/provision", () => {
  it("returns 401 when Authorization header is missing", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest(URL_, { method: "POST" }));
    expect(res.status).toBe(401);
    expect(await readJson<{ error: string }>(res)).toEqual({ error: "Unauthorized" });
  });

  it("returns 401 when Authorization is not a Bearer token", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      makeRequest(URL_, { method: "POST", headers: { Authorization: "Basic foo" } })
    );
    expect(res.status).toBe(401);
  });

  it("returns 401 when verifyIdToken throws", async () => {
    verifyIdToken.mockRejectedValueOnce(new Error("invalid token"));
    const { POST } = await import("./route");
    const res = await POST(
      makeRequest(URL_, { method: "POST", headers: bearer("bad-token") })
    );
    expect(res.status).toBe(401);
    expect(ensureUserDoc).not.toHaveBeenCalled();
  });

  it("provisions and returns 200 on success", async () => {
    verifyIdToken.mockResolvedValueOnce({
      uid: "user-1",
      email: "ada@example.com",
      name: "Ada",
    });
    ensureUserDoc.mockResolvedValueOnce(undefined);

    const { POST } = await import("./route");
    const res = await POST(
      makeRequest(URL_, { method: "POST", headers: bearer("good-token") })
    );

    expect(res.status).toBe(200);
    expect(await readJson<{ ok: boolean }>(res)).toEqual({ ok: true });
    expect(ensureUserDoc).toHaveBeenCalledWith("user-1", "ada@example.com", "Ada");
  });

  it("nulls out missing email/name on the decoded token", async () => {
    verifyIdToken.mockResolvedValueOnce({ uid: "user-1" });
    ensureUserDoc.mockResolvedValueOnce(undefined);

    const { POST } = await import("./route");
    const res = await POST(
      makeRequest(URL_, { method: "POST", headers: bearer("good-token") })
    );

    expect(res.status).toBe(200);
    expect(ensureUserDoc).toHaveBeenCalledWith("user-1", null, null);
  });

  it("returns 401 when ensureUserDoc throws (caught by try/catch)", async () => {
    verifyIdToken.mockResolvedValueOnce({ uid: "u" });
    ensureUserDoc.mockRejectedValueOnce(new Error("firestore down"));

    const { POST } = await import("./route");
    const res = await POST(
      makeRequest(URL_, { method: "POST", headers: bearer("good") })
    );
    // NOTE: current behavior is 401 because ensureUserDoc errors fall into the
    // outer catch. Audit finding: this should arguably be 500. Test asserts
    // current behavior so we notice if it changes.
    expect(res.status).toBe(401);
  });
});
