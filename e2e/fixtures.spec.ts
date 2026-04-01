import { test, expect } from "@playwright/test";

test.use({ storageState: "e2e/.auth/user.json" });

test.describe("Fixtures", () => {
  test("fixtures list loads", async ({ page }) => {
    await page.goto("/admin/fixtures");
    await expect(page.locator("h1")).toContainText("Fixtures");
  });

  test("new fixture page loads", async ({ page }) => {
    await page.goto("/admin/fixtures/new");
    await expect(page.locator("h1")).toContainText("New Fixture");
    // Form fields present
    await expect(page.locator('input[name="scheduled_at"]')).toBeVisible();
  });

  test("fixture form validates required fields", async ({ page }) => {
    await page.goto("/admin/fixtures/new");
    await page.click('button[type="submit"]');
    // Should show validation errors (not redirect)
    await expect(page).toHaveURL(/\/admin\/fixtures\/new/);
  });
});
