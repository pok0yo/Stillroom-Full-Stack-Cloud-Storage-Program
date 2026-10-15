import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { Query, type Models } from 'node-appwrite';
import { admin, settings } from '../lib/appwrite';
import { tables } from './schema';
import { logFailure } from '../lib/logging';

// Read-only Cloud inventory. There is deliberately no apply or restore mode.
async function main() {
  if (process.argv.length > 2) throw new Error('This script accepts no arguments');
  const { db } = admin();
  const { databaseId, project, endpoint } = settings();
  const snapshot: { tableId: string; rowId: string; updatedAt: string; permissions: string[] }[] = [];
  const counts: Record<string, { total: number; changing: number; alreadyPrivate: number; grants: Record<string, number> }> = {};
  for (const tableId of ['files', 'totals']) {
    const count = counts[tableId] = { total: 0, changing: 0, alreadyPrivate: 0, grants: {} as Record<string, number> };
    let cursor: string | undefined;
    do {
      const result: Models.RowList<Models.Row> = await db.listRows({ databaseId, tableId, queries: [Query.select(['$id', '$updatedAt', '$permissions']), Query.limit(100), Query.orderAsc('$id'), ...(cursor ? [Query.cursorAfter(cursor)] : [])] });
      for (const record of result.rows) {
        count.total++;
        if (record.$permissions.length) count.changing++; else count.alreadyPrivate++;
        for (const grant of record.$permissions) {
          const category = /^(read|update|delete|write)\("user:[^"]+"\)$/.test(grant) ? `${grant.split('(')[0]}:individual-user` : 'other-review-required';
          count.grants[category] = (count.grants[category] ?? 0) + 1;
        }
        snapshot.push({ tableId, rowId: record.$id, updatedAt: record.$updatedAt, permissions: record.$permissions });
      }
      cursor = result.rows.length === 100 ? result.rows.at(-1)!.$id : undefined;
    } while (cursor);
  }
  const capturedAt = new Date().toISOString();
  await mkdir('.private', { recursive: true });
  const path = `.private/access-preview-${capturedAt.replaceAll(':', '-')}.json`;
  execFileSync('git', ['check-ignore', '--quiet', path], { stdio: 'ignore' });
  await writeFile(path, JSON.stringify({ capturedAt, endpoint, project, databaseId, records: snapshot }, null, 2), { flag: 'wx', mode: 0o600 });
  console.log(JSON.stringify({ mode: 'READ_ONLY', capturedAt, project, databaseId, tablesToCreate: tables.filter(table => ['members', 'invitations'].includes(table.tableId)).map(table => ({ ...table, permissions: [], rowSecurity: true })), counts, privateSnapshot: path }, null, 2));
}
main().catch(error => { logFailure('operator', error); process.exitCode = 1; });
