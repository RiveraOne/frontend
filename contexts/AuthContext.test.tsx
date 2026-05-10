// @vitest-environment jsdom

import React from "react";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "firebase/auth";
import type { UserDoc } from "@/types/user";

// Hoisted mocks for the auth + Firestore listeners. `vi.hoisted` ensures the
// vi.fn instances exist before `vi.mock` factories run.
const { onAuthStateChanged, subscribeToUserDoc } = vi.hoisted(() => ({
  onAuthStateChanged: vi.fn(),
  subscribeToUserDoc: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged,
}));

vi.mock("@/lib/firebase", () => ({
  auth: { __auth: true },
}));

vi.mock("@/lib/firebase/userDocClient", () => ({
  subscribeToUserDoc,
}));

import { AuthProvider, useAuth } from "./AuthContext";

function Probe() {
  const { user, loading, userDoc, userDocLoading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user?.uid ?? "none"}</span>
      <span data-testid="docLoading">{String(userDocLoading)}</span>
      <span data-testid="userDoc">{userDoc?.plan ?? "none"}</span>
    </div>
  );
}

let authCallback: ((user: User | null) => void) | null = null;
let authUnsub: ReturnType<typeof vi.fn>;
let docCallback: ((doc: UserDoc | null) => void) | null = null;
let docErrCallback: ((error: Error) => void) | undefined;
let docUnsub: ReturnType<typeof vi.fn>;

beforeEach(() => {
  authCallback = null;
  docCallback = null;
  docErrCallback = undefined;
  authUnsub = vi.fn();
  docUnsub = vi.fn();

  onAuthStateChanged.mockImplementation((_auth, cb) => {
    authCallback = cb;
    return authUnsub;
  });

  subscribeToUserDoc.mockImplementation((_uid, onNext, onError) => {
    docCallback = onNext;
    docErrCallback = onError;
    return docUnsub;
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

const fakeUser = (uid = "u-1"): User => ({ uid } as User);
const fakeDoc = (plan: UserDoc["plan"] = "free"): UserDoc => ({
  uid: "u-1",
  email: null,
  displayName: null,
  plan,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  subscriptionStatus: null,
  advisorQueriesUsed: 0,
  advisorQueriesResetAt: "2025-01-01T00:00:00.000Z",
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
});

describe("AuthProvider — initial state", () => {
  it("starts with loading=true and no user", () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    expect(screen.getByTestId("loading").textContent).toBe("true");
    expect(screen.getByTestId("user").textContent).toBe("none");
  });
});

describe("AuthProvider — login", () => {
  it("transitions to loading=false and subscribes to the user doc when user logs in", () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    act(() => {
      authCallback?.(fakeUser());
    });

    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(screen.getByTestId("user").textContent).toBe("u-1");
    expect(subscribeToUserDoc).toHaveBeenCalledTimes(1);
    expect(subscribeToUserDoc.mock.calls[0][0]).toBe("u-1");
  });

  it("updates userDoc state when the user-doc snapshot fires", () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    act(() => {
      authCallback?.(fakeUser());
    });
    act(() => {
      docCallback?.(fakeDoc("pro"));
    });

    expect(screen.getByTestId("userDoc").textContent).toBe("pro");
    expect(screen.getByTestId("docLoading").textContent).toBe("false");
  });

  it("clears userDoc and logs the error when the user-doc subscription errors", () => {
    const consoleErr = vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    act(() => {
      authCallback?.(fakeUser());
    });
    act(() => {
      docCallback?.(fakeDoc("essential"));
    });
    act(() => {
      docErrCallback?.(new Error("perm-denied"));
    });

    expect(screen.getByTestId("userDoc").textContent).toBe("none");
    expect(screen.getByTestId("docLoading").textContent).toBe("false");
    expect(consoleErr).toHaveBeenCalled();
    consoleErr.mockRestore();
  });
});

describe("AuthProvider — logout", () => {
  it("tears down the user-doc subscription and clears state when user logs out", () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    act(() => {
      authCallback?.(fakeUser());
    });
    act(() => {
      docCallback?.(fakeDoc("pro"));
    });

    // Simulate logout
    act(() => {
      authCallback?.(null);
    });

    expect(docUnsub).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("user").textContent).toBe("none");
    expect(screen.getByTestId("userDoc").textContent).toBe("none");
    expect(screen.getByTestId("docLoading").textContent).toBe("false");
  });
});

describe("AuthProvider — switching users", () => {
  it("tears down the previous subscription before starting a new one", () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    act(() => {
      authCallback?.(fakeUser("u-1"));
    });
    expect(subscribeToUserDoc).toHaveBeenCalledTimes(1);
    const firstUnsub = docUnsub;

    // Re-spawn the docUnsub so we can assert the new sub doesn't reuse it
    docUnsub = vi.fn();
    subscribeToUserDoc.mockImplementation((_uid, onNext, onError) => {
      docCallback = onNext;
      docErrCallback = onError;
      return docUnsub;
    });

    act(() => {
      authCallback?.(fakeUser("u-2"));
    });

    expect(firstUnsub).toHaveBeenCalledTimes(1);
    expect(subscribeToUserDoc).toHaveBeenCalledTimes(2);
    expect(subscribeToUserDoc.mock.calls[1][0]).toBe("u-2");
  });
});

describe("AuthProvider — unmount cleanup", () => {
  it("calls both unsubscribes on unmount", () => {
    const { unmount } = render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    act(() => {
      authCallback?.(fakeUser());
    });

    unmount();
    expect(authUnsub).toHaveBeenCalledTimes(1);
    expect(docUnsub).toHaveBeenCalledTimes(1);
  });
});

describe("useAuth — default values outside a Provider", () => {
  it("returns loading=true and null user when no provider is mounted", () => {
    render(<Probe />);
    expect(screen.getByTestId("loading").textContent).toBe("true");
    expect(screen.getByTestId("user").textContent).toBe("none");
    expect(screen.getByTestId("docLoading").textContent).toBe("true");
  });
});
