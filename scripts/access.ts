import { operation } from '../lib/maintenance';
import { admin, row } from '../lib/appwrite';
import { emailAddress, identifier } from '../lib/domain';
import { invitationId } from '../lib/membership';
import { suspend } from '../lib/suspension';
import { logFailure } from '../lib/logging';
import { requireEligibilityApproval } from '../lib/eligibility';

async function main() {
  const [action, target, ...flags] = process.argv.slice(2);
  if (!['invite', 'suspend'].includes(action) || !target || flags.some(flag => flag !== '--apply')) throw new Error('Invalid arguments');
  if (action === 'invite') emailAddress(target); else identifier(target);
  if (!flags.includes('--apply')) {
    console.log(action === 'invite' ? 'PREVIEW: create one private email invitation; no existing binding will be replaced.' : 'PREVIEW: deny application access, disable account, revoke sessions, remove recipient references and legacy file read grants. Preserve account and owned files.');
    console.log('No provider calls made. Applying requires approval and --apply. Invitations also require the private eligibility record in docs/ELIGIBILITY.md.');
    return;
  }
  if (action === 'invite') {
    const email = emailAddress(target);
    await requireEligibilityApproval(email);
    await admin().db.createRow({ ...row('invitations', invitationId(email)), data: { email, state: 'invited', accountId: '' }, permissions: [] });
    console.log('Invitation created. No email was sent.');
  } else {
    const report = await suspend(target);
    console.log(JSON.stringify(report));
    if (Object.values(report).some(done => !done)) process.exitCode = 1;
  }
}
operation(main).catch(error => { logFailure('operator', error); process.exitCode = 1; });
