import 'server-only';
import path from 'node:path';
import { readdir, unlink } from 'node:fs/promises';
import { AppwriteException, Query, type Models } from 'node-appwrite';
import { admin, row, settings } from './appwrite';
import { calendarDeadline } from './case-dates';
import { exitDigest, signExitPlan, signExitProgress, type ExitPlan, type ExitProgress } from './account-exit';
import { cancelSupersededReceipts, trackedCaseForReceipt, exitDirectory, exitRequestState, newExitCase, readExitCase, readReceipt, saveExitCase } from './exit-request';
import { coordinated, privateRead, privateRoot, privateSave } from './maintenance';
import { identifier } from './domain';

const review = () => { throw new Error('Private case requires operator review'); };
const text = (value: unknown) => { if (typeof value !== 'string' || !value.trim() || value.length > 500 || /[\x00-\x1f]/.test(value)) return review(); return value.trim(); };
export async function caseForReceipt(id: string) {
  const receipt = await readReceipt(id);
  const tracked = await trackedCaseForReceipt(receipt.requestId);
  if (!tracked.receiptIds.includes(id)) return review();
  return tracked;
}
export async function migrationPreview(id: string) {
  const selected = await readReceipt(id);
  const receipts = [];
  for (const entry of await readdir(path.join(await privateRoot(), 'exits'), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const receipt = await readReceipt(entry.name);
    if (receipt.accountId !== selected.accountId) continue;
    if (receipt.identity !== selected.identity || receipt.trackingCaseId) return review();
    receipts.push(receipt);
  }
  receipts.sort((a, b) => a.issuedAt.localeCompare(b.issuedAt) || a.requestId.localeCompare(b.requestId));
  if (!receipts.length || receipts.at(-1)!.requestId !== id) return review();
  const result = newExitCase(receipts[0], 'reviewed-preserved-receipts');
  result.receiptIds = receipts.map(receipt => receipt.requestId);
  for (const receipt of receipts) if (await privateRead(path.join(await exitDirectory(receipt.requestId), 'case.json'))) return review();
  const states = await Promise.all(result.receiptIds.map(exitRequestState));
  if (states.slice(0, -1).some(state => state.status === 'claimed')) return review();
  return { record: result, digest: exitDigest({ result, states }), qualification: 'Earliest preserved signed receipt; operator must establish history completeness before migration.' };
}
export const migrateCase = coordinated(async (id: string, digest: string, historyComplete: boolean) => {
  const preview = await migrationPreview(id);
  if (!historyComplete || preview.digest !== digest) return review();
  await saveExitCase(preview.record);
  await cancelSupersededReceipts(preview.record);
  return preview.record;
});
export const repairCasePointer = coordinated(async (id: string) => {
  const record = await readExitCase(id);
  if (record.status !== 'open') return review();
  const latest = record.receiptIds.at(-1)!;
  if ((await exitRequestState(latest)).status === 'claimed') return review();
  await cancelSupersededReceipts(record);
  await privateSave(path.join(await privateRoot(), 'exits', `account-${identifier(record.accountId)}.json`), { requestId: latest });
});
async function planFor(id: string) {
  const stored = await privateRead<{ plan: ExitPlan; signature: string }>(path.join(await exitDirectory(id), 'plan.json'));
  if (!stored || stored.plan.requestId !== id || stored.signature !== signExitPlan(stored.plan)) return review();
  return stored.plan;
}
export const recordCaseNote = coordinated(async (id: string, input: Record<string, unknown>) => {
  const record = await readExitCase(id);
  if (record.status !== 'open') return review();
  const now = new Date().toISOString(), reason = text(input.reason), operator = text(input.operator);
  const action = input.action;
  const allowed = action === 'hold' ? ['action', 'reason', 'operator', 'dataIds', 'category'] : action === 'review-hold' || action === 'release-hold' ? ['action', 'reason', 'operator', 'holdId'] : ['action', 'reason', 'operator'];
  if (Object.keys(input).some(key => !allowed.includes(key))) return review();
  if (action === 'hold') {
    const plan = await planFor(record.receiptIds.at(-1)!);
    if (plan.target !== record.accountId || !['security', 'abuse', 'copyright', 'legal'].includes(String(input.category)) || !Array.isArray(input.dataIds) || !input.dataIds.length) return review();
    const ids = input.dataIds.map(identifier);
    const selected = [...plan.heldFileIds, ...(plan.accountHold ? [plan.target] : [])];
    if (ids.some(value => !selected.includes(value))) return review();
    record.holds.push({ id: `hold-${record.holds.length + 1}`, dataIds: [...new Set(ids)], reason, operator, category: input.category as 'security' | 'abuse' | 'copyright' | 'legal', reviewedAt: now, reviewDueAt: calendarDeadline(now, 30) });
  } else if (action === 'review-hold' || action === 'release-hold') {
    const hold = record.holds.find(value => value.id === input.holdId && !value.releasedAt);
    if (!hold) return review();
    if (action === 'release-hold') { hold.releasedAt = now; hold.releaseReason = reason; }
    else { hold.reason = reason; hold.operator = operator; hold.reviewedAt = now; hold.reviewDueAt = calendarDeadline(now, 30); }
  } else if (action !== 'delay') return review();
  record.events.push({ at: now, action: String(action), reason, operator });
  await saveExitCase(record);
});
export async function requireRecordedHolds(id: string, plan: ExitPlan) {
  const record = await caseForReceipt(id);
  const selected = [...plan.heldFileIds, ...(plan.accountHold ? [plan.target] : [])].sort();
  const recorded = [...new Set(record.holds.filter(hold => !hold.releasedAt).flatMap(hold => hold.dataIds))].sort();
  if (JSON.stringify(selected) !== JSON.stringify(recorded)) return review();
}
async function absent(work: () => Promise<unknown>) {
  try { await work(); } catch (error) { if (error instanceof AppwriteException && error.code === 404) return; throw error; }
  return review();
}
async function rows(tableId: string) {
  const result: (Models.Row & { owner?: string; recipients?: string[]; accountId?: string })[] = []; let cursor: string | undefined;
  do {
    const batch = await admin().db.listRows({ databaseId: settings().databaseId, tableId, queries: [Query.limit(25), Query.orderAsc('$id'), ...(cursor ? [Query.cursorAfter(cursor)] : [])], ttl: 0 });
    result.push(...batch.rows); cursor = batch.rows.length === 25 ? batch.rows.at(-1)!.$id : undefined;
  } while (cursor);
  return result;
}
export const closeCase = coordinated(async (id: string, operatorValue: unknown) => {
  const operator = text(operatorValue), record = await readExitCase(id);
  if (record.status !== 'open' || record.holds.some(hold => !hold.releasedAt)) return review();
  const latest = record.receiptIds.at(-1)!, plan = await planFor(latest);
  if (plan.target !== record.accountId || plan.heldFileIds.length || plan.accountHold) return review();
  for (const previous of record.receiptIds.slice(0, -1)) if ((await exitRequestState(previous)).status !== 'cancelled') return review();
  const state = await exitRequestState(latest);
  const saved = await privateRead<{ progress: ExitProgress; signature: string }>(path.join(await exitDirectory(latest), 'progress.json'));
  if (state.status !== 'claimed' || state.epoch !== plan.epoch || !saved || saved.progress.stage !== 'complete' || saved.signature !== signExitProgress(plan, saved.progress)) return review();
  const { users, db, storage } = admin();
  // A signed completed journal alone is not independent deletion evidence.
  await absent(() => users.get({ userId: record.accountId }));
  await absent(() => users.listSessions({ userId: record.accountId }));
  for (const tableId of ['members', 'totals']) await absent(() => db.getRow(row(tableId, record.accountId)));
  for (const item of plan.owned) { await absent(() => db.getRow(row('files', item.id))); await absent(() => storage.getFile({ bucketId: settings().bucketId, fileId: item.id })); }
  for (const item of plan.shares) if (exitDigest(await db.getRow(row('files', item.id))) !== item.restricted) return review();
  if ((await rows('files')).some(file => file.owner === record.accountId || file.recipients?.includes(record.accountId))) return review();
  if ((await rows('invitations')).some(invite => invite.accountId === record.accountId)) return review();
  for (const item of plan.invitations) if (exitDigest(await db.getRow(row('invitations', item.id))) !== item.restricted) return review();
  record.status = 'closed'; record.closedAt = new Date().toISOString(); record.correspondenceReviewAt = calendarDeadline(record.closedAt, 90);
  record.closure = { applicationDeletionVerified: true, sessionsRevoked: true, providerErasure: 'unknown', recipientCopies: 'not-recallable' };
  record.events.push({ at: record.closedAt, action: 'verified-closure', reason: 'Independent provider reads and completed signed journal verified; provider backup/log erasure unknown.', operator });
  await saveExitCase(record);
});
export async function caseStatus(id: string) {
  const record = await readExitCase(id), latest = record.receiptIds.at(-1)!;
  const state = await exitRequestState(latest);
  const progress = await privateRead<{ progress: ExitProgress; signature: string }>(path.join(await exitDirectory(latest), 'progress.json'));
  if (progress && progress.signature !== signExitProgress(await planFor(latest), progress.progress)) return review();
  return { record, requestStatus: state.status, executionStage: progress?.progress.stage || 'not-started', overdue: record.status !== 'closed' && Date.now() > Date.parse(record.targetAt), overdueHoldReviews: record.holds.filter(hold => !hold.releasedAt && Date.now() > Date.parse(hold.reviewDueAt)).length };
}

// Removes one local eligibility record only; provider admission state and case evidence are never written.
export const cleanupEligibility = coordinated(async (id: string, invitationId: string, execution?: { digest: string; holdsReviewed: boolean }) => {
  if (!/^[a-f0-9]{36}$/.test(invitationId)) return review();
  const status = await caseStatus(id), record = status.record;
  if (record.status !== 'closed' || !record.closedAt || !Number.isFinite(Date.parse(record.closedAt)) ||
      record.closure?.applicationDeletionVerified !== true || record.closure.sessionsRevoked !== true ||
      record.holds.some(hold => !hold.releasedAt) || status.executionStage !== 'complete') return review();
  const latest = record.receiptIds.at(-1)!, plan = await planFor(latest);
  if (plan.target !== record.accountId || plan.heldFileIds.length || plan.accountHold || !plan.invitations.some(value => value.id === invitationId)) return review();
  const state = await exitRequestState(latest);
  if (state.status !== 'claimed' || state.epoch !== plan.epoch) return review();
  for (const previous of record.receiptIds.slice(0, -1)) if ((await exitRequestState(previous)).status !== 'cancelled') return review();
  const root = await privateRoot();
  for (const entry of await readdir(path.join(root, 'exits'), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const receipt = await readReceipt(entry.name);
    if (receipt.accountId === record.accountId && !record.receiptIds.includes(receipt.requestId)) return review();
    // A different account's pending plan must not lose a shared invitation-reference record.
    const other = await privateRead<{ plan: ExitPlan; signature: string }>(path.join(await exitDirectory(entry.name), 'plan.json'));
    if (other && (other.signature !== signExitPlan(other.plan) ||
        (!record.receiptIds.includes(entry.name) && other.plan.invitations.some(value => value.id === invitationId)))) return review();
  }
  const file = path.join(root, 'eligibility', `${invitationId}.json`);
  const eligibility = await privateRead<Record<string, unknown>>(file);
  if (!eligibility) return { mode: 'ALREADY_ABSENT', removed: false };
  const fields = ['invitationId', 'adult18', 'residentGeorgia', 'decision', 'decidedAt', 'reason', 'reviewOutcome'];
  if (eligibility.invitationId !== invitationId || Object.keys(eligibility).length !== fields.length ||
      Object.keys(eligibility).some(key => !fields.includes(key)) || typeof eligibility.decidedAt !== 'string' ||
      !Number.isFinite(Date.parse(eligibility.decidedAt)) || Date.parse(eligibility.decidedAt) > Date.parse(record.closedAt) ||
      !['approved', 'denied'].includes(String(eligibility.decision)) || !['approved', 'denied'].includes(String(eligibility.reviewOutcome))) return review();
  const digest = exitDigest({ record, plan, eligibility });
  if (!execution) return { mode: 'PREVIEW', reviewDigest: digest, selectedRecords: 1, removed: false };
  if (!execution.holdsReviewed || execution.digest !== digest) return review();
  // privateRead checked canonical parent and rejected symlinks; the coordination lock remains held.
  await unlink(file);
  return { mode: 'COMPLETE', removed: true };
});
