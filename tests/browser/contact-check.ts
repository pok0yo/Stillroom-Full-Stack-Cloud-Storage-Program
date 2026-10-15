import { expect, type Page } from '@playwright/test';

export async function checkContact(page: Page) {
  const section = page.getByRole('region', { name: 'Contact the operator' });
  const link = section.getByRole('link', { name: 'Email yla.stillroom@gmail.com' });
  await expect(link).toHaveAttribute('href', 'mailto:yla.stillroom@gmail.com');
  await expect(section).toContainText('target, not a guarantee');
  const summary = section.locator('summary');
  // Focus the preceding stop, then use native keyboard traversal into the link.
  await summary.focus(); await page.keyboard.press('Shift+Tab'); await expect(link).toBeFocused();
  expect(await link.evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none');
  await link.evaluate(el => el.addEventListener('click', event => { event.preventDefault(); el.setAttribute('data-activated', 'true'); }));
  await page.keyboard.press('Enter'); await expect(link).toHaveAttribute('data-activated', 'true');
  await page.keyboard.press('Tab'); await expect(summary).toBeFocused();
  await page.keyboard.press('Enter'); await expect(section.locator('details')).toHaveAttribute('open', '');
  await expect(section).toContainText('Do not send passwords');
  await expect(section).toContainText('this is not automatic deletion');
  expect(await link.evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press('Space'); await expect(section.locator('details')).not.toHaveAttribute('open');
}
