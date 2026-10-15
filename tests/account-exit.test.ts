import { testRoot } from './local-environment';
import path from 'node:path';
import { createHmac, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, readdir } from 'node:fs/promises';
import { beginMaintenance, maintenance } from '../lib/maintenance';
import { recordPasswordAuthentication, issueExitRequest } from '../lib/exit-request';
import { exitDirectory } from '../lib/exit-request';
import { privateSave } from '../lib/maintenance';
import { cleanupEligibility, closeCase, recordCaseNote, requireRecordedHolds, caseStatus } from '../lib/exit-case';
import { readExitCase } from '../lib/exit-request';
import './local-environment';
import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { Account, Client, AppwriteException, Storage, TablesDB, Users } from 'node-appwrite';
import { applyExit as rawApplyExit, exitDigest, previewExit as rawPreviewExit, signExitPlan, signExitProgress, type ExitProgress, type ExitRequest } from '../lib/account-exit';
import { enroll, invitation, invitationId } from '../lib/membership';

Object.assign(process.env, { APP_ORIGIN: 'http://localhost:3000', APPWRITE_ENDPOINT: 'https://example.invalid/v1', APPWRITE_PROJECT_ID: 'test', APPWRITE_API_KEY: 'synthetic', APPWRITE_DATABASE_ID: 'test', APPWRITE_BUCKET_ID: 'test', RATE_LIMIT_SECRET: 'synthetic-rate-secret-at-least-32-characters' });
type Row = Record<string, unknown> & { $id: string; $permissions: string[] };
type Params = { tableId: string; rowId: string; data?: Record<string, unknown>; permissions?: string[]; queries?: string[] };
let epoch = '';
const previewExit = (request: ExitRequest) => maintenance(epoch, () => rawPreviewExit(request));
const applyExit = (...args: Parameters<typeof rawApplyExit>) => maintenance(epoch, () => rawApplyExit(...args));
async function fixture() {
  process.env.STILLROOM_PRIVATE_ROOT = path.join(testRoot, randomUUID());
  const created = new Date().toISOString();
  const sessionData = { $id: 'old-session', $createdAt: created, userId: 'leaver', provider: 'email', current: true, expire: new Date(Date.now() + 86400000).toISOString() };
  mock.method(Account.prototype, 'getSession', async () => sessionData);
  const email = 'exit-person@example.test'; const inviteId = invitationId(email);
  let user: { $id: string; email: string; emailVerification: boolean; status: boolean; registration: string } | null = { $id: 'leaver', email, emailVerification: true, status: true, registration: '2026-01-01' };
  let sessions = ['old-session'];
  const rows = new Map<string, Row>(); const blobs = new Map<string, Row>();
  const record = (id: string, data: Record<string, unknown>) => ({ $id: id, $permissions: [], $createdAt: '2026-01-01', $updatedAt: '2026-01-01', ...data });
  rows.set('members:leaver', record('leaver', { email, state: 'active' }));
  rows.set(`invitations:${inviteId}`, record(inviteId, { email, state: 'bound', accountId: 'leaver' }));
  rows.set('totals:leaver', record('leaver', { documentBytes: 3 }));
  rows.set('totals:other', record('other', { documentBytes: 7 }));
  for (let i = 0; i < 27; i++) {
    const id = `file${String(i).padStart(2, '0')}`;
    rows.set(`files:${id}`, record(id, { owner: i < 2 ? 'leaver' : 'other', name: 'SYNTHETIC_PRIVATE_NAME', status: i === 1 ? 'pending' : 'ready', recipients: i < 2 ? ['other'] : ['leaver', 'third'], digest: 'SYNTHETIC_CONTENT_DIGEST' }));
    blobs.set(id, record(id, { sizeOriginal: 3, name: 'SYNTHETIC_PRIVATE_NAME' }));
  }
  const missing = () => new AppwriteException('SYNTHETIC_SECRET', 404);
  const events: string[] = []; let fail = ''; let after = false;
  const mutation = (name: string, work: () => void) => {
    events.push(name); if (fail === name && !after) throw new Error('SYNTHETIC_SECRET'); work(); if (fail === name && after) throw new Error('SYNTHETIC_SECRET');
  };
  mock.method(Users.prototype, 'get', async () => { if (!user) throw missing(); return structuredClone(user); });
  mock.method(Users.prototype, 'listSessions', async () => { if (!user) throw missing(); return { sessions: sessions.map($id => ({ ...sessionData, $id, secret: 'SYNTHETIC_SESSION_SECRET' })) }; });
  mock.method(Users.prototype, 'updateStatus', async () => { if (!user) throw missing(); mutation('disable', () => { user!.status = false; }); return user; });
  mock.method(Users.prototype, 'deleteSessions', async () => { if (!user) throw missing(); mutation('sessions', () => { sessions = []; }); return {}; });
  mock.method(Users.prototype, 'delete', async () => { if (!user) throw missing(); mutation('account', () => { user = null; }); return {}; });
  mock.method(TablesDB.prototype, 'getRow', async (p: Params) => { const value = rows.get(`${p.tableId}:${p.rowId}`); if (!value) throw missing(); return structuredClone(value); });
  mock.method(TablesDB.prototype, 'createRow', async (p: Params) => { if (rows.has(`${p.tableId}:${p.rowId}`)) throw new AppwriteException('conflict', 409); throw new Error('Unexpected enrollment mutation'); });
  mock.method(TablesDB.prototype, 'createTransaction', async () => ({ $id: 'synthetic-transaction' }));
  mock.method(TablesDB.prototype, 'updateTransaction', async ({ commit }: { commit?: boolean }) => { assert.ok(!commit, 'revoked invitation must never commit enrollment'); return {}; });
  mock.method(TablesDB.prototype, 'listRows', async (p: Params) => {
    const queries = p.queries!.map(q => JSON.parse(q));
    assert.equal(queries.find(q => q.method === 'limit').values[0], 25);
    const cursor = queries.find(q => q.method === 'cursorAfter')?.values[0];
    return { rows: structuredClone([...rows.entries()].filter(([key, value]) => key.startsWith(p.tableId + ':') && (!cursor || value.$id > cursor)).map(([, value]) => value).sort((a, b) => a.$id.localeCompare(b.$id)).slice(0, 25)) };
  });
  mock.method(TablesDB.prototype, 'updateRow', async (p: Params) => {
    const key = `${p.tableId}:${p.rowId}`; if (!rows.has(key)) throw missing();
    mutation(`restrict:${key}`, () => { rows.set(key, { ...rows.get(key)!, ...p.data, $permissions: p.permissions ?? [], $updatedAt: 'changed' }); }); return structuredClone(rows.get(key));
  });
  mock.method(TablesDB.prototype, 'deleteRow', async (p: Params) => {
    const key = `${p.tableId}:${p.rowId}`; if (!rows.has(key)) throw missing();
    mutation(`delete:${key}`, () => { rows.delete(key); }); return {};
  });
  mock.method(Storage.prototype, 'getFile', async ({ fileId }: { fileId: string }) => { if (!blobs.has(fileId)) throw missing(); return structuredClone(blobs.get(fileId)); });
  mock.method(Storage.prototype, 'deleteFile', async ({ fileId }: { fileId: string }) => {
    if (!blobs.has(fileId)) throw missing();
    assert.equal(rows.get('members:leaver')?.state, 'suspended'); assert.equal(user?.status, false); assert.deepEqual(sessions, []);
    for (const value of rows.values()) if (value.owner === 'leaver') { assert.deepEqual(value.recipients, []); assert.equal(value.status, 'deleting'); }
    mutation(`storage:${fileId}`, () => { blobs.delete(fileId); }); return {};
  });
  await recordPasswordAuthentication(sessionData as Parameters<typeof recordPasswordAuthentication>[0]);
  const auth = { user, account: new Account(new Client()), db: new TablesDB(new Client()) } as Parameters<typeof issueExitRequest>[0];
  const issued = await issueExitRequest(auth);
  epoch = await beginMaintenance();
  const request: ExitRequest = { requestId: issued.caseId, heldFileIds: [], accountHold: false };
  const progress: ExitProgress = { stage: 'prepared', completed: [] };
  return { rows, blobs, events, request, progress, inviteId, email, user: () => user, addSession: () => { sessions.push('new-session'); }, fail: (name: string, didApply = false) => { fail = name; after = didApply; } };
}

