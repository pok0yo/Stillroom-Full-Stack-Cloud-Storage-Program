import { testRoot } from './local-environment';
import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, unlink, rename } from 'node:fs/promises';
import path from 'node:path';
import { AppwriteException, Client, TablesDB } from 'node-appwrite';
import { applyLimits, closeLimits, limiterBaseline, limiterEnvironment, previewLimits, reconcileLimits } from '../lib/limiter-cleanup';
import { beginMaintenance, endMaintenance, maintenance, maintenanceStatus, operation, providerWrite } from '../lib/maintenance';

type Row = { $id: string; $updatedAt: string; $permissions: string[]; count: number; expires: number };
const approved = { apply: true, holdsReviewed: true, externalWritersInactive: true };
const originalPin = limiterBaseline.sha256;
Object.assign(process.env, { APP_ORIGIN: 'http://localhost:3000', APPWRITE_ENDPOINT: 'https://nyc.cloud.appwrite.io/v1', APPWRITE_PROJECT_ID: 'stillroom', APPWRITE_DATABASE_ID: 'stillroom', APPWRITE_BUCKET_ID: 'stillroom', APPWRITE_API_KEY: 'SYNTHETIC-NOT-A-CREDENTIAL', RATE_LIMIT_SECRET: 'synthetic-limiter-tests-not-a-real-secret-1234' });

async function fixture(eligible = 3) {
  const root = path.join(testRoot, randomUUID()); process.env.STILLROOM_PRIVATE_ROOT = root;
  await mkdir(path.join(root, 'limiter-cleanup'), { recursive: true });
  const now = Date.now(); mock.method(Date, 'now', () => now);
  const cutoff = Math.floor(now / 1000);
  mock.method(Client.prototype, 'call', async () => { throw new Error('Unexpected provider call'); });
  mock.method(globalThis, 'fetch', async (_url: unknown, options: RequestInit) => {
    assert.equal(options.method, 'GET'); return new Response('{}', { headers: { date: new Date(now).toUTCString() } });
  });
  const rows = new Map<string, Row>();
  const add = (id: string, expires = cutoff - 20) => rows.set(id, { $id: id, $updatedAt: new Date(now - 60000).toISOString(), $permissions: [], count: 2, expires });
  const protectedIds = Array.from({ length: 107 }, (_, i) => `protected-${i}`); protectedIds.forEach(id => add(id));
  const baseline = JSON.stringify({ project: 'stillroom', rows: { limits: protectedIds.map($id => ({ $id })) } });
  limiterBaseline.sha256 = createHash('sha256').update(baseline).digest('hex');
  await writeFile(path.join(root, 'activation-readonly-evidence.json'), baseline);
  const entries = protectedIds.map(id => ({ id, state: 'eligible' })); // Classification cannot override pinned protection.
  for (let i = 0; i < eligible; i++) { const id = `eligible-${String(i).padStart(3, '0')}`; add(id); entries.push({ id, state: 'eligible' }); }
  for (const state of ['held', 'protected', 'unclassified', 'unresolved']) { add(state); entries.push({ id: state, state }); }
  add('missing-classification'); add('boundary', cutoff); add('active', cutoff + 60);
  entries.push({ id: 'boundary', state: 'eligible' }, { id: 'active', state: 'eligible' });
  const policy = { environment: limiterEnvironment(), reviewedAt: new Date(now).toISOString(), externalHoldsReviewed: true, entries, retainedRunIds: [] as string[] };
  const policyFile = path.join(root, 'limiter-cleanup', 'review.json');
  await writeFile(policyFile, JSON.stringify(policy));
  const deleted: string[] = []; let pageCalls = 0; let failure = ''; let failAt = '';
  mock.method(TablesDB.prototype, 'listRows', async (p: { tableId: string; queries: string[]; ttl: number }) => {
    assert.equal(p.tableId, 'limits'); assert.equal(p.ttl, 0); pageCalls++;
    const qs = p.queries.map(q => JSON.parse(q));
    assert.equal(qs.find(q => q.method === 'limit').values[0], 100);
    const threshold = qs.find(q => q.method === 'lessThan').values[0];
    let values = [...rows.values()].filter(r => r.expires < threshold).sort((a, b) => a.$id.localeCompare(b.$id));
    const cursor = qs.find(q => q.method === 'cursorAfter')?.values[0];
    if (cursor) values = values.slice(values.findIndex(r => r.$id === cursor) + 1);
    return { rows: structuredClone(values.slice(0, 100)), total: values.length };
  });
  mock.method(TablesDB.prototype, 'getRow', async (p: { tableId: string; rowId: string }) => {
    assert.equal(p.tableId, 'limits'); const value = rows.get(p.rowId); if (!value) throw new AppwriteException('absent', 404); return structuredClone(value);
  });
  mock.method(TablesDB.prototype, 'deleteRow', async (p: { tableId: string; rowId: string }) => providerWrite(async () => {
    assert.equal(p.tableId, 'limits');
    if (p.rowId === failAt && failure === 'known') throw new AppwriteException('rate limited', 429);
    rows.delete(p.rowId); deleted.push(p.rowId);
    if (p.rowId === failAt && failure === 'lost') throw new Error('synthetic response lost');
    return {};
  }));
  return { root, rows, deleted, cutoff, policy, policyFile, pages: () => pageCalls, fail: (mode: string, id = 'eligible-001') => { failure = mode; failAt = id; } };
}
const cleanup = () => { limiterBaseline.sha256 = originalPin; mock.restoreAll(); };

