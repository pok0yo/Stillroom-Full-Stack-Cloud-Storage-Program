import { session } from '../../../lib/appwrite';
import { boundedBody, handle, json, protect, rateLimit } from '../../../lib/http';
import { MAX_BYTES, Problem } from '../../../lib/domain';
import { listFiles, upload } from '../../../lib/files';
import { fileAccount } from '../../../lib/terms';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  return handle(async () => { const auth = await session(); await rateLimit(`read:${auth.user.$id}`, 120); return json(await listFiles(auth, new URL(request.url).searchParams)); });
}
export async function POST(request: Request) {
  return handle(async () => {
    protect(request);
    const auth = await session();
    await fileAccount(auth.user.$id);
    await rateLimit(`upload:${auth.user.$id}`, 15);
    let name;
    try { name = decodeURIComponent(request.headers.get('x-file-name') ?? ''); } catch { throw new Problem(400, 'Invalid filename.'); }
    return json(await upload(auth, name, await boundedBody(request, MAX_BYTES)), 201);
  });
}
