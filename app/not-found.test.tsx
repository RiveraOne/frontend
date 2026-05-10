// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "./not-found";

describe("NotFound page", () => {
  it("renders 404 copy", () => {
    render(<NotFound />);
    expect(document.body.textContent).toMatch(/404|not found|sorry/i);
  });

  it("includes a link back to home", () => {
    render(<NotFound />);
    const homeLink = screen.getByRole("link", { name: /home|back/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });
});
