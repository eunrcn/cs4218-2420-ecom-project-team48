import { test, expect } from '@playwright/test';


test.beforeEach(async ({ page }) => {
    await page.goto(".");
  });


test('test', async ({ page }) => {
  await page.getByRole('radio', { name: '$100 or more' }).check();
  await page.getByRole('button', { name: 'RESET FILTERS' }).click();
  await expect(true).toBeTruthy();
});



