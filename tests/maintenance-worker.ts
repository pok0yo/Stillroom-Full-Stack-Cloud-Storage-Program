import { mock } from 'node:test';
import { AppwriteException, Storage, TablesDB, Users } from 'node-appwrite';
import { upload, mutate } from '../lib/files';
import { emptyTotals } from '../lib/domain';
import { operation, providerWrite } from '../lib/maintenance';

const phase = process.argv[2];
const pause = () => new Promise<void>(resolve => { process.once('message', () => resolve()); process.send!('paused'); });
const user = { $id: 'alice', email: 'alice@example.test', emailVerification: true, status: true };
let file = { $id: 'synthetic', owner: 'alice', name: 'synthetic.txt', recipients: [] as string[], status: 'ready', size: 1, kind: 'document' };
mock.method(Users.prototype, 'get', async ({ userId }: { userId: string }) => ({ ...user, $id: userId }));
mock.method(TablesDB.prototype, 'getRow', async ({ tableId }: { tableId: string }) => tableId === 'members' ? { email: user.email, state: 'active' } : tableId === 'totals' ? emptyTotals() : file);
mock.method(TablesDB.prototype, 'createRow', async ({ tableId, data }: { tableId: string; data: typeof file }) => { if (tableId === 'totals') throw new AppwriteException('exists', 409); file = { ...file, ...data }; return file; });
mock.method(TablesDB.prototype, 'createTransaction', async () => ({ $id: 'tx' }));
mock.method(TablesDB.prototype, 'updateTransaction', async () => ({}));
mock.method(TablesDB.prototype, 'updateRow', async () => { if (phase === 'share') await pause(); return {}; });
mock.method(Storage.prototype, 'createFile', async () => { await pause(); return {}; });
const auth = { user } as Parameters<typeof upload>[0];
async function main() {
  if (phase === 'crash') await operation(() => providerWrite(pause));
  else if (phase === 'upload') await upload(auth, 'synthetic.txt', Buffer.from('a'));
  else await mutate(auth, 'synthetic', { action: 'share', recipient: 'bob' });
  process.send!('finished'); process.disconnect();
}
main().catch(() => { process.send!('failed'); process.exitCode = 1; process.disconnect(); });
