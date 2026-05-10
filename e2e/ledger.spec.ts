import { test, expect } from "@playwright/test";

async function registerAndAuth(page: import("@playwright/test").Page) {
  const email = `e2e-ledger-${Date.now()}@example.com`;
  await page.goto("/register");
  await page.getByLabel(/full name|^name/i).fill("Ledger User");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill("password123");
  await page.getByRole("button", { name: /create.*account|get started|sign up|register/i }).click();
  await page.waitForURL(/\/(dashboard|pricing)/);
  return email;
}

test.describe("Ledger", () => {
  test("add a transaction and see it in the dashboard balance", async ({ page }) => {
    await registerAndAuth(page);

    await page.goto("/ledger/new");
    await page.getByLabel(/amount/i).fill("125.50");
    await page.getByLabel(/category/i).fill("Coffee");
    await page.getByLabel(/^date/i).fill("2025-04-15");
    await page.getByRole("button", { name: /save|add transaction|submit/i }).click();

    await expect(page).toHaveURL(/\/ledger$/);
    await expect(page.getByText(/Coffee/)).toBeVisible();

    await page.goto("/dashboard");
    await expect(page.getByText(/\$125\.50|\$125/)).toBeVisible();
  });

  test("delete a transaction from its detail page", async ({ page }) => {
    await registerAndAuth(page);

    // Seed one
    await page.goto("/ledger/new");
    await page.getByLabel(/amount/i).fill("10");
    await page.getByLabel(/category/i).fill("Tea");
    await page.getByLabel(/^date/i).fill("2025-04-01");
    await page.getByRole("button", { name: /save|add transaction|submit/i }).click();
    await page.waitForURL(/\/ledger$/);

    await page.getByText(/Tea/).first().click();

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: /delete/i }).click();

    await expect(page).toHaveURL(/\/ledger$/);
    await expect(page.getByText(/Tea/)).toHaveCount(0);
  });

  test("rejects 0-amount input (validation matches Firestore rules)", async ({ page }) => {
    await registerAndAuth(page);

    await page.goto("/ledger/new");
    await page.getByLabel(/amount/i).fill("0");
    await page.getByLabel(/category/i).fill("x");
    await page.getByLabel(/^date/i).fill("2025-04-01");

    const save = page.getByRole("button", { name: /save|add transaction|submit/i });
    await expect(save).toBeDisabled();
  });
});