test('exit preview is read-only, binds scope, and deletion preserves other owners across pagination', async () => {
  const f = await fixture();
  try {
    const plan = await previewExit(f.request); assert.equal(plan.owned.length, 2); assert.equal(plan.shares.length, 25); assert.deepEqual(f.events, []);
    const serialized = JSON.stringify(plan); for (const value of [f.email, 'SYNTHETIC_PRIVATE_NAME', 'SYNTHETIC_SESSION_SECRET', 'SYNTHETIC_CONTENT_DIGEST']) assert.ok(!serialized.includes(value));
    const run = (confirmation = exitDigest(plan)) => applyExit(plan, signExitPlan(plan), confirmation, f.progress, async () => {});
    assert.equal((await run('wrong')).blocked, 'review'); assert.equal((await rawApplyExit(plan, signExitPlan(plan), exitDigest(plan), f.progress, async () => {})).blocked, 'review'); assert.deepEqual(f.events, []);
    assert.equal((await run()).complete, true); assert.equal(f.user(), null); assert.equal(f.rows.has('members:leaver'), false); assert.equal(f.rows.has('totals:leaver'), false);
    assert.ok(f.rows.has('totals:other')); assert.equal(f.blobs.size, 25);
    for (const value of f.rows.values()) if (value.owner === 'other') { assert.deepEqual(value.recipients, ['third']); assert.equal(value.name, 'SYNTHETIC_PRIVATE_NAME'); }
    const revoked = f.rows.get(`invitations:${f.inviteId}`)!; assert.equal(revoked.email, ''); assert.equal(revoked.accountId, ''); assert.equal(revoked.state, 'revoked');
    await assert.rejects(invitation(f.email));
    await assert.rejects(enroll({ $id: 'fresh-account', email: f.email, emailVerification: true, status: true }));
    assert.equal((await run()).complete, true);
    revoked.state = 'invited';
    const drift = await run(); assert.equal(drift.complete, false); assert.equal(drift.blocked, 'review');
  } finally { mock.restoreAll(); }
});

