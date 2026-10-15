import 'server-only';
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { AppwriteException, Query, type Models } from 'node-appwrite';
import { admin, row, settings } from './appwrite';
import { exitDigest } from './account-exit';
import { identifier } from './domain';
import { maintenanceEpoch, maintenanceStatus, privateRead, privateRoot, privateSave } from './maintenance';
import { calendarDeadline } from './case-dates';

// All 107 IDs remain excluded. Changing this pin requires separate preservation-release review.
export const limiterBaseline = { sha256: 'd19038291725d46b9ad27221f2856295eb93fae1367cee6ec89b8c93987cf4f8' };
type Limit = Models.Row & { count: number; expires: number };
type Review = { environment: string; reviewedAt: string; externalHoldsReviewed: true; entries: { id: string; state: 'eligible' | 'held' | 'protected' | 'unclassified' | 'unresolved' }[]; retainedRunIds: string[] };
type Item = { id: string; expires: number; digest: string };
type Plan = { environment: string; cutoff: number; reviewDigest: string; items: Item[]; scanned: number; excluded: number };
type State = 'not-attempted' | 'unknown' | 'failed' | 'absent';
type Run = { kind: 'open'; plan: Plan; states: State[]; failure: string | null };
type Closed = { kind: 'closed'; closedAt: string; reviewAt: string; selected: number; absent: number; outcome: 'independently-verified-absent' };
const stop = () => { throw new Error('Limiter cleanup requires operator review; no new targets authorized'); };
const hash = (text: string) => createHash('sha256').update(text).digest('hex');
export function limiterEnvironment() {
  const c = settings();
  if (c.project !== 'stillroom' || c.databaseId !== 'stillroom' || c.endpoint !== 'https://nyc.cloud.appwrite.io/v1') stop();
  return JSON.stringify([c.endpoint, c.project, c.databaseId, 'limits']);
}
async function directory() {
  const dir = path.join(await privateRoot(), 'limiter-cleanup');
  await mkdir(dir, { recursive: true });
  if (await realpath(dir) !== dir) stop();
  return dir;
}
const sign = (id: string, data: Run | Closed) => createHmac('sha256', settings().rateSecret).update(`limiter-run:v1:${limiterEnvironment()}:${id}:${JSON.stringify(data)}`).digest('hex');
async function save(id: string, data: Run | Closed) { await privateSave(path.join(await directory(), `${identifier(id)}.json`), { data, signature: sign(id, data) }); }
async function load(id: string): Promise<Run | Closed> {
  const saved = await privateRead<{ data: Run | Closed; signature: string }>(path.join(await directory(), `${identifier(id)}.json`));
  if (!saved || typeof saved.signature !== 'string' || !/^[a-f0-9]{64}$/.test(saved.signature) || !timingSafeEqual(Buffer.from(saved.signature), Buffer.from(sign(id, saved.data)))) return stop();
  if (saved.data.kind === 'open' && (saved.data.plan.environment !== limiterEnvironment() || saved.data.states.length !== saved.data.plan.items.length)) stop();
  if (!['open', 'closed'].includes(saved.data.kind)) stop();
  return saved.data;
}
async function review() {
  const root = await privateRoot();
  const baselineFile = path.join(root, 'activation-readonly-evidence.json');
  // privateRead performs the existing canonical/symlink checks before reading the pinned bytes.
  await privateRead(baselineFile);
  const bytes = await readFile(baselineFile, 'utf8');
  if (hash(bytes) !== limiterBaseline.sha256) return stop();
  const baseline = JSON.parse(bytes) as { project: string; rows: { limits: { $id: string }[] } };
  if (baseline.project !== settings().project || !Array.isArray(baseline.rows?.limits)) return stop();
  const protectedIds = new Set(baseline.rows.limits.map(r => identifier(r.$id)));
  const value = await privateRead<Review>(path.join(await directory(), 'review.json'));
  if (!value || value.environment !== limiterEnvironment() || value.externalHoldsReviewed !== true || !Number.isFinite(Date.parse(value.reviewedAt)) || Date.parse(value.reviewedAt) > Date.now() || !Array.isArray(value.entries) || !Array.isArray(value.retainedRunIds)) return stop();
  const entries = new Map<string, string>();
  for (const entry of value.entries) {
    identifier(entry.id);
    if (entries.has(entry.id) || !['eligible', 'held', 'protected', 'unclassified', 'unresolved'].includes(entry.state)) stop();
    entries.set(entry.id, entry.state);
  }
  value.retainedRunIds.forEach(identifier);
  return { digest: exitDigest(value), eligible: (id: string) => !protectedIds.has(id) && entries.get(id) === 'eligible', retainedRunIds: value.retainedRunIds };
}
async function providerTime() {
  const c = settings(); limiterEnvironment();
  const started = Date.now();
  const params = new URLSearchParams(); params.append('queries[]', Query.limit(1)); params.append('queries[]', Query.select(['$id']));
  const response = await fetch(`${c.endpoint}/tablesdb/${c.databaseId}/tables/limits/rows?${params}`, { method: 'GET', headers: { 'X-Appwrite-Project': c.project, 'X-Appwrite-Key': c.key }, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10000) });
  const server = Date.parse(response.headers.get('date') ?? '');
  await response.body?.cancel();
  if (!response.ok || !Number.isFinite(server) || Date.now() - started > 10000 || Math.abs(server - Date.now()) > 60000) return stop();
  // Conservative cutoff: defer boundary seconds and never trust a clock ahead of local request start.
  return Math.floor(Math.min(server, started) / 1000);
}
function validate(value: Limit) {
  identifier(value.$id);
  if (!Array.isArray(value.$permissions) || value.$permissions.length || !Number.isSafeInteger(value.expires) || value.expires < 0 || !Number.isSafeInteger(value.count) || value.count < 0 || typeof value.$updatedAt !== 'string') stop();
}
const digest = (value: Limit) => exitDigest({ record: value, updatedAt: value.$updatedAt });
async function get(id: string) {
  try { const value = await admin().db.getRow<Limit>(row('limits', identifier(id))); validate(value); return value; }
  catch (error) { if (error instanceof AppwriteException && error.code === 404) return null; throw error; }
}
const result = (id: string, run: Run) => ({ runId: id, digest: exitDigest(run.plan), selected: run.states.length, absent: run.states.filter(s => s === 'absent').length, failed: run.states.filter(s => s === 'failed').length, unknown: run.states.filter(s => s === 'unknown').length, notAttempted: run.states.filter(s => s === 'not-attempted').length, complete: run.states.every(s => s === 'absent') && run.failure === null, failure: run.failure });

