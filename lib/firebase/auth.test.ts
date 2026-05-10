import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const createUserWithEmailAndPassword = vi.fn();
const signInWithEmailAndPassword = vi.fn();
const signInWithPopup = vi.fn();
const sendPasswordResetEmail = vi.fn();
const updateProfile = vi.fn();
const signOut = vi.fn();
const GoogleAuthProvider = vi.fn();

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
}));

vi.mock("./config", () => ({ auth: { __auth: true }, db: {}, default: {} }));

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  fetchMock.mockResolvedValue({ ok: true });
});

afterEach(() => {
  // @ts-expect-error — restore default
  delete globalThis.fetch;
});

function fakeCredential(token = "id-token-1") {
  return {
    user: {
      getIdToken: vi.fn().mockResolvedValue(token),
    },
  };
}

describe("registerWithEmail", () => {
  it("creates the user, sets the display name, and provisions", async () => {
    const credential = fakeCredential();
    createUserWithEmailAndPassword.mockResolvedValueOnce(credential);
    updateProfile.mockResolvedValueOnce(undefined);

    const { registerWithEmail } = await import("./auth");
    await registerWithEmail("Ada", "ada@example.com", "password123");

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      { __auth: true },
      "ada@example.com",
      "password123"
    );
    expect(updateProfile).toHaveBeenCalledWith(credential.user, { displayName: "Ada" });
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/provision", {
      method: "POST",
      headers: { Authorization: "Bearer id-token-1" },
    });
  });

  it("does not throw when /api/auth/provision fails (non-fatal)", async () => {
    const credential = fakeCredential();
    createUserWithEmailAndPassword.mockResolvedValueOnce(credential);
    updateProfile.mockResolvedValueOnce(undefined);
    fetchMock.mockRejectedValueOnce(new Error("network"));

    const { registerWithEmail } = await import("./auth");
    await expect(
      registerWithEmail("Ada", "ada@example.com", "password123")
    ).resolves.toBeDefined();
  });
});

describe("loginWithEmail", () => {
  it("signs in and provisions", async () => {
    const credential = fakeCredential("login-token");
    signInWithEmailAndPassword.mockResolvedValueOnce(credential);

    const { loginWithEmail } = await import("./auth");
    await loginWithEmail("ada@example.com", "password123");

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      { __auth: true },
      "ada@example.com",
      "password123"
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/provision",
      expect.objectContaining({
        headers: { Authorization: "Bearer login-token" },
      })
    );
  });

  it("propagates Firebase auth errors (e.g. wrong-password)", async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce(
      Object.assign(new Error("wrong-password"), { code: "auth/wrong-password" })
    );

    const { loginWithEmail } = await import("./auth");
    await expect(loginWithEmail("a@b.c", "x")).rejects.toThrow(/wrong-password/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("loginWithGoogle", () => {
  it("signs in via popup and provisions", async () => {
    const credential = fakeCredential("google-token");
    signInWithPopup.mockResolvedValueOnce(credential);

    const { loginWithGoogle } = await import("./auth");
    await loginWithGoogle();

    expect(signInWithPopup).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/provision",
      expect.objectContaining({
        headers: { Authorization: "Bearer google-token" },
      })
    );
  });

  it("propagates the Firebase popup error (e.g. closed by user)", async () => {
    signInWithPopup.mockRejectedValueOnce(
      Object.assign(new Error("popup-closed"), {
        code: "auth/popup-closed-by-user",
      })
    );

    const { loginWithGoogle } = await import("./auth");
    await expect(loginWithGoogle()).rejects.toThrow(/popup-closed/);
  });
});

describe("resetPassword", () => {
  it("calls sendPasswordResetEmail with the auth instance", async () => {
    sendPasswordResetEmail.mockResolvedValueOnce(undefined);

    const { resetPassword } = await import("./auth");
    await resetPassword("ada@example.com");

    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      { __auth: true },
      "ada@example.com"
    );
  });
});

describe("logout", () => {
  it("calls signOut with the auth instance", async () => {
    signOut.mockResolvedValueOnce(undefined);

    const { logout } = await import("./auth");
    await logout();

    expect(signOut).toHaveBeenCalledWith({ __auth: true });
  });
});

describe("googleProvider singleton", () => {
  it("constructs GoogleAuthProvider once at module load and not again per call", async () => {
    vi.resetModules();
    GoogleAuthProvider.mockClear();
    signInWithPopup.mockResolvedValue(fakeCredential());

    const { loginWithGoogle } = await import("./auth");
    expect(GoogleAuthProvider).toHaveBeenCalledTimes(1);

    await loginWithGoogle();
    await loginWithGoogle();
    await loginWithGoogle();
    expect(GoogleAuthProvider).toHaveBeenCalledTimes(1);
  });
});
