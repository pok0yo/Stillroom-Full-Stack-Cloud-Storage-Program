import { session } from '../../../../lib/appwrite';
import { body, handle, json, protect, rateLimit } from '../../../../lib/http';
import { cancelExitRequest, issueExitRequest } from '../../../../lib/exit-request';
import { identifier, Problem } from '../../../../lib/domain';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  return handle(async () => {
    protect(request);
    const auth = await session();
    const data = await body(request);
    await rateLimit(`exit:${auth.user.$id}`, 5);
    if (data.action === 'cancel' && Object.keys(data).every(key => ['action', 'caseId'].includes(key))) return json(await cancelExitRequest(auth, identifier(data.caseId)));
    if (data.action !== 'request' || data.confirm !== true || Object.keys(data).some(key => !['action', 'confirm'].includes(key))) throw new Problem(400, 'Confirm the account-exit scope.');
    return json(await issueExitRequest(auth));
  });
}