test('changed ownership, sessions or signed scope blocks before any mutation', async () => {
  for (const change of ['owner', 'new-file', 'tamper', 'session']) {
    const f = await fixture();
    try {
      const plan = await previewExit(f.request); const signature = signExitPlan(plan);
      if (change === 'owner') f.rows.get('files:file00')!.owner = 'other';
      if (change === 'new-file') f.rows.set('files:new', { ...f.rows.get('files:file00')!, $id: 'new' });
      if (change === 'tamper') plan.target = 'other';
      if (change === 'session') f.addSession();
      assert.equal((await applyExit(plan, signature, exitDigest(plan), f.progress, async () => {})).blocked, 'review'); assert.deepEqual(f.events, []);
    } finally { mock.restoreAll(); }
  }
});

test('partial failures and uncertain successful writes retry without deleting other owners or losing cleanup state', async () => {
  for (const [failure, after] of [['restrict:members:leaver', false], ['disable', false], ['sessions', false], ['restrict:files:file01', true], ['storage:file00', false], ['storage:file00', true], ['delete:files:file00', true], ['delete:totals:leaver', true], ['account', true], ['delete:members:leaver', true]] as const) {
    const f = await fixture();
    try {
      const plan = await previewExit(f.request); const signature = signExitPlan(plan); let saved: ExitProgress | undefined;
      const run = () => applyExit(plan, signature, exitDigest(plan), f.progress, async value => { saved = structuredClone(value); });
      f.fail(failure, after); const interrupted = await run(); assert.equal(interrupted.complete, false, failure); assert.ok(saved); assert.ok(!JSON.stringify(interrupted).includes('SYNTHETIC_SECRET'));
      f.fail(''); assert.equal((await run()).complete, true, failure); assert.equal(f.blobs.size, 25);
    } finally { mock.restoreAll(); }
  }
});

