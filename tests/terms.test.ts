import { testRoot } from './local-environment';
import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { Client, TablesDB, Users } from 'node-appwrite';
import { noticePublication } from '../lib/notice-content';
import { acceptTerms, fileAccount, needsAgreement, publishedNotices } from '../lib/terms';
import { beginMaintenance, endMaintenance, maintenance, privateSave } from '../lib/maintenance';
import { POST } from '../app/api/terms/accept/route';

Object.assign(process.env, { APP_ORIGIN: 'http://localhost:3000', APPWRITE_ENDPOINT: 'https://example.invalid/v1', APPWRITE_PROJECT_ID: 'test', APPWRITE_API_KEY: 'test-only', APPWRITE_DATABASE_ID: 'test', APPWRITE_BUCKET_ID: 'test', RATE_LIMIT_SECRET: 'test-only-secret-not-for-production-1234' });

test('disabled publication cannot collect agreement or expose candidate text', async () => {
  assert.equal(publishedNotices(), null);
  assert.equal(await needsAgreement('alice'), false);
  await assert.rejects(acceptTerms('alice', { agree: true, version: 'anything' }), { status: 409 });
  const response = await POST(new Request('http://localhost:3000/api/terms/accept', { method: 'POST', headers: { origin: 'http://localhost:3000' }, body: '{}' }));
  assert.equal(response.status, 409);
  assert.equal((await readdir(testRoot)).includes('terms'), false);
});

test('signed prospective agreement: validation, concurrent first write, maintenance, integrity and isolated restore', async () => {
  mock.method(Client.prototype, 'call', async () => { throw new Error('Unexpected provider call'); });
  let active = true;
  mock.method(Users.prototype, 'get', async ({ userId }: { userId: string }) => ({ $id: userId, email: `${userId}@example.test`, emailVerification: true, status: active }));
  mock.method(TablesDB.prototype, 'getRow', async ({ rowId }: { rowId: string }) => ({ email: `${rowId}@example.test`, state: 'active' }));
  noticePublication.current = { effectiveDate: '2026-01-01', terms: 'SYNTHETIC TERMS ONLY', privacy: 'SYNTHETIC PRIVACY ONLY' };
  try {
    const version = publishedNotices()!.version;
    const input = { agree: true, version };
    assert.equal(await needsAgreement('alice'), true);
    await assert.rejects(fileAccount('alice'), { status: 403 });
    for (const invalid of [{}, { agree: false, version }, { ...input, accountId: 'bob' }, { ...input, acceptedAt: '2000-01-01' }, { ...input, extra: true }]) await assert.rejects(acceptTerms('alice', invalid), { status: 400 });
    await assert.rejects(acceptTerms('alice', { ...input, version: 'old' }), { status: 409 });
    await assert.rejects(acceptTerms('../escape', input));
    active = false; await assert.rejects(acceptTerms('alice', input), { status: 403 }); active = true;
    const before = Date.now();
    await Promise.all(Array.from({ length: 6 }, () => acceptTerms('alice', input)));
    const file = path.join(testRoot, 'terms', 'alice', `${version}.json`);
    const original = await readFile(file, 'utf8');
    const stored = JSON.parse(original);
    assert.deepEqual(Object.keys(stored.data).sort(), ['acceptedAt', 'accountId', 'version']);
    assert.ok(Date.parse(stored.data.acceptedAt) >= before);
    await acceptTerms('alice', input); assert.equal(await readFile(file, 'utf8'), original);
    assert.equal(await needsAgreement('alice'), false); assert.equal(await needsAgreement('bob'), true);
    await fileAccount('alice');
    const gate = await beginMaintenance();
    await assert.rejects(acceptTerms('bob', input), { status: 503 });
    const backup = await maintenance(gate, () => readFile(file, 'utf8'));
    await endMaintenance(gate);
    await writeFile(file, JSON.stringify({ ...stored, data: { ...stored.data, accountId: 'bob' } }));
    await assert.rejects(fileAccount('alice'), { status: 503 });
    await assert.rejects(acceptTerms('alice', input), { status: 503 });
    await writeFile(file, 'null');
    await assert.rejects(acceptTerms('alice', input), { status: 503 }, 'corrupt null is not missing evidence');
    await writeFile(file, original);
    const recoveryRoot = path.join(testRoot, 'synthetic-recovery');
    process.env.STILLROOM_PRIVATE_ROOT = recoveryRoot;
    assert.equal(await needsAgreement('alice'), true);
    const recoveryGate = await beginMaintenance();
    await maintenance(recoveryGate, async () => {
      await privateSave(path.join(recoveryRoot, 'terms', 'alice', `${version}.json`), JSON.parse(backup));
    });
    await endMaintenance(recoveryGate);
    await fileAccount('alice');
    await acceptTerms('alice', input);
    assert.equal(await readFile(path.join(recoveryRoot, 'terms', 'alice', `${version}.json`), 'utf8'), original);
    process.env.STILLROOM_PRIVATE_ROOT = testRoot;
    await mkdir(path.join(testRoot, 'terms', 'bob'), { recursive: true });
    await writeFile(path.join(testRoot, 'terms', 'bob', `${version}.json`), original);
    await assert.rejects(fileAccount('bob'), { status: 503 }, 'another account cannot reuse the signed record');
    noticePublication.current.terms += ' Changed obligations.';
    assert.notEqual(publishedNotices()!.version, version);
    assert.equal(await needsAgreement('alice'), true);
    await assert.rejects(acceptTerms('alice', input), { status: 409 });
    await acceptTerms('alice', { agree: true, version: publishedNotices()!.version });
    assert.equal(await readFile(file, 'utf8'), original, 'old version remains immutable');
    const dirty = path.join(testRoot, 'coordination', 'dirty.json');
    await writeFile(dirty, '{}');
    await assert.rejects(acceptTerms('alice', { agree: true, version: publishedNotices()!.version }), { status: 503 });
  } finally { process.env.STILLROOM_PRIVATE_ROOT = testRoot; noticePublication.current = null; mock.restoreAll(); }
});
