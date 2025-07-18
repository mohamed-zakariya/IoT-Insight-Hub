import { test, expect, Page } from '@playwright/test';
import { openLocationFilter, selectFirstLocationOption, testSortingByLocation, verifyAllRowsMatch } from './utils';
import { FRONTEND_BASE_URL, AIRPOLLUTION_BASE_URL } from './config';

test.use({ storageState: 'storageState.json' });

test.describe("Air Pollution Dashboard", () => {
  test("Filter works correctly", async ({ page }) => {
    await page.goto(AIRPOLLUTION_BASE_URL);
    await page.pause();
    await openLocationFilter(page);
    const optionText = await selectFirstLocationOption(page);
    await verifyAllRowsMatch(page, optionText);
  });

  test("Verify sorting by Location in ascending order", async ({ page }) => {
    await testSortingByLocation(page, false);
  });

  test("Verify sorting by Location in descending order", async ({ page }) => {
    await testSortingByLocation(page, true);
  });

});