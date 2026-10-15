import { coordinated } from './maintenance';
import 'server-only';
import { AppwriteException, Query, type Models } from 'node-appwrite';
import { admin, row, settings } from './appwrite';
import { emailAddress, identifier } from './domain';
import type { Member } from './membership';

type Step = 'applicationDenied' | 'accountDisabled' | 'sessionsRevoked' | 'recipientAccessRemoved';
export type SuspensionReport = Record<Step, boolean>;
async function suspendInternal(accountId: string): Promise<SuspensionReport> {
  identifier(accountId);
  const { db, users } = admin();
  const report: SuspensionReport = { applicationDenied: false, accountDisabled: false, sessionsRevoked: false, recipientAccessRemoved: false };
  try {
    try {
      await db.getRow<Member>(row('members', accountId));
      await db.updateRow({ ...row('members', accountId), data: { state: 'suspended' }, permissions: [] });
    } catch (error) {
      if (!(error instanceof AppwriteException) || error.code !== 404) throw error;
      const user = await users.get({ userId: accountId });
      try { await db.createRow({ ...row('members', accountId), data: { email: emailAddress(user.email), state: 'suspended' }, permissions: [] }); }
      catch (conflict) {
        if (!(conflict instanceof AppwriteException) || conflict.code !== 409) throw conflict;
        await db.updateRow({ ...row('members', accountId), data: { state: 'suspended' }, permissions: [] });
      }
    }
    report.applicationDenied = true;
  } catch { return report; }
  try { await users.updateStatus({ userId: accountId, status: false }); report.accountDisabled = true; } catch { /* Continue independent revocations. */ }
  try { await users.deleteSessions({ userId: accountId }); report.sessionsRevoked = true; } catch { /* Retry is safe; continue metadata cleanup. */ }
  try {
    // Scan all rows: this also removes legacy grants missing from the recipients field.
    let cursor: string | undefined;
    do {
      const batch = await db.listRows<Models.Row & { recipients: string[] }>({ databaseId: settings().databaseId, tableId: 'files', queries: [Query.limit(25), Query.orderAsc('$id'), ...(cursor ? [Query.cursorAfter(cursor)] : [])] });
      for (const file of batch.rows) {
        const { $id: transactionId } = await db.createTransaction({ ttl: 60 });
        try {
          const current = await db.getRow<Models.Row & { recipients: string[] }>({ ...row('files', file.$id), transactionId });
          await db.updateRow({ ...row('files', file.$id), transactionId, data: { recipients: current.recipients.filter(id => id !== accountId) }, permissions: [] });
          await db.updateTransaction({ transactionId, commit: true });
        } catch (error) {
          try { await db.updateTransaction({ transactionId, rollback: true }); } catch { /* Report incomplete and rerun. */ }
          throw error;
        }
      }
      cursor = batch.rows.length === 25 ? batch.rows.at(-1)!.$id : undefined;
    } while (cursor);
    try { await db.updateRow({ ...row('totals', accountId), permissions: [] }); }
    catch (error) { if (!(error instanceof AppwriteException) || error.code !== 404) throw error; }
    report.recipientAccessRemoved = true;
  } catch { /* Preserve successful steps and report incomplete cleanup. */ }
  return report;
}

export const suspend = coordinated(suspendInternal);
