// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("motion/react", async () => {
  // Always-in-view + animate-immediately mock so we can assert final values.
  return {
    useInView: () => true,
    animate: (
      _from: number,
      to: number,
      opts: { onUpdate?: (v: number) => void }
    ) => {
      // Fire onUpdate once with the target value, then return a no-op stop.
      opts.onUpdate?.(to);
      return { stop: () => undefined };
    },
  };
});

import Counter from "./counter";

describe("Counter", () => {
  it("renders the formatted target value when in view", () => {
    render(<Counter to={1234} />);
    expect(screen.getByText("1,234")).toBeInTheDocument();
  });

  it("respects the prefix and suffix", () => {
    render(<Counter to={42} prefix="$" suffix="+" />);
    expect(screen.getByText("$42+")).toBeInTheDocument();
  });

  it("renders decimals correctly", () => {
    render(<Counter to={3.1415} decimals={2} />);
    expect(screen.getByText("3.14")).toBeInTheDocument();
  });

  it("formats thousands with commas", () => {
    render(<Counter to={1000000} />);
    expect(screen.getByText("1,000,000")).toBeInTheDocument();
  });

  it("forwards className to the span", () => {
    const { container } = render(<Counter to={1} className="big-text" />);
    expect(container.firstElementChild).toHaveClass("big-text");
  });
});
