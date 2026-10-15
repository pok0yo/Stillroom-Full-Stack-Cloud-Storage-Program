import { testRoot } from './local-environment';
import test from 'node:test';
import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, symlink, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { AppwriteException, Client } from 'node-appwrite';
import { beginMaintenance, coordinatedClient, endMaintenance, maintenance, maintenanceStatus, operation, privateRead, privateSave, providerWrite } from '../lib/maintenance';
import { handle, rateLimit } from '../lib/http';
import { enroll } from '../lib/membership';
import { suspend } from '../lib/suspension';

Object.assign(process.env, { APP_ORIGIN: 'http://localhost:3000', APPWRITE_ENDPOINT: 'https://example.invalid/v1', APPWRITE_PROJECT_ID: 'test', APPWRITE_API_KEY: 'synthetic', APPWRITE_DATABASE_ID: 'test', APPWRITE_BUCKET_ID: 'test', RATE_LIMIT_SECRET: 'synthetic-coordination-secret-at-least-32-characters' });
const isolate = () => { process.env.STILLROOM_PRIVATE_ROOT = path.join(testRoot, randomUUID()); };
test('separate upload/share workers drain before inventory; all new service and GET writes reject', async () => {
  for (const phase of ['upload', 'share']) {
    isolate();
    const child = fork(path.resolve('tests/maintenance-worker.ts'), [phase], { execArgv: ['--conditions=react-server', '--import', 'tsx'], stdio: ['ignore', 'ignore', 'ignore', 'ipc'] });
    try {
      assert.equal((await once(child, 'message'))[0], 'paused');
      const exited = once(child, 'exit');
      let drained = false;
      const closing = beginMaintenance().then(epoch => { drained = true; return epoch; });
      while (!(await maintenanceStatus()).closing) await new Promise(resolve => setTimeout(resolve, 10));
      assert.equal(drained, false);
      await assert.rejects(operation(async () => assert.fail('new write admitted')));
      await assert.rejects(rateLimit('synthetic', 1));
      await assert.rejects(enroll({ $id: 'alice', email: 'a@example.test', status: true, emailVerification: true }));
      await assert.rejects(suspend('alice'));
      assert.equal((await handle(async () => { assert.fail('GET limiter/enrollment ran'); })).status, 503);
      child.send('resume'); await exited;
      const epoch = await closing;
      await maintenance(epoch, async () => assert.equal(drained, true));
      await endMaintenance(epoch);
      assert.equal(await operation(async () => 'recovered'), 'recovered');
    } finally { child.kill(); }
  }
});
test('transport blocks uncoordinated SDK writes; known errors release and unknown outcomes remain dirty', async () => {
  isolate();
  const client = coordinatedClient(new Client());
  await assert.rejects(client.call('post', new URL('https://example.invalid/v1/rows')), { status: 503 });
  await assert.rejects(operation(() => providerWrite(async () => { throw new AppwriteException('synthetic', 409); })));
  assert.equal((await maintenanceStatus()).dirty, false);
  await operation(async () => { try { await providerWrite(async () => { throw new Error('SYNTHETIC_TOKEN'); }); } catch { /* Application swallowed it. */ } });
  assert.equal((await maintenanceStatus()).dirty, true);
  assert.equal((await maintenanceStatus()).locked, false);
  await assert.rejects(operation(async () => assert.fail('unknown outcome admitted')));
  const dirty = path.join(process.env.STILLROOM_PRIVATE_ROOT!, 'coordination', 'dirty.json');
  assert.ok(!(await readFile(dirty, 'utf8')).includes('SYNTHETIC_TOKEN'));
  // Mock has no external work; this models explicit reconciliation, never automatic TTL recovery.
  await unlink(dirty);
  assert.equal(await operation(async () => true), true);
});
test('crashed worker leaves durable lock/in-flight evidence; host/mode mismatches fail closed', async () => {
  isolate();
  const child = fork(path.resolve('tests/maintenance-worker.ts'), ['crash'], { execArgv: ['--conditions=react-server', '--import', 'tsx'], stdio: ['ignore', 'ignore', 'ignore', 'ipc'] });
  await once(child, 'message'); const exited = once(child, 'exit'); child.kill(); await exited;
  const state = await maintenanceStatus(); assert.equal(state.dirty, true); assert.equal(state.locked, true);
  const dir = path.join(process.env.STILLROOM_PRIVATE_ROOT!, 'coordination');
  await writeFile(path.join(dir, 'closing.json'), JSON.stringify({ epoch: 'synthetic-crash' }));
  await assert.rejects(operation(async () => {}));
  isolate(); process.env.STILLROOM_COORDINATION_MODE = 'multi-host'; await assert.rejects(operation(async () => {})); process.env.STILLROOM_COORDINATION_MODE = 'single-host';
  await maintenanceStatus();
  await writeFile(path.join(process.env.STILLROOM_PRIVATE_ROOT!, 'coordination', 'host.json'), JSON.stringify({ host: 'another-host' }));
  await assert.rejects(operation(async () => {}));
});
test('private paths reject traversal and redirected directories; cleanup never runs implicitly', async () => {
  isolate(); await maintenanceStatus();
  const root = process.env.STILLROOM_PRIVATE_ROOT!;
  await assert.rejects(privateSave(path.resolve(root, '..', 'outside.json'), {}));
  const target = path.join(root, 'target'); await mkdir(target);
  await symlink(target, path.join(root, 'redirect'), 'junction');
  await assert.rejects(privateSave(path.join(root, 'redirect', 'secret.json'), {}));
  const kept = path.join(target, 'held.json'); await privateSave(kept, { held: true });
  const epoch = await beginMaintenance(); await endMaintenance(epoch);
  assert.deepEqual(await privateRead(kept), { held: true });
});
