# Private-beta eligibility — operator procedure

Local implementation, 2026-10-13. No invitations, suspensions or communications were executed in this phase. Notices remain unpublished.

## Approved scope and evidence standard

The operator explicitly approved **only adults 18+ residing in Georgia**, directly confirmed before invitation, without identity documents or full birth dates. The recorded answer in the policy-preparation conversation and POLICY_PREPARATION.md, Approved decisions (2026-10-13), resolve the earlier United States tester proposal. Broader US participation is not approved. Georgia means the US state for this pilot.

An affirmative attestation is the person's statement, not independently verified proof of age or residence. Email verification establishes control of an email account, not adulthood, residence or agreement to terms. Do not infer eligibility from an email domain, name, appearance, school, IP address, owner status or an existing login. No geolocation, DOB, document upload or terms-acceptance feature is introduced.

## Before approving an invitation

1. Confirm the intended email directly with the prospective tester through the existing operator channel. Ask for two explicit answers: **“I am at least 18 years old”** and **“I currently reside in Georgia, United States.”** Require affirmative answers to both; silence, missing answers or negative answers cannot authorize invitation.
2. Review the answers and any already-known credible contrary information. If either answer is missing/negative or a contradiction is unresolved, leave approval pending or denied and do not create an invitation. Do not request an exact birth date, ID, street address, GPS data or supporting documents merely to fill a checklist.
3. Record the minimal decision privately, using the normalized email's existing invitation ID as the reference. Keep the decision date truthful; do not backdate it. Mark both answers true only after receiving them. `reason` is a short code; any necessary minimal review context belongs in a private correspondence case, not application logs or the invitation row.
4. Review the standard preview from `scripts/access.ts invite EMAIL`. It performs no provider call and is not an eligibility pass. Under separate live authorization only, the existing `--apply` command checks the private approval before creating the invitation. It never overwrites a bound invitation or sends email. Enrollment subsequently binds the verified email to its stable account ID using existing membership transactions.

## Minimal private record

Create `.private/eligibility` locally only when needed. Store `<invitationId>.json`, where invitationId is the existing `invitationId(normalizedEmail)` from `lib/membership.ts` (SHA-256, first 36 hexadecimal characters). Use the existing operator tooling/environment; do not put credentials in commands. No record was created for a real person during this phase.

```json
{
  "invitationId": "EXISTING_INVITATION_REFERENCE",
  "adult18": true,
  "residentGeorgia": true,
  "decision": "approved",
  "decidedAt": "ACTUAL_ISO_DECISION_DATE",
  "reason": "direct-attestation",
  "reviewOutcome": "approved"
}
```

The example is a shape, not approval to assert facts. For unresolved/negative decisions use false or null answers as appropriate, `decision: "review"` or `"denied"`, `reviewOutcome: "pending"` or `"denied"`, and a concise reason such as `missing-attestation` or `contrary-information`. These cannot pass the invitation guard. A reviewed approval after a resolved concern may use `reason: "review-resolved"`; do not set it merely because someone repeats a contradicted answer. The guard rejects missing/negative attestation, mismatched invitation reference, unknown fields, unapproved decisions/outcomes, invalid/future dates and unsupported approval reasons.

The record duplicates no email/profile/file content. Its email-derived reference is personal data, not anonymization. Do not force-add private files to Git. Do not log records, copy them into browser bundles or include them in publication packages. Restrict access to the operator. Routine correspondence still follows its separately approved 90-days-after-closure rule. Eligibility retention is now approved in NOTICE_DECISIONS.md: keep only the minimal record during participation; remove it after independently verified exit and documented closure unless specifically held. Do not keep age/location statements to prevent reuse; that purpose belongs to the separate minimal revoked invitation. At shutdown, removal additionally requires permanently closed admission and verified completed shutdown/exit processing. No automatic cleanup runs.

## Credible contrary information and review

1. Record only the necessary concern, source category, date and review outcome privately. Distinguish a credible statement or directly relevant evidence from rumor or an unsupported allegation. Do not retain uploaded files or full message chains by default. Ask only a narrow clarification of the conflicting statement; do not start collecting identity documents.
2. Change the local decision to review/denied so new invitation creation cannot pass. **A local record change does not revoke an existing Cloud invitation or session.** Before continuing participation, use the existing reviewed suspension procedure for the stable account ID in ACCESS_CONTROL.md, with appropriate live authorization. Do not delete accounts, files, invitations or membership tombstones as an eligibility shortcut.
3. Suspension sets membership to suspended, disables the account, revokes sessions and removes the account's recipient references while preserving its account and owned uploads. Drain in-flight work and inspect all report fields; failed steps require safe retry and independent denial checks before claiming provider revocation complete. Other authorized recipients may retain access to owned files, and downloaded copies cannot be recalled.
4. If only an unbound invitation exists, halt admission and prepare revocation of that invitation before allowing signup/enrollment. The current access CLI does not revoke unbound invitations. Do not claim changing the local decision blocks their consumption; a separately authorized existing-provider-state change is required. Reconcile any account that enrolled in the meantime, then suspend its stable ID.
5. On resolution, record the actual review date and approved/denied outcome. Restore only under the existing explicit restoration procedure after confirming eligibility and the same verified account identity. A local approved record does not reactivate membership. Require fresh signin; revoked sessions and previous incoming shares are not automatically restored. If eligibility remains negative or unknown, access stays restricted. Any account exit follows the separate authenticated workflow, not automatic eligibility deletion.

