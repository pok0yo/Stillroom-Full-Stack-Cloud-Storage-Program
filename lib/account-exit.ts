import { maintenanceEpoch } from './maintenance';
import { readReceipt, validateExitReceipt, claimExitReceipt } from './exit-request';
import 'server-only';
import { createHash, createHmac } from 'node:crypto';
import { AppwriteException, Query, type Models } from 'node-appwrite';
import { admin, row, settings } from './appwrite';
import { emailAddress, identifier } from './domain';
import { invitationId } from './membership';

type RecordRow = Models.Row & Record<string, unknown>;
export type ExitRequest = { requestId: string; heldFileIds: string[]; accountHold: boolean };
type RecordPlan = { id: string; before: string; restricted: string };
export type ExitPlan = {
  version: 1; epoch: string; target: string; requestId: string; verifiedAt: string;
  environment: { endpoint: string; project: string; databaseId: string; bucketId: string };
  account: string; member: RecordPlan; invitations: RecordPlan[];
  owned: (RecordPlan & { storage: string | null })[]; shares: RecordPlan[];
  totals: string | null; sessionIds: string[]; heldFileIds: string[]; accountHold: boolean;
};
export type ExitProgress = { stage: 'prepared' | 'restricting' | 'removing' | 'complete'; completed: string[] };
export type ExitResult = { complete: boolean; stage: string; blocked: 'none' | 'review' | 'restriction' | 'cleanup' | 'hold'; removedFiles: number };
const stop = () => { throw new Error('Exit requires operator review'); };
const absent = (error: unknown) => error instanceof AppwriteException && error.code === 404;
async function optional<T>(work: () => Promise<T>): Promise<T | null> { try { return await work(); } catch (error) { if (absent(error)) return null; throw error; } }
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([key]) => key !== '$updatedAt').sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonical(item)]));
  return value;
}
export const exitDigest = (value: unknown) => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
export const signExitPlan = (plan: ExitPlan) => createHmac('sha256', settings().rateSecret).update(`account-exit:v1:${JSON.stringify(plan)}`).digest('hex');
export const signExitProgress = (plan: ExitPlan, progress: ExitProgress) => createHmac('sha256', settings().rateSecret).update(`account-exit-progress:v1:${plan.target}:${plan.requestId}:${JSON.stringify(progress)}`).digest('hex');
const environment = () => { const { endpoint, project, databaseId, bucketId } = settings(); return { endpoint, project, databaseId, bucketId }; };
const ref = (table: string, id: string) => row(table, id);
const get = (table: string, id: string) => optional(() => admin().db.getRow<RecordRow>(ref(table, id)));
async function all(tableId: string) {
  const rows: RecordRow[] = []; let cursor: string | undefined;
  do {
    const batch = await admin().db.listRows<RecordRow>({ databaseId: settings().databaseId, tableId, queries: [Query.limit(25), Query.orderAsc('$id'), ...(cursor ? [Query.cursorAfter(cursor)] : [])] });
    rows.push(...batch.rows); cursor = batch.rows.length === 25 ? batch.rows.at(-1)!.$id : undefined;
  } while (cursor);
  return rows;
}
function recordPlan(value: RecordRow, data: Record<string, unknown>): RecordPlan {
  if (value.$permissions.length) stop();
  return { id: identifier(value.$id), before: exitDigest(value), restricted: exitDigest({ ...value, ...data, $permissions: [] }) };
}
const accountDigest = (user: { $id: string; email: string; emailVerification: boolean; registration: string }) => exitDigest({ id: user.$id, email: user.email, verified: user.emailVerification, registration: user.registration });
const ownRestriction = { status: 'deleting', recipients: [] };
const inviteRestriction = { email: '', state: 'revoked', accountId: '' };
export async function previewExit(request: ExitRequest, retry = false): Promise<ExitPlan> {
  const epoch = maintenanceEpoch();
  const receipt = await readReceipt(request.requestId);
  const target = receipt.accountId;
  await validateExitReceipt(request.requestId, target, retry);
  if (!Array.isArray(request.heldFileIds) || typeof request.accountHold !== 'boolean') stop();
  request.heldFileIds.forEach(identifier);
  const { users, storage } = admin(); const user = await users.get({ userId: target });
  const member = await get('members', target);
  if (!user.emailVerification || !member || member.email !== emailAddress(user.email) || !['active', 'suspended'].includes(String(member.state))) stop();
  const invitations = (await all('invitations')).filter(value => value.accountId === target || value.$id === invitationId(user.email));
  if (!invitations.length || invitations.some(value => value.accountId !== target || value.state !== 'bound' || value.email !== emailAddress(user.email))) stop();
  const files = await all('files');
  const owned: ExitPlan['owned'] = [];
  for (const file of files.filter(value => value.owner === target)) {
    const blob = await optional(() => storage.getFile({ bucketId: settings().bucketId, fileId: file.$id }));
    if (blob && blob.$permissions.length) stop();
    owned.push({ ...recordPlan(file, ownRestriction), storage: blob ? exitDigest(blob) : null });
  }
  if (request.heldFileIds.some(id => !owned.some(file => file.id === id))) stop();
  const shares = files.filter(value => value.owner !== target && (value.recipients as string[]).includes(target)).map(value => recordPlan(value, { recipients: (value.recipients as string[]).filter(id => id !== target) }));
  const totals = await get('totals', target);
  if (totals && totals.$permissions.length) stop();
  const sessions = await users.listSessions({ userId: target });
  return { version: 1, epoch, target, requestId: request.requestId, verifiedAt: receipt.issuedAt, environment: environment(), account: accountDigest(user), member: recordPlan(member!, { email: '', state: 'suspended' }), invitations: invitations.map(value => recordPlan(value, inviteRestriction)), owned, shares, totals: totals ? exitDigest(totals) : null, sessionIds: sessions.sessions.map(value => value.$id).sort(), heldFileIds: [...new Set(request.heldFileIds)].sort(), accountHold: request.accountHold };
}

