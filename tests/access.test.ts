import './local-environment';
import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { AppwriteException, TablesDB, Users } from 'node-appwrite';
import { activeMember, enroll, invitationId, eligibleAccount } from '../lib/membership';
import { suspend } from '../lib/suspension';
import { handle } from '../lib/http';
import { logFailure } from '../lib/logging';
import config from '../next.config';

Object.assign(process.env, { APP_ORIGIN: 'http://localhost:3000', APPWRITE_ENDPOINT: 'https://example.invalid/v1', APPWRITE_PROJECT_ID: 'test', APPWRITE_API_KEY: 'synthetic', APPWRITE_DATABASE_ID: 'test', APPWRITE_BUCKET_ID: 'test', RATE_LIMIT_SECRET: 'synthetic-rate-secret-at-least-32-characters' });
type Row = Record<string, unknown> & { $id: string };
type Params = { tableId: string; rowId: string; transactionId?: string; data?: Record<string, unknown>; permissions?: string[]; queries?: string[] };
test('verified invitation binding, bypass denial, suspension and retry with preserved data', async () => {
  let rows = new Map<string, Row>();
  const transactions = new Map<string, Map<string, Row>>();
  const versions = new Map<string, number>(); let version = 0;
  const user = { $id: 'tester', email: 'tester@example.test', emailVerification: false, status: true };
  let failDisable = false, failSessions = false, failCleanup = false, failBinding = false, failDenial = false;
  const store = (p: Params) => p.transactionId ? transactions.get(p.transactionId)! : rows;
  const key = (p: Params) => `${p.tableId}:${p.rowId}`;
  mock.method(Users.prototype, 'get', async () => ({ ...user }));
  mock.method(Users.prototype, 'updateStatus', async () => { if (failDisable) throw new Error('simulated'); user.status = false; });
  mock.method(Users.prototype, 'deleteSessions', async () => { if (failSessions) throw new Error('simulated'); });
  mock.method(TablesDB.prototype, 'getRow', async (p: Params) => { const value = store(p).get(key(p)); if (!value) throw new AppwriteException('missing', 404); return structuredClone(value); });
  mock.method(TablesDB.prototype, 'createRow', async (p: Params) => { assert.deepEqual(p.permissions, []); if (store(p).has(key(p))) throw new AppwriteException('conflict', 409); if (failBinding) throw new Error('simulated'); const value = { $id: p.rowId, ...p.data }; store(p).set(key(p), value); return value; });
  mock.method(TablesDB.prototype, 'updateRow', async (p: Params) => { if ((p.tableId === 'files' && failCleanup) || (p.tableId === 'members' && failDenial)) throw new Error('simulated'); const old = store(p).get(key(p)); if (!old) throw new AppwriteException('missing', 404); const value = { ...old, ...p.data, $permissions: p.permissions }; store(p).set(key(p), value); return value; });
  mock.method(TablesDB.prototype, 'createTransaction', async () => { const id = `tx${transactions.size}`; transactions.set(id, structuredClone(rows)); versions.set(id, version); return { $id: id }; });
  mock.method(TablesDB.prototype, 'updateTransaction', async ({ transactionId, commit }: { transactionId: string; commit?: boolean }) => { if (commit) { if (versions.get(transactionId) !== version) throw new AppwriteException('conflict', 409); rows = transactions.get(transactionId)!; version++; } });
  mock.method(TablesDB.prototype, 'listRows', async (p: Params) => { const q = p.queries!.map(value => JSON.parse(value)); assert.ok(q.some(query => query.method === 'limit' && query.values[0] === 25)); const cursor = q.find(query => query.method === 'cursorAfter')?.values[0]; const values = [...rows.entries()].filter(([key, value]) => key.startsWith(`${p.tableId}:`) && (!cursor || value.$id > cursor)).map(([, value]) => value).sort((a,b) => a.$id.localeCompare(b.$id)); return { rows: values.slice(0, 25) }; });
  try {
    await assert.rejects(enroll(user), 'unverified direct signup denied');
    user.emailVerification = true;
    await assert.rejects(enroll(user), 'verified non-invited direct signup denied');
    const inviteKey = `invitations:${invitationId(user.email)}`;
    rows.set(inviteKey, { $id: invitationId(user.email), email: user.email, state: 'invited', accountId: '' });
    user.emailVerification = false;
    await assert.rejects(enroll(user)); assert.equal(rows.get(inviteKey)!.accountId, '');
    user.emailVerification = true; failBinding = true;
    await assert.rejects(enroll(user)); assert.equal(rows.get(inviteKey)!.state, 'invited', 'failed transaction must not consume invitation');
    failBinding = false;
    const attempts = await Promise.allSettled([enroll(user), enroll({ ...user, $id: 'racer' })]);
    assert.equal(attempts.filter(result => result.status === 'fulfilled').length, 1, 'mock optimistic conflict permits only one binding');
    assert.ok([user.$id, 'racer'].includes(String(rows.get(inviteKey)!.accountId)));
    user.$id = String(rows.get(inviteKey)!.accountId);
    const loser = user.$id === 'tester' ? 'racer' : 'tester';
    assert.equal(rows.has(`members:${loser}`), false, 'loser has no membership');
    await assert.rejects(activeMember({ ...user, $id: loser }));
    await enroll(user);
    assert.equal(rows.get(inviteKey)!.accountId, user.$id);
    await assert.rejects(enroll({ ...user, $id: 'impostor' }), 'same email cannot bind another account');
    user.email = 'changed@example.test';
    rows.set(`invitations:${invitationId(user.email)}`, { $id: invitationId(user.email), email: user.email, state: 'invited', accountId: '' });
    await assert.rejects(enroll(user), 'bound account cannot switch to another invitation');
    await assert.rejects(eligibleAccount(user.$id), 'changed email is not a sharing recipient');
    user.email = 'tester@example.test';
    for (let i=0; i<27; i++) rows.set(`files:f${String(i).padStart(2,'0')}`, { $id: `f${String(i).padStart(2,'0')}`, owner: i === 0 ? user.$id : 'owner', recipients: [user.$id, 'other'], digest: 'preserved', $permissions: ['legacy'] });
    failDenial = true;
    assert.ok(Object.values(await suspend(user.$id)).every(done => !done), 'failed denial stops workflow');
    assert.equal(user.status, true);
    failDenial = false;
    failDisable = true; failSessions = true; failCleanup = true;
    const first = await suspend(user.$id);
    assert.deepEqual(first, { applicationDenied: true, accountDisabled: false, sessionsRevoked: false, recipientAccessRemoved: false });
    await assert.rejects(activeMember(user), 'pre-existing authenticated identity denied');
    await assert.rejects(enroll(user), 'suspended member cannot consume another invitation');
    failDisable = false; failSessions = false; failCleanup = false;
    assert.ok(Object.values(await suspend(user.$id)).every(Boolean));
    assert.ok(Object.values(await suspend(user.$id)).every(Boolean), 'retry remains successful');
    assert.equal([...rows.keys()].filter(key => key.startsWith('files:')).length, 27);
    for (const [key, value] of rows) if (key.startsWith('files:')) { assert.deepEqual(value.recipients, ['other']); assert.equal(value.digest, 'preserved'); assert.deepEqual(value.$permissions, []); }
    assert.equal(rows.get('files:f00')!.owner, user.$id);
    assert.equal(rows.get(`members:${user.$id}`)!.state, 'suspended');
    assert.equal(rows.get(inviteKey)!.accountId, user.$id, 'binding retained for safe restoration');
    user.status = true; rows.get(`members:${user.$id}`)!.state = 'active';
    await eligibleAccount(user.$id);
    assert.deepEqual(rows.get('files:f00')!.recipients, ['other'], 'restoration does not silently re-share files');
  } finally { mock.restoreAll(); }
});

test('application logging drops synthetic secrets and disables framework request logging', async () => {
  const secret = 'SYNTHETIC-NEVER-LOG-THIS';
  const output: string[] = [];
  mock.method(console, 'error', (...args: unknown[]) => output.push(JSON.stringify(args)));
  try {
    const error = new AppwriteException(secret, 503, secret, secret);
    error.name = secret; error.stack = secret;
    const response = await handle(async () => { throw error; });
    assert.equal(response.status, 503);
    logFailure('operator', { code: secret, password: secret, url: `/verify?secret=${secret}`, file: Buffer.from(secret) });
    assert.ok(!output.join('').includes(secret));
    assert.ok(!(await response.text()).includes(secret));
    assert.equal(output.length, 2);
    assert.equal(config.logging, false);
  } finally { mock.restoreAll(); }
});
