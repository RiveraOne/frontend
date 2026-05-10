// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import ThemeToggle from "./theme-toggle";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  document.documentElement.style.colorScheme = "";
  // Reset matchMedia to "system does not prefer dark" — individual tests
  // override this when they need to simulate dark preference.
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: () => ({
      matches: false,
      media: "",
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
    }),
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("ThemeToggle — initial theme", () => {
  it("defaults to light when no stored value and system does not prefer dark", () => {
    render(<ThemeToggle />);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("reads 'dark' from localStorage on mount", () => {
    localStorage.setItem("theme", "dark");
    render(<ThemeToggle />);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("falls back to system preference when no stored value (dark)", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: () => ({
        matches: true,
        media: "(prefers-color-scheme: dark)",
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
      }),
    });

    render(<ThemeToggle />);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("respects 'light' in localStorage even if system prefers dark", () => {
    localStorage.setItem("theme", "light");
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: () => ({
        matches: true,
        media: "(prefers-color-scheme: dark)",
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
      }),
    });

    render(<ThemeToggle />);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});

describe("ThemeToggle — toggle behavior", () => {
  it("toggles to dark on click and persists", () => {
    render(<ThemeToggle />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(button.getAttribute("aria-label")).toMatch(/light/i);
  });

  it("toggles back to light on second click", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    fireEvent.click(button);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("sets the colorScheme inline style alongside the dark class", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button"));
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });
});
