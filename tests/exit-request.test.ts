import { testRoot } from './local-environment';
import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, randomUUID } from 'node:crypto';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { Account, Client, TablesDB, Users } from 'node-appwrite';
import { cancelExitRequest, claimExitReceipt, cleanupPolicy, exitDirectory, issueExitRequest, readReceipt, recordPasswordAuthentication, validateExitReceipt } from '../lib/exit-request';
import { beginMaintenance, endMaintenance, maintenance } from '../lib/maintenance';
import { readExitCase, exitRequestState, saveExitCase } from '../lib/exit-request';
import { migrationPreview, migrateCase, repairCasePointer } from '../lib/exit-case';
import { calendarDeadline } from '../lib/case-dates';
import { noticePublication } from '../lib/notice-content';

test('exit request and cancellation remain available without agreement', async () => {
  const f = await fixture();
  noticePublication.current = { effectiveDate: '2026-01-01', terms: 'Synthetic unaccepted terms', privacy: 'Synthetic privacy' };
  try {
    await f.proof();
    const result = await issueExitRequest(f.auth);
    assert.ok(result.caseId);
    await cancelExitRequest(f.auth, result.caseId);
    assert.equal((await exitRequestState(result.caseId)).status, 'cancelled');
  } finally { noticePublication.current = null; mock.restoreAll(); }
});

test('calendar targets preserve Georgia wall time across DST and calendar boundaries', () => {
  assert.equal(calendarDeadline('2026-02-20T17:00:00.123Z', 30), '2026-03-22T16:00:00.123Z');
  assert.equal(calendarDeadline('2026-10-20T16:00:00.000Z', 30), '2026-11-19T17:00:00.000Z');
  assert.equal(calendarDeadline('2027-12-01T17:00:00.000Z', 90), '2028-02-29T17:00:00.000Z');
  assert.throws(() => calendarDeadline('invalid', 30));
});

test('renewal preserves original case target, cancels old receipt, and missing pointers fail closed', async () => {
  const f = await fixture();
  try {
    await f.proof(); const first = await issueExitRequest(f.auth); const original = await readExitCase(first.caseId);
    const now = Date.parse(first.expiresAt); const clock = mock.method(Date, 'now', () => now);
    const gate = await beginMaintenance();
    await maintenance(gate, () => assert.rejects(validateExitReceipt(first.caseId, 'alice'))); await endMaintenance(gate);
    f.current.$id = 'fresh-session'; f.current.$createdAt = new Date(now).toISOString(); f.current.expire = new Date(now + 86400000).toISOString();
    await f.proof(); const second = await issueExitRequest(f.auth); clock.mock.restore();
    assert.notEqual(first.caseId, second.caseId);
    assert.equal((await readReceipt(second.caseId)).trackingCaseId, original.caseId);
    const renewed = await readExitCase(original.caseId);
    assert.equal(renewed.originalReceivedAt, original.originalReceivedAt); assert.equal(renewed.targetAt, original.targetAt);
    assert.equal((await exitRequestState(first.caseId)).status, 'cancelled');
    await assert.rejects(saveExitCase({ ...renewed, originalReceivedAt: new Date().toISOString(), targetAt: 'changed' }));
    await unlink(path.join(process.env.STILLROOM_PRIVATE_ROOT!, 'exits', 'account-alice.json'));
    const future = mock.method(Date, 'now', () => now);
    await assert.rejects(issueExitRequest(f.auth)); await repairCasePointer(original.caseId);
    assert.equal((await issueExitRequest(f.auth)).caseId, second.caseId);
    f.user.email = 'different@example.test'; await assert.rejects(issueExitRequest(f.auth));
    future.mock.restore();
  } finally { mock.restoreAll(); }
});

test('historical receipts require explicit complete-history review and cannot invent dates', async () => {
  const f = await fixture();
  try {
    await f.proof(); const issued = await issueExitRequest(f.auth); const directory = await exitDirectory(issued.caseId);
    const receiptFile = path.join(directory, 'receipt.json'); const stored = JSON.parse(await readFile(receiptFile, 'utf8'));
    delete stored.data.trackingCaseId;
    stored.signature = createHmac('sha256', process.env.RATE_LIMIT_SECRET!).update(`exit-receipt:v1:${JSON.stringify(stored.data)}`).digest('hex');
    await writeFile(receiptFile, JSON.stringify(stored)); await unlink(path.join(directory, 'case.json'));
    await assert.rejects(issueExitRequest(f.auth));
    const preview = await migrationPreview(issued.caseId);
    await assert.rejects(migrateCase(issued.caseId, preview.digest, false)); await assert.rejects(migrateCase(issued.caseId, 'wrong', true));
    await migrateCase(issued.caseId, preview.digest, true);
    assert.equal((await readExitCase(issued.caseId)).originalReceivedAt, stored.data.issuedAt);
    assert.equal((await issueExitRequest(f.auth)).caseId, issued.caseId);
    await assert.rejects(migrationPreview(issued.caseId));
  } finally { mock.restoreAll(); }
});

test('freshness boundary and wrong-account pointer cannot extend or link a case', async () => {
  const f = await fixture();
  try {
    await f.proof(); const created = Date.parse(f.current.$createdAt);
    let now = created + 600000; const clock = mock.method(Date, 'now', () => now);
    const issued = await issueExitRequest(f.auth);
    now++; await assert.rejects(issueExitRequest(f.auth)); now--;
    const pointer = path.join(process.env.STILLROOM_PRIVATE_ROOT!, 'exits', 'account-bob.json');
    await writeFile(pointer, JSON.stringify({ requestId: issued.caseId }));
    f.user.$id = 'bob'; f.current.userId = 'bob'; await f.proof();
    await assert.rejects(issueExitRequest(f.auth));
    assert.equal((await readExitCase(issued.caseId)).accountId, 'alice'); clock.mock.restore();
  } finally { mock.restoreAll(); }
});

