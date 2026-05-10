// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import FadeIn from "./fade-in";

describe("FadeIn", () => {
  it("renders its children", () => {
    render(
      <FadeIn>
        <span data-testid="child">hello</span>
      </FadeIn>
    );
    expect(screen.getByTestId("child").textContent).toBe("hello");
  });

  it("forwards a className to the wrapper", () => {
    const { container } = render(
      <FadeIn className="custom-class">
        <span>x</span>
      </FadeIn>
    );
    expect(container.firstElementChild).toHaveClass("custom-class");
  });

  it("renders without crashing for each direction prop", () => {
    for (const direction of ["up", "down", "left", "right", "none"] as const) {
      const { container, unmount } = render(
        <FadeIn direction={direction}>
          <span>x</span>
        </FadeIn>
      );
      expect(container.firstElementChild).toBeInTheDocument();
      unmount();
    }
  });
});
