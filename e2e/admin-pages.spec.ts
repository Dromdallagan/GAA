import { test, expect } from "@playwright/test";

test.use({ storageState: "e2e/.auth/user.json" });

test.describe("Admin Pages Load", () => {
  test("settings page loads", async ({ page }) => {
    await page.goto("/admin/settings");
    await expect(page.locator("h1")).toContainText("Settings");
    await expect(page.locator("text=Stripe Connect")).toBeVisible();
  });

  test("revenue page loads", async ({ page }) => {
    await page.goto("/admin/revenue");
    await expect(page.locator("h1")).toContainText("Revenue");
  });

  test("content queue page loads", async ({ page }) => {
    await page.goto("/admin/content");
    await expect(page.locator("h1")).toContainText("Content Queue");
  });

  test("agents page loads", async ({ page }) => {
    await page.goto("/admin/agents");
    await expect(page.locator("h1")).toContainText("AI Agents");
  });

  test("unauthenticated user redirects to login", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    await context.close();
  });
});
