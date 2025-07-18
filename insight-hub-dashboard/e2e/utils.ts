import { expect, Page } from "@playwright/test";
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
        expect(cellText.localeCompare(nextCellText)).toBeGreaterThanOrEqual(0);
        } else {
        expect(cellText.localeCompare(nextCellText)).toBeLessThanOrEqual(0);
        }
      } else {
        throw new Error(`Cell ${i} or ${i + 1} textContent is null`);
      }
    }
}


export async function openLocationFilter(page: Page) {
  await page.getByRole('combobox', { name: 'Locations' }).click();
}

export async function selectFirstLocationOption(page: Page): Promise<string> {
  const firstOption = page.locator('.mdc-list-item__primary-text').nth(1);
  await expect(firstOption).toBeVisible();
  const optionText = await firstOption.textContent();
  if (!optionText) throw new Error('Option text is null');
  await firstOption.click();
  return optionText;
}

export async function verifyAllRowsMatch(page: Page, expectedText: string) {
  const locationCells = page.locator('td.cdk-column-location');
    if (expectedText !== null) {
        await expect(locationCells.first()).toHaveText(expectedText.trim());
    } else {
        throw new Error('optionText is null');
    }
  const count = await locationCells.count();
  for (let i = 0; i < count; i++) {
    const cellText = await locationCells.nth(i).textContent();
    expect(cellText?.trim()).toBe(expectedText.trim());
  }
}