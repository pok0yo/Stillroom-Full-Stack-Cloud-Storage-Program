import { coordinated } from './maintenance';
import 'server-only';
import { createHash } from 'node:crypto';
import { AppwriteException, type Models } from 'node-appwrite';
import { admin, row } from './appwrite';
import { emailAddress, Problem } from './domain';

type Identity = { $id: string; email: string; emailVerification: boolean; status: boolean };
export type Member = Models.Row & { email: string; state: string };
type Invitation = Models.Row & { email: string; state: string; accountId: string };
export const invitationId = (email: string) => createHash('sha256').update(emailAddress(email)).digest('hex').slice(0, 36);
const denied = () => new Problem(403, 'An active invitation for your verified email is required. Contact the operator.');
export async function invitation(email: string) {
  const normalized = emailAddress(email);
  try {
    const invite = await admin().db.getRow<Invitation>(row('invitations', invitationId(normalized)));
    if (invite.email !== normalized || invite.state !== 'invited') throw denied();
    return invite;
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 404) throw denied();
    throw error;
  }
}
export async function activeMember(user: Identity) {
  if (!user.status || !user.emailVerification) throw denied();
  try {
    const member = await admin().db.getRow<Member>(row('members', user.$id));
    if (member.state !== 'active' || member.email !== emailAddress(user.email)) throw denied();
    return member;
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 404) throw denied();
    throw error;
  }
}
// Only the verified account itself can consume an invitation. Never called by sharing.
async function enrollInternal(user: Identity) {
  if (!user.status || !user.emailVerification) throw denied();
  const { db } = admin();
  try { await db.getRow(row('members', user.$id)); return activeMember(user); }
  catch (error) { if (!(error instanceof AppwriteException) || error.code !== 404) throw error; }
  const { $id: transactionId } = await db.createTransaction({ ttl: 60 });
  try {
    const email = emailAddress(user.email);
    const ref = row('invitations', invitationId(email));
    const invite = await db.getRow<Invitation>({ ...ref, transactionId });
    if (invite.email !== email || invite.state !== 'invited' || invite.accountId !== '') throw denied();
    await db.updateRow({ ...ref, transactionId, data: { state: 'bound', accountId: user.$id }, permissions: [] });
    await db.createRow({ ...row('members', user.$id), transactionId, data: { email, state: 'active' }, permissions: [] });
    await db.updateTransaction({ transactionId, commit: true });
  } catch (error) {
    try { await db.updateTransaction({ transactionId, rollback: true }); } catch { /* Fail closed; a retry rereads the committed binding. */ }
    if (error instanceof AppwriteException && error.code === 404) throw denied();
    throw error;
  }
  return activeMember(user);
}
export async function eligibleAccount(id: string) {
  const user = await admin().users.get({ userId: id });
  await activeMember(user);
  return user;
}

export const enroll = coordinated(enrollInternal);
