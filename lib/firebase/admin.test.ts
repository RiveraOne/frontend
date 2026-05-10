import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getApps = vi.fn();
const initializeApp = vi.fn();
const cert = vi.fn();
const getAuth = vi.fn(() => ({ __auth: true }));
const getFirestore = vi.fn(() => ({ __db: true }));

vi.mock("firebase-admin/app", () => ({ getApps, initializeApp, cert }));
vi.mock("firebase-admin/auth", () => ({ getAuth }));
vi.mock("firebase-admin/firestore", () => ({ getFirestore }));

const originalEnv = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  getApps.mockReset().mockReturnValue([]);
  initializeApp.mockReset().mockReturnValue({ __app: "init" });
  cert.mockReset().mockReturnValue({ __cert: true });
  getAuth.mockClear();
  getFirestore.mockClear();
  process.env = { ...originalEnv };
  delete process.env.FIREBASE_PROJECT_ID;
  delete process.env.FIREBASE_CLIENT_EMAIL;
  delete process.env.FIREBASE_PRIVATE_KEY;
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("firebase-admin init", () => {
  it("throws when FIREBASE_PROJECT_ID is missing", async () => {
    process.env.FIREBASE_CLIENT_EMAIL = "x@y.iam.gserviceaccount.com";
    process.env.FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\\nKEY\\n-----END PRIVATE KEY-----\\n";

    await expect(import("./admin")).rejects.toThrow(/Missing Firebase Admin env vars/);
  });

  it("throws when FIREBASE_CLIENT_EMAIL is missing", async () => {
    process.env.FIREBASE_PROJECT_ID = "p";
    process.env.FIREBASE_PRIVATE_KEY = "k";
    await expect(import("./admin")).rejects.toThrow(/Missing Firebase Admin env vars/);
  });

  it("throws when FIREBASE_PRIVATE_KEY is missing", async () => {
    process.env.FIREBASE_PROJECT_ID = "p";
    process.env.FIREBASE_CLIENT_EMAIL = "e";
    await expect(import("./admin")).rejects.toThrow(/Missing Firebase Admin env vars/);
  });

  it("initializes the app with cert credentials, converting \\\\n to real newlines in the private key", async () => {
    process.env.FIREBASE_PROJECT_ID = "proj-1";
    process.env.FIREBASE_CLIENT_EMAIL = "svc@proj-1.iam.gserviceaccount.com";
    process.env.FIREBASE_PRIVATE_KEY =
      "-----BEGIN PRIVATE KEY-----\\nABC\\nXYZ\\n-----END PRIVATE KEY-----\\n";

    await import("./admin");

    expect(cert).toHaveBeenCalledWith({
      projectId: "proj-1",
      clientEmail: "svc@proj-1.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nABC\nXYZ\n-----END PRIVATE KEY-----\n",
    });
    expect(initializeApp).toHaveBeenCalledWith({ credential: { __cert: true } });
  });

  it("reuses an existing app when getApps() returns one", async () => {
    process.env.FIREBASE_PROJECT_ID = "p";
    process.env.FIREBASE_CLIENT_EMAIL = "e";
    process.env.FIREBASE_PRIVATE_KEY = "k";
    getApps.mockReturnValue([{ __app: "existing" }]);

    await import("./admin");

    expect(initializeApp).not.toHaveBeenCalled();
    expect(getAuth).toHaveBeenCalledWith({ __app: "existing" });
    expect(getFirestore).toHaveBeenCalledWith({ __app: "existing" });
  });

  it("exports adminAuth and adminDb", async () => {
    process.env.FIREBASE_PROJECT_ID = "p";
    process.env.FIREBASE_CLIENT_EMAIL = "e";
    process.env.FIREBASE_PRIVATE_KEY = "k";
    getApps.mockReturnValue([{ __app: "x" }]);

    const { adminAuth, adminDb } = await import("./admin");
    expect(adminAuth).toEqual({ __auth: true });
    expect(adminDb).toEqual({ __db: true });
  });
});
