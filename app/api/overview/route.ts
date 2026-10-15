import { session } from '../../../lib/appwrite';
import { dashboard } from '../../../lib/files';
import { handle, json, rateLimit } from '../../../lib/http';
export async function GET() { return handle(async () => { const auth = await session(); await rateLimit(`read:${auth.user.$id}`, 120); return json(await dashboard(auth)); }); }
