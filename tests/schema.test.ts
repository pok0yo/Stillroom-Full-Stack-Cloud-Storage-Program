import './local-environment';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tables } from '../scripts/schema';

test('inline indexes reference scalar columns using the provider attributes contract', () => {
  for (const table of tables) {
    for (const index of table.indexes) {
      assert.ok(index.attributes.length > 0);
      for (const key of index.attributes) {
        const column = table.columns.find(column => column.key === key);
        assert.ok(column, `${table.tableId}.${key} exists`);
        assert.ok(!('array' in column) || !column.array, 'Cloud rejects array indexes');
      }
    }
  }
});
