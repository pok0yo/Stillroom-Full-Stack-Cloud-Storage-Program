export const MAX_BYTES = 20 * 1024 * 1024;
export const PAGE_SIZE = 25;
export const KINDS = ['document', 'image', 'audio', 'video'] as const;
export type Kind = typeof KINDS[number];
export type FileRecord = {
  $id: string; $createdAt: string; owner: string; name: string; searchName: string;
  size: number; mime: string; kind: Kind; recipients: string[];
  status: 'pending' | 'failed' | 'ready' | 'deleting'; digest: string;
};
export type Totals = Record<`${Kind}Bytes` | `${Kind}Count`, number>;
export const emptyTotals = (): Totals => ({ documentBytes: 0, documentCount: 0, imageBytes: 0, imageCount: 0, audioBytes: 0, audioCount: 0, videoBytes: 0, videoCount: 0 });
export class Problem extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function identifier(value: unknown): string {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,35}$/.test(value)) throw new Problem(400, 'Invalid identifier.');
  return value;
}
export function filename(value: unknown): string {
  if (typeof value !== 'string' || value !== value.trim() || value.length < 1 || value.length > 180 || /[\x00-\x1f\x7f/\\<>:"|?*\u202a-\u202e\u2066-\u2069]/u.test(value) || value.startsWith('.') || value.endsWith('.')) throw new Problem(400, 'Use a filename of 1–180 characters without path or control characters.');
  return value.normalize('NFC');
}
export function emailAddress(value: unknown): string {
  if (typeof value !== 'string' || value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new Problem(400, 'Enter a valid email address.');
  return value.trim().toLowerCase();
}
export function assertAccess(file: FileRecord, user: string, ownerOnly = false) {
  if (file.owner !== user && (ownerOnly || file.status !== 'ready' || !file.recipients.includes(user))) throw new Problem(404, 'File not found.');
}
export function recipientChange(file: FileRecord, user: string, remove: boolean): string[] {
  if (user === file.owner) throw new Problem(400, 'You already own this file.');
  const next = remove ? file.recipients.filter(id => id !== user) : [...new Set([...file.recipients, user])];
  if (next.length > 20) throw new Problem(400, 'A file can have at most 20 recipients.');
  return next;
}
export function adjustTotals(totals: Totals, file: Pick<FileRecord, 'kind' | 'size'>, direction: 1 | -1): Totals {
  const next = { ...totals };
  next[`${file.kind}Bytes`] += direction * file.size;
  next[`${file.kind}Count`] += direction;
  if (Object.values(next).some(n => !Number.isSafeInteger(n) || n < 0)) throw new Problem(409, 'Storage totals need reconciliation. Contact the operator.');
  return next;
}
export function listOptions(params: URLSearchParams) {
  const view = params.get('view') ?? 'owned';
  const sort = params.get('sort') ?? 'newest';
  const kind = params.get('kind') ?? '';
  const search = (params.get('q') ?? '').trim().normalize('NFC').toLowerCase();
  if (!['owned', 'shared'].includes(view) || !['newest', 'oldest', 'name', 'size'].includes(sort) || (kind && !KINDS.includes(kind as Kind)) || search.length > 100) throw new Problem(400, 'Invalid search or filter.');
  return { view, sort, kind, search, cursor: params.get('cursor') ? identifier(params.get('cursor')) : undefined };
}
export function bytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KiB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MiB`;
}