test('journal failure blocks before mutation and account hold does not retain unheld uploads', async () => {
  const f = await fixture();
  try {
    f.request.accountHold = true; const plan = await previewExit(f.request);
    const interrupted = await applyExit(plan, signExitPlan(plan), exitDigest(plan), f.progress, async () => { throw new Error('SYNTHETIC_PRIVATE_FAILURE'); });
    assert.equal(interrupted.complete, false); assert.deepEqual(f.events, []);
    const saved: ExitProgress = { stage: 'prepared', completed: [] };
    const result = await applyExit(plan, signExitPlan(plan), exitDigest(plan), saved, async () => {});
    assert.equal(result.blocked, 'hold'); assert.equal(f.blobs.has('file00'), false); assert.equal(f.blobs.has('file01'), false); assert.equal(f.user()?.status, false);
    assert.notEqual(signExitProgress(plan, saved), signExitProgress(plan, { ...saved, stage: 'complete' }));
    const released = { ...plan, accountHold: false };
    assert.equal((await applyExit(released, signExitPlan(released), exitDigest(released), saved, async () => {})).complete, true);
  } finally { mock.restoreAll(); }
});

test('specific holds preserve only selected owned file; account removal waits for reviewed release', async () => {
  const f = await fixture();
  try {
    f.request.heldFileIds = ['file01']; const plan = await previewExit(f.request);
    const first = await applyExit(plan, signExitPlan(plan), exitDigest(plan), f.progress, async () => {});
    assert.equal(first.blocked, 'hold'); assert.equal(f.blobs.has('file00'), false); assert.equal(f.blobs.has('file01'), true); assert.equal(f.user()?.status, false);
    assert.deepEqual(f.rows.get('files:file01')?.recipients, []);
    const released = { ...plan, heldFileIds: [] };
    assert.equal((await applyExit(released, signExitPlan(released), exitDigest(released), f.progress, async () => {})).complete, true);
  } finally { mock.restoreAll(); }
});

test('unauthenticated or stale requests and unrelated holds cannot produce a plan', async () => {
  const f = await fixture();
  try {
    await assert.rejects(rawPreviewExit(f.request));
    await assert.rejects(previewExit({ ...f.request, requestId: 'fabricated' }));
    await assert.rejects(previewExit({ ...f.request, heldFileIds: ['file02'] }));
    assert.deepEqual(f.events, []);
  } finally { mock.restoreAll(); }
});

test('operator callers reject legacy drain flags, preserve closed holds, and release only a completed case', async () => {
  const f = await fixture();
  try {
    f.request.heldFileIds = ['file01']; let plan = await previewExit(f.request);
    const directory = await exitDirectory(f.request.requestId);
    const cli = (script: string, ...args: string[]) => spawnSync(process.execPath, ['--conditions=react-server', '--import', 'tsx', `scripts/${script}.ts`, ...args], { env: process.env, encoding: 'utf8', timeout: 15000, windowsHide: true });
    await privateSave(path.join(directory, 'plan.json'), { plan, signature: signExitPlan(plan) });
    const legacy = cli('account-exit', 'apply', f.request.requestId, '--confirm', exitDigest(plan), '--workers-drained');
    assert.equal(legacy.status, 1); assert.deepEqual(f.events, []);
    const persist = (progress: ExitProgress) => privateSave(path.join(directory, 'progress.json'), { progress, signature: signExitProgress(plan, progress) });
    assert.equal((await applyExit(plan, signExitPlan(plan), exitDigest(plan), f.progress, persist)).blocked, 'hold');
    assert.equal(cli('maintenance', 'end', epoch).status, 1);
    await privateSave(path.join(directory, 'holds.json'), { heldFileIds: [], accountHold: false });
    const release = cli('account-exit', 'release-holds', f.request.requestId);
    assert.equal(release.status, 0, release.stderr);
    plan = JSON.parse(await readFile(path.join(directory, 'plan.json'), 'utf8')).plan;
    assert.equal((await applyExit(plan, signExitPlan(plan), exitDigest(plan), f.progress, persist)).complete, true);
    assert.equal(cli('maintenance', 'end', epoch).status, 0);
  } finally { mock.restoreAll(); }
});

