import { test, expect } from '@playwright/test';

const FRONTEND_BASE_URL = "http://localhost:4200";
const AIRPOLLUTION_BASE_URL = FRONTEND_BASE_URL + "/street-light-management";

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
    await page.goto(AIRPOLLUTION_BASE_URL);
    const headers = page.locator('.mat-sort-header');
    headers.first().click()
    await increaseNumberOfRows(page, 25);

    const locationCells = page.locator('td.cdk-column-location');
    const count = await locationCells.count();
    for (let i = 0; i < count-1; i++) {
      const cellText = await locationCells.nth(i).textContent();
      const nextCellText = await locationCells.nth(i + 1).textContent();
      if (cellText !== null && nextCellText !== null) {
        expect(cellText.localeCompare(nextCellText)).toBeLessThanOrEqual(0);
      } else {
        throw new Error(`Cell ${i} or ${i + 1} textContent is null`);
      }
    }
  });

});