test('preview paginates without deletes; all 107 protected plus held/unclassified and boundary records survive', async () => {
  const f = await fixture(205);
  try {
    const plan = await operation(previewLimits);
    assert.equal(plan.selected, 205); assert.ok(f.pages() >= 4); assert.equal(f.deleted.length, 0);
    await assert.rejects(applyLimits(plan.runId, plan.digest, approved), 'flag is not a held gate');
    const epoch = await beginMaintenance();
    await assert.rejects(operation(async () => assert.fail('writer admitted')));
    const result = await maintenance(epoch, () => applyLimits(plan.runId, plan.digest, approved));
    assert.equal(result.complete, true); assert.equal(result.absent, 205);
    for (const id of f.deleted) assert.match(id, /^eligible-/);
    assert.equal([...f.rows.keys()].filter(id => id.startsWith('protected-')).length, 107);
    assert.ok(f.rows.has('held') && f.rows.has('active') && f.rows.has('boundary') && f.rows.has('missing-classification'));
    await maintenance(epoch, async () => {
      assert.equal((await applyLimits(plan.runId, plan.digest, approved)).complete, true);
      const closed = await closeLimits(plan.runId, plan.digest, true);
      assert.equal(closed.kind, 'closed');
      const raw = await readFile(path.join(f.root, 'limiter-cleanup', `${plan.runId}.json`), 'utf8');
      assert.doesNotMatch(raw, /eligible-|protected-|reviewDigest|items|states/);
      assert.equal(closed.selected, 205);
      assert.deepEqual(await closeLimits(plan.runId, plan.digest, true), closed);
    });
    await endMaintenance(epoch);
  } finally { cleanup(); }
});

test('changed, renewed or newly held records cannot be deleted; unfinished evidence cannot close', async () => {
  for (const change of ['count', 'expires', 'updated', 'hold', 'protection', 'digest']) {
    const f = await fixture();
    try {
      const plan = await operation(previewLimits); const epoch = await beginMaintenance();
      if (change === 'count') f.rows.get('eligible-000')!.count++;
      if (change === 'expires') f.rows.get('eligible-000')!.expires = f.cutoff + 60;
      if (change === 'updated') f.rows.get('eligible-000')!.$updatedAt = new Date().toISOString();
      if (change === 'hold') { f.policy.entries.find(e => e.id === 'eligible-000')!.state = 'held'; await writeFile(f.policyFile, JSON.stringify(f.policy)); }
      if (change === 'protection') await writeFile(path.join(f.root, 'activation-readonly-evidence.json'), '{}');
      await maintenance(epoch, async () => {
        if (change === 'digest') await assert.rejects(applyLimits(plan.runId, 'wrong', approved));
        else assert.equal((await applyLimits(plan.runId, plan.digest, approved)).complete, false);
        await assert.rejects(closeLimits(plan.runId, plan.digest, true));
      });
      assert.equal(f.deleted.length, 0); await endMaintenance(epoch);
    } finally { cleanup(); }
  }
});

