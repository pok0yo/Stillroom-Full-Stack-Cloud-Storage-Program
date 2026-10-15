import { coordinated } from './maintenance';
import 'server-only';
import { ID, Query, type Models, type TablesDB, AppwriteException } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';
import { admin, row, settings, session } from './appwrite';
import { adjustTotals, assertAccess, emptyTotals, filename, identifier, listOptions, PAGE_SIZE, Problem, recipientChange, type FileRecord, type Totals } from './domain';
import { fileAccount } from './terms';
import { validateUpload } from './validation';
type FileRow = Models.Row & FileRecord;
type TotalsRow = Models.Row & Totals;
export async function accessible(id: string, auth: Awaited<ReturnType<typeof session>>, ownerOnly = false, transactionId?: string) {
  await fileAccount(auth.user.$id);
  const file = await admin().db.getRow<FileRow>({ ...row('files', identifier(id)), transactionId });
  assertAccess(file, auth.user.$id, ownerOnly);
  return file;
}
async function transaction<T>(work: (db: TablesDB, transactionId: string) => Promise<T>) {
  const { db } = admin();
  const { $id: transactionId } = await db.createTransaction({ ttl: 60 });
  try {
    const result = await work(db, transactionId);
    await db.updateTransaction({ transactionId, commit: true });
    return result;
  } catch (error) {
    try { await db.updateTransaction({ transactionId, rollback: true }); } catch { /* An uncertain commit is resolved by reading the persisted file state. */ }
    throw error;
  }
}
async function ensureTotals(owner: string) {
  try { await admin().db.createRow({ ...row('totals', owner), data: emptyTotals(), permissions: [] }); }
  catch (error) { if (!(error instanceof AppwriteException) || error.code !== 409) throw error; }
}
async function updateTotals(db: TablesDB, file: FileRecord, direction: 1 | -1, transactionId: string) {
  const ref = row('totals', file.owner);
  const current = await db.getRow<TotalsRow>({ ...ref, transactionId });
  const totals = emptyTotals();
  for (const key of Object.keys(totals) as (keyof Totals)[]) totals[key] = current[key];
  await db.updateRow({ ...ref, transactionId, data: adjustTotals(totals, file, direction) });
}
async function uploadInternal(auth: Awaited<ReturnType<typeof session>>, name: string, bytes: Buffer) {
  await fileAccount(auth.user.$id);
  const data = validateUpload(name, bytes);
  await ensureTotals(auth.user.$id);
  const { db, storage } = admin();
  const id = ID.unique();
  const file = await db.createRow<FileRow>({ ...row('files', id), data: { ...data, owner: auth.user.$id, recipients: [], status: 'pending' }, permissions: [] });
  try {
    await storage.createFile({ bucketId: settings().bucketId, fileId: id, file: InputFile.fromBuffer(bytes, data.name), permissions: [] });
    await transaction(async (tx, transactionId) => {
      const current = await tx.getRow<FileRow>({ ...row('files', id), transactionId });
      if (current.status !== 'pending') throw new Problem(409, 'Upload state changed.');
      await tx.updateRow({ ...row('files', id), data: { status: 'ready' }, transactionId });
      await updateTotals(tx, file, 1, transactionId);
    });
  } catch {
    // Preserve the pre-upload journal, even when the storage request or commit outcome is unknown.
    throw new Problem(503, `Upload ${id} could not be confirmed. Refresh My Files; an operator can recover a pending upload using the setup guide.`);
  }
  return { id };
}
export async function listFiles(auth: Awaited<ReturnType<typeof session>>, params: URLSearchParams) {
  await fileAccount(auth.user.$id);
  const options = listOptions(params);
  const queries = [Query.limit(PAGE_SIZE + 1)];
  if (options.view === 'shared') queries.push(Query.contains('recipients', [auth.user.$id]), Query.equal('status', 'ready'));
  else queries.push(Query.equal('owner', auth.user.$id));
  if (options.kind) queries.push(Query.equal('kind', options.kind));
  if (options.search) queries.push(Query.contains('searchName', options.search));
  queries.push(options.sort === 'name' ? Query.orderAsc('searchName') : options.sort === 'size' ? Query.orderDesc('size') : options.sort === 'oldest' ? Query.orderAsc('$createdAt') : Query.orderDesc('$createdAt'), Query.orderAsc('$id'));
  if (options.cursor) {
    const cursor = await accessible(options.cursor, auth);
    if ((options.view === 'owned' && cursor.owner !== auth.user.$id) || (options.view === 'shared' && !cursor.recipients.includes(auth.user.$id))) throw new Problem(400, 'Invalid page cursor.');
    queries.push(Query.cursorAfter(options.cursor));
  }
  const result = await admin().db.listRows<FileRow>({ databaseId: settings().databaseId, tableId: 'files', queries });
  const items = result.rows.slice(0, PAGE_SIZE);
  items.forEach(file => assertAccess(file, auth.user.$id));
  return { items, next: result.rows.length > PAGE_SIZE ? items.at(-1)!.$id : null };
}
export async function dashboard(auth: Awaited<ReturnType<typeof session>>) {
  await fileAccount(auth.user.$id);
  const totals: Totals = emptyTotals();
  try {
    const result = await admin().db.getRow<TotalsRow>(row('totals', auth.user.$id));
    for (const key of Object.keys(totals) as (keyof Totals)[]) totals[key] = result[key];
  } catch (error) { if (!(error instanceof AppwriteException) || error.code !== 404) throw error; }
  const recent = await admin().db.listRows<FileRow>({ databaseId: settings().databaseId, tableId: 'files', queries: [Query.equal('owner', auth.user.$id), Query.equal('status', 'ready'), Query.orderDesc('$createdAt'), Query.orderAsc('$id'), Query.limit(6)] });
  recent.rows.forEach(file => assertAccess(file, auth.user.$id, true));
  return { totals, recent: recent.rows };
}
async function mutateInternal(auth: Awaited<ReturnType<typeof session>>, id: string, input: Record<string, unknown>) {
  await accessible(id, auth, true);
  return transaction(async (db, transactionId) => {
    const current = await db.getRow<FileRow>({ ...row('files', id), transactionId });
    assertAccess(current, auth.user.$id, true);
    if (current.status !== 'ready') throw new Problem(409, 'This file is not ready.');
    if (input.action === 'rename') {
      const name = filename(input.name);
      if (name.split('.').pop()?.toLowerCase() !== current.name.split('.').pop()?.toLowerCase()) throw new Problem(400, 'Keep the original file extension.');
      await db.updateRow({ ...row('files', id), data: { name, searchName: name.toLowerCase() }, transactionId });
    } else if (input.action === 'share' || input.action === 'revoke') {
      const recipient = identifier(input.recipient);
      if (input.action === 'share') {
        try { await fileAccount(recipient); }
        catch (error) { if (error instanceof Problem && error.status === 403) throw new Problem(400, 'Cannot share with this recipient. They must be eligible to use files.'); throw error; }
      }
      const recipients = recipientChange(current, recipient, input.action === 'revoke');
      await db.updateRow({ ...row('files', id), data: { recipients }, permissions: [], transactionId });
    } else throw new Problem(400, 'Unknown file action.');
    return { ok: true };
  });
}
async function removeInternal(auth: Awaited<ReturnType<typeof session>>, id: string) {
  await accessible(id, auth, true);
  await transaction(async (db, transactionId) => {
    const file = await db.getRow<FileRow>({ ...row('files', id), transactionId });
    assertAccess(file, auth.user.$id, true);
    if (file.status === 'pending') throw new Problem(409, 'Upload may still be running. An operator must recover this pending upload before deletion.');
    if (file.status === 'deleting') return;
    await db.updateRow({ ...row('files', id), data: { status: 'deleting', recipients: [] }, permissions: [], transactionId });
    if (file.status === 'ready') await updateTotals(db, file, -1, transactionId);
  });
  try { await admin().storage.deleteFile({ bucketId: settings().bucketId, fileId: id }); }
  catch (error) { if (!(error instanceof AppwriteException) || error.code !== 404) throw new Problem(503, 'Deletion is unfinished. Retry Delete in My Files to finish cleanup.'); }
  try { await admin().db.deleteRow(row('files', id)); }
  catch (error) { if (!(error instanceof AppwriteException) || error.code !== 404) throw new Problem(503, 'File bytes were deleted; metadata cleanup is unfinished. Retry Delete.'); }
  return { ok: true };
}


export const upload = coordinated(uploadInternal);

export const mutate = coordinated(mutateInternal);

export const remove = coordinated(removeInternal);
