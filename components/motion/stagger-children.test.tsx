// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import StaggerChildren, { staggerItemVariants } from "./stagger-children";

describe("StaggerChildren", () => {
  it("renders its children", () => {
    render(
      <StaggerChildren>
        <span data-testid="a">A</span>
        <span data-testid="b">B</span>
      </StaggerChildren>
    );
    expect(screen.getByTestId("a")).toBeInTheDocument();
    expect(screen.getByTestId("b")).toBeInTheDocument();
  });

  it("exposes a non-trivial staggerItemVariants object for child usage", () => {
    expect(staggerItemVariants).toHaveProperty("hidden");
    expect(staggerItemVariants).toHaveProperty("visible");
    expect(staggerItemVariants.hidden).toMatchObject({ opacity: 0 });
  });

  it("forwards className to the wrapper", () => {
    const { container } = render(
      <StaggerChildren className="grid">
        <span>x</span>
      </StaggerChildren>
    );
    expect(container.firstElementChild).toHaveClass("grid");
  });
});
