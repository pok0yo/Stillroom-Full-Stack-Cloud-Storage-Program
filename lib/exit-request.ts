import 'server-only';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { mkdir, readdir, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Models } from 'node-appwrite';
import { admin, session, settings } from './appwrite';
import { identifier, Problem } from './domain';
import { activeMember } from './membership';
import { coordinated, privateRead, privateRoot, privateSave, maintenanceEpoch } from './maintenance';
import { calendarDeadline } from './case-dates';

type Receipt = { version: 1; requestId: string; trackingCaseId?: string; accountId: string; sessionId: string; authenticatedAt: string; issuedAt: string; expiresAt: string; environment: string; identity: string };
type State = { status: 'pending' | 'cancelled' | 'claimed'; epoch?: string; initialDigest?: string };
export type CaseHold = { id: string; dataIds: string[]; reason: string; category: 'security' | 'abuse' | 'copyright' | 'legal'; operator: string; reviewedAt: string; reviewDueAt: string; releasedAt?: string; releaseReason?: string };
export type ExitCase = { version: 1; caseId: string; accountId: string; identity: string; environment: string; originalReceivedAt: string; targetAt: string; receiptIds: string[]; origin: 'new-request' | 'reviewed-preserved-receipts'; status: 'open' | 'closed'; holds: CaseHold[]; events: { at: string; action: string; reason: string; operator: string }[]; closedAt?: string; correspondenceReviewAt?: string; closure?: { applicationDeletionVerified: true; sessionsRevoked: true; providerErasure: 'unknown'; recipientCopies: 'not-recallable' } };
const denied = () => new Problem(409, 'This exit request cannot be used. Sign out, sign in again, and submit a new request, or contact the operator.');
const sign = (purpose: string, data: unknown) => createHmac('sha256', settings().rateSecret).update(`${purpose}:v1:${JSON.stringify(data)}`).digest('hex');
const environment = () => { const c = settings(); return JSON.stringify([c.endpoint, c.project, c.databaseId, c.bucketId]); };
const identity = (user: { $id: string; email: string; registration: string }) => sign('exit-identity', [user.$id, user.email, user.registration]);
function valid(purpose: string, data: unknown, signature: unknown) {
  const expected = sign(purpose, data);
  return typeof signature === 'string' && /^[a-f0-9]{64}$/.test(signature) && timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
export async function exitDirectory(id: string) {
  identifier(id);
  const directory = path.join(await privateRoot(), 'exits', id);
  await mkdir(directory, { recursive: true });
  if (await realpath(directory) !== directory) throw denied();
  return directory;
}
async function signedRead<T>(file: string, purpose: string): Promise<T> {
  const stored = await privateRead<{ data: T; signature: string }>(file);
  if (!stored || !valid(purpose, stored.data, stored.signature)) throw denied();
  return stored.data;
}
async function signedSave(file: string, purpose: string, data: unknown) { await privateSave(file, { data, signature: sign(purpose, data) }); }
export async function readExitCase(id: string) {
  const value = await signedRead<ExitCase>(path.join(await exitDirectory(id), 'case.json'), `exit-case:${id}`);
  if (value.version !== 1 || value.caseId !== id || value.environment !== environment() || value.targetAt !== calendarDeadline(value.originalReceivedAt, 30) || !value.receiptIds.length) throw denied();
  for (const requestId of value.receiptIds) {
    const receipt = await readReceipt(requestId);
    if (receipt.accountId !== value.accountId || receipt.identity !== value.identity || receipt.issuedAt < value.originalReceivedAt || (receipt.trackingCaseId && receipt.trackingCaseId !== id)) throw denied();
  }
  if ((await readReceipt(value.receiptIds[0])).issuedAt !== value.originalReceivedAt) throw denied();
  return value;
}
export async function trackedCaseForReceipt(id: string) {
  const receipt = await readReceipt(id);
  if (receipt.trackingCaseId) return readExitCase(receipt.trackingCaseId);
  const matches: ExitCase[] = [];
  for (const entry of await readdir(path.join(await privateRoot(), 'exits'), { withFileTypes: true })) {
    if (!entry.isDirectory() || !await privateRead(path.join(await exitDirectory(entry.name), 'case.json'))) continue;
    const record = await readExitCase(entry.name);
    if (record.receiptIds.includes(id)) matches.push(record);
  }
  if (matches.length !== 1) throw denied();
  return matches[0];
}
export const cancelSupersededReceipts = coordinated(async (record: ExitCase) => {
  const checked = await readExitCase(record.caseId);
  for (const id of checked.receiptIds.slice(0, -1)) {
    if ((await readState(id)).status === 'claimed') throw denied();
    await signedSave(path.join(await exitDirectory(id), 'state.json'), `exit-state:${id}`, { status: 'cancelled' });
  }
});
export const saveExitCase = coordinated(async (value: ExitCase) => {
  const previous = await privateRead<{ data: ExitCase }>(path.join(await exitDirectory(value.caseId), 'case.json'));
  if (previous) {
    const original = await readExitCase(value.caseId);
    for (const field of ['caseId', 'accountId', 'identity', 'environment', 'originalReceivedAt', 'targetAt', 'origin'] as const) if (value[field] !== original[field]) throw denied();
    if (original.status === 'closed' || original.receiptIds.some((id, index) => value.receiptIds[index] !== id)) throw denied();
  }
  await signedSave(path.join(await exitDirectory(value.caseId), 'case.json'), `exit-case:${value.caseId}`, value);
});
export function newExitCase(receipt: Receipt, origin: ExitCase['origin'] = 'new-request'): ExitCase {
  return { version: 1, caseId: receipt.trackingCaseId || receipt.requestId, accountId: receipt.accountId, identity: receipt.identity, environment: receipt.environment, originalReceivedAt: receipt.issuedAt, targetAt: calendarDeadline(receipt.issuedAt, 30), receiptIds: [receipt.requestId], origin, status: 'open', holds: [], events: [] };
}

// Written only after the application's password sign-in succeeds; page/cookie refresh never writes this proof.
export const recordPasswordAuthentication = coordinated(async (provider: Models.Session) => {
  const directory = path.join(await privateRoot(), 'authentication'); await mkdir(directory, { recursive: true });
  identifier(provider.$id); identifier(provider.userId);
  await signedSave(path.join(directory, `${provider.$id}.json`), 'password-authentication', { sessionId: provider.$id, accountId: provider.userId, created: provider.$createdAt, environment: environment() });
});
export const issueExitRequest = coordinated(async (auth: Awaited<ReturnType<typeof session>>) => {
  await activeMember(auth.user);
  const current = await auth.account.getSession({ sessionId: 'current' });
  const age = Date.now() - Date.parse(current.$createdAt);
  if (!current.current || current.userId !== auth.user.$id || current.provider !== 'email' || !Number.isFinite(age) || age < 0 || age > 600000 || !Number.isFinite(Date.parse(current.expire)) || Date.parse(current.expire) <= Date.now()) throw denied();
  const proof = await signedRead<{ sessionId: string; accountId: string; created: string; environment: string }>(path.join(await privateRoot(), 'authentication', `${identifier(current.$id)}.json`), 'password-authentication');
  if (proof.sessionId !== current.$id || proof.accountId !== auth.user.$id || proof.created !== current.$createdAt || proof.environment !== environment()) throw denied();
  // At most one outstanding request per account; a lost response can be recovered without issuing another receipt.
  const pointer = path.join(await privateRoot(), 'exits', `account-${identifier(auth.user.$id)}.json`);
  const old = await privateRead<{ requestId: string }>(pointer);
  let tracking: ExitCase | undefined;
  if (old) {
    const state = await readState(old.requestId);
    if (state.status === 'claimed') throw denied();
    const receipt = await readReceipt(old.requestId);
    if (receipt.accountId !== auth.user.$id || receipt.identity !== identity(auth.user)) throw denied();
    // Legacy receipts require an explicit reviewed migration; never restart an unknown clock.
    tracking = await trackedCaseForReceipt(receipt.requestId);
    if (tracking.status !== 'open' || tracking.accountId !== auth.user.$id || tracking.identity !== identity(auth.user) || tracking.receiptIds.at(-1) !== old.requestId) throw denied();
    if (state.status === 'pending' && receipt.sessionId === current.$id && Date.parse(receipt.expiresAt) > Date.now()) return { caseId: receipt.requestId, expiresAt: receipt.expiresAt };
  } else {
    // A missing pointer after a partial local write must not manufacture a later original date.
    for (const entry of await readdir(path.dirname(pointer), { withFileTypes: true }).catch(error => { if (error.code === 'ENOENT') return []; throw error; })) {
      if (entry.isDirectory() && (await readReceipt(entry.name)).accountId === auth.user.$id) throw denied();
    }
  }
  const requestId = randomUUID();
  const now = Date.now();
  const receipt: Receipt = { version: 1, requestId, trackingCaseId: tracking?.caseId || requestId, accountId: auth.user.$id, sessionId: current.$id, authenticatedAt: current.$createdAt, issuedAt: new Date(now).toISOString(), expiresAt: new Date(now + 86400000).toISOString(), environment: environment(), identity: identity(auth.user) };
  const directory = await exitDirectory(requestId);
  await writeFile(path.join(directory, 'receipt.json'), JSON.stringify({ data: receipt, signature: sign('exit-receipt', receipt) }), { flag: 'wx', mode: 0o600 });
  await signedSave(path.join(directory, 'state.json'), `exit-state:${requestId}`, { status: 'pending' });
  if (tracking) tracking.receiptIds.push(requestId); else tracking = newExitCase(receipt);
  await saveExitCase(tracking);
  if (old) await signedSave(path.join(await exitDirectory(old.requestId), 'state.json'), `exit-state:${old.requestId}`, { status: 'cancelled' });
  await privateSave(pointer, { requestId });
  return { caseId: requestId, expiresAt: receipt.expiresAt };
});
export async function readReceipt(id: string) {
  const receipt = await signedRead<Receipt>(path.join(await exitDirectory(id), 'receipt.json'), 'exit-receipt');
  if (receipt.version !== 1 || receipt.requestId !== id || receipt.environment !== environment() || Date.parse(receipt.expiresAt) - Date.parse(receipt.issuedAt) !== 86400000) throw denied();
  identifier(receipt.accountId); identifier(receipt.sessionId);
  const age = Date.parse(receipt.issuedAt) - Date.parse(receipt.authenticatedAt);
  if (!Number.isFinite(age) || age < 0 || age > 600000) throw denied();
  return receipt;
}
async function readState(id: string) { return signedRead<State>(path.join(await exitDirectory(id), 'state.json'), `exit-state:${id}`); }
export async function exitRequestState(id: string) { await readReceipt(id); return readState(id); }
export const cancelExitRequest = coordinated(async (auth: Awaited<ReturnType<typeof session>>, id: string) => {
  const receipt = await readReceipt(id); const state = await readState(id);
  if (receipt.accountId !== auth.user.$id || state.status === 'claimed') throw denied();
  if (receipt.trackingCaseId && (await readExitCase(receipt.trackingCaseId)).receiptIds.at(-1) !== id) throw denied();
  await signedSave(path.join(await exitDirectory(id), 'state.json'), `exit-state:${id}`, { status: 'cancelled' });
  return { ok: true };
});
export async function validateExitReceipt(id: string, target: string, retry = false) {
  const epoch = maintenanceEpoch();
  const receipt = await readReceipt(id); const state = await readState(id);
  if (receipt.accountId !== target || state.status === 'cancelled') throw denied();
  if (receipt.trackingCaseId || state.status === 'pending' || await privateRead(path.join(await exitDirectory(id), 'case.json'))) {
    const tracking = await trackedCaseForReceipt(id);
    if (tracking.status !== 'open' || tracking.receiptIds.at(-1) !== id) throw denied();
  }
  if (state.status === 'claimed') { if (!retry || state.epoch !== epoch) throw denied(); return receipt; }
  if (state.status !== 'pending' || Date.parse(receipt.issuedAt) > Date.now() || Date.parse(receipt.expiresAt) <= Date.now()) throw denied();
  const user = await admin().users.get({ userId: target });
  await activeMember(user);
  if (identity(user) !== receipt.identity) throw denied();
  const sessions = await admin().users.listSessions({ userId: target });
  if (!sessions.sessions.some(value => value.$id === receipt.sessionId && value.userId === target && value.provider === 'email' && value.$createdAt === receipt.authenticatedAt && Date.parse(value.expire) > Date.now())) throw denied();
  return receipt;
}
export async function claimExitReceipt(id: string, target: string, initialDigest: string) {
  await validateExitReceipt(id, target, true);
  const state = await readState(id);
  if (state.status === 'claimed') { if (state.initialDigest !== initialDigest) throw denied(); return; }
  await signedSave(path.join(await exitDirectory(id), 'state.json'), `exit-state:${id}`, { status: 'claimed', epoch: maintenanceEpoch(), initialDigest });
}
export const cleanupPolicy = { enabled: false, reason: 'Full-case and revoked-invitation cleanup remain disabled. Eligibility-only cleanup uses the explicit case action; real execution requires separate authorization. Preserve retry state and holds.' } as const;