test('case holds and delay notes preserve deadlines; closure requires independent completed and unheld state', async () => {
  const f = await fixture();
  try {
    f.request.heldFileIds = ['file01']; let plan = await previewExit(f.request);
    const id = f.request.requestId, directory = await exitDirectory(id);
    const savePlan = () => privateSave(path.join(directory, 'plan.json'), { plan, signature: signExitPlan(plan) });
    const persist = (progress: ExitProgress) => privateSave(path.join(directory, 'progress.json'), { progress, signature: signExitProgress(plan, progress) });
    await savePlan(); const original = await readExitCase(id);
    await maintenance(epoch, async () => {
      await assert.rejects(requireRecordedHolds(id, plan));
      await assert.rejects(recordCaseNote(id, { action: 'hold', operator: 'operator', reason: 'report', category: 'abuse', dataIds: ['file02'] }));
      await recordCaseNote(id, { action: 'hold', operator: 'operator', reason: 'specific report', category: 'abuse', dataIds: ['file01'] });
      await requireRecordedHolds(id, plan);
      await recordCaseNote(id, { action: 'delay', operator: 'operator', reason: 'awaiting report review' });
      await recordCaseNote(id, { action: 'review-hold', operator: 'operator', reason: 'report still unresolved', holdId: 'hold-1' });
      await assert.rejects(closeCase(id, 'operator'));
    });
    assert.equal((await applyExit(plan, signExitPlan(plan), exitDigest(plan), f.progress, persist)).blocked, 'hold');
    const held = await readExitCase(id); assert.equal(held.targetAt, original.targetAt);
    assert.equal(held.originalReceivedAt, original.originalReceivedAt);
    assert.ok(Date.parse(held.holds[0].reviewDueAt) > Date.parse(held.holds[0].reviewedAt));
    await maintenance(epoch, () => recordCaseNote(id, { action: 'release-hold', operator: 'operator', reason: 'report resolved', holdId: 'hold-1' }));
    plan = { ...plan, heldFileIds: [] }; await savePlan();
    await maintenance(epoch, async () => { await requireRecordedHolds(id, plan); await assert.rejects(closeCase(id, 'operator')); });
    assert.equal((await applyExit(plan, signExitPlan(plan), exitDigest(plan), f.progress, persist)).complete, true);
    const other = f.rows.get('files:file02')!; f.rows.delete('files:file02');
    await maintenance(epoch, () => assert.rejects(closeCase(id, 'operator'))); f.rows.set('files:file02', other);
    await maintenance(epoch, () => closeCase(id, 'operator'));
    const closed = await caseStatus(id); assert.equal(closed.record.status, 'closed');
    assert.equal(closed.record.closure?.providerErasure, 'unknown'); assert.equal(closed.record.closure?.sessionsRevoked, true);
    assert.ok(closed.record.correspondenceReviewAt); assert.equal(closed.record.targetAt, original.targetAt);
    await maintenance(epoch, () => assert.rejects(recordCaseNote(id, { action: 'delay', operator: 'operator', reason: 'late change' })));
    for (const secret of [f.email, 'SYNTHETIC_PRIVATE_NAME', 'SYNTHETIC_SESSION_SECRET']) assert.ok(!JSON.stringify(closed.record).includes(secret));
  } finally { mock.restoreAll(); }
});

