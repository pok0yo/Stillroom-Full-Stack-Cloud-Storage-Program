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

test('unconfigured public routes: accessibility tree, keyboard and 320px reflow', async ({ page }) => {
  const external: string[] = [];
  const origin = new URL(test.info().project.use.baseURL!).origin;
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) { external.push(url.origin); return route.abort(); }
    return route.continue();
  });
  await page.addInitScript({ path: require.resolve('axe-core/axe.min.js') });
  for (const route of ['/', '/login', '/verify', '/privacy', '/terms']) {
    await page.goto(route);
    await expect(page.getByRole('main')).toBeVisible();
    for (const width of [1440, 320]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const violations = await page.evaluate(async () => (await (window as typeof window & { axe: typeof import('axe-core') }).axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } })).violations.map(v => ({ id: v.id, count: v.nodes.length })));
      expect(violations, `${route} at ${width}px`).toEqual([]);
    }
  }
  await page.goto('/login');
  await page.keyboard.press('Tab'); await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.getByLabel('Email address').focus(); await page.keyboard.press('Tab');
  await expect(page.getByLabel('Password', { exact: true })).toBeFocused();
  expect(await page.getByLabel('Password', { exact: true }).evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none');
  expect(await page.getByRole('main').ariaSnapshot()).toContain('textbox "Email address"');
  await page.screenshot({ path: 'test-results/portfolio-login-320.png', fullPage: true });
  expect(external).toEqual([]);
});
