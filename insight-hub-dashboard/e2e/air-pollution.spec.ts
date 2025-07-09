import { test, expect } from '@playwright/test';

const FRONTEND_BASE_URL = "http://localhost:4200";

test.use({ storageState: 'storageState.json' });

test.describe("Air Pollution Dashboard", () => {
  test("Filter works correctly", async ({ page }) => {
    await page.goto(FRONTEND_BASE_URL + "/air-pollution-monitoring");
    await page.pause();
  });

  test("Chart values match table entries", async ({ page }) => {
    await page.goto(FRONTEND_BASE_URL + "/air-pollution-monitoring");
  });
});