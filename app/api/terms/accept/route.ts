import { session } from '../../../../lib/appwrite';
import { body, handle, json, protect, rateLimit } from '../../../../lib/http';
import { acceptTerms, publishedNotices } from '../../../../lib/terms';
import { Problem } from '../../../../lib/domain';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  return handle(async () => {
    protect(request);
    if (!publishedNotices()) throw new Problem(409, 'Terms agreement is not active. No agreement was recorded.');
    const auth = await session();
    await rateLimit(`terms:${auth.user.$id}`, 10);
    return json(await acceptTerms(auth.user.$id, await body(request)));
  });
}
