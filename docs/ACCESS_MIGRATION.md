# Access-control migration approval preview

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

## Historical preparation scope and approval ledger

Confirmed scope: free, invitation-only adult beta, personally operated in Georgia, separate Appwrite Cloud NYC project, no analytics/advertising, 20 MiB maximum per file. This is an engineering preparation document, not published legal terms or proof of age verification.

Earlier project-creation approval and the subsequent broad provisioning authorization supported the already-existing resources. They do not override the later explicit instruction to prepare this migration without Cloud mutations. ID: 063 and the latest continuation authorize read-only Cloud inspection, local fixes, documentation and tests only. No current approval covers the two new tables, invitations, permission changes, new operator key or disposable-account mutations below. Request that approval once this preview is reviewed. Deployment, legal notices, real tester invitations and paid resources remain outside scope.

## Pre-migration read-only inventory — 2026-10-12

Inspected the connected Appwrite Cloud project `stillroom` (Stillroom), NYC, organization `stillroom`, Free `tier-0`. No Cloud writes were performed. The connector and the existing runtime key independently reported the same files/totals inventory.

| Resource | Existing records | Proposed permission changes |
| --- | ---: | --- |
| files | 0 | 0; no owned/shared/pending/deleting rows exist at this snapshot |
| totals | 1 | 1 zeroed row belonging to an existing test account: remove its single individual-user read grant |
| limits | 44 | 0; all inspected row permissions are empty |
| invitations / members | Neither table exists | Create exactly two tables below |
| Project users | 3 enabled, email-verified accounts | No existing account updates; invite the selected personal owner only after approval |

Existing tables have `permissions=[]`, `rowSecurity=true`, and available columns/indexes. Bucket `stillroom` is enabled with no bucket grants, file security enabled and the existing 20 MiB limit. No storage settings change is proposed. Current runtime key readback showed the six scopes listed below. No key value was printed or copied.

The affected row ID, original permissions and update timestamp are in ignored `.private/access-preview-2026-10-12T23-05-40.330Z.json`. The earlier 18:37 snapshot is retained; their record IDs, permissions and update timestamps match exactly. The selected **project user**, distinct from the Console account, is identified in `.private/access-owner.json`. These files contain no passwords, session tokens or file bodies. Keep them local and out of support messages, Git and shared artifacts; `.private/` is Git-ignored, not encrypted storage.

The same table and row counts were rechecked after the interruption; there was no difference.

Reproduce a read-only, bounded inventory with:

```powershell
node --env-file=.env.local --conditions=react-server --import tsx scripts/preview-access.ts
```

It accepts no apply/restore arguments, reads only files/totals, prints aggregate permission categories and the proposed schema, and writes a new exclusive snapshot without overwriting earlier evidence. It refuses to write a snapshot unless Git confirms that the target is ignored. A failure exits nonzero; it never alters Cloud resources. The live inventory can drift: refresh after draining writers, and stop for renewed approval if the affected set differs from the approved one-row snapshot. The preview does not validate table schemas; the connector readback and exact checks below do that.

## Exact resource definitions

Create in existing database `stillroom`. Both tables: `enabled=true`, `permissions=[]`, `rowSecurity=true`; every row has `permissions=[]`. All columns below are required scalar `varchar`, `array=false`, no defaults, no extra indexes. System row IDs supply the only lookup keys.

| Table | Name / ID | Columns |
| --- | --- | --- |
| Invitations | invitations | email(320), state(16), accountId(36) |
| Members | members | email(320), state(16) |

An invitation uses the first 36 hex characters of SHA-256(normalized exact email) as row ID, with full email comparison to detect a hash mismatch. Initial fields: normalized email, `state=invited`, `accountId=""`. Binding atomically sets `state=bound`, `accountId=verified account ID`, and creates a member whose row ID is that same account ID, with original email and `state=active`. Suspension retains the row and binding, setting only member state to `suspended`. These states are enforced in source, not database enum constraints. No unique-email index is needed: deterministic invitation IDs prevent a second invitation for the same normalized email, and member IDs prevent rebinding one account.

