import { test, expect } from "@playwright/test";

test.use({ storageState: "e2e/.auth/user.json" });

test.describe("Members", () => {
  test("members list loads with table", async ({ page }) => {
    await page.goto("/admin/members");
    await expect(page.locator("h1")).toContainText("Members");
    // Register button visible
    await expect(page.locator('a[href="/admin/members/new"]')).toBeVisible();
  });

  test("status filters work", async ({ page }) => {
    await page.goto("/admin/members");
    // Click Active filter
    await page.click("button:has-text('Active')");
    // Filter should be highlighted (has shadow-sm class indicator)
    await expect(page.locator("button:has-text('Active')")).toHaveClass(/shadow/);
  });

  test("member registration form loads", async ({ page }) => {
    await page.goto("/admin/members/new");
    await expect(page.locator("h1")).toContainText("Register Member");
    await expect(page.locator('input[name="first_name"]')).toBeVisible();
    await expect(page.locator('input[name="last_name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone_number"]')).toBeVisible();
  });

  test("search filters members", async ({ page }) => {
    await page.goto("/admin/members");
    await page.fill('input[placeholder="Search by name..."]', "zzzznonexistent");
    await expect(page.locator("text=No members found")).toBeVisible({ timeout: 3000 });
  });
});
