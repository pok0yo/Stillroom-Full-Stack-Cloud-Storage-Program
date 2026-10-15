import { coordinatedClient, operation } from '../lib/maintenance';
import { logFailure } from '../lib/logging';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { Account, Client, ID, TablesDB } from 'node-appwrite';
import { rateLimit } from '../lib/http';
import { remove } from '../lib/files';

async function main() {
  assert.equal(process.env.STILLROOM_LIVE_TESTS, '1', 'Explicit live-test opt-in required');
  const client = () => coordinatedClient(new Client().setEndpoint(process.env.APPWRITE_ENDPOINT!).setProject(process.env.APPWRITE_PROJECT_ID!));
  const db = new TablesDB(client().setKey(process.env.APPWRITE_API_KEY!));
  // Server-key session creation returns the secret used by the production session client.
  const loginAccount = new Account(client().setKey(process.env.APPWRITE_API_KEY!));
  const session = await loginAccount.createEmailPasswordSession({ email: process.env.TEST_OWNER_EMAIL!, password: process.env.TEST_OWNER_PASSWORD! });
  const userClient = client().setSession(session.secret);
  const userAccount = new Account(userClient);
  const user = await userAccount.get();
  const auth = { user, account: userAccount, db: new TablesDB(userClient) };
  const databaseId = process.env.APPWRITE_DATABASE_ID!;
  const ids: string[] = [];
  const subject = `live-check:${ID.unique()}`;
  const bucket = Math.floor(Date.now() / 3_600_000);
  const limitId = createHmac('sha256', process.env.RATE_LIMIT_SECRET!).update(`${subject}:${bucket}`).digest('hex').slice(0, 36);
  try {
    await rateLimit(subject, 2, 3600);
    await rateLimit(subject, 2, 3600);
    await assert.rejects(rateLimit(subject, 2, 3600), (error: unknown) => (error as { status: number }).status === 429);
    console.log('PASS real persistent limit exhaustion');
    for (const status of ['pending', 'failed', 'deleting']) {
      const rowId = ID.unique(); ids.push(rowId);
      await db.createRow({ databaseId, tableId: 'files', rowId, data: { owner: user.$id, name: 'recovery-test.txt', searchName: 'recovery-test.txt', size: 1, mime: 'text/plain', kind: 'document', recipients: [], status, digest: '0'.repeat(64) }, permissions: [] });
      if (status === 'pending') {
        await assert.rejects(remove(auth, rowId), (error: unknown) => (error as { status: number }).status === 409);
        assert.equal((await db.getRow({ databaseId, tableId: 'files', rowId })).$id, rowId);
      } else {
        await remove(auth, rowId);
        await assert.rejects(db.getRow({ databaseId, tableId: 'files', rowId }), (error: unknown) => (error as { code: number }).code === 404);
      }
    }
    console.log('PASS pending protection and failed/deleting recovery with absent storage bytes');
  } finally {
    for (const rowId of ids) {
      try { await db.deleteRow({ databaseId, tableId: 'files', rowId }); }
      catch (error) { if ((error as { code: number }).code !== 404) throw error; }
    }
    await db.deleteRow({ databaseId, tableId: 'limits', rowId: limitId });
    await userAccount.deleteSession({ sessionId: 'current' });
  }
}
operation(main).catch(error => { logFailure('verification', error); process.exitCode = 1; });
