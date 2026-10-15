import { test, expect } from '@playwright/test';

test('live authenticated workspace: desktop and narrow-screen navigation', async ({ page }) => {
  test.skip(process.env.STILLROOM_LIVE_TESTS !== '1', 'Requires approved live test credentials.');
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/login');
  await page.getByLabel('Email address').fill(process.env.TEST_OWNER_EMAIL!);
  await page.getByLabel('Password', { exact: true }).fill(process.env.TEST_OWNER_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Everything in its place.' })).toBeVisible();
  await expect(page.getByText('A fresh start.', { exact: true })).toBeVisible();
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/live-workspace-${width}.png`, fullPage: true });
  }
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeFocused();
  expect(errors).toEqual([]);
});
