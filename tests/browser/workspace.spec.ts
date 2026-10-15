import { checkContact } from './contact-check';
import { test, expect } from '@playwright/test';
import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { emptyTotals, type FileRecord } from '../../lib/domain';
test('actual library component: desktop, mobile, escaped preview, dialog and upload failure', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  let mode = 'ready';
  let exitMode = 'stale';
  let finishExit: (() => void) | undefined;
  let releaseLoading: (() => void) | undefined;
  const bundle = await build({ entryPoints: ['tests/browser/workspace-entry.tsx'], bundle: true, write: false, platform: 'browser', define: { 'process.env.NODE_ENV': '"production"', 'process.env': '{}' } });
  const css = await readFile('app/globals.css', 'utf8');
  const items: FileRecord[] = [
    { $id: 'f1', $createdAt: '2026-10-01T12:00:00Z', owner: 'alice', name: 'Notes for a quieter week.txt', searchName: 'notes for a quieter week.txt', mime: 'text/plain', size: 2018, kind: 'document', status: 'ready', recipients: [], digest: '' },
    { $id: 'f2', $createdAt: '2026-10-02T12:00:00Z', owner: 'alice', name: 'Autumn light.jpg', searchName: 'autumn light.jpg', mime: 'image/jpeg', size: 2401034, kind: 'image', status: 'ready', recipients: [], digest: '' },
  ];
  await page.route('http://stillroom.test/**', async route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/account-exit/request') {
      const body = route.request().postDataJSON();
      expect(body.accountId).toBeUndefined();
      if (body.action === 'cancel') return route.fulfill({ json: { ok: true } });
      if (exitMode === 'stale') return route.fulfill({ status: 409, json: { error: 'Sign out and sign in again.' } });
      await new Promise<void>(resolve => { finishExit = resolve; });
      return route.fulfill({ json: { caseId: '11111111-2222-3333-4444-555555555555', expiresAt: '2026-11-01T12:00:00Z' } });
    }
    if (url.pathname === '/api/files' && route.request().method() === 'GET' && mode === 'loading') await new Promise<void>(resolve => { releaseLoading = resolve; });
    if (url.pathname === '/api/overview' && mode === 'partial') return route.fulfill({ status: 503, json: { error: 'Totals offline' } });
    if (url.pathname === '/api/files' && mode === 'empty') return route.fulfill({ json: { items: [], next: null } });
    if (url.pathname === '/api/files' && mode === 'permission') return route.fulfill({ status: 401, json: { error: 'Your session has expired. Please sign in.' } });
    if (url.pathname === '/api/files' && route.request().method() === 'POST' && mode === 'success') return route.fulfill({ status: 201, json: { id: 'test-upload' } });
    if (url.pathname === '/bundle.js') return route.fulfill({ contentType: 'application/javascript', body: bundle.outputFiles[0].text });
    if (url.pathname === '/api/overview') return route.fulfill({ json: { totals: { ...emptyTotals(), documentCount: 1, documentBytes: 2018, imageCount: 1, imageBytes: 2401034 }, recent: items } });
    if (url.pathname === '/api/files' && route.request().method() === 'POST') return route.fulfill({ status: 400, json: { error: 'The file contents do not match an allowed format.' } });
    if (url.pathname === '/api/files') return route.fulfill({ json: { items, next: null } });
    if (url.pathname === '/api/files/f1') return route.fulfill({ json: { file: items[0], recipients: [] } });
    if (url.pathname === '/api/files/f1/content') return route.fulfill({ contentType: 'text/plain', body: '<b>This stays plain text.</b>' });
    return route.fulfill({ contentType: 'text/html', body: `<!doctype html><html lang="en"><head><title>Stillroom UI fixture</title><style>${css}</style></head><body><div id="root"></div><script src="/bundle.js"></script></body></html>` });
  });
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.goto('http://stillroom.test/');
  await expect(page.getByRole('heading', { name: 'Everything in its place.' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Notes for a quieter week/ })).toBeVisible();
  await page.screenshot({ path: 'test-results/workspace-desktop.png', fullPage: true });
  await page.getByRole('button', { name: /Notes for a quieter week/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('pre')).toHaveText('<b>This stays plain text.</b>');
  await expect(page.locator('pre b')).toHaveCount(0);
  await page.screenshot({ path: 'test-results/file-dialog.png', fullPage: true });
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Notes for a quieter week/ })).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/workspace-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeFocused();
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.locator('input[type=file]').setInputFiles({ name: 'fake.png', mimeType: 'image/png', buffer: Buffer.from('not an image') });
  await expect(page.getByRole('alert')).toContainText('contents do not match');
  await expect(page.getByRole('button', { name: 'Choose files' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('contents do not match');
  await page.screenshot({ path: 'test-results/upload-error-320.png', fullPage: true });
  await checkContact(page);
  await page.getByRole('region', { name: 'Contact the operator' }).locator('summary').click();
  await page.screenshot({ path: 'test-results/contact-workspace-320.png', fullPage: true });
  await page.getByRole('region', { name: 'Contact the operator' }).locator('summary').click();
  await page.setViewportSize({ width: 1440, height: 1050 });
  await checkContact(page);
  mode = 'success';
  await page.locator('input[type=file]').setInputFiles({ name: 'note.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
  await expect(page.getByRole('status').filter({ hasText: 'note.txt was uploaded.' })).toBeVisible();
  await expect(page.getByText('Opening your library…')).toHaveCount(0);
  const dropped = await page.evaluateHandle(() => { const data = new DataTransfer(); data.items.add(new File(['synthetic drop'], 'dropped.txt', { type: 'text/plain' })); return data; });
  await page.locator('.dropzone').dispatchEvent('drop', { dataTransfer: dropped });
  await expect(page.getByRole('status').filter({ hasText: 'dropped.txt was uploaded.' })).toBeVisible();
  await dropped.dispose();
  mode = 'partial';
  await page.getByRole('button', { name: 'My Files', exact: true }).click();
  await expect(page.getByText('Storage totals are unavailable.', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: /Notes for a quieter week/ })).toBeVisible();
  await page.screenshot({ path: 'test-results/partial-state.png', fullPage: true });
  mode = 'empty';
  await page.getByRole('button', { name: 'My Files', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A fresh start.' })).toBeVisible();
  await page.screenshot({ path: 'test-results/empty-state.png', fullPage: true });
  mode = 'loading';
  await page.getByRole('button', { name: 'My Files', exact: true }).click();
  await expect(page.getByText('Opening your library…')).toBeVisible();
  await page.screenshot({ path: 'test-results/loading-state.png', fullPage: true });
  await expect.poll(() => Boolean(releaseLoading)).toBe(true);
  mode = 'ready'; releaseLoading!();
  await expect(page.getByRole('button', { name: /Notes for a quieter week/ })).toBeVisible();
  mode = 'permission';
  await page.getByRole('button', { name: 'My Files', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Your session has expired.');
  await expect(page.getByRole('link', { name: 'Sign in again' })).toHaveAttribute('href', '/login');
  await page.screenshot({ path: 'test-results/permission-state.png', fullPage: true });
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const launcher = page.getByRole('button', { name: 'Request account exit', exact: true });
    await launcher.focus(); await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const submit = dialog.getByRole('button', { name: 'Record exit request' });
    const checkbox = dialog.getByRole('checkbox');
    if (!(await checkbox.isChecked())) { await expect(submit).toBeDisabled(); await checkbox.focus(); await page.keyboard.press('Space'); }
    await submit.click(); await expect(dialog.getByRole('alert')).toContainText('Sign out');
    exitMode = 'fresh'; await submit.click();
    await expect(dialog.getByRole('button', { name: 'Recording request…' })).toBeDisabled();
    await expect.poll(() => Boolean(finishExit)).toBe(true); finishExit!();
    await expect(dialog.getByRole('status')).toContainText('Request recorded');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await page.screenshot({ path: 'test-results/exit-request-' + width + '.png', fullPage: true });
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
    await dialog.getByRole('button', { name: 'Cancel exit request' }).click();
    await expect(dialog.getByRole('status')).toContainText('cancelled');
    await page.keyboard.press('Escape'); await expect(launcher).toBeFocused();
    exitMode = 'stale'; finishExit = undefined;
  }
  expect(errors).toEqual([]);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.getByRole('button', { name: 'Refresh', exact: true }).evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
});

test('portfolio file actions, browsing and accessible desktop/mobile controls (simulated HTTP)', async ({ page }) => {
  const bundle = await build({ entryPoints: ['tests/browser/workspace-entry.tsx'], bundle: true, write: false, platform: 'browser', define: { 'process.env.NODE_ENV': '"production"', 'process.env': '{}' } });
  const css = await readFile('app/globals.css', 'utf8');
  const contents = Buffer.from('Synthetic portfolio download.\n');
  const file: FileRecord = { $id: 'portfolio-file', $createdAt: '2026-10-01T12:00:00Z', owner: 'alice', name: 'Portfolio note.txt', searchName: 'portfolio note.txt', mime: 'text/plain', size: contents.length, kind: 'document', status: 'ready', recipients: [], digest: '' };
  const second = { ...file, $id: 'second-file', name: 'Second note.txt' };
  const shared = { ...file, $id: 'shared-file', owner: 'bob', name: 'Shared note.txt', recipients: ['alice'] };
  const writes: unknown[] = []; const queries: URLSearchParams[] = [];
  const unexpected: string[] = []; let deleted = false;
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== 'http://stillroom.test') { unexpected.push(url.origin); return route.abort(); }
    if (url.pathname === '/bundle.js') return route.fulfill({ contentType: 'application/javascript', body: bundle.outputFiles[0].text });
    if (url.pathname === '/api/overview') return route.fulfill({ json: { totals: emptyTotals(), recent: deleted ? [] : [file] } });
    if (url.pathname === '/api/files') {
      queries.push(url.searchParams);
      return route.fulfill({ json: { items: url.searchParams.get('view') === 'shared' ? [shared] : url.searchParams.has('cursor') ? [second] : deleted ? [] : [file], next: url.searchParams.has('cursor') ? null : 'synthetic-cursor' } });
    }
    if (url.pathname.endsWith('/content')) return route.fulfill({ contentType: 'text/plain', headers: url.searchParams.has('preview') ? {} : { 'Content-Disposition': 'attachment; filename="portfolio.txt"' }, body: contents });
    if (url.pathname === '/api/files/portfolio-file' || url.pathname === '/api/files/shared-file') {
      const method = route.request().method();
      if (method === 'PATCH') {
        const body = route.request().postDataJSON(); writes.push(body);
        if (body.action === 'rename') file.name = body.name;
        if (body.action === 'share') file.recipients = ['bob'];
        if (body.action === 'revoke') file.recipients = [];
        return route.fulfill({ json: { ok: true } });
      }
      if (method === 'DELETE') { writes.push({ action: 'delete' }); deleted = true; return route.fulfill({ json: { ok: true } }); }
      return route.fulfill({ json: { file, recipients: file.recipients.map(id => ({ id, email: 'recipient@example.test' })) } });
    }
    return route.fulfill({ contentType: 'text/html', body: `<!doctype html><html lang="en"><head><title>Stillroom portfolio fixture</title><style>${css}</style></head><body><div id="root"></div><script src="/bundle.js"></script></body></html>` });
  });
  const accessibility = async () => {
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
    const violations = await page.evaluate(async () => (await (window as typeof window & { axe: typeof import('axe-core') }).axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } })).violations.map(v => ({ id: v.id, count: v.nodes.length })));
    expect(violations).toEqual([]);
  };
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.goto('http://stillroom.test/');
  const row = page.getByRole('button', { name: /Portfolio note/ });
  await expect(row).toBeVisible(); await accessibility();
  expect(await page.getByRole('main').ariaSnapshot()).toContain('Search accessible files by name');
  await row.focus(); await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: 'Close dialog' })).toBeFocused();
  await accessibility();
  await dialog.getByLabel('Registered, verified email').fill('recipient@example.test');
  await dialog.getByRole('button', { name: 'Share file', exact: true }).click();
  await expect(dialog.getByText('recipient@example.test', { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Revoke access' }).click();
  await expect(dialog.getByRole('button', { name: 'Revoke access' })).toHaveCount(0);
  await dialog.getByLabel('Filename').fill('Renamed note.txt');
  await dialog.getByRole('button', { name: 'Save name' }).click();
  const renamed = page.getByRole('button', { name: /Renamed note/ });
  await expect(renamed).toBeVisible(); await renamed.click();
  const download = page.getByRole('link', { name: 'Download original' });
  await expect(download).toHaveAttribute('href', '/api/files/portfolio-file/content');
  await expect(download).toHaveAttribute('download', '');
  // The intercepted synthetic hostname cannot complete Edge's separate download transport.
  const fetched = await page.evaluate(async url => Array.from(new Uint8Array(await (await fetch(url)).arrayBuffer())), (await download.getAttribute('href'))!);
  expect(Buffer.from(fetched)).toEqual(contents);
  await dialog.getByRole('button', { name: 'Delete file', exact: true }).click();
  expect(deleted).toBe(false);
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  expect(deleted).toBe(false);
  await dialog.getByRole('button', { name: 'Delete file', exact: true }).click();
  await dialog.getByRole('button', { name: 'Delete file', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(writes).toEqual([{ action: 'share', email: 'recipient@example.test' }, { action: 'revoke', recipient: 'bob' }, { action: 'rename', name: 'Renamed note.txt' }, { action: 'delete' }]);
  await page.getByRole('button', { name: 'My Files', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('button', { name: /Second note/ })).toBeVisible();
  expect(queries.at(-1)!.get('cursor')).toBe('synthetic-cursor');
  await page.getByRole('button', { name: 'Previous', exact: true }).click();
  await page.getByRole('searchbox').fill('note'); await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect.poll(() => queries.at(-1)!.get('q')).toBe('note');
  await page.getByRole('combobox', { name: 'Type', exact: true }).selectOption('document');
  await expect.poll(() => queries.at(-1)!.get('kind')).toBe('document');
  await page.getByRole('combobox', { name: 'Sort', exact: true }).selectOption('size');
  await expect.poll(() => queries.at(-1)!.get('sort')).toBe('size');
  await page.getByRole('button', { name: 'Shared with Me', exact: true }).click();
  await page.getByRole('button', { name: /Shared note/ }).click();
  await expect(dialog.getByRole('link', { name: 'Download original' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: /Delete file|Save name|Share file/ })).toHaveCount(0);
  await page.keyboard.press('Escape');
  // 320 CSS px is the reflow width of a 1280px viewport at 400% browser zoom; not an assistive-technology test.
  await page.setViewportSize({ width: 320, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await accessibility();
  await page.getByRole('button', { name: 'Menu', exact: true }).focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible(); await accessibility();
  await page.screenshot({ path: 'test-results/portfolio-menu-320.png', fullPage: true });
  await page.keyboard.press('Escape'); await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeFocused();
  expect(unexpected).toEqual([]);
});
