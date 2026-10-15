# Invitation-only access and reversible removal

## Verification completion — 2026-10-13 UTC (October 12 local)

The user explicitly approved one replacement operator key and completion using only the existing two disposable accounts/files. Read-only preflight matched the saved private inventory: Stillroom/stillroom in NYC on Free; personal owner active and verified; both testers disabled, suspended, sessionless with retained original bindings; exactly two preserved test files with matching original-byte hashes. No new accounts, files, tables or invitations were created.

**Result: the interrupted access-control protocol is completed across the two live runs.** The former failure was an incorrect test expectation, not a demonstrated suspension defect. The corrected live assertion passed: runtime suspension denies application access and removes recipient access, cannot disable the account, and successfully revokes sessions using its existing sessions.write capability. The four-scope operator retry then disabled the account and completed all stages; repeating it succeeded. Product behavior and runtime scopes were unchanged.

Restoration followed the documented operator procedure: verify the same stable IDs and original verified emails, re-enable the accounts, activate their existing membership rows, and require new sign-in. Old sessions remained rejected by both the app and Appwrite after restoration. Fresh sessions could download their own preserved files with matching original hashes, but could not access each other's files. Explicit sharing granted B app read-only access to A's file; direct raw storage access remained denied. Revocation then denied B app details, preview/download and shared-list visibility, direct metadata GET/list, direct recipient-regrant attempts and raw storage download.

Final cleanup and readback passed: both testers disabled, member state suspended, zero sessions, retained bound invitations, empty file recipient arrays and permissions, and both files/hashes/totals preserved. Current and earlier session credentials remain rejected. The personal owner remains active and verified. No owner account mutation was performed. Evidence is private: .private/completion-evidence.json, completion-cleanup.json, completion-sessions.json and the prior inventory/journal. Do not publish credential/session files.

The replacement key had only users.read, users.write, rows.read and rows.write, with a 55-minute expiration. It was revoked immediately after testing. A subsequent request using it returned **401**, and key-list readback showed only the unchanged runtime key. Both temporary verification keys are revoked. Evidence: .private/completion-key-revocation.json; key-list readback was observed through the connector. No key remains active for this phase.

Local verification: the private completion script passed syntax checking and its live assertions; all 13 local/mock tests passed separately. No application source changed, so production build, type/lint and UI checks were not repeated. A targeted scan of 74 Git candidates, 14 existing production browser bundles and one Next development log found no matches for 12 known key/password/session values; all private files remain ignored. This does not guarantee absence of unknown secrets or external log retention.

**Remaining private-beta boundaries:** direct registration still consumes provider resources despite application invitation denial; no provider abuse-control change was made. Host/CDN/reverse-proxy/APM/Appwrite logging controls remain unverified. Legal notices/reporting procedures, deployment/ingress controls, known development dependency findings, broader concurrency/outage tests and maximum-size/media coverage retain their earlier limits. Passing this bounded protocol is not overall private-beta readiness. No dependency installation, deployment, commit, push, paid resource or deletion occurred. Another phase requires a new go signal.

## Historical partial execution (superseded by completion above)


## Approved migration and partial live verification — 2026-10-12

The user approved ID: 067 and this exact migration. Both private tables were created and read back with all required columns available, empty permissions, row security enabled and no indexes. The existing verified personal owner self-enrolled through the application and reported a loaded library; provider readback confirmed the same account ID, bound invitation and active membership. No verification or membership was fabricated administratively. The sole seeded totals read grant was removed transactionally after snapshot comparison, and all totals values were preserved.

The approved temporary operator key had exactly users.read, users.write, rows.read and rows.write and a one-hour expiration. It was revoked immediately after the test failure below. Revocation was independently verified: the key is absent from the project key list and an authenticated request using its retained private value is rejected. No replacement key was created. The runtime key and scopes are unchanged.

Live checks passed: direct uninvited registration followed by application denial; unverified invitation denial; verified self-binding including concurrent enrollment/retry; sharing denial for unverified, uninvited and invited-but-unenrolled recipients; owner isolation; recipient read-only content; anonymous/owner/recipient direct metadata GET/list/create/update/delete denial across all five tables and direct raw storage denial; changed-email denial before and after verification; restoration of the original verified email; and all protected API denials with a still-valid suspended session, while sign-out remains available. These are real Appwrite checks, not mocks. Synthetic administrative verification does not prove mailbox delivery.

**Failed test assumption:** the runtime suspension report was applicationDenied=true, accountDisabled=false, sessionsRevoked=true, recipientAccessRemoved=true. The test incorrectly expected sessionsRevoked=false. A safe retry on the already-disabled disposable account reproduced the actual report. The runtime key's existing sessions.write capability can revoke sessions; do not claim only users.write can do so. The separate four-scope operator key successfully performed final suspension, account disabling and all-session revocation for both disposable accounts. No scope was widened.