Object.assign(process.env, { APP_ORIGIN: 'http://localhost:3000', APPWRITE_ENDPOINT: 'https://example.invalid/v1', APPWRITE_PROJECT_ID: 'test', APPWRITE_API_KEY: 'synthetic', APPWRITE_DATABASE_ID: 'test', APPWRITE_BUCKET_ID: 'test', RATE_LIMIT_SECRET: 'synthetic-receipt-secret-at-least-32-characters' });
async function fixture() {
  process.env.STILLROOM_PRIVATE_ROOT = path.join(testRoot, randomUUID());
  const user = { $id: 'alice', email: 'alice@example.test', registration: '2026-01-01', emailVerification: true, status: true };
  const current = { $id: 'password-session', $createdAt: new Date().toISOString(), userId: user.$id, current: true, provider: 'email', expire: new Date(Date.now() + 86400000).toISOString(), secret: 'SYNTHETIC_SESSION_SECRET' };
  mock.method(Account.prototype, 'getSession', async () => current);
  mock.method(Users.prototype, 'get', async () => user);
  mock.method(Users.prototype, 'listSessions', async () => ({ sessions: [current] }));
  mock.method(TablesDB.prototype, 'getRow', async () => ({ state: 'active', email: user.email }));
  const auth = { user, account: new Account(new Client()), db: new TablesDB(new Client()) } as Parameters<typeof issueExitRequest>[0];
  return { user, current, auth, proof: () => recordPasswordAuthentication(current as Parameters<typeof recordPasswordAuthentication>[0]) };
}
test('receipt requires a real password-sign-in proof and a fresh current provider session', async () => {
  const f = await fixture();
  try {
    await assert.rejects(issueExitRequest(f.auth), 'provider session alone is insufficient');
    await f.proof();
    const original = f.current.$createdAt;
    for (const patch of [{ $createdAt: new Date(Date.now() - 600001).toISOString() }, { $createdAt: new Date(Date.now() + 10000).toISOString() }, { userId: 'bob' }, { provider: 'impersonation' }, { current: false }, { expire: 'invalid' }]) {
      const before = { ...f.current }; Object.assign(f.current, patch);
      await assert.rejects(issueExitRequest(f.auth)); Object.assign(f.current, before);
    }
    f.current.$createdAt = original;
    const first = await issueExitRequest(f.auth); const repeat = await issueExitRequest(f.auth);
    assert.equal(first.caseId, repeat.caseId);
    const saved = await readFile(path.join(await exitDirectory(first.caseId), 'receipt.json'), 'utf8');
    for (const secret of [f.current.secret, f.user.email]) assert.ok(!saved.includes(secret));
    assert.deepEqual(Object.keys(first).sort(), ['caseId', 'expiresAt']);
  } finally { mock.restoreAll(); }
});
test('wrong-account cancellation, tampering, expiry, cancellation and identity drift reject', async () => {
  const f = await fixture();
  try {
    await f.proof(); const issued = await issueExitRequest(f.auth);
    await assert.rejects(cancelExitRequest({ ...f.auth, user: { ...f.auth.user, $id: 'bob' } }, issued.caseId));
    const file = path.join(await exitDirectory(issued.caseId), 'receipt.json'); const original = await readFile(file, 'utf8');
    const tampered = JSON.parse(original); tampered.data.accountId = 'bob'; await writeFile(file, JSON.stringify(tampered));
    await assert.rejects(readReceipt(issued.caseId)); await writeFile(file, original);
    const epoch = await beginMaintenance();
    await maintenance(epoch, async () => {
      await assert.rejects(validateExitReceipt(issued.caseId, 'bob'));
      f.user.email = 'changed@example.test'; await assert.rejects(validateExitReceipt(issued.caseId, 'alice')); f.user.email = 'alice@example.test';
      const now = Date.now(); const clock = mock.method(Date, 'now', () => now + 86400001);
      await assert.rejects(validateExitReceipt(issued.caseId, 'alice')); clock.mock.restore();
    });
    await endMaintenance(epoch);
    await cancelExitRequest(f.auth, issued.caseId);
    const again = await beginMaintenance();
    await maintenance(again, () => assert.rejects(validateExitReceipt(issued.caseId, 'alice')));
    assert.equal(cleanupPolicy.enabled, false); assert.ok(await readFile(file));
  } finally { mock.restoreAll(); }
});
test('claim binds one case, digest and maintenance epoch; retries survive expiry without reauthorization', async () => {
  const f = await fixture();
  try {
    await f.proof(); const issued = await issueExitRequest(f.auth); const epoch = await beginMaintenance();
    await maintenance(epoch, async () => {
      await claimExitReceipt(issued.caseId, 'alice', 'reviewed-digest');
      await claimExitReceipt(issued.caseId, 'alice', 'reviewed-digest');
      await assert.rejects(claimExitReceipt(issued.caseId, 'alice', 'different-digest'));
      await assert.rejects(cancelExitRequest(f.auth, issued.caseId));
      await assert.rejects(validateExitReceipt(issued.caseId, 'alice'));
      const now = Date.now(); const clock = mock.method(Date, 'now', () => now + 86400001);
      await validateExitReceipt(issued.caseId, 'alice', true); clock.mock.restore();
    });
    await endMaintenance(epoch); const another = await beginMaintenance();
    await maintenance(another, () => assert.rejects(validateExitReceipt(issued.caseId, 'alice', true)));
  } finally { mock.restoreAll(); }
});
