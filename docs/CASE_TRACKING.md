# Private account-exit case tracking

## Eligibility-only cleanup support

ELIGIBILITY.md documents the new preview-first action in the existing account-exit CLI. It reads signed case/receipt/plan/progress evidence and deletes only a specifically confirmed local eligibility record after verified closure and hold/reference checks. It never deletes or rewrites tracking/retry evidence, and full-case cleanup remains disabled. Shutdown-wide cleanup has no verified admission-closure prerequisite yet. Real execution requires separate approval.


## Historical evidence review and rehearsal — 2026-10-13

See [HISTORICAL_CASE_REVIEW.md](HISTORICAL_CASE_REVIEW.md): one historical request was reviewed offline, with verified local signatures and saved independent provider evidence. An open-case migration with the original request date is proposed privately, not applied. Historical hold notes and formal closure date are not invented. Fifteen isolated synthetic tests passed; original records remain unchanged and cleanup disabled.


Local implementation, 2026-10-13. This supplements ACCOUNT_EXIT.md; it does not authorize provider deletion, cleanup or communications. Earlier live deletion evidence predates this tracking layer. No public deadlines have been published.

## Approved timing

> Aim to remove active account data and owned uploads within 30 calendar days after Stillroom receives a valid authenticated exit request with confirmed scope.

> Later operator acknowledgment or required reauthentication does not restart that clock.

> For each hold, record the specific data, reason, responsible operator and next review within 30 days.

Closure requires independent completion verification, documented closure, verified session revocation, and no unfinished case references or specific hold. Correspondence remains subject to its separate 90-days-after-closure rule. See NOTICE_DECISIONS.md for the complete approved wording and exceptions. Cleanup remains disabled.

## Records and boundaries

The initial receipt seeds a stable private case ID. Its value initially equals the first execution receipt ID, but subsequent receipt IDs differ and reference the same case. Signed `case.json` preserves originalReceivedAt and targetAt, account/environment identity, receipt references, holds, delay/review events, and closure evidence. It contains no email address, session secret, password or uploaded content. Receipt records still contain necessary authentication identifiers; do not copy them into correspondence or logs.

Calendar calculations use America/New_York wall time, including DST. Ambiguous/nonexistent times conservatively choose the earlier adjacent occurrence. A hold or delay never moves the original date or target. Review dates are computed 30 calendar days after a recorded review; correspondence review is 90 calendar days after verified closure. These are operator targets/review dates, not scheduled deletion jobs or new legal deadlines.

New requests still require successful password authentication plus current-session readback within ten minutes. Receipts expire after 24 hours. A new authenticated session renews an unclaimed receipt only after stable account identity, registration/email binding, environment and existing case checks. The prior receipt is cancelled. Claimed work cannot be renewed; retries retain the original maintenance epoch and confirmed scope. Cancellation does not erase case history or restart its date.

## Operator commands

Use the existing Node/tsx operator environment and private credentials described in ACCOUNT_EXIT.md. All commands below use `node --conditions=react-server --import tsx scripts/account-exit.ts ACTION ID`; supply a stable case ID except where explicitly marked receipt ID. They coordinate through the existing persistent single-host gate. No new database, key or schema is required.

- `case-status CASE_ID`: writes the detailed private `case-report.json`; console output contains only status, execution stage and overdue indicators. This is a manual review workflow, not a background alert service.
- `case-note CASE_ID`: reads ignored `case-input.json` in that case directory. Use action `delay` with `operator` and a concise `reason`; do not enter credentials, message bodies or file contents. Hold notes additionally use action `hold`, category `security`, `abuse`, `copyright` or `legal`, and `dataIds` containing only held file IDs or the held account ID from the latest signed preview. `review-hold` and `release-hold` use the generated `holdId`, operator and reason. Reviews calculate the next due date; release records why the reason ended.
- Existing `apply` requires the active recorded holds to match the signed plan exactly. Existing `release-holds` requires matching updated case notes before updating the execution plan. Notes alone do not delete files or release execution holds. Preview and explicitly confirmed apply retain their existing approval boundaries.
- `case-close CASE_ID`: reads `case-input.json` containing only `operator`. Requires a complete signed journal, claimed receipt, no active holds, cancelled superseded receipts, and fresh independent provider GETs for account/session absence, deleted owned data, revoked invitation, removed owner/recipient references and preserved incoming-share rows. It records application deletion and unknown backup/log erasure separately. Provider reads require an already authorized credential; this command does not create one. Any read failure prevents closure. Later legitimate changes to a preserved share row can require explicit reconciliation rather than bypassing this check.
- `case-repair-pointer CASE_ID`: only for reviewed interrupted local writes where the signed case and every linked receipt are intact. Restores the latest unclaimed receipt pointer and cancels superseded receipts; it cannot reconstruct missing evidence, change the original date or authorize deletion. Missing/invalid records remain blocked for explicit recovery review.

Use the stable case directory for notes/reports and the execution receipt directory for receipt, plan and progress. The application response remains `{caseId, expiresAt}`, where caseId is the execution receipt reference; the private stable case ID is not a new public field. Never treat status reporting as execution authorization.

## Historical migration

Existing historical receipts are not silently converted. `case-preview-migration RECEIPT_ID` selects the latest preserved receipt, checks all matching account/identity receipts and writes a private proposed record/digest. Its earliest signed timestamp is only the earliest *preserved* evidence, not proof that no earlier qualifying request existed.

An operator must establish complete history and confirm scope against the original evidence. Only then use `case-migrate RECEIPT_ID --confirm DIGEST --history-complete`. This signs the private record without rewriting historical receipts or inventing dates. Earlier claimed work, conflicting identity, ambiguous or incomplete history requires manual reconciliation; there is deliberately no arbitrary backdate option. Repeated migration refuses an existing record rather than resetting it. Interrupted migration with intact signed records can use reviewed pointer repair.

One pre-existing historical receipt directory was observed during preparation; it has receipt/plan/progress evidence and no case record. It has not been migrated, closed or cleaned by this phase. Its history completeness and any closure reads remain pending operator review. Existing live test artifacts retain their preservation requirement.

## Privacy and operational limits

Records and input/report files stay under ignored `.private/exits`, behind existing canonical-path and single-host coordination checks; CLI checks reject tracked private directories. Server-only modules are not imported into client components, and no new API fields or browser storage are introduced. Local filesystem/backup access remains an operator responsibility. Never force-add private files. Free-text notes must be minimal; the tool cannot prevent an operator from typing unnecessary personal data into a private note.

Do not erase full case evidence at closure: cleanup implementation/execution remains separately gated. A future cleanup must consider shared authentication proofs, unfinished references and specifically justified holds, and preserve only approved minimal disposition. Existing rate-limit rows, provider backups/logs, recipient copies and preserved test artifacts are not removed by case closure. Missing history, lost signing secrets, uncertain writes or damaged journals require review, never a new clock.
