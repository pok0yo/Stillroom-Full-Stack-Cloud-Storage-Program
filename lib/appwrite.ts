import { coordinatedClient } from './maintenance';
import 'server-only';
import { Account, Client, Storage, TablesDB, Users } from 'node-appwrite';
import { cookies } from 'next/headers';
import { Problem } from './domain';
import { enroll } from './membership';
export function settings() {
  const { APP_ORIGIN: origin, APPWRITE_ENDPOINT: endpoint, APPWRITE_PROJECT_ID: project, APPWRITE_API_KEY: key, APPWRITE_DATABASE_ID: databaseId, APPWRITE_BUCKET_ID: bucketId, RATE_LIMIT_SECRET: rateSecret } = process.env;
  if (!origin || !endpoint || !project || !key || !databaseId || !bucketId || !rateSecret || rateSecret.length < 32) throw new Problem(503, 'Stillroom is not configured yet. Follow the setup guide.');
  if (new URL(endpoint).protocol !== 'https:' || (process.env.NODE_ENV === 'production' && new URL(origin).protocol !== 'https:')) throw new Problem(503, 'Secure service URLs are required.');
  return { origin: new URL(origin).origin, endpoint, project, key, databaseId, bucketId, rateSecret };
}
export function configured() { try { settings(); return true; } catch { return false; } }
export function client() { const c = settings(); return coordinatedClient(new Client().setEndpoint(c.endpoint).setProject(c.project)); }
export function admin() {
  const c = client().setKey(settings().key);
  return { db: new TablesDB(c), storage: new Storage(c), users: new Users(c), account: new Account(c) };
}
export const cookieName = 'stillroom_session';
export async function session(verified = true) {
  const secret = (await cookies()).get(cookieName)?.value;
  if (!secret || secret.length > 4096 || /[\s\x00-\x1f]/.test(secret)) throw new Problem(401, 'Please sign in.');
  const c = client().setSession(secret);
  const account = new Account(c);
  let user;
  try { user = await account.get(); } catch (error) {
    if ((error as { code?: number }).code === 401) throw new Problem(401, 'Your session has expired. Please sign in.');
    throw error;
  }
  if (verified && !user.emailVerification) throw new Problem(403, 'Verify your email before using your files.');
  if (verified) await enroll(user);
  return { account, user, db: new TablesDB(c) };
}
export function row(tableId: string, rowId: string) { return { databaseId: settings().databaseId, tableId, rowId }; }
