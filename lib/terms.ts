import 'server-only';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { lstat, mkdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { settings } from './appwrite';
import { identifier, Problem } from './domain';
import { eligibleAccount } from './membership';
import { coordinated, privateRead, privateRoot, privateSave } from './maintenance';
import { noticePublication } from './notice-content';

type Agreement = { accountId: string; version: string; acceptedAt: string };
const unavailable = () => new Problem(503, 'Agreement records are unavailable. You can still request account exit or sign out.');
export function publishedNotices() {
  const notice = noticePublication.current;
  if (!notice) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(notice.effectiveDate) || !Number.isFinite(Date.parse(notice.effectiveDate)) || !notice.terms.trim() || !notice.privacy.trim()) throw unavailable();
  // Content-derived identity prevents changed terms from reusing an old acceptance.
  return { ...notice, version: createHash('sha256').update(JSON.stringify([notice.effectiveDate, notice.terms])).digest('hex') };
}
function signature(data: Agreement) {
  const c = settings();
  return createHmac('sha256', c.rateSecret).update(JSON.stringify(['terms:v1', c.endpoint, c.project, c.databaseId, data])).digest('hex');
}
async function location(accountId: string, version: string) {
  identifier(accountId);
  if (!/^[a-f0-9]{64}$/.test(version)) throw unavailable();
  const root = await privateRoot();
  const parent = path.join(root, 'terms');
  await mkdir(parent, { recursive: true });
  if (await realpath(parent) !== parent) throw unavailable();
  const directory = path.join(parent, accountId);
  await mkdir(directory, { recursive: true });
  if (await realpath(directory) !== directory) throw unavailable();
  return path.join(directory, `${version}.json`);
}
async function readAgreement(accountId: string, version: string): Promise<Agreement | null> {
  try {
    const file = await location(accountId, version);
    const stored = await privateRead<{ data: Agreement; signature: string }>(file);
    if (stored === null) {
      try { await lstat(file); } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null; throw error; }
      throw unavailable();
    }
    const data = stored.data;
    if (Object.keys(stored).sort().join() !== 'data,signature' || !data || Object.keys(data).sort().join() !== 'acceptedAt,accountId,version' || data.accountId !== accountId || data.version !== version || typeof data.acceptedAt !== 'string' || new Date(data.acceptedAt).toISOString() !== data.acceptedAt || Date.parse(data.acceptedAt) > Date.now() || typeof stored.signature !== 'string' || !/^[a-f0-9]{64}$/.test(stored.signature) || !timingSafeEqual(Buffer.from(stored.signature), Buffer.from(signature(data)))) throw unavailable();
    return data;
  } catch { throw unavailable(); }
}
export async function needsAgreement(accountId: string) {
  const notice = publishedNotices();
  return notice !== null && await readAgreement(accountId, notice.version) === null;
}
export async function fileAccount(accountId: string) {
  const user = await eligibleAccount(accountId);
  if (await needsAgreement(accountId)) throw new Problem(403, 'Review and agree to the current beta terms before using files. Account exit and sign-out remain available.');
  return user;
}
export const acceptTerms = coordinated(async (accountId: string, input: Record<string, unknown>) => {
  const notice = publishedNotices();
  if (!notice) throw new Problem(409, 'Terms agreement is not active. No agreement was recorded.');
  if (input.agree !== true || Object.keys(input).sort().join() !== 'agree,version') throw new Problem(400, 'Explicit agreement is required.');
  if (input.version !== notice.version) throw new Problem(409, 'The terms version changed. Reload and review it before agreeing.');
  await eligibleAccount(accountId);
  const existing = await readAgreement(accountId, notice.version);
  if (existing) return { ok: true };
  const data: Agreement = { accountId: identifier(accountId), version: notice.version, acceptedAt: new Date().toISOString() };
  const file = await location(accountId, notice.version);
  try { await privateSave(file, { data, signature: signature(data) }); }
  catch {
    // A rename may have completed before the caller saw an error; never replace its timestamp.
    if (!await readAgreement(accountId, notice.version)) throw unavailable();
  }
  return { ok: true };
});