export async function previewLimits() {
  const policy = await review(); const cutoff = await providerTime();
  const plan: Plan = { environment: limiterEnvironment(), cutoff, reviewDigest: policy.digest, items: [], scanned: 0, excluded: 0 };
  const seen = new Set<string>(); let cursor: string | undefined; let finished = false;
  for (let page = 0; page < 100; page++) {
    const response = await admin().db.listRows<Limit>({ databaseId: settings().databaseId, tableId: 'limits', queries: [Query.lessThan('expires', cutoff), Query.orderAsc('$id'), Query.limit(100), ...(cursor ? [Query.cursorAfter(cursor)] : [])], ttl: 0 });
    if (!Array.isArray(response.rows) || response.rows.length > 100) stop();
    for (const value of response.rows) {
      validate(value); if (seen.has(value.$id)) stop(); seen.add(value.$id); plan.scanned++;
      if (value.expires >= cutoff || !policy.eligible(value.$id)) { plan.excluded++; continue; }
      plan.items.push({ id: value.$id, expires: value.expires, digest: digest(value) });
    }
    if (response.rows.length < 100) { finished = true; break; }
    cursor = response.rows.at(-1)!.$id;
  }
  if (!finished || (await review()).digest !== policy.digest) stop();
  const id = randomUUID(); const run: Run = { kind: 'open', plan, states: plan.items.map(() => 'not-attempted'), failure: null };
  await save(id, run);
  return { ...result(id, run), scanned: plan.scanned, excluded: plan.excluded, mode: 'PREVIEW_ONLY' };
}

