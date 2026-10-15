import { coordinatedClient, operation } from '../../lib/maintenance';
import { test, expect } from '@playwright/test';
import { Account, Client, ID, Storage, TablesDB, type Models } from 'node-appwrite';

test('live Appwrite: bounded shared/owned queries and direct permission denials', async ({ playwright }) => {
  test.skip(process.env.STILLROOM_LIVE_TESTS !== '1', 'Requires approved disposable accounts and cloud resources.');
  test.setTimeout(180_000);
  const baseURL = process.env.TEST_BASE_URL ?? 'http://localhost:3000';
  const client = () => coordinatedClient(new Client().setEndpoint(process.env.APPWRITE_ENDPOINT!).setProject(process.env.APPWRITE_PROJECT_ID!));
  const admin = new TablesDB(client().setKey(process.env.APPWRITE_API_KEY!));
  const ref = { databaseId: process.env.APPWRITE_DATABASE_ID!, tableId: 'files' };
  const owner = process.env.TEST_OWNER_ID!;
  const recipient = process.env.TEST_RECIPIENT_ID!;
  const contexts = await Promise.all(['OWNER', 'RECIPIENT'].map(async role => {
    const context = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { Origin: new URL(baseURL).origin } });
    expect((await context.post('/api/auth/signin', { data: { email: process.env[`TEST_${role}_EMAIL`], password: process.env[`TEST_${role}_PASSWORD`] } })).status()).toBe(200);
    return context;
  }));
  const ids: string[] = [];
  const prefix = `query-${Date.now()}`;
  try {
    // These are disposable metadata fixtures in the real provider, not uploaded files.
    for (let n = 0; n < 26; n++) {
      const id = ID.unique();
      await operation(() => admin.createRow({ ...ref, rowId: id, data: { owner, name: `${prefix}-${String(n).padStart(2, '0')}.txt`, searchName: `${prefix}-${String(n).padStart(2, '0')}.txt`, size: n + 1, mime: 'text/plain', kind: 'document', recipients: [recipient], status: 'ready', digest: '0'.repeat(64) }, permissions: [] }));
      ids.push(id);
    }
    for (const [index, view] of ['owned', 'shared'].entries()) {
      for (const sort of ['name', 'size', 'oldest', 'newest']) {
        const query = `/api/files?view=${view}&q=${prefix}&kind=document&sort=${sort}`;
        const first = await contexts[index].get(query); expect(first.status()).toBe(200);
        const page1 = await first.json(); expect(page1.items).toHaveLength(25); expect(page1.next).toBeTruthy();
        const second = await contexts[index].get(`${query}&cursor=${page1.next}`); expect(second.status()).toBe(200);
        const page2 = await second.json(); expect(page2.items).toHaveLength(1); expect(page2.next).toBeNull();
        expect(new Set([...page1.items, ...page2.items].map(row => row.$id)).size).toBe(26);
        const sizes = [...page1.items, ...page2.items].map(row => row.size);
        if (sort === 'size') expect(sizes).toEqual(Array.from({ length: 26 }, (_, n) => 26 - n));
        if (sort === 'name') expect(sizes).toEqual(Array.from({ length: 26 }, (_, n) => n + 1));
      }
      const empty = await contexts[index].get(`/api/files?view=${view}&q=${prefix}&kind=image`);
      expect((await empty.json()).items).toEqual([]);
      const state = await contexts[index].storageState();
      const session = client().setSession(state.cookies.find(cookie => cookie.name === 'stillroom_session')!.value);
      const db = new TablesDB(session);

      const denied = async (work: Promise<unknown>) => {
        try { await work; throw new Error('Unexpected direct access'); }
        catch (error) { expect([401, 403, 404]).toContain((error as { code?: number }).code); }
      };
      await denied(db.getRow({ ...ref, rowId: ids[0] }));
      expect((await db.listRows(ref)).rows).toEqual([]);
      for (const tableId of ['totals', 'members', 'invitations']) expect((await db.listRows({ databaseId: ref.databaseId, tableId })).rows).toEqual([]);
      await denied(operation(() => db.updateRow<Models.Row & { name: string }>({ ...ref, rowId: ids[0], data: { name: 'unauthorized.txt' } })));
      await denied(operation(() => db.deleteRow({ ...ref, rowId: ids[0] })));
      expect((await db.listRows({ databaseId: ref.databaseId, tableId: 'limits' })).rows).toEqual([]);
      expect((await new Storage(session).listFiles({ bucketId: process.env.APPWRITE_BUCKET_ID! })).files).toEqual([]);
      await operation(() => new Account(session).deleteSession({ sessionId: 'current' }));
    }
  } finally {
    for (const rowId of ids) await operation(() => admin.deleteRow({ ...ref, rowId }));
    for (const context of contexts) await context.dispose();
  }
});
