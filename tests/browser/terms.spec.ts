import { test, expect } from '@playwright/test';
import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';

test('actual agreement UI: unchecked, keyboard, error focus, loading, exit and responsive states', async ({ page }) => {
  const bundle = await build({ entryPoints: ['tests/browser/terms-entry.tsx'], bundle: true, write: false, platform: 'browser', define: { 'process.env.NODE_ENV': '"production"', 'process.env': '{}' } });
  const css = await readFile('app/globals.css', 'utf8');
  let submissions = 0;
  let release: (() => void) | undefined;
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('http://stillroom.test/**', async route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/bundle.js') return route.fulfill({ contentType: 'application/javascript', body: bundle.outputFiles[0].text });
    if (url.pathname === '/api/terms/accept') {
      submissions++;
      expect(route.request().postDataJSON()).toEqual({ agree: true, version: 'a'.repeat(64) });
      await new Promise<void>(resolve => { release = resolve; });
      return route.fulfill({ status: 409, json: { error: 'The terms version changed. Reload and review it before agreeing.' } });
    }
    if (url.pathname === '/api/account-exit/request') return route.fulfill({ json: { caseId: 'synthetic-case', expiresAt: '2027-01-01T12:00:00Z' } });
    return route.fulfill({ contentType: 'text/html', body: `<!doctype html><html lang="en"><head><title>Synthetic agreement fixture</title><style>${css}</style></head><body><div id="root"></div><script src="/bundle.js"></script></body></html>` });
  });
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('http://stillroom.test/');
    const checkbox = page.getByRole('checkbox', { name: /I agree/ });
    await expect(checkbox).not.toBeChecked();
    await expect(page.getByRole('button', { name: 'Agree and continue' })).toBeDisabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/terms-pending-${width}.png`, fullPage: true });
  }
  expect(submissions).toBe(0);
  const checkbox = page.getByRole('checkbox', { name: /I agree/ });
  await checkbox.focus(); await page.keyboard.press('Space'); await expect(checkbox).toBeChecked();
  await page.keyboard.press('Tab'); await expect(page.getByRole('button', { name: 'Agree and continue' })).toBeFocused();
  await page.keyboard.press('Enter'); await expect(page.getByRole('button', { name: 'Recording agreement…' })).toBeDisabled();
  await expect.poll(() => Boolean(release)).toBe(true); release!();
  await expect(page.getByRole('alert')).toContainText('version changed');
  await expect(page.getByRole('alert')).toBeFocused();
  await expect(checkbox).not.toBeChecked();
  await page.screenshot({ path: 'test-results/terms-error-320.png', fullPage: true });
  await page.getByRole('button', { name: 'Request account exit', exact: true }).click();
  await page.getByRole('checkbox', { name: /I request account exit/ }).check();
  await page.getByRole('button', { name: 'Record exit request', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('status')).toContainText('synthetic-case');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Request account exit', exact: true })).toBeFocused();
  await page.goto('http://stillroom.test/unavailable');
  await expect(page.getByRole('heading', { name: 'Agreement temporarily unavailable' })).toBeVisible();
  await expect(page.getByRole('checkbox')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Request account exit', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Read privacy notice' })).toHaveAttribute('href', '/privacy');
  await page.screenshot({ path: 'test-results/terms-unavailable-320.png', fullPage: true });
  expect(errors).toEqual([]);
});