The test stopped at that assertion. Its finally cleanup succeeded and readback confirmed both disposable accounts disabled, zero sessions, suspended memberships, retained bound invitations and preserved file bytes matching their recorded hashes. Both old sessions were rejected directly by Appwrite and returned 401 from the application. Final inventory: two files, three totals, three members and three invitations; every inspected row has empty permissions, and both file recipient arrays are empty. Existing accounts/uploads were preserved. Evidence and IDs remain in ignored .private/live-access-state.json, final-access-inventory.json, final-permissions-evidence.json, runtime-suspension-result.json and migration-journal.jsonl.

**Still unrun:** account suspension-to-active restoration with fresh sign-in, preserved-owner access after that restoration, explicit re-sharing and subsequent application revocation, and the completed operator-repeat test sequence. Email restoration above is a different completed check. The failed overall protocol is not a private-beta readiness pass. No application implementation changed; private test/migration scripts passed syntax checks. Earlier local tests/build evidence remains separate.

**Next approval proposal:** create one replacement temporary key with the same four scopes and at most a one-hour lifetime solely to finish testing the same two existing disposable accounts and files. Re-enable their original verified identities and activate their existing memberships without replacing bindings, verify fresh sign-in and preserved owner access, explicitly share/revoke the existing A file with B, repeat suspension safely, then leave both accounts disabled, memberships suspended, sessions revoked and files preserved. Revoke the replacement key immediately afterward or on failure and verify rejection. No new accounts, files, invitations, tables or runtime scopes; no deletion or legacy permissions. This replacement credential is outside the original at-most-one-key plan and has not been created. Deployment and legal notices remain pending.

## Pre-migration status and authorization boundary (historical)

This is a local implementation and proposed cloud migration. It has **not** been applied or verified against Appwrite. Earlier live results in VERIFICATION.md cover the old implementation. Do not start the new application for testers until the migration and live checks below are approved. Missing membership tables deny protected access; the setup screen only detects environment configuration.

The concrete [migration approval preview](ACCESS_MIGRATION.md) records the read-only Cloud inventory, private snapshots, owner-first enrollment, exact scopes, recovery boundaries and two-user disposable verification protocol. As inspected on 2026-10-12, invitations/members are absent; only one existing test-account totals row needs its read grant removed, and there are no file rows. No migration mutation is currently authorized.

## Identity and access rules

An operator creates an invitation for a normalized exact email. Its row ID is the first 36 hexadecimal characters of SHA-256(email); the full email is compared too. It begins with `state=invited`, `accountId=""`. A verified, enabled account consumes it in a transaction: invitation becomes `bound` with its stable account ID and a private `members` row with that ID becomes active. Existing verified accounts also need an invitation. No automatic grandfathering occurs.

Every protected session checks membership. File services additionally reload account eligibility, avoiding reliance on an old session identity snapshot. Membership requires enabled account, verified email, matching bound email and `state=active`. Email changes deny access, including a change to a separately invited email; the stable membership cannot silently rebind. Restoring the original verified email restores email eligibility only if membership remains active. Never delete and recreate an account ID or membership tombstone as an access-management shortcut.

Sharing requires an already active recipient; it does not enroll another account. Nonmembers can authenticate to verify an invitation or sign out, but cannot use protected pages or file operations. Signup and verification-email requests require a pending invitation. A direct Appwrite registration can still create an account or session: this design gates Stillroom access, not provider registration or resource consumption. Direct-account abuse remains a provider settings/rate-limit review item.

Metadata access changes deliberately: all file and totals rows must have `permissions=[]`, as must the tables. The server authenticates the session and checks membership, then performs bounded admin queries with explicit owner/recipient checks. Clients must have no direct metadata reads, writes, or storage access. This closes the old row-permission bypass only **after** migration. Operators and providers remain privileged; this is not end-to-end encryption.

## Exact cloud changes requiring approval

Within the existing NYC `stillroom` database, create only these two tables with empty table permissions and `rowSecurity=true`. All columns are required, scalar, no defaults, no extra indexes:

| Table | Columns | Row ID |
| --- | --- | --- |
| invitations | email varchar(320), state varchar(16), accountId varchar(36) | truncated SHA-256 of normalized email |
| members | email varchar(320), state varchar(16) | verified Appwrite account ID |

The complete definition is in `scripts/schema.ts`. `scripts/setup.ts` is for a fresh database and must **not** be rerun against this existing project. Confirm required empty `accountId` strings and transaction conflict behavior on the actual provider during migration verification.

1. Stop/drain old application workers. Keep an operator-only inventory of existing file/totals row permissions outside Git, including recipient IDs needed for any approved restoration.
2. Create the two tables above and wait for columns to become available. Create invitations only for explicitly approved tester emails; do not activate membership by unverified email or retroactively accept terms.
3. Set `permissions=[]` on **every existing files and totals row**, with bounded pagination. Preserve every data field. Retain empty table permissions and row security for all five tables. Audit limits, members and invitations for any accidental grants. Keep bucket and storage-file permissions empty. Old application versions must not run afterward because they recreate direct read grants.
4. Runtime key scopes stay `sessions.write`, `users.read`, `rows.read`, `rows.write`, `files.read`, `files.write`; no runtime elevation is proposed. Provisioning, if done by a separate key, requires table and column creation scopes (`tables.write`, `columns.write`); readback uses `tables.read`, `columns.read`. No new indexes/buckets/authentication providers are needed.
5. The proposed minimum separate operator credential for suspension is `users.read`, `users.write`, `rows.read`, `rows.write`. Both `Users.updateStatus` and `Users.deleteSessions` use `users.write` in the published Appwrite 1.8.1 implementation; no additional `sessions.write` scope is proposed for this operator script. Validate that scope set against the current Cloud deployment with approved disposable accounts. Do not broaden the runtime key. Use the connector/Console or an approved short-lived operator key provided locally, never in chat. Invitation creation alone needs `rows.write`.

