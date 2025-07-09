import { test, expect, Page } from '@playwright/test';
import { testSortingByLocation } from './utils';
import { FRONTEND_BASE_URL, AIRPOLLUTION_BASE_URL } from './config';

test.use({ storageState: 'storageState.json' });

test.describe("Air Pollution Dashboard", () => {
  test("Filter works correctly", async ({ page }) => {
    await page.goto(AIRPOLLUTION_BASE_URL);
    // await page.pause();
    await page.getByRole('combobox', { name: 'Locations' }).click();
    const firstOption = page.locator('.mdc-list-item__primary-text').nth(1);
    const optionText = await firstOption.textContent();
    await expect(firstOption).toBeVisible();  // this waits 5 seconds
    await firstOption.click();

    const locationCells = page.locator('td.cdk-column-location');
    if (optionText !== null) {
      await expect(locationCells.first()).toHaveText(optionText);
    } else {
      throw new Error('optionText is null');
    }
    
    // await page.waitForTimeout(2000);
    const count = await locationCells.count();
    for (let i = 0; i < count; i++) {
      const cellText = await locationCells.nth(i).textContent();
      if (cellText !== null) {
        expect(cellText.trim()).toBe(optionText?.trim());
      } else {
        throw new Error(`Cell ${i} textContent is null`);
      }
    }
  });

  test("Verify sorting by Location in ascending order", async ({ page }) => {
    await testSortingByLocation(page, false);
  });

  test("Verify sorting by Location in descending order", async ({ page }) => {
    await testSortingByLocation(page, true);
  });

});