Use the existing connector to create just these tables with inline columns, not the fresh-database setup script. Read back every definition, permission, enabled flag and column status. If a table already exists on rerun, compare its full definition; do not overwrite or drop mismatches. If matching columns are still processing, wait; if failed, leave them and investigate. Confirm that the provider accepts the required empty accountId string before proceeding with any access cutover. No bucket, auth-provider, platform, database or existing index change is requested.

## Scope separation

| Credential | Minimum proposed scopes | Reason |
| --- | --- | --- |
| Existing runtime, unchanged | sessions.write | Server-side sign-in session creation |
| Existing runtime, unchanged | users.read | Current account status/email checks and exact recipient lookup |
| Existing runtime, unchanged | rows.read, rows.write | Private metadata, membership and invitation binding, rate limits, transactional mutations |
| Existing runtime, unchanged | files.read, files.write | Authorized byte delivery, uploads and deletion |
| Separate temporary operator | users.read, users.write, rows.read, rows.write | Identity checks, disposable-account verification/email/status changes, all-session revocation, membership suspension/restoration, recipient cleanup |

Create at most one separate key, named `Stillroom access verification`, expiring 24 hours after creation, only after approval. Keep its value in the local operator environment, never chat or Git. Revoke that temporary key after verification. The persistent runtime key is unchanged. The operator credential needs no storage, schema, project, billing or key-administration scope. Actual storage uploads use the app and its existing runtime credential.

Appwrite's read-only current scope catalog and runtime-key readback confirm these scope names. Published endpoint source maps `Users.updateStatus` and `Users.deleteSessions` to `users.write` (see ACCESS_CONTROL.md sources). This mapping still needs a live least-privilege check against disposable accounts; if Cloud denies a step, report the step and stop rather than silently widening scopes. No additional sessions.write is proposed for the operator's Users API calls.

Provision schema through the approved connector without creating a schema-admin key. A separate SDK provisioning alternative would need `tables.read`, `tables.write`, `columns.read`, `columns.write`; it is outside the proposed key creation. Neither workflow elevates the runtime key.

## Application read-path review

No missing application read gate was found in source inspection. This is not live authorization proof.

| Path | Authorization boundary |
| --- | --- |
| Protected page | Session identity, verified email and invitation enrollment/active membership before workspace rendering |
| Overview/totals | Protected session and fresh account/membership lookup; totals row ID is the acting account; recent rows are owner-filtered and checked |
| Owned/shared lists | Fresh eligibility, bounded owner or ready-recipient filter, authorized cursor, then per-row owner/recipient assertions |
| Details/content | Fresh eligibility before internal admin metadata lookup; owner/recipient assertion before exposing metadata or fetching bytes; repeat after fetching content |
| Recipient details/sharing | File-owner assertion before reading recipient emails or exact-email lookup; selected recipient requires active membership before share mutation |
| Enrollment/authentication | Narrow server-only invitation/member reads establish eligibility; verification/sign-out remain available without active membership |

A metadata row must be read internally to learn its owner/recipients. Therefore the relationship assertion follows that administrative row fetch, but precedes metadata exposure or byte access; membership is checked before the fetch. The server key bypasses provider ACLs by design. Authentication/rate-limit operations are intentional exceptions to the file gate. In-flight requests can finish after their last eligibility check. Operator CLI reads are not exposed as application endpoints.

## Owner-first sequence and safe retries