test('partial known failures retry exact selection; holds and temporary evidence block minimization', async () => {
  const f = await fixture();
  try {
    const plan = await operation(previewLimits); const epoch = await beginMaintenance();
    f.fail('known');
    await maintenance(epoch, async () => {
      const partial = await applyLimits(plan.runId, plan.digest, approved);
      assert.equal(partial.absent, 1); assert.equal(partial.failed, 1); assert.equal(partial.complete, false);
      await assert.rejects(closeLimits(plan.runId, plan.digest, true));
      f.fail(''); assert.equal((await applyLimits(plan.runId, plan.digest, approved)).complete, true);
      assert.equal(new Set(f.deleted).size, 3); assert.equal(f.deleted.length, 3);
      f.policy.retainedRunIds.push(plan.runId); await writeFile(f.policyFile, JSON.stringify(f.policy));
      await assert.rejects(closeLimits(plan.runId, plan.digest, true));
      f.policy.retainedRunIds = []; await writeFile(f.policyFile, JSON.stringify(f.policy));
      const temporary = path.join(f.root, 'limiter-cleanup', `${plan.runId}.json.synthetic.tmp`);
      await writeFile(temporary, 'preserved incomplete evidence');
      await assert.rejects(closeLimits(plan.runId, plan.digest, true)); await unlink(temporary);
      await closeLimits(plan.runId, plan.digest, true);
      assert.ok(await readFile(f.policyFile));
    });
    await endMaintenance(epoch);
  } finally { cleanup(); }
});

test('lost response leaves durable blocker; reconciliation never clears it or authorizes new writes', async () => {
  const f = await fixture();
  try {
    const plan = await operation(previewLimits); const epoch = await beginMaintenance(); f.fail('lost');
    const partial = await maintenance(epoch, () => applyLimits(plan.runId, plan.digest, approved));
    assert.equal(partial.unknown, 1); assert.equal(partial.absent, 1); assert.equal((await maintenanceStatus()).dirty, true);
    const observed = await reconcileLimits(plan.runId);
    assert.equal(observed.absent, 2); assert.equal(observed.unchanged, 1); assert.equal((await maintenanceStatus()).dirty, true);
    await assert.rejects(maintenance(epoch, () => applyLimits(plan.runId, plan.digest, approved)));
    await assert.rejects(endMaintenance(epoch));
    assert.equal(f.deleted.length, 2);
  } finally { cleanup(); }
});

test('invalid clock, missing classification, malformed rows and repeated pages fail without deletion', async () => {
  const f = await fixture();
  try {
    mock.method(globalThis, 'fetch', async () => new Response('{}'));
    await assert.rejects(operation(previewLimits)); assert.equal(f.deleted.length, 0);
    mock.method(globalThis, 'fetch', async () => new Response('{}', { headers: { date: new Date().toUTCString() } }));
    const rows = [...f.rows.values()].slice(0, 100);
    mock.method(TablesDB.prototype, 'listRows', async () => ({ rows }));
    await assert.rejects(operation(previewLimits), 'repeated cursor page is not complete');
    mock.method(TablesDB.prototype, 'listRows', async () => ({ rows: [{ ...rows[0], expires: 'bad' }] }));
    await assert.rejects(operation(previewLimits));
    await unlink(f.policyFile); await assert.rejects(operation(previewLimits));
    assert.equal(f.deleted.length, 0);
  } finally { cleanup(); }
});

test('journal replacement failure stops before provider deletion and preserves retry evidence', async () => {
  const f = await fixture();
  try {
    const plan = await operation(previewLimits); const epoch = await beginMaintenance();
    const file = path.join(f.root, 'limiter-cleanup', `${plan.runId}.json`);
    const original = await readFile(file, 'utf8');
    const getRow = TablesDB.prototype.getRow;
    let blocked = false;
    mock.method(TablesDB.prototype, 'getRow', async function (this: TablesDB, ...args: Parameters<typeof getRow>) {
      const value = await getRow.apply(this, args);
      if (!blocked) { blocked = true; await rename(file, `${file}.preserved`); await mkdir(file); }
      return value;
    });
    await assert.rejects(maintenance(epoch, () => applyLimits(plan.runId, plan.digest, approved)));
    assert.equal(f.deleted.length, 0);
    assert.equal(await readFile(`${file}.preserved`, 'utf8'), original);
    assert.equal((await maintenanceStatus()).dirty, false);
    await endMaintenance(epoch);
  } finally { cleanup(); }
});
