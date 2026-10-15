import './local-environment';
import test from 'node:test';
import assert from 'node:assert/strict';
import { adjustTotals, assertAccess, emptyTotals, filename, identifier, listOptions, MAX_BYTES, recipientChange, type FileRecord } from '../lib/domain';
import { validateUpload } from '../lib/validation';
const file: FileRecord = { $id: 'file1', $createdAt: new Date().toISOString(), name: 'a.txt', searchName: 'a.txt', owner: 'alice', recipients: ['bob'], size: 5, mime: 'text/plain', kind: 'document', status: 'ready', digest: '' };
test('owner manages, recipient reads, outsiders and recipients cannot manage', () => {
  assert.doesNotThrow(() => assertAccess(file, 'alice', true)); assert.doesNotThrow(() => assertAccess(file, 'bob'));
  assert.throws(() => assertAccess(file, 'bob', true)); assert.throws(() => assertAccess(file, 'eve'));
  assert.throws(() => assertAccess({ ...file, status: 'deleting' }, 'bob'));
  assert.throws(() => assertAccess({ ...file, recipients: [] }, 'bob'));
});
test('sharing is bounded, duplicate-safe and revocable', () => {
  assert.deepEqual(recipientChange(file, 'bob', false), ['bob']); assert.deepEqual(recipientChange(file, 'bob', true), []);
  assert.throws(() => recipientChange(file, 'alice', false));
  assert.throws(() => recipientChange({ ...file, recipients: Array.from({ length: 20 }, (_, i) => `user${i}`) }, 'new', false));
});
test('totals are per type and reversible without negative drift', () => {
  const totals = adjustTotals(emptyTotals(), file, 1); assert.equal(totals.documentBytes, 5); assert.equal(totals.documentCount, 1); assert.equal(totals.imageCount, 0);
  assert.deepEqual(adjustTotals(totals, file, -1), emptyTotals()); assert.throws(() => adjustTotals(emptyTotals(), file, -1));
});
test('upload detects encoding, contents, extension, empty and oversized bytes', () => {
  assert.equal(validateUpload('notes.txt', Buffer.from('Hello')).size, 5);
  assert.equal(validateUpload('table.csv', Buffer.from('a,b\n1,2')).kind, 'document');
  for (const [name, data] of [['evil.svg', '<svg/>'], ['evil.html', '<html/>'], ['fake.png', 'not png'], ['fake.txt', '<script>alert(1)</script>'], ['run.exe', 'MZ'], ['archive.zip', 'PK']] as const) assert.throws(() => validateUpload(name, Buffer.from(data)));
  assert.throws(() => validateUpload('bad.txt', Buffer.from([0xff, 0xfe]))); assert.throws(() => validateUpload('bad.txt', Buffer.from([0])));
  assert.throws(() => validateUpload('empty.txt', Buffer.alloc(0))); assert.throws(() => validateUpload('large.txt', Buffer.alloc(MAX_BYTES + 1, 65)));
  assert.equal(validateUpload('limit.txt', Buffer.alloc(MAX_BYTES, 65)).size, MAX_BYTES);
});
test('filenames and IDs reject traversal, controls, bidi and hidden extensions', () => {
  for (const value of ['../a.txt', 'a/b.txt', 'a\\b.txt', 'a\n.txt', 'a\u202e.txt', '.hidden', ' a.txt']) assert.throws(() => filename(value));
  for (const value of ['../x', '', 'x'.repeat(37), '<svg>']) assert.throws(() => identifier(value));
});
test('search, sort and cursors are bounded and normalized', () => {
  assert.deepEqual(listOptions(new URLSearchParams('view=shared&sort=name&q=Hello&cursor=abc&kind=image')), { view: 'shared', sort: 'name', search: 'hello', cursor: 'abc', kind: 'image' });
  for (const value of ['sort=owner', 'kind=html', 'view=everyone', 'cursor=../x', `q=${'x'.repeat(101)}`]) assert.throws(() => listOptions(new URLSearchParams(value)));
});
