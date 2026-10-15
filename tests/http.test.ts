import './local-environment';
import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { boundedBody, body, protect, rateLimit } from '../lib/http';
import { AppwriteException, TablesDB } from 'node-appwrite';
Object.assign(process.env, { APP_ORIGIN: 'http://localhost:3000', APPWRITE_ENDPOINT: 'https://example.invalid/v1', APPWRITE_PROJECT_ID: 'test', APPWRITE_API_KEY: 'test-only', APPWRITE_DATABASE_ID: 'test', APPWRITE_BUCKET_ID: 'test', RATE_LIMIT_SECRET: 'test-only-secret-not-for-production-1234' });
test('CSRF rejects missing and foreign origin', () => {
  assert.throws(() => protect(new Request('http://localhost:3000')));
  assert.throws(() => protect(new Request('http://localhost:3000', { headers: { origin: 'https://evil.invalid' } })));
  assert.doesNotThrow(() => protect(new Request('http://localhost:3000', { headers: { origin: 'http://localhost:3000' } })));
});
test('streamed body limit is enforced without trusting Content-Length', async () => {
  await assert.rejects(boundedBody(new Request('http://localhost', { method: 'POST', body: '123456' }), 5));
  assert.equal((await boundedBody(new Request('http://localhost', { method: 'POST', body: '12345' }), 5)).length, 5);
  await assert.rejects(body(new Request('http://localhost', { method: 'POST', body: '[]' })));
});
test('persistent rate limiter caps increments across separate requests and fails closed', async () => {
  const counters = new Map<string, number>();
  mock.method(TablesDB.prototype, 'createRow', async (p: { rowId: string }) => { if (counters.has(p.rowId)) throw new AppwriteException('exists', 409); counters.set(p.rowId, 1); return {}; });
  mock.method(TablesDB.prototype, 'incrementRowColumn', async (p: { rowId: string; max: number }) => { const next = counters.get(p.rowId)! + 1; if (next > p.max) throw new AppwriteException('max exceeded', 400); counters.set(p.rowId, next); return {}; });
  try {
    await rateLimit('test-user', 2); await rateLimit('test-user', 2); await assert.rejects(rateLimit('test-user', 2), { status: 429 });
    assert.equal(counters.size, 1); assert.ok([...counters.keys()].every(k => !k.includes('test-user')));
    mock.method(TablesDB.prototype, 'createRow', async () => { throw new AppwriteException('offline', 503); });
    await assert.rejects(rateLimit('another-user', 2), { code: 503 });
  } finally { mock.restoreAll(); }
});
