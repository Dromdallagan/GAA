import { test, expect } from "@playwright/test";

test.use({ storageState: "e2e/.auth/user.json" });

test.describe("Dashboard", () => {
  test("loads dashboard with KPI cards", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page.locator("h1")).toContainText("Dashboard");
    // KPI cards should render
    await expect(page.locator("[data-slot='card']").first()).toBeVisible({ timeout: 10000 });
  });

  test("sidebar navigation works", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.click('a[href="/admin/fixtures"]');
    await expect(page).toHaveURL(/\/admin\/fixtures/);
    await expect(page.locator("h1")).toContainText("Fixtures");
  });

  test("CMD+K palette opens", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.keyboard.press("Meta+k");
    await expect(page.locator("[cmdk-dialog]")).toBeVisible({ timeout: 3000 });
  });
});