1. After approval, stop/drain all application writers and keep a maintenance boundary. Do not run the old app again: it can recreate user read grants. Refresh the private snapshot and compare record IDs, permissions and timestamps to the approved inventory.
2. Create/read back the two tables. Create only the selected owner's invitation. Confirm its exact email against the already verified, enabled **project** account in the private owner record. Do not create another personal account, change its email, reset its password, revoke its sessions or mark it verified administratively.
3. The owner signs in locally using their own password, and the new server's verified-session enrollment transaction binds the invitation to their existing ID. Check both records and a successful protected page/API request before completing the access cutover. Do not request passwords or verification links in chat. This can run behind the maintenance boundary; other users remain excluded. If owner enrollment fails, keep maintenance in place and repair the missing/mismatched configuration instead of weakening the gate.
4. In a transaction, read the one approved totals row, compare its current fields and permissions with the fresh snapshot, and update **permissions only** to `[]`. Preserve all totals values. There are no existing file rows to update. If additional file/totals rows appear, stop and prepare a revised inventory. Read back empty permissions before committing the result to the operation journal.
5. Validate owner access and direct metadata denial, then run only the disposable tests authorized below. Create no additional human invitations. Keep the app private; deployment and legal notices remain pending.

Reruns: absent tables are created; exact matching tables are reused; already empty permissions are a no-op; an existing matching owner invitation or completed same-ID binding is read back and reused. A conflicting binding, unexpected member state, email mismatch, changed data/permissions, or schema mismatch stops the run. Never reset `suspended` to `active` as part of migration. If transaction success is uncertain, reread the invitation/member pair or totals row before retrying; never recreate a consumed invitation blindly.

Write a private operation journal with fixed step names, timestamps and resource IDs only. Record failures without provider payloads. Partial creation or partial permission changes stay in place while maintenance remains active; prefer repair forward. Existing bytes, account data and owned files are never deleted as migration recovery. Read-only snapshots support investigation, not automatic rollback. **Restoring legacy user read permissions or reverting to the old app can reopen the known direct-metadata bypass** and requires a separate explicit decision; it is not an authorized recovery shortcut.

## Approved protocol — partially executed; results above

Proposed new synthetic accounts (not inferred from the two existing test accounts):

- A: `stillroom-access-owner@testing.invalid`, invited test owner.
- B: `stillroom-access-recipient@testing.invalid`, initially uninvited direct-registration account; invited later as the test recipient and owner of one preservation-test file.
- B's temporary changed email: `stillroom-access-changed@testing.invalid`; no invitation for that address.

Approval must explicitly include these two disposable accounts and invitations for A/B only, with B’s invitation delayed until the uninvited-account assertions pass. If the provider rejects reserved-domain addresses, stop and ask for approved replacements. Passwords are random and generated locally. Synthetic accounts may be administratively marked verified to test identity binding; this does not prove mailbox delivery. The real owner's verification is never changed. Real human tester invitations require the user's explicit email list and remain outside this approval.

