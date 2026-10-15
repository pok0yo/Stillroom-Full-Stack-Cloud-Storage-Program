import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import { lstat, mkdir, open, readFile, realpath, rename, unlink, writeFile } from 'node:fs/promises';
import { hostname } from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { AppwriteException, type Client } from 'node-appwrite';
import { Problem } from './domain';

type Scope = { active: boolean; epoch?: string; directory: string };
const scope = new AsyncLocalStorage<Scope>();
const unavailable = () => new Problem(503, 'Stillroom is busy or undergoing maintenance. Try again later.');
export async function privateRoot() {
  if (process.env.STILLROOM_COORDINATION_MODE && process.env.STILLROOM_COORDINATION_MODE !== 'single-host') throw unavailable();
  if (process.env.NODE_ENV === 'production' && process.env.STILLROOM_COORDINATION_MODE !== 'single-host') throw unavailable();
  const root = path.resolve(process.cwd(), '.private');
  const directory = path.resolve(/* turbopackIgnore: true */ process.env.STILLROOM_PRIVATE_ROOT || root);
  // shortcut: one persistent local filesystem on one host; distributed hosting needs a different coordinator.
  if (directory !== root && !directory.startsWith(root + path.sep)) throw unavailable();
  await mkdir(directory, { recursive: true });
  if (await realpath(/* turbopackIgnore: true */ directory) !== directory || await realpath(/* turbopackIgnore: true */ root) !== root) throw unavailable();
  return directory;
}
export async function privateRead<T>(file: string): Promise<T | null> {
  try { await assertPrivateFile(file); return JSON.parse(await readFile(file, 'utf8')) as T; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null; throw error; }
}
export async function privateSave(file: string, value: unknown) {
  await assertPrivateFile(file);
  const temporary = `${file}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(value), { mode: 0o600, flag: 'wx' });
  await rename(temporary, file);
}
async function assertPrivateFile(file: string) {
  const root = await privateRoot();
  if (!path.resolve(file).startsWith(root + path.sep) || await realpath(path.dirname(file)) !== path.dirname(file)) throw unavailable();
  try { if ((await lstat(file)).isSymbolicLink()) throw unavailable(); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
}
async function directory() {
  const dir = path.join(await privateRoot(), 'coordination');
  await mkdir(dir, { recursive: true });
  if (await realpath(dir) !== dir) throw unavailable();
  const host = path.join(dir, 'host.json');
  try { await writeFile(host, JSON.stringify({ host: hostname() }), { flag: 'wx', mode: 0o600 }); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error; }
  if ((await privateRead<{ host: string }>(host))?.host !== hostname()) throw unavailable();
  return dir;
}
export async function maintenanceStatus() {
  const dir = await directory();
  return { closing: await privateRead<{ epoch: string }>(path.join(dir, 'closing.json')), dirty: Boolean(await privateRead(path.join(dir, 'dirty.json'))), locked: Boolean(await privateRead(path.join(dir, 'operation.json'))) };
}
async function locked<T>(epoch: string | undefined, work: () => Promise<T>) {
  const existing = scope.getStore();
  if (existing) { if (!existing.active || (epoch && existing.epoch !== epoch)) throw unavailable(); return work(); }
  const dir = await directory();
  const allowed = async () => {
    const closing = await privateRead<{ epoch: string }>(path.join(dir, 'closing.json'));
    if ((epoch ? closing?.epoch !== epoch : closing !== null)) throw unavailable();
  };
  const lockPath = path.join(dir, 'operation.json');
  const deadline = Date.now() + 30000;
  let lock;
  while (!lock) {
    await allowed();
    try { lock = await open(lockPath, 'wx', 0o600); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST' || Date.now() >= deadline) throw unavailable(); await delay(25); }
  }
  const state: Scope = { active: true, epoch, directory: dir };
  try {
    await lock.writeFile(JSON.stringify({ pid: process.pid, host: hostname(), started: new Date().toISOString() }));
    await allowed();
    if (await privateRead(path.join(dir, 'dirty.json'))) throw unavailable();
    return await scope.run(state, work);
  } finally { state.active = false; await lock.close(); await unlink(lockPath); }
}
export function operation<T>(work: () => Promise<T>) { return locked(undefined, work); }
export function coordinated<A extends unknown[], R>(work: (...args: A) => Promise<R>) { return (...args: A) => operation(() => work(...args)); }
export async function beginMaintenance() {
  const dir = await directory();
  const epoch = randomUUID();
  await writeFile(path.join(dir, 'closing.json'), JSON.stringify({ epoch }), { flag: 'wx', mode: 0o600 });
  // Closing survives timeout/crash. A later invocation can finish the drain.
  await locked(epoch, async () => {});
  return epoch;
}
export function maintenance<T>(epoch: string, work: () => Promise<T>) { return locked(epoch, work); }
export function maintenanceEpoch() {
  const state = scope.getStore();
  if (!state?.active || !state.epoch) throw unavailable();
  return state.epoch;
}
export async function endMaintenance(epoch: string) {
  await maintenance(epoch, async () => { await unlink(path.join(scope.getStore()!.directory, 'closing.json')); });
}
export async function providerWrite<T>(work: () => Promise<T>) {
  const state = scope.getStore();
  if (!state?.active) throw unavailable();
  const dirty = path.join(state.directory, 'dirty.json');
  // Persist before dispatch. Unknown outcomes stay blocked even if a service catches the exception.
  await writeFile(dirty, JSON.stringify({ pid: process.pid, started: new Date().toISOString() }), { flag: 'wx', mode: 0o600 });
  try { const result = await work(); await unlink(dirty); return result; }
  catch (error) {
    if (error instanceof AppwriteException && [400, 401, 403, 404, 409, 413, 429].includes(error.code)) await unlink(dirty);
    throw error;
  }
}
export function coordinatedClient<T extends Client>(client: T): T {
  const call = client.call.bind(client);
  client.call = (...args: Parameters<Client['call']>) => args[0].toLowerCase() === 'get' ? call(...args) : providerWrite(() => call(...args));
  return client;
}
