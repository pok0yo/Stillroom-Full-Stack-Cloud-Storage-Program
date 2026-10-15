import { emptyTotals } from '../lib/domain';
const text = (key: string, size: number, array = false) => ({ key, type: 'varchar', size, required: true, array });
const integer = (key: string) => ({ key, type: 'integer', required: true, min: 0 });
export const tables = [
  { tableId: 'invitations', columns: [text('email', 320), text('state', 16), text('accountId', 36)], indexes: [] },
  { tableId: 'members', columns: [text('email', 320), text('state', 16)], indexes: [] },
  { tableId: 'files', columns: [text('owner', 36), text('name', 180), text('searchName', 180), integer('size'), text('mime', 100), text('kind', 16), text('recipients', 36, true), text('status', 16), text('digest', 64)], indexes: ['owner', 'searchName', 'size', 'kind', 'status'].map(key => ({ key: `idx_${key}`, type: 'key', attributes: [key] })) },
  { tableId: 'totals', columns: Object.keys(emptyTotals()).map(integer), indexes: [] },
  { tableId: 'limits', columns: [integer('count'), integer('expires')], indexes: [{ key: 'expiry', type: 'key', attributes: ['expires'] }] },
];
