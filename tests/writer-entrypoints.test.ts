import { testRoot } from './local-environment';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { runInNewContext } from 'node:vm';
import path from 'node:path';
import { beginMaintenance, endMaintenance, maintenanceStatus } from '../lib/maintenance';

for (const name of ['apply-totals.mjs', 'live-access.ts', 'complete-access.ts']) {
  test(`historical ${name} refuses execution without provider or filesystem capabilities`, async t => {
    let source: string;
    try { source = await readFile(path.join('.private', name), 'utf8'); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') { t.skip('Local historical entry point is absent in this checkout'); return; }
      throw error;
    }
    const errors: string[] = [];
    const processStub = { exitCode: 0, argv: ['node', name, '--apply'] };
    runInNewContext(source, { process: processStub, console: { error: (message: string) => errors.push(message) } }, { timeout: 1000, contextCodeGeneration: { strings: false, wasm: false } });
    assert.equal(processStub.exitCode, 1);
    assert.equal(errors.length, 1);
    assert.match(errors[0], /^RETIRED:/);
    assert.match(errors[0], /docs\//);
    assert.match(errors[0], /No provider calls or mutations/);
  });
}

test('supported operator entries reject maintenance before reaching the provider', async () => {
  process.env.STILLROOM_PRIVATE_ROOT = path.join(testRoot, randomUUID());
  process.env.STILLROOM_COORDINATION_MODE = 'single-host';
  const env = { ...process.env, APPWRITE_ENDPOINT: 'https://example.invalid/v1', APPWRITE_PROJECT_ID: 'test', APPWRITE_DATABASE_ID: 'test', APPWRITE_BUCKET_ID: 'test', APPWRITE_API_KEY: 'synthetic', APP_ORIGIN: 'http://localhost:3000', RATE_LIMIT_SECRET: 'synthetic-operator-secret-at-least-32-characters', STILLROOM_LIVE_TESTS: '1', TEST_OWNER_EMAIL: 'synthetic@example.test', TEST_OWNER_PASSWORD: 'synthetic-password' };
  const run = (script: string, ...args: string[]) => {
    const result = spawnSync(process.execPath, ['--conditions=react-server', '--import', 'tsx', '--import', './tests/provider-tripwire.ts', `scripts/${script}.ts`, ...args], { env, encoding: 'utf8', timeout: 15000, windowsHide: true });
    assert.ifError(result.error);
    assert.doesNotMatch(result.stdout + result.stderr, /UNEXPECTED_(PROVIDER|NETWORK)_CALL/);
    return result;
  };
  assert.equal(run('access', 'invite', 'synthetic@example.test').status, 0);
  assert.equal(run('access', 'invite', 'synthetic@example.test', '--apply').status, 1, 'missing eligibility fails before provider calls');
  assert.equal(run('setup').status, 0);
  assert.equal(run('maintenance', 'limits-apply').status, 1);
  assert.equal(run('maintenance', 'limits-close').status, 1);
  assert.equal(run('maintenance', 'limits-preview').status, 1, 'missing private classification prevents provider access');
  const epoch = await beginMaintenance();
  try {
    for (const [script, ...args] of [['access', 'invite', 'synthetic@example.test', '--apply'], ['setup', '--apply'], ['verify-provider']]) {
      const result = run(script, ...args);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /Stillroom failure/);
    }
    assert.equal((await maintenanceStatus()).dirty, false);
  } finally { await endMaintenance(epoch); }
  assert.equal(run('access', 'invite', 'synthetic@example.test').status, 0);
});