## Existing accounts without evidence

An existing invitation, verified email, active member or successful login is not a historical attestation. Before human beta participation, audit each intended tester prospectively, record missing evidence as pending and obtain current affirmative answers. Record today's actual decision, never an assumed signup-era date. Pending existing accounts need separately authorized suspension while reviewed; this phase did not inspect or change live accounts. Apply the same standard to an owner who participates as a tester, while preserving safe operator access and avoiding an unreviewed lockout. Disposable synthetic protocol accounts are test evidence, not human attestations; do not fabricate eligibility for them or reactivate them.

## Enforcement boundary

The supported invitation CLI now requires the private approval file before its provider write, under the existing maintenance gate. No Cloud columns, indexes, permissions, runtime scopes or UI changes are needed. Existing enrollment continues to enforce verified-email binding, active membership and suspended-account denial. Local attestations are not checked on every request and are not a new Cloud authorization claim.

Direct Console/SDK invitation creation can bypass the operator checklist; restrict those privileged workflows operationally and require the same review. Direct Appwrite registration/resource abuse remains a separate blocker. Do not equate this guard with provider age/location verification or automatic revocation. No eligibility expiry, automatic suspension job, blacklist or cleanup schedule was invented.

## Preview-first eligibility cleanup

Use the existing account-exit CLI, private directory and coordination gate. No additional workflow store, Cloud schema or API key is created. This command reads local signed evidence only; it does not refresh provider verification. Never run `case-close` solely to unblock cleanup without its independently authorized provider checks.

Preview (no deletion):

```powershell
node --conditions=react-server --import tsx scripts/account-exit.ts case-eligibility-cleanup CASE_ID --target INVITATION_ID
```

The target must be the exact 36-character invitation reference in the closed case's signed plan. Preview validates signed identity/closure, independent-verification flags, completed signed journal, claimed receipt/epoch, no active case holds, no selected execution holds, cancelled superseded receipts, no unlinked same-account receipt and no other plan sharing the invitation reference. It refuses unresolved eligibility review, a decision newer than case closure, unexpected record fields and noncanonical paths/symlinks. A damaged or unexplained reference fails closed for review; it is never deleted to unblock cleanup.

Preview returns a digest and count only, without copying attestations into another report. Review the private selected record and the case evidence. Check all external correspondence/incident/legal holds: the code cannot discover a hold in a mailbox. If one exists, mark the eligibility decision as `review`/`pending` and retain the minimal hold documentation with its reason, responsible operator and next review within 30 days. A review date is not an expiry that releases a hold automatically. Resolve and document the hold before restoring a final decision; unknown or incomplete evidence blocks execution. Any hold conservatively blocks removal of this small record as a whole.

**Only after separate approval for the exact real target**, append:

```text
--apply --confirm REVIEW_DIGEST --holds-reviewed
```

`--holds-reviewed` is the operator's explicit confirmation that no additional specific hold or unresolved reference exists outside the checked records, not machine proof of mailbox contents. The command reacquires the existing coordination lock and recomputes the preview before unlinking only `.private/eligibility/INVITATION_ID.json`. Changed evidence/digest or missing confirmation refuses execution. Do not edit eligibility/case records concurrently in an external editor or client; the application gate cannot control those tools. A filesystem failure leaves the other records untouched; retry from a fresh preview. If the unlink succeeded but its output was lost, a retry reports `ALREADY_ABSENT` after the closure checks, without deleting anything else. No archived copy of the attestations is made by this action.

This does not remove or write invitations, memberships, receipts, authentication proofs, plans, journals, holds, correspondence, uploads or provider data. Removing approval cannot activate admission: the invitation command instead requires a fresh approved record, and existing provider revoked-state protections remain unchanged. Preserve test artifacts unless separately selected/approved. The historical case reviewed earlier remains unmigrated/unclosed and cannot pass this gate.

**Shutdown-wide removal remains blocked.** There is no verified permanent-admission-closure record or completed shutdown workflow to support it yet. Do not use a shutdown flag or the passage of time as proof. Per-account records may use the verified-exit path when individually qualified; unbound or otherwise unmatched records require a later reviewed shutdown inventory and implementation/authorization. Full-case and revoked-invitation cleanup remain disabled. No correspondence, filesystem backups or provider log/backup erasure is implied.
