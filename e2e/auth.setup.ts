import { test as setup, expect } from "@playwright/test";

const LOGIN_EMAIL = process.env.E2E_EMAIL ?? "declan@derrygaa.ie";
const LOGIN_PASSWORD = process.env.E2E_PASSWORD ?? "ClubOS2026!";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");

  await page.fill('input[type="email"]', LOGIN_EMAIL);
  await page.fill('input[type="password"]', LOGIN_PASSWORD);
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 });

  // Save auth state
  await page.context().storageState({ path: "e2e/.auth/user.json" });
});
