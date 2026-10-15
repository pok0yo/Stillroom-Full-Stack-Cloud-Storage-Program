import 'server-only';
import path from 'node:path';
import { invitationId } from './membership';
import { privateRead, privateRoot } from './maintenance';

// Operator attestations support admission decisions; they are not age/residence verification.
export async function requireEligibilityApproval(email: string) {
  const id = invitationId(email);
  const record = await privateRead<Record<string, unknown>>(path.join(await privateRoot(), 'eligibility', `${id}.json`));
  const fields = ['invitationId', 'adult18', 'residentGeorgia', 'decision', 'decidedAt', 'reason', 'reviewOutcome'];
  if (!record || Object.keys(record).some(key => !fields.includes(key)) || record.invitationId !== id ||
      record.adult18 !== true || record.residentGeorgia !== true || record.decision !== 'approved' ||
      record.reviewOutcome !== 'approved' || !['direct-attestation', 'review-resolved'].includes(String(record.reason)) ||
      typeof record.decidedAt !== 'string' || !Number.isFinite(Date.parse(record.decidedAt)) || Date.parse(record.decidedAt) > Date.now()) {
    throw new Error('Eligibility approval required. Follow docs/ELIGIBILITY.md; do not infer or backdate an attestation.');
  }
}