| Check | Exact action and expected evidence |
| --- | --- |
| Direct registration | Register B directly with the Appwrite Account API without an invitation. Obtain its session and prove Stillroom rejects protected access both before and after operator verification. Only then create B’s approved invitation. Provider registration may succeed; that is an explicitly documented remaining abuse surface |
| Verified binding | Invite/register A and prove denial while unverified. Verify A and let it bind itself. Use B’s uninvited session for the earlier denial tests; verify B, create B’s invitation, and test that A cannot share to B before B enrolls itself. Then let B bind through its own session. Repeat enrollment and simultaneous requests: one stable binding, no duplicate membership |
| Direct metadata | As A, B before/after invitation, and an unauthenticated client, GET known file/totals/member/invitation IDs must fail with an authorization/not-found response; list must return no private rows or deny. Also test direct create/update/delete of private metadata and direct storage download. API key clients are intentionally privileged and are not used as proof of user denial |
| Owner/recipient | Upload two synthetic TXT files, one owned by A and one by B, each under 1 KiB. Verify totals and original-byte hashes. A/B cannot read or mutate the other's file before sharing. A shares its file with B: B can view/download but cannot rename, delete, share or revoke it |
| Sharing eligibility | Sharing to B while uninvited, unverified, changed-email or suspended must fail (perform each assertion in the corresponding phase). An invitation by itself must not enroll a sharing recipient. Lookups stay exact-email and rate-limited |
| Email changes | Change B to its approved temporary alias, test both unverified and administratively verified alias states; protected requests and new shares remain denied because member email is bound to the original address. Restore B's original email and verify it; original stable membership works again |
| Existing session after denial | Retain B's pre-suspension cookies locally. Set only B's member state to suspended, then prove that this still-valid session is denied by overview, lists, details, previews/downloads, uploads, rename, share, revoke and delete. Sign-out remains available. This isolates app denial from provider session revocation |
| Full suspension/retry | Run suspension for B with the unchanged runtime key, which lacks users.write: expect application denial/recipient cleanup, failed account-disable, and successful session revocation through existing sessions.write. Rerun with the separate operator key and confirm all four stages, then repeat safely. Never change runtime scopes or induce a provider outage |
| Preservation/restoration | Confirm B's owned file, bytes/hash and totals survive. Re-enable B and activate the same member after checking original verified email; use a fresh session. B can read its own preserved file but cannot read A's formerly shared file until A explicitly re-shares. A then revokes and B loses application access again |
| Finish | Suspend both new synthetic accounts, revoke their sessions, keep suspended member tombstones/bindings for A/B, and preserve both synthetic files and all account data. Record residual resource IDs privately. Revoke the temporary operator key. No permanent deletion is included |

Expected new resources for this two-user plan: two disposable accounts, two synthetic storage files and matching metadata/totals rows, plus three invitations and three members including the personal owner. Ordinary application session, transaction and rate-limit records are also generated; their count depends on request timing. Existing test accounts receive no invitations. No permanent deletion is authorized.

Test against a freshly built private/local server using the unchanged runtime key. Store temporary cookies, generated passwords, IDs and byte hashes only in `.private/` or ignored test environment files. Keep browser traces/screenshots that could contain session URLs private. The existing live query fixture expects direct reads to fail, but it creates 26 additional rows; that fixture is **not** part of this minimal two-file approval unless separately requested.

Record expected and actual HTTP/provider status, booleans, counts and hashes of synthetic bytes; never log credentials, verification links or provider response bodies. Distinguish real-provider assertions from mocked failure injection. Drain requests before declaring revocation complete: a previously authorized response or downloaded copy cannot be recalled. Leave the accounts disabled and the temporary key revoked after any failed run once those cleanup actions can safely complete.

## Git, browser and logging safeguards

Snapshots and owner identity records live under ignored `.private/`; actual runtime/test/operator credentials belong only in ignored environment files. The preview checks Git ignore status before writing. No snapshot or operator script is imported by client components, and Appwrite credentials are accessed through a `server-only` module without NEXT_PUBLIC names. Error logs emit only a fixed event and bounded numeric status, never snapshots or raw SDK errors. Review the latest client bundles and Git candidate set before publishing. Git ignore is not a security boundary against deliberate force-add, and local files are not encrypted by this implementation; do not claim those actions are impossible.

Preparation check: 74 Git candidate files contained none of four known local secret values; 14 fresh production browser JavaScript bundles contained neither those values nor the affected snapshot row ID. All private/environment files were ignored and none were tracked. The private check report is `.private/publication-safety-check.json`. This targeted scan does not detect unknown secrets or replace review before publication. No operator credential exists yet, so its future handling must also be checked.

## Outstanding boundaries

The new logging check verifies actual local development requests and both console and Next development-file output. It does not verify CDN/host/reverse-proxy/APM/Appwrite logs, backups, public deployment or mailbox delivery. Direct registration can still consume provider resources. Runtime/admin credentials bypass row permissions by design and must remain server-only. Cloud transaction semantics, least-privilege operator scopes and the new direct-read denial model remain unverified until the approved live protocol runs. Legal-notice and deployment work remain pending.
