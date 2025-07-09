async function increaseNumberOfRows(page: any, numberOfRows: number) {
  await page.pause();
  await page.locator('.mat-mdc-paginator-touch-target').click();
  await page.getByRole('option', { name: numberOfRows.toString() }).click();
}