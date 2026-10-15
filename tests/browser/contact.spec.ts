import { test } from '@playwright/test';
import { checkContact } from './contact-check';

test('public contact: real login and verification routes, desktop and mobile keyboard access', async ({ page }) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/login', '/verify']) {
      await page.goto(route);
      await checkContact(page);
      await page.getByRole('region', { name: 'Contact the operator' }).locator('summary').click();
      await page.screenshot({ path: `test-results/contact-${route.slice(1)}-${width}.png`, fullPage: true });
    }
  }
});
