import { test, expect } from '@playwright/test';

const FRONTEND_BASE_URL = "http://localhost:4200";

test.use({ storageState: 'storageState.json' });

test.describe("Air Pollution Dashboard", () => {
  test("Filter works correctly", async ({ page }) => {
    await page.goto(FRONTEND_BASE_URL + "/street-light-management");
    await page.getByRole('combobox', { name: 'Locations' }).click();
    const firstOption = page.locator('.mat-mdc-option').nth(2);
    const optionText = await firstOption.textContent();
    await expect(firstOption).toBeVisible();  // this waits 5 seconds
    await firstOption.click();
    await page.pause();

    const locationCells = page.locator('td.cdk-column-location');

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

  test("Chart values match table entries", async ({ page }) => {
    await page.goto(FRONTEND_BASE_URL + "/air-pollution-monitoring");
  });

});