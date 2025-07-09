import { expect } from "@playwright/test";
import { FRONTEND_BASE_URL, AIRPOLLUTION_BASE_URL } from './config';

async function increaseNumberOfRows(page: any, numberOfRows: number) {
  await page.locator('.mat-mdc-paginator-touch-target').click();
  await page.getByRole('option', { name: numberOfRows.toString() }).click();
}

export async function testSortingByLocation(page: any, isDesc: boolean){
    await page.goto(AIRPOLLUTION_BASE_URL);
    const headers = page.locator('.mat-sort-header');
    await page.pause();
    await headers.first().click()
    if (isDesc) {
        await headers.first().click()
    }
    await increaseNumberOfRows(page, 25);

    const locationCells = page.locator('td.cdk-column-location');
    const count = await locationCells.count();
    for (let i = 0; i < count-1; i++) {
      const cellText = await locationCells.nth(i).textContent();
      const nextCellText = await locationCells.nth(i + 1).textContent();
      if (cellText !== null && nextCellText !== null) {
        if (isDesc) {
        // current cell should be >= next cell → so a > b = 1, a === b = 0 → expect result >= 0
        expect(cellText.localeCompare(nextCellText)).toBeGreaterThanOrEqual(0);
        } else {
        // ascending: a <= b → expect result <= 0
        expect(cellText.localeCompare(nextCellText)).toBeLessThanOrEqual(0);
        }
      } else {
        throw new Error(`Cell ${i} or ${i + 1} textContent is null`);
      }
    }
}