// A held maintenance capability is required; an operator boolean cannot establish drain.
export async function applyExit(plan: ExitPlan, signature: string, confirmed: string, progress: ExitProgress, persist: (value: ExitProgress) => Promise<void>): Promise<ExitResult> {
  const result = (blocked: ExitResult['blocked']): ExitResult => ({ complete: progress.stage === 'complete' && blocked === 'none', stage: progress.stage, blocked, removedFiles: progress.completed.filter(value => value.startsWith('file:')).length });
  try { if (maintenanceEpoch() !== plan.epoch) return result('review'); await validateExitReceipt(plan.requestId, plan.target, true); } catch { return result('review'); }
  if (signExitPlan(plan) !== signature || confirmed !== exitDigest(plan) || JSON.stringify(plan.environment) !== JSON.stringify(environment())) return result('review');
  const target = identifier(plan.target); const { db, storage, users } = admin();
  const save = async (label: string) => { if (!progress.completed.includes(label)) progress.completed.push(label); await persist(progress); };
  const verifyRow = async (table: string, item: RecordPlan, missingAllowed = false) => {
    const current = await get(table, item.id);
    if (!current) { if (!missingAllowed) stop(); return null; }
    if (![item.before, item.restricted].includes(exitDigest(current))) stop();
    return current;
  };
  const restrict = async (table: string, item: RecordPlan, data: Record<string, unknown>) => {
    const current = await verifyRow(table, item, progress.stage === 'removing' && (table === 'files' || table === 'members'));
    if (current && exitDigest(current) !== item.restricted) await db.updateRow({ ...ref(table, item.id), data, permissions: [] });
    const actual = await get(table, item.id);
    if (actual && exitDigest(actual) !== item.restricted) stop();
  };
  const eraseRow = async (table: string, id: string) => { await optional(() => db.deleteRow(ref(table, id))); if (await get(table, id)) stop(); };
  try {
    const user = await optional(() => users.get({ userId: target }));
    if (user && accountDigest(user) !== plan.account) stop();
    if (!user && progress.stage !== 'removing' && progress.stage !== 'complete') stop();
    const files = await all('files');
    if (files.some(value => value.owner === target ? !plan.owned.some(item => item.id === value.$id) : (value.recipients as string[]).includes(target) && !plan.shares.some(item => item.id === value.$id))) stop();
    for (const item of [...plan.owned, ...plan.shares]) await verifyRow('files', item, progress.stage === 'removing' || progress.stage === 'complete');
    for (const item of plan.invitations) await verifyRow('invitations', item);
    const otherInvites = (await all('invitations')).filter(value => value.accountId === target && !plan.invitations.some(item => item.id === value.$id));
    if (otherInvites.length) stop();
    if (progress.stage === 'complete') {
      for (const item of plan.invitations) if (exitDigest(await get('invitations', item.id)) !== item.restricted) stop();
      if (user || await get('members', target) || await get('totals', target) || files.some(value => value.owner === target || (value.recipients as string[]).includes(target))) stop();
      for (const item of plan.owned) if (await optional(() => storage.getFile({ bucketId: settings().bucketId, fileId: item.id }))) stop();
      return result('none');
    }
    if (progress.stage === 'prepared') {
      // Fresh approval must match the exact inventory, including sessions, before any mutation.
      const fresh = await previewExit({ requestId: plan.requestId, heldFileIds: plan.heldFileIds, accountHold: plan.accountHold }, true);
      if (exitDigest(fresh) !== confirmed) stop();
      await claimExitReceipt(plan.requestId, target, confirmed);
      progress.stage = 'restricting'; await persist(progress);
    }
  } catch { return result('review'); }
  try {
    await restrict('members', plan.member, { email: '', state: 'suspended' });
    for (const invite of plan.invitations) await restrict('invitations', invite, inviteRestriction);
    const user = await optional(() => users.get({ userId: target }));
    if (user) {
      await users.updateStatus({ userId: target, status: false });
      await users.deleteSessions({ userId: target });
      if ((await users.get({ userId: target })).status || (await users.listSessions({ userId: target })).sessions.length) stop();
    }
    // Restrict every owned file before deleting any bytes, including held files.
    for (const item of plan.owned) await restrict('files', item, ownRestriction);
    for (const item of plan.shares) {
      const value = await verifyRow('files', item, progress.stage === 'removing');
      if (value) await restrict('files', item, { recipients: (value.recipients as string[]).filter(id => id !== target) });
    }
    progress.stage = 'removing'; await persist(progress);
  } catch { return result('restriction'); }
  try {
    for (const item of plan.owned) {
      if (plan.heldFileIds.includes(item.id)) continue;
      const value = await verifyRow('files', item, true);
      if (value && (value.owner !== target || exitDigest(value) !== item.restricted)) stop();
      const blob = await optional(() => storage.getFile({ bucketId: settings().bucketId, fileId: item.id }));
      if (blob && exitDigest(blob) !== item.storage) stop();
      if (blob) await optional(() => storage.deleteFile({ bucketId: settings().bucketId, fileId: item.id }));
      if (await optional(() => storage.getFile({ bucketId: settings().bucketId, fileId: item.id }))) stop();
      await eraseRow('files', item.id); await save(`file:${item.id}`);
    }
    if (plan.accountHold || plan.heldFileIds.length) return result('hold');
    const remaining = await all('files');
    if (remaining.some(value => value.owner === target || (value.recipients as string[]).includes(target))) stop();
    const totals = await get('totals', target);
    if (totals && exitDigest(totals) !== plan.totals) stop();
    await eraseRow('totals', target); await save('totals');
    // Account deletion releases its ID. Remove it only after owned resources/shares are gone.
    await optional(() => users.delete({ userId: target }));
    if (await optional(() => users.get({ userId: target }))) stop();
    await save('account');
    await verifyRow('members', plan.member, true); await eraseRow('members', target); await save('membership');
    for (const item of plan.invitations) {
      const value = await get('invitations', item.id);
      if (!value || exitDigest(value) !== item.restricted) stop();
    }
    progress.stage = 'complete'; await persist(progress); return result('none');
  } catch { return result('cleanup'); }
}
