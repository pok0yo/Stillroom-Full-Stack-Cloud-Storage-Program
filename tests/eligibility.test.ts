import { testRoot } from './local-environment';
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { privateSave } from '../lib/maintenance';
import { invitationId } from '../lib/membership';
import { requireEligibilityApproval } from '../lib/eligibility';

test('invitation eligibility requires affirmative adult/Georgia approval for the exact invitee', async () => {
  process.env.STILLROOM_PRIVATE_ROOT = path.join(testRoot, randomUUID());
  const email = 'synthetic@example.test', id = invitationId(email);
  const file = path.join(process.env.STILLROOM_PRIVATE_ROOT, 'eligibility', `${id}.json`);
  const approved = { invitationId: id, adult18: true, residentGeorgia: true, decision: 'approved', decidedAt: new Date().toISOString(), reason: 'direct-attestation', reviewOutcome: 'approved' };
  await assert.rejects(requireEligibilityApproval(email));
  await mkdir(path.dirname(file), { recursive: true });
  for (const patch of [{ adult18: false }, { adult18: null }, { residentGeorgia: false }, { residentGeorgia: null }, { decision: 'review' }, { reviewOutcome: 'pending' }, { invitationId: 'another' }, { decidedAt: 'invalid' }, { decidedAt: '2999-01-01' }, { reason: 'assumed' }, { birthDate: 'not-collected' }]) {
    await privateSave(file, { ...approved, ...patch }); await assert.rejects(requireEligibilityApproval(email));
  }
  await privateSave(file, approved); await requireEligibilityApproval(email);
  await requireEligibilityApproval('SYNTHETIC@example.test');
  await assert.rejects(requireEligibilityApproval('other@example.test'));
  await privateSave(file, { ...approved, reason: 'review-resolved' }); await requireEligibilityApproval(email);
});