The [Appwrite Users reference](https://appwrite.io/docs/references/cloud/server-go/users) documents status updates and deletion of all user sessions; [SSR guidance](https://appwrite.io/docs/products/auth/server-side-rendering) documents `sessions.write` for session management. The [published endpoint implementation](https://github.com/appwrite/appwrite/blob/1.8.1/app/controllers/api/users.php#L2257) supplies the operator scope mapping; this source review is not proof of a completed Cloud operation.

## Operator preview and execution

Preview uses no environment file and makes no provider calls:

```powershell
node --conditions=react-server --import tsx scripts/access.ts invite tester@example.test
node --conditions=react-server --import tsx scripts/access.ts suspend ACCOUNT_ID
```

After separate approval only, supply the existing server settings plus the approved operator credential through the local environment, then append `--apply`. Do not put the key in command arguments. Invite requires the private affirmative 18+/Georgia operator approval described in ELIGIBILITY.md before its provider call. It creates one row and never overwrites an existing invitation or binding; a duplicate fails safely. It does not send email.

Suspension/removal is intentionally reversible and never deletes an account, owned file, storage object, or invitation binding:

1. Write/retain a `suspended` member tombstone. On a first-time account, derive its email from the provider, never from a caller. A race with enrollment is resolved by suspending the existing member after a create conflict. If this step fails, stop and report all steps incomplete.
2. Disable the account and revoke all sessions independently. Failures do not stop the other revocation attempts.
3. Scan all file rows in batches of 25. In a transaction, remove the account ID from each recipient array and clear legacy row permissions. Owned files, other recipient IDs, bytes and totals are retained. Clear the removed account's totals row permissions. Clearing file permissions globally aligns with the required server-only metadata model; do not run this script with the old application.

The JSON report contains `applicationDenied`, `accountDisabled`, `sessionsRevoked`, `recipientAccessRemoved`. Any false field produces a nonzero exit status. These describe successful API responses, not a completed independent access test. If a timeout occurred after a successful provider action, a false field is conservative. Rerun the same account ID; successful steps are safe to repeat. A missing row during concurrent cleanup is reported incomplete; retry after draining workers. No secret, email, response payload, or file content is logged.

Application denial applies to subsequent eligibility checks, including previously authenticated sessions. Already authorized requests may finish. To declare completed revocation, drain in-flight operations, rerun cleanup, inspect all report fields, and verify denial using the old session and direct SDK. Do not claim immediate byte recall. Other active recipients retain access to preserved owned files. Existing downloaded copies and provider backups are unaffected.

For an approved reversal, confirm the same stable account and originally invited verified email, enable that account, then set the existing member state to `active`. Keep the original invitation binding. Require a fresh sign-in; revoked sessions are not restored. Owners may explicitly re-share with the restored tester. Do not automatically restore old recipient grants or legacy direct-read permissions. No retention period or permanent deletion process is defined here.

## Logging boundary

`next.config.ts` disables Next development logging, including incoming verification URLs. Application error logging emits only a fixed event and bounded numeric HTTP code. Auth/file API errors are caught before raw provider errors reach framework logging; the protected page returns a generic access state. Setup, verification and access scripts use the same restricted logger. Browser history cleanup remains a separate privacy measure.

The repaired local integration check passed actual `/verify` (200) and unauthenticated `/api/files?q=...` (401) requests with synthetic canaries absent from both captured server output and the nonempty Next development log. It isolates its build directory and waits for an actual HTTP response: the initial ECONNRESET came from a conflicting Next development-server registration, not a demonstrated application request failure. Evidence and source/log hashes are retained in ignored `.private/logging-evidence.json`; see VERIFICATION.md for limits.

No host or provider logging controls were changed or verified. Before deployment, configure the reverse proxy/CDN/host/APM to omit query strings (especially `/verify`), Authorization/Cookie/Set-Cookie headers, auth request bodies, upload/content bodies and raw SDK error payloads. Disable debug payload capture. Verify with synthetic canaries at each layer and review provider logging and access controls. Do not infer production host behavior from Next's development logging setting.

## Live verification still required

With separately approved disposable accounts/resources, test uninvited direct registration and sessions, unverified invitation denial, verified binding, simultaneous binding attempts, replay with a second account, email changes, and denied membership-table writes. Check active recipients through the app while direct GET/list/update/delete on all private metadata tables and storage remain denied. Then suspend a tester with an existing session, test every protected route and sharing lookup, inject/observe revocation failures and retry, and prove preserved owned files plus approved restoration. Include in-flight request drain and concurrent share/remove behavior. The revised live query fixture expects direct metadata reads to fail; it has not been run.
