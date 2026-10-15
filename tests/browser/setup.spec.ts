import { test, expect } from '@playwright/test';
test('unconfigured setup is honest, responsive, and navigable', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  page.on('console', message => { if (message.type() === 'error') console.error(message.text()); });
  await page.goto('/'); await expect(page.getByRole('heading', { name: 'Connect Appwrite to get started' })).toBeVisible();
  await page.getByRole('link', { name: 'Go to sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'New here? Create an account' }).click(); await expect(page.getByLabel('Your name')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/login-mobile.png', fullPage: true });
  expect(errors).toEqual([]);
});
test('protected API requires a session', async ({ request }) => {
  expect((await request.get('/api/files')).status()).toBe(401);
  expect((await request.get('/api/overview')).status()).toBe(401);
});
