import { test, expect } from "@playwright/test";

test.use({ storageState: "e2e/.auth/user.json" });

test.describe("Live Scoring", () => {
  test("live page loads", async ({ page }) => {
    await page.goto("/admin/live");
    await expect(page.locator("h1")).toContainText("Live Scoring");
  });
});

test.describe("Public Pages", () => {
  // Public pages don't need auth
  test.use({ storageState: undefined });

  test("public live scoreboard loads", async ({ page }) => {
    await page.goto("/live");
    await expect(page.locator("h1")).toContainText("Live Scores");
  });

  test("public results page loads", async ({ page }) => {
    await page.goto("/results");
    await expect(page.locator("h1")).toContainText("Results");
  });

  test("public fixtures page loads", async ({ page }) => {
    await page.goto("/fixtures");
    await expect(page.locator("h1")).toContainText("Upcoming Fixtures");
  });
});
