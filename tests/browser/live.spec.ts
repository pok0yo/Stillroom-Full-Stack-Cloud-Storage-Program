import { test, expect, type APIRequestContext } from '@playwright/test';
import { Client, Storage } from 'node-appwrite';
test('live Appwrite: two-user authorization and file lifecycle', async ({ playwright }) => {
  test.skip(process.env.STILLROOM_LIVE_TESTS !== '1', 'Requires explicit approval, configured Appwrite and two verified test accounts.');
  test.setTimeout(180_000);
  const baseURL = process.env.TEST_BASE_URL ?? 'http://localhost:3000';
  const origin = new URL(baseURL).origin;
  const a = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { Origin: origin } });
  const b = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { Origin: origin } });
  let id: string | undefined;
  async function login(client: APIRequestContext, prefix: string) {
    const email = process.env[`${prefix}_EMAIL`]; const password = process.env[`${prefix}_PASSWORD`];
    if (!email || !password) throw new Error(`Missing ${prefix} credentials`);
    expect((await client.post('/api/auth/signin', { data: { email, password } })).ok()).toBeTruthy();
    expect((await client.get('/api/overview')).ok()).toBeTruthy();
  }
  try {
    await login(a, 'TEST_OWNER'); await login(b, 'TEST_RECIPIENT');
    const before = await (await a.get('/api/overview')).json();
    const original = Buffer.from(`Stillroom live verification ${Date.now()}\n`);
    const upload = await a.post('/api/files', { headers: { 'X-File-Name': 'live-verification.txt', 'Content-Type': 'application/octet-stream' }, data: original });
    expect(upload.status()).toBe(201); id = (await upload.json()).id;
    const state = await a.storageState();
    const direct = new Storage(new Client().setEndpoint(process.env.APPWRITE_ENDPOINT!).setProject(process.env.APPWRITE_PROJECT_ID!).setSession(state.cookies.find(cookie => cookie.name === 'stillroom_session')!.value));
    await expect(direct.getFileDownload({ bucketId: process.env.APPWRITE_BUCKET_ID!, fileId: id! })).rejects.toMatchObject({ code: 404 });
    expect((await b.get(`/api/files/${id}/content`)).status()).toBe(404);
    const received = await a.get(`/api/files/${id}/content`); expect(await received.body()).toEqual(original);
    expect(received.headers()['cache-control']).toContain('no-store');
    const after = await (await a.get('/api/overview')).json(); expect(after.totals.documentBytes).toBe(before.totals.documentBytes + original.length);
    expect((await a.patch(`/api/files/${id}`, { data: { action: 'share', email: process.env.TEST_RECIPIENT_EMAIL } })).ok()).toBeTruthy();
    expect(await (await b.get(`/api/files/${id}/content`)).body()).toEqual(original);
    expect((await b.patch(`/api/files/${id}`, { data: { action: 'rename', name: 'stolen.txt' } })).status()).toBe(404);
    expect((await b.delete(`/api/files/${id}`)).status()).toBe(404);
    const details = await (await a.get(`/api/files/${id}`)).json();
    expect((await a.patch(`/api/files/${id}`, { data: { action: 'revoke', recipient: details.recipients[0].id } })).ok()).toBeTruthy();
    expect((await b.get(`/api/files/${id}/content`)).status()).toBe(404);
    expect((await a.patch(`/api/files/${id}`, { data: { action: 'rename', name: 'live-renamed.txt' } })).ok()).toBeTruthy();
    const results = await (await a.get('/api/files?q=live-renamed&sort=name&kind=document')).json(); expect(results.items.some((r: { $id: string }) => r.$id === id)).toBeTruthy();
    expect((await a.post('/api/files', { headers: { 'X-File-Name': 'fake.png' }, data: Buffer.from('not an image') })).status()).toBe(400);
    expect((await a.delete(`/api/files/${id}`)).ok()).toBeTruthy(); id = undefined;
    const final = await (await a.get('/api/overview')).json(); expect(final.totals).toEqual(before.totals);
    expect((await a.post('/api/auth/signout', { data: {} })).ok()).toBeTruthy(); expect((await a.get('/api/files')).status()).toBe(401);
  } finally {
    if (id) { const cleanup = await a.delete(`/api/files/${id}`); if (!cleanup.ok()) console.error(`Live test cleanup requires operator attention for file ${id}`); }
    await a.dispose(); await b.dispose();
  }
});