test('eligibility cleanup is preview-first, closure-bound, hold-safe and removes no case or provider data', async () => {
  const f = await fixture();
  try {
    const id = f.request.requestId, directory = await exitDirectory(id), plan = await previewExit(f.request);
    const eligibilityDirectory = path.join(process.env.STILLROOM_PRIVATE_ROOT!, 'eligibility');
    await mkdir(eligibilityDirectory);
    const file = path.join(eligibilityDirectory, `${f.inviteId}.json`);
    const eligibility = { invitationId: f.inviteId, adult18: true, residentGeorgia: true, decision: 'approved', decidedAt: (await readExitCase(id)).originalReceivedAt, reason: 'direct-attestation', reviewOutcome: 'approved' };
    await privateSave(file, eligibility);
    await privateSave(path.join(directory, 'plan.json'), { plan, signature: signExitPlan(plan) });
    const clean = (execution?: { digest: string; holdsReviewed: boolean }) => maintenance(epoch, () => cleanupEligibility(id, f.inviteId, execution));
    await assert.rejects(clean(), 'unfinished case must retain eligibility');
    const persist = (progress: ExitProgress) => privateSave(path.join(directory, 'progress.json'), { progress, signature: signExitProgress(plan, progress) });
    assert.equal((await applyExit(plan, signExitPlan(plan), exitDigest(plan), f.progress, persist)).complete, true);
    await assert.rejects(clean(), 'application deletion alone is not documented closure');
    await maintenance(epoch, () => closeCase(id, 'synthetic-operator'));
    const before = new Map(await Promise.all((await readdir(directory)).map(async name => [name, await readFile(path.join(directory, name), 'utf8')] as const)));
    const providerBefore = JSON.stringify([...f.rows]); const eventsBefore = f.events.length;
    const preview = await clean(); assert.equal(preview.mode, 'PREVIEW'); assert.ok(await readFile(file));
    await assert.rejects(clean({ digest: preview.reviewDigest!, holdsReviewed: false }));
    await assert.rejects(clean({ digest: 'wrong', holdsReviewed: true }));
    await maintenance(epoch, () => assert.rejects(cleanupEligibility(id, '../other')));
    await maintenance(epoch, () => assert.rejects(cleanupEligibility(id, 'a'.repeat(36))));
    await privateSave(file, { ...eligibility, reason: 'review-resolved' });
    await assert.rejects(clean({ digest: preview.reviewDigest!, holdsReviewed: true }), 'changed evidence invalidates preview');
    await privateSave(file, { ...eligibility, decision: 'review' }); await assert.rejects(clean());
    await privateSave(file, { ...eligibility, decidedAt: '2999-01-01' }); await assert.rejects(clean());
    await privateSave(file, { ...eligibility, hold: 'unresolved' }); await assert.rejects(clean());
    await privateSave(file, eligibility);
    const originalCase = JSON.parse(before.get('case.json')!);
    const held = structuredClone(originalCase); held.data.holds.push({ releasedAt: undefined });
    held.signature = createHmac('sha256', process.env.RATE_LIMIT_SECRET!).update(`exit-case:${id}:v1:${JSON.stringify(held.data)}`).digest('hex');
    await privateSave(path.join(directory, 'case.json'), held); await assert.rejects(clean());
    await privateSave(path.join(directory, 'case.json'), originalCase);
    const receipt = JSON.parse(before.get('receipt.json')!); const extraId = randomUUID();
    receipt.data.requestId = extraId;
    const extraFile = path.join(await exitDirectory(extraId), 'receipt.json');
    const saveExtra = () => { receipt.signature = createHmac('sha256', process.env.RATE_LIMIT_SECRET!).update(`exit-receipt:v1:${JSON.stringify(receipt.data)}`).digest('hex'); return privateSave(extraFile, receipt); };
    await saveExtra(); await assert.rejects(clean(), 'unlinked same-account receipt blocks cleanup');
    receipt.data.accountId = 'other-synthetic-account'; await saveExtra();
    const fresh = await clean();
    const cli = (...flags: string[]) => spawnSync(process.execPath, ['--conditions=react-server', '--import', 'tsx', '--import', './tests/provider-tripwire.ts', 'scripts/account-exit.ts', 'case-eligibility-cleanup', id, '--target', f.inviteId, ...flags], { env: process.env, encoding: 'utf8', timeout: 15000, windowsHide: true });
    const shown = cli(); assert.equal(shown.status, 0, shown.stderr); assert.equal(JSON.parse(shown.stdout).reviewDigest, fresh.reviewDigest);
    assert.equal(cli('--apply').status, 1); assert.ok(await readFile(file));
    const applied = cli('--apply', '--confirm', fresh.reviewDigest!, '--holds-reviewed');
    assert.equal(applied.status, 0, applied.stderr); assert.equal(JSON.parse(applied.stdout).removed, true);
    assert.doesNotMatch(applied.stdout + applied.stderr, /UNEXPECTED_(PROVIDER|NETWORK)_CALL/);
    assert.equal((await clean()).mode, 'ALREADY_ABSENT');
    await assert.rejects(readFile(file), { code: 'ENOENT' }); assert.ok(await readFile(extraFile));
    for (const [name, contents] of before) assert.equal(await readFile(path.join(directory, name), 'utf8'), contents);
    assert.equal(JSON.stringify([...f.rows]), providerBefore); assert.equal(f.events.length, eventsBefore);
    assert.equal(f.rows.get(`invitations:${f.inviteId}`)?.state, 'revoked');
  } finally { mock.restoreAll(); }
});
