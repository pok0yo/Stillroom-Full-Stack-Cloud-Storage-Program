import { createHash } from 'node:crypto';
import { admin, session, settings } from '../../../../../lib/appwrite';
import { accessible } from '../../../../../lib/files';
import { handle, rateLimit } from '../../../../../lib/http';
import { Problem } from '../../../../../lib/domain';
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const auth = await session();
    await rateLimit(`content:${auth.user.$id}`, 60);
    const file = await accessible((await context.params).id, auth);
    if (file.status !== 'ready') throw new Problem(409, 'This file is not ready.');
    const payload = await admin().storage.getFileDownload({ bucketId: settings().bucketId, fileId: file.$id });
    const buffer = Buffer.from(payload);
    if (buffer.length !== file.size || createHash('sha256').update(buffer).digest('hex') !== file.digest) throw new Problem(503, 'File integrity check failed. Contact the operator.');
    // Recheck after fetching bytes so a revocation during the fetch takes effect.
    const current = await accessible(file.$id, auth);
    if (current.status !== 'ready') throw new Problem(409, 'File is no longer available.');
    const preview = new URL(request.url).searchParams.get('preview') === '1' && file.mime !== 'application/pdf';
    const mime = file.mime.startsWith('text/') ? 'text/plain; charset=utf-8' : file.mime;
    const headers = new Headers({ 'Content-Type': mime, 'Cache-Control': 'private, no-store, max-age=0', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox", 'Content-Disposition': `${preview ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(file.name).replace(/['()*]/g, c => `%${c.charCodeAt(0).toString(16)}`)}`, 'Accept-Ranges': 'bytes' });
    const range = request.headers.get('range');
    if (range) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(range);
      const start = match ? Number(match[1]) : -1;
      const end = match?.[2] ? Number(match[2]) : buffer.length - 1;
      if (start < 0 || start > end || end >= buffer.length) return new Response(null, { status: 416, headers: { ...Object.fromEntries(headers), 'Content-Range': `bytes */${buffer.length}` } });
      headers.set('Content-Range', `bytes ${start}-${end}/${buffer.length}`);
      headers.set('Content-Length', String(end - start + 1));
      return new Response(new Uint8Array(buffer.subarray(start, end + 1)), { status: 206, headers });
    }
    headers.set('Content-Length', String(buffer.length));
    return new Response(new Uint8Array(buffer), { headers });
  });
}
