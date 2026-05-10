import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

// Auto-unmount React Testing Library trees between tests (Vitest doesn't do
// this for us). Wrapped in a try so node-environment files don't fail to load.
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const rtl = require("@testing-library/react") as { cleanup: () => void };
  afterEach(() => {
    rtl.cleanup();
  });
} catch {
  // RTL isn't installed in node-only test contexts; ignore.
}

// jsdom doesn't implement matchMedia / IntersectionObserver / ResizeObserver.
// Stub them so components using `motion` or `next/font` don't crash.
if (typeof window !== "undefined") {
  if (!window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }),
    });
  }

  if (!("IntersectionObserver" in window)) {
    class FakeIntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      writable: true,
      value: FakeIntersectionObserver,
    });
  }

  if (!("ResizeObserver" in window)) {
    class FakeResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    Object.defineProperty(window, "ResizeObserver", {
      configurable: true,
      writable: true,
      value: FakeResizeObserver,
    });
  }
}
