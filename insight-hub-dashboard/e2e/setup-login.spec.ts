import dotenv from 'dotenv';
import { test, expect } from '@playwright/test';
import path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});

const EMAIL = process.env['EMAIL'];
const PASSWORD = process.env['PASSWORD'];
const FRONTEND_BASE_URL = "http://localhost:4200";

if (!EMAIL || !PASSWORD) {
  throw new Error('EMAIL and PASSWORD environment variables must be set');
}

test('Login and save storage state', async ({ page }) => {
  await page.goto(FRONTEND_BASE_URL + "/auth");
  await page.getByRole('button', { name: 'SIGN IN' }).click();
  await page.getByPlaceholder('Email').fill(EMAIL);
  await page.getByPlaceholder('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'SIGN IN' }).click();
  await page.waitForURL(FRONTEND_BASE_URL + "/home");

  await page.context().storageState({ path: 'storageState.json' }); // Export the current browser context’s storage state (cookies + localStorage + sessionStorage) into a JSON file
  // Cookies = server knows who you are
  // LocalStorage/sessionStorage = frontend knows who you are
  // storageState saves them all → so your tests can skip login UI and be instantly authenticated.
});