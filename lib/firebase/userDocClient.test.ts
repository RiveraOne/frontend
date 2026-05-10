import { beforeEach, describe, expect, it, vi } from "vitest";

const onSnapshot = vi.fn();
const doc = vi.fn((..._args: unknown[]) => ({ __ref: _args }));

vi.mock("firebase/firestore", () => ({
  doc,
  onSnapshot,
}));
vi.mock("./config", () => ({ db: { __db: true }, auth: {}, default: {} }));

beforeEach(() => {
  onSnapshot.mockReset();
  doc.mockClear();
});

describe("subscribeToUserDoc", () => {
  it("subscribes to /users/{uid} and forwards data when the doc exists", async () => {
    const data = { uid: "u", plan: "free" };
    onSnapshot.mockImplementation((_ref, onNext) => {
      onNext({ exists: () => true, data: () => data });
      return () => undefined;
    });

    const { subscribeToUserDoc } = await import("./userDocClient");
    const cb = vi.fn();
    const unsub = subscribeToUserDoc("u", cb);

    expect(doc).toHaveBeenCalledWith({ __db: true }, "users", "u");
    expect(cb).toHaveBeenCalledWith(data);
    expect(typeof unsub).toBe("function");
  });

  it("forwards null when the doc does not exist", async () => {
    onSnapshot.mockImplementation((_ref, onNext) => {
      onNext({ exists: () => false, data: () => undefined });
      return () => undefined;
    });

    const { subscribeToUserDoc } = await import("./userDocClient");
    const cb = vi.fn();
    subscribeToUserDoc("u", cb);
    expect(cb).toHaveBeenCalledWith(null);
  });

  it("forwards errors to the onError callback", async () => {
    onSnapshot.mockImplementation((_ref, _onNext, onError) => {
      onError?.(new Error("perm-denied"));
      return () => undefined;
    });

    const { subscribeToUserDoc } = await import("./userDocClient");
    const cb = vi.fn();
    const onError = vi.fn();
    subscribeToUserDoc("u", cb, onError);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toBe("perm-denied");
  });

  it("returns the unsubscribe function from onSnapshot", async () => {
    const unsubMock = vi.fn();
    onSnapshot.mockReturnValueOnce(unsubMock);

    const { subscribeToUserDoc } = await import("./userDocClient");
    const unsub = subscribeToUserDoc("u", vi.fn());
    unsub();
    expect(unsubMock).toHaveBeenCalledTimes(1);
  });
});
