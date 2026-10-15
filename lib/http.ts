import { coordinated, operation } from './maintenance';
import 'server-only';
import { createHmac } from 'node:crypto';
import { AppwriteException } from 'node-appwrite';
import { NextResponse } from 'next/server';
import { admin, row, settings } from './appwrite';
import { logFailure } from './logging';
import { Problem } from './domain';
export function protect(request: Request) {
  if (request.headers.get('origin') !== settings().origin || request.headers.get('sec-fetch-site') === 'cross-site') throw new Problem(403, 'This request must come from Stillroom.');
}
export async function body(request: Request, max = 4096) {
  const bytes = await boundedBody(request, max);
  try {
    const data: unknown = JSON.parse(bytes.toString('utf8'));
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error();
    return data as Record<string, unknown>;
  } catch { throw new Problem(400, 'Invalid request body.'); }
}
export async function boundedBody(request: Request, max: number) {
  const declared = request.headers.get('content-length');
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > max)) throw new Problem(413, 'Request is too large.');
  if (!request.body) throw new Problem(400, 'Request body is required.');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > max) { await reader.cancel(); throw new Problem(413, 'Request is too large.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks, size);
}
async function rateLimitInternal(subject: string, limit: number, seconds = 60) {
  const { db } = admin();
  const bucket = Math.floor(Date.now() / (seconds * 1000));
  const id = createHmac('sha256', settings().rateSecret).update(`${subject}:${bucket}`).digest('hex').slice(0, 36);
  const ref = row('limits', id);
  try { await db.createRow({ ...ref, data: { count: 1, expires: (bucket + 1) * seconds }, permissions: [] }); }
  catch (error) {
    if (!(error instanceof AppwriteException) || error.code !== 409) throw error;
    try { await db.incrementRowColumn({ ...ref, column: 'count', value: 1, max: limit }); }
    catch (incrementError) {
      if (incrementError instanceof AppwriteException && [400, 409].includes(incrementError.code)) throw new Problem(429, 'Too many requests. Wait a minute and try again.');
      throw incrementError;
    }
  }
}
export const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: { 'Cache-Control': 'private, no-store' } });
export async function handle(work: () => Promise<Response>): Promise<Response> {
  try { return await operation(work); } catch (error) {
    if (error instanceof Problem) return json({ error: error.message }, error.status);
    if (error instanceof AppwriteException) {
      if ([401, 403, 404].includes(error.code)) return json({ error: error.code === 404 ? 'File or resource not found.' : 'Access denied. Sign in and verify your email.' }, error.code);
      if (error.code === 409) return json({ error: 'The record changed. Refresh and try again.' }, 409);
      if (error.code === 429) return json({ error: 'Too many requests. Try again shortly.' }, 429);

    }
    logFailure('request', error);
    return json({ error: 'The operation could not be confirmed. Refresh before retrying. Unfinished files remain recoverable in My Files.' }, 503);
  }
}

export const rateLimit = coordinated(rateLimitInternal);
