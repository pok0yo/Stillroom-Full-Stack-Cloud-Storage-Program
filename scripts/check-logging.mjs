import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import http from 'node:http';
import path from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';

// Local-only integration check: GET /verify renders without provider calls.
const secret = 'SYNTHETIC-LOG-CANARY-7419';
const search = 'SYNTHETIC-SEARCH-CANARY-8520';
const port = 3107;
// Next regenerates these shared type files even with a separate distDir.
const generated = ['tsconfig.json', 'next-env.d.ts'].map(path => [path, readFileSync(path)]);
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', String(port)], {
  windowsHide: true,
  env: { ...process.env, STILLROOM_LOGGING_CHECK: '1', STILLROOM_PRIVATE_ROOT: path.resolve('.private', 'logging-check-' + process.pid), STILLROOM_COORDINATION_MODE: 'single-host', APP_ORIGIN: `http://127.0.0.1:${port}`, APPWRITE_ENDPOINT: 'https://example.invalid/v1', APPWRITE_PROJECT_ID: 'synthetic', APPWRITE_API_KEY: 'synthetic', APPWRITE_DATABASE_ID: 'synthetic', APPWRITE_BUCKET_ID: 'synthetic', RATE_LIMIT_SECRET: 'synthetic-not-a-real-secret-1234567890', NEXT_TELEMETRY_DISABLED: '1' },
  stdio: ['pipe', 'pipe', 'pipe'],
});
let output = '';
child.stdout.on('data', data => { output += data; });
child.stderr.on('data', data => { output += data; });
let passed = false;
let responseStatus = 0;
async function request(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${port}${path}`, { agent: new http.Agent(), headers: { Authorization: `Bearer ${secret}`, Cookie: `synthetic=${secret}` } }, response => {
      let body = '';
      response.on('data', data => { body += data; });
      response.once('end', () => resolve({ status: response.statusCode, body }));
    });
    req.setTimeout(30000, () => req.destroy(new Error('Timeout')));
    req.once('error', reject);
  });
}
try {
  for (let i = 0; i < 60 && !output.includes('Ready in'); i++) {
    if (child.exitCode !== null) throw new Error('Local server failed to start');
    await delay(500);
  }
  assert.ok(output.includes('Ready in'), 'Local server startup timed out');
  assert.equal((await request('/verify')).status, 200, 'HTTP readiness, not just the early Ready message');
  assert.ok(!output.includes('Another next dev server'), 'Dedicated test server required');
  const verification = await request(`/verify?userId=synthetic&secret=${secret}`);
  responseStatus = verification.status;
  assert.equal(responseStatus, 200);
  assert.ok(verification.body.includes('One last step.'), 'The real verification page rendered');
  const files = await request(`/api/files?q=${search}`);
  assert.equal(files.status, 401, 'Real search route rejects unauthenticated requests before provider access');
  assert.equal(JSON.parse(files.body).error, 'Please sign in.');
  await delay(1000);
  const diskLog = readFileSync('.next-logging-check/dev/logs/next-development.log', 'utf8');
  assert.ok(diskLog.length > 0, 'Read actual framework log output');
  for (const value of [secret, search]) {
    assert.ok(!output.includes(value), 'Synthetic canary entered captured server output');
    assert.ok(!diskLog.includes(value), 'Synthetic canary entered the framework log file');
  }
  passed = true;
} catch (error) {
  console.error('FAIL local logging integration; raw server output intentionally withheld.');
  console.error({ responseStatus, serverExited: child.exitCode !== null, lockBusy: output.includes('lock'), portBusy: output.includes('EADDRINUSE'), canarySeen: output.includes(secret), compiled: output.includes('Compiled'), ready: output.includes('Ready') });
  console.error({ networkFailure: ['ECONNREFUSED', 'ECONNRESET', 'EPERM', 'EACCES'].find(code => code === error.code) ?? 'other' });
  process.exitCode = 1;
} finally {
  if (process.platform === 'win32') {
    const killer = spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
    await new Promise(resolve => killer.once('exit', resolve));
  } else child.kill('SIGTERM');
  for (const [path, contents] of generated) writeFileSync(path, contents);
}
if (passed) console.log('PASS real /verify (200) and /api/files search (401): synthetic tokens, headers and search terms absent from captured stdout/stderr and Next development log file. No provider calls.');