export async function applyLimits(id: string, confirmation: string, approvals: { apply: boolean; holdsReviewed: boolean; externalWritersInactive: boolean }) {
  maintenanceEpoch();
  if (!approvals.apply || !approvals.holdsReviewed || !approvals.externalWritersInactive || (await maintenanceStatus()).dirty) return stop();
  const run = await load(id);
  if (run.kind !== 'open' || confirmation !== exitDigest(run.plan)) return stop();
  run.failure = null;
  for (let i = 0; i < run.plan.items.length; i++) {
    const item = run.plan.items[i];
    try {
      const policy = await review();
      if (policy.digest !== run.plan.reviewDigest || !policy.eligible(item.id) || policy.retainedRunIds.includes(id)) stop();
      const now = await providerTime();
      const current = await get(item.id);
      if (current === null) { run.states[i] = 'absent'; await save(id, run); continue; }
      // Even a previously confirmed absent ID cannot be deleted if it was recreated.
      if (run.states[i] === 'absent' || current.expires >= now || current.expires >= run.plan.cutoff || digest(current) !== item.digest) stop();
      run.states[i] = 'unknown'; await save(id, run);
      await admin().db.deleteRow(row('limits', item.id));
      if (await get(item.id) !== null) stop();
      run.states[i] = 'absent'; await save(id, run);
    } catch (error) {
      const dirty = (await maintenanceStatus()).dirty;
      if (run.states[i] === 'unknown' && !dirty && error instanceof AppwriteException && [400, 401, 403, 409, 413, 429].includes(error.code)) run.states[i] = 'failed';
      run.failure = dirty ? 'uncertain-provider-write' : 'review-or-retry-required';
      await save(id, run);
      return result(id, run);
    }
  }
  await save(id, run); return result(id, run);
}

// GET-only observation is available while dirty; it never clears a marker or rewrites the journal.
export async function reconcileLimits(id: string) {
  const run = await load(id); if (run.kind !== 'open') return { closed: true };
  let absent = 0, unchanged = 0, changed = 0;
  for (const item of run.plan.items) { const current = await get(item.id); if (!current) absent++; else if (digest(current) === item.digest) unchanged++; else changed++; }
  return { selected: run.plan.items.length, absent, unchanged, changed, dirty: (await maintenanceStatus()).dirty, action: 'READ_ONLY_OPERATOR_REVIEW_REQUIRED' };
}

export async function closeLimits(id: string, confirmation: string, holdsReviewed: boolean) {
  maintenanceEpoch(); if (!holdsReviewed || (await maintenanceStatus()).dirty) return stop();
  identifier(id);
  if ((await readdir(await directory())).some(name => name.startsWith(`${id}.json.`))) return stop();
  const run = await load(id); if (run.kind === 'closed') return run;
  if (confirmation !== exitDigest(run.plan) || !result(id, run).complete) return stop();
  const policy = await review();
  if (policy.digest !== run.plan.reviewDigest || policy.retainedRunIds.includes(id)) return stop();
  for (const item of run.plan.items) if (!policy.eligible(item.id) || await get(item.id) !== null) stop();
  const closedAt = new Date().toISOString();
  const closed: Closed = { kind: 'closed', closedAt, reviewAt: calendarDeadline(closedAt, 90), selected: run.plan.items.length, absent: run.plan.items.length, outcome: 'independently-verified-absent' };
  // One atomic replacement removes only this run's detailed payload; no directory purge or timer.
  await save(id, closed); return closed;
}
