import { recordPasswordAuthentication } from '../../../../lib/exit-request';
import { AppwriteException, ID } from 'node-appwrite';
import { cookies } from 'next/headers';
import { admin, cookieName, session, settings } from '../../../../lib/appwrite';
import { body, handle, json, protect, rateLimit } from '../../../../lib/http';
import { emailAddress, identifier, Problem } from '../../../../lib/domain';
import { invitation, enroll } from '../../../../lib/membership';
export const runtime = 'nodejs';
export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  const result = await handle(async () => {
    protect(request);
    const { action } = await context.params;
    if (!['signup', 'signin', 'signout', 'send-verification', 'verify'].includes(action)) throw new Problem(404, 'Unknown action.');
    if (action === 'signout') {
      try { const auth = await session(false); await auth.account.deleteSession({ sessionId: 'current' }); }
      catch { /* Local sign-out must work even when the provider rejects the session. */ }
      finally { (await cookies()).delete(cookieName); }
      return json({ ok: true });
    }
    await rateLimit('auth:global', 120);
    const data = await body(request);
    if (action === 'signup' || action === 'signin') {
      const email = emailAddress(data.email);
      await rateLimit(`auth:${email}`, 10);
      if (typeof data.password !== 'string' || data.password.length < 8 || data.password.length > 256) throw new Problem(400, 'Use a password of 8–256 characters.');
      const account = admin().account;
      if (action === 'signup') {
        await invitation(email);
        if (typeof data.name !== 'string' || !data.name.trim() || data.name.length > 80) throw new Problem(400, 'Enter a name of 1–80 characters.');
        try { await account.create({ userId: ID.unique(), email, password: data.password, name: data.name.trim() }); }
        catch (error) {
          if (error instanceof AppwriteException && [400, 409].includes(error.code)) throw new Problem(400, 'Unable to create this account. Try signing in or use a different email and strong password.');
          throw error;
        }
      }
      let result;
      try { result = await account.createEmailPasswordSession({ email, password: data.password }); }
      catch (error) {
        if (error instanceof AppwriteException && [400, 401].includes(error.code)) throw new Problem(401, 'Email or password is incorrect.');
        throw error;
      }
      await recordPasswordAuthentication(result);
      if (!result.secret) throw new Problem(503, 'Session creation is not configured correctly.');
      (await cookies()).set(cookieName, result.secret, { httpOnly: true, secure: settings().origin.startsWith('https:'), sameSite: 'strict', path: '/', expires: new Date(result.expire) });
      return json({ ok: true });
    }
    const auth = await session(false);
    await rateLimit(`auth-user:${auth.user.$id}`, 10);
    await invitation(auth.user.email);
    if (action === 'send-verification') {
      await rateLimit(`verification:${auth.user.$id}`, 3, 3600);
      await auth.account.createVerification({ url: `${settings().origin}/verify` });
    } else {
      const userId = identifier(data.userId);
      if (userId !== auth.user.$id || typeof data.secret !== 'string' || data.secret.length < 1 || data.secret.length > 512) throw new Problem(400, 'Sign in to the account this verification link belongs to.');
      await auth.account.updateVerification({ userId, secret: data.secret });
      await enroll(await auth.account.get());
    }
    return json({ ok: true });
  });
  if ((await context.params).action === 'signout') {
    try { protect(request); (await cookies()).delete(cookieName); return json({ ok: true }); } catch { return result; }
  }
  return result;
}
