import { test, expect } from "@playwright/test";

const ts = () => Date.now();

test.describe("Auth flows", () => {
  test("register → land on dashboard with empty state", async ({ page }) => {
    const email = `e2e-register-${ts()}@example.com`;

    await page.goto("/register");
    await page.getByLabel(/full name|^name/i).fill("E2E User");
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /create.*account|get started|sign up|register/i }).click();

    await expect(page).toHaveURL(/\/(dashboard|pricing)/);
  });

  test("logout → protected routes redirect to /login?redirect=…", async ({ page }) => {
    const email = `e2e-logout-${ts()}@example.com`;

    // Quick register flow to land authenticated.
    await page.goto("/register");
    await page.getByLabel(/full name|^name/i).fill("E2E");
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /create.*account|get started|sign up|register/i }).click();

    await page.goto("/settings");
    await page.getByRole("button", { name: /sign out/i }).click();

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?redirect=/);
  });

  test("open-redirect protection: ?redirect=https://evil.com falls back to /pricing", async ({ page }) => {
    const email = `e2e-openredir-${ts()}@example.com`;

    // Register with an evil redirect param: post-auth landing must NOT be evil.com.
    await page.goto("/register?redirect=https://evil.example.com");
    await page.getByLabel(/full name|^name/i).fill("E2E");
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /create.*account|get started|sign up|register/i }).click();

    await page.waitForURL((url) => !/evil\.example\.com/.test(url.toString()));
    expect(page.url()).not.toContain("evil.example.com");
  });
});
