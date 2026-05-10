import { test, expect } from "@playwright/test";

test.describe("Advisor — plan gating", () => {
  test("free user is redirected to /pricing?reason=advisor", async ({ page }) => {
    const email = `e2e-advisor-${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel(/full name|^name/i).fill("Free User");
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /create.*account|get started|sign up|register/i }).click();
    await page.waitForURL(/\/(dashboard|pricing)/);

    await page.goto("/advisor");
    await expect(page).toHaveURL(/\/pricing\?reason=advisor/);
  });
});

test.describe("Routing edges", () => {
  test("404 page renders with home link for unknown route", async ({ page }) => {
    await page.goto("/totally-not-a-real-page");
    await expect(page.getByRole("link", { name: /home|back/i })).toBeVisible();
  });
});
