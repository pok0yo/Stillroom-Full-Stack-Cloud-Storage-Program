import { Query } from 'node-appwrite';
import { admin, session } from '../../../../lib/appwrite';
import { accessible, mutate, remove } from '../../../../lib/files';
import { body, handle, json, protect, rateLimit } from '../../../../lib/http';
import { emailAddress, identifier, Problem } from '../../../../lib/domain';
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  return handle(async () => {
    const auth = await session(); await rateLimit(`read:${auth.user.$id}`, 120);
    const file = await accessible((await context.params).id, auth);
    const recipients = file.owner === auth.user.$id ? await Promise.all(file.recipients.map(async id => {
      try { const user = await admin().users.get({ userId: id }); return { id, email: user.email }; }
      catch { return { id, email: 'Unavailable account' }; }
    })) : [];
    return json({ file, recipients });
  });
}
export async function PATCH(request: Request, context: Context) {
  return handle(async () => {
    protect(request);
    const auth = await session(); await rateLimit(`write:${auth.user.$id}`, 40);
    const id = identifier((await context.params).id);
    await accessible(id, auth, true);
    const input = await body(request);
    if (input.action === 'share') {
      await rateLimit(`share:${auth.user.$id}`, 10);
      const email = emailAddress(input.email);
      const matches = await admin().users.list({ queries: [Query.equal('email', email), Query.limit(1)] });
      const recipient = matches.users[0];
      if (!recipient || recipient.email.toLowerCase() !== email || !recipient.status || !recipient.emailVerification) throw new Problem(400, 'Cannot share with this address. The recipient must have an active invitation and verified email.');
      input.recipient = recipient.$id;
    }
    return json(await mutate(auth, id, input));
  });
}
export async function DELETE(request: Request, context: Context) {
  return handle(async () => { protect(request); const auth = await session(); await rateLimit(`write:${auth.user.$id}`, 40); return json(await remove(auth, identifier((await context.params).id))); });
}
