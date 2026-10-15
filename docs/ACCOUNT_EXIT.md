# Account exit — live protocol passed; retained-record cleanup disabled

## Local terms integration — inactive, 2026-10-14

The prospective terms flow does not alter session/activeMember or exit receipt controls. Pending and unavailable agreement screens expose the existing authenticated exit UI and sign-out; synthetic request/cancellation without agreement passed. Agreement records, if later activated, live separately under the shared private root and follow their approved retention policy. They are not selected by eligibility cleanup or erased by active-account deletion. Full retained-record/terms cleanup remains gated; account exit must never require agreement. No new live exit verification or mutation occurred in this phase.

## Eligibility-specific cleanup exception — local only

The approved eligibility retention rule is in NOTICE_DECISIONS.md. The existing account-exit CLI now supports case-eligibility-cleanup for one local eligibility record after signed independently verified closure; see ELIGIBILITY.md for preview, explicit target/digest confirmation and hold/reference checks. This does not enable full-case, receipt, journal, invitation or Cloud deletion. Original historical records remain unmigrated and cannot pass this closure gate. No real eligibility cleanup occurred in implementation.


## Current private case workflow

See [CASE_TRACKING.md](CASE_TRACKING.md) for stable case IDs, receipt renewal, historical migration, holds, operator commands and independently verified closure. The local layer passes synthetic tests; its live behavior is unverified. Existing provider protocol evidence below remains intact. Cleanup is disabled.


## Notice reconciliation and policy approval — 2026-10-13

The live result above/below remains preserved; no protocol rerun or Cloud changes occurred in this documentation phase. The operator approved the exact 30-calendar-day exit target (clock starts at valid authenticated scoped request, not later acknowledgment/reauthentication), conditional planned shutdown and retention/hold triggers in NOTICE_DECISIONS.md. Drafts remain unpublished. Cleanup remains disabled pending separately authorized implementation/execution; preserved test resources/evidence are not selected. The 24-hour receipt validity is unchanged; the local original-date/renewal workflow is now implemented and tested synthetically; see CASE_TRACKING.md. Historical migration remains explicit and new tracking behavior has not been tested live. See BETA_READINESS.md for the current compact checklist.


## Live account-exit protocol — passed; temporary key revoked (2026-10-13, IDs 147–151)

This completion supersedes earlier pending/blocked protocol sections below. The user approved the refreshed baseline and confirmed intentional earlier signout, then explicitly resumed the unchanged live protocol. Pre-mutation project identity, bucket/table/row/object permissions, key list, accounts/resources and downloaded hashes were refreshed. Accounts, all 99 baseline rows and both files matched the accepted snapshot exactly. The real local server again honored the shared gate, retired scripts refused execution, and no dirty/closing/operation blocker was present. External-client inactivity is user-confirmed, not enforced by the gate.

### Applied scope and live results

Exactly two disposable accounts (A exiting, B control), their two invitations/verified self-enrolled memberships, three tiny synthetic text uploads (A owns two, B owns one), and one temporary operator key were created. Synthetic accounts were administratively marked email-verified without sending mail, then signed in through the actual application password flow and bound through normal verified-email enrollment. This tests authenticated receipt/authorization behavior, not delivery of verification email. Both A files were shared with B; B's file was shared with A. Stable IDs, credentials, hashes, shares and exact target selection were recorded only in ignored private evidence.

- **Authenticated request and preview passed:** A obtained a genuine server-issued exit receipt through the application after password signin and current-session readback. Stable account binding, 10-minute authentication freshness and 24-hour initial receipt validity were checked. The drained gate's signed preview contained exactly A's two files, B's one incoming share reference and the designated hold. No operator-entered authentication attestation substituted for the receipt.
- **Stale-plan rejection passed:** a bounded share change on A's synthetic file made apply return review-required while A remained enabled. The share was restored through the held gate and the documented preview replacement preserved the prior plan. No extra file/account or permission grant was introduced.
- **Hold/retry passed:** applying the reviewed plan disabled A, suspended membership, minimized/revoked the invitation, revoked all sessions, removed B-file references to A and restricted both A files before deleting the unheld file. Independent reads confirmed the designated held file still matched its hash and A had zero sessions. A's old direct Account request was rejected. B's direct provider downloads of A's files were rejected. During maintenance the app returned 503; that observation proves fencing, not a post-maintenance authorization-specific denial.
- **Completion and repeat passed:** reviewed hold release followed by the newly confirmed digest deleted A's remaining file, metadata, totals, account and membership. Independent provider reads returned absence; no remaining file owner/recipient reference pointed to A. Repeating apply returned completed without widening scope. The revoked invitation remains private with empty email/accountId and state revoked; invitation lookup rejects reuse. No new registration/re-entry attempt was made and no automatic cleanup was enabled.
- **Post-maintenance access passed:** A's old app session returned 401; B's app requests for A's deleted files returned 404 and direct provider metadata reads were rejected. B's account remained active and its own authenticated download matched the recorded hash before final restriction.
- **Approved final control state passed:** B is disabled, its membership suspended and its sessions revoked. Its file and hash remain preserved with no recipient references; old direct/app session requests are rejected. A is absent. The owner and all five pre-existing accounts retain their baseline states.

### Independent preservation and key evidence

A separate GET-only final inventory compared every baseline account/session record, all 99 original rows and both original storage objects/byte hashes with the accepted snapshot: **all unchanged**. The final project has six accounts and three objects, with rows files 3, totals 5, limits 100, invitations 5, members 4 (117 total). All row/object permissions remain empty; no orphan object or file metadata without an object was observed. Thirteen protocol limiter rows remain, as do retry/evidence/authentication records and A's minimal revoked invitation; active-resource deletion does not mean every related record was erased. Original baselines and previous protocol resources remain intact.

The temporary key had only users.read, users.write, rows.read, rows.write, files.read and files.write, with a 55-minute expiry. It was revoked immediately after the runner completed. Authoritative list readback contains only the original runtime key and no temporary key. A direct request using the revoked credential was rejected with **401 api_key_invalid** at 2026-10-13T21:51:21Z. The phase is not relying on eventual expiry. Key secrets were transferred directly into the ignored private file, not command arguments or application output. The first stdin-based local file-transfer attempt failed because stdin was closed; a direct file write completed before running the protocol, without creating a second key or exposing its value.

Private evidence: live-exit-state.json; the signed case receipt/plans/progress and preserved stale preview under .private/exits; captured operator results; account-exit-final-inventory.json; exit-preservation-verdict.json; exit-key-list-verdict.json; exit-key-rejection.json. These remain ignored/untracked. Current Next development log scanning found none of the synthetic passwords, cookies/session secrets, receipt signature or temporary-key secret. This is not verification of provider, host, proxy or other infrastructure logs. Final default coordination state has only its host marker: no dirty, operation or closing marker. No uncertain-write marker needed reconciliation or clearing.

### Limits and next phase

No application fix was required. Local checks in this phase were the three retirement checks, real-server drain probe, private-runner syntax check and evidence consistency checks; previous 31-test/lint/type results remain historical. No production build or full regression rerun was needed. Live provider-wide outage/lost-response injection was not performed; uncertain-write/error recovery retains its separate synthetic-test evidence. Live stale-preview, held partial completion, release/retry and completed-repeat behavior passed. No claims are made about backup/log erasure, recipient downloads or general private-beta readiness.

Retained-record destructive cleanup stays disabled. No additional resources/scopes, permissions, communications, notices, deployment, dependency changes, commit or push occurred. Direct-registration abuse, external logging/backup controls, recovery/accessibility work and unpublished policy/operating decisions remain separate beta blockers. The smallest next phase is reviewing the unpublished account-exit/privacy/beta wording and readiness checklist against this live evidence, with any deadline/cleanup decision explicitly approved before implementation or publication. Wait for the user's go before that phase.


## Refreshed baseline approved (2026-10-13, ID 146)

The user explicitly approved the refreshed baseline and confirmed intentionally signing out earlier. The proposed snapshot digest was verified against its private manifest before recording approval. Its five accounts, 99 rows and two files are now the approved point-in-time preservation baseline; the original snapshots remain intact. Intentional signout is user-confirmed context, while attribution of the specific missing session remains independently unverified because audit evidence was unavailable. The earlier proposal/pending wording below is historical and superseded by this approval.

No Cloud reads or mutations occurred in this approval-recording step. The existing live protocol scope is unchanged; execution awaits the next go and fresh pre-mutation reconciliation under the documented abort rules. Baseline approval does not silently accept subsequent drift.


## Baseline reconciliation — proposal awaiting explicit approval (2026-10-13, IDs 142–144)

Read-only reconciliation is complete. The user reports "I just signed back in"; this is not confirmation of the earlier signout/revocation or of every request. No Cloud mutation, account/file/key creation, session revocation, deletion or permission change was performed. Application code and the original preservation baseline remain unchanged.

### Observed differences and their limits

- Relative to the original baseline: five accounts remain; one old owner session is absent and one new owner session is present, returning the owner count to three. The new session has a valid local password-authentication signature with matching stable account/session IDs and provider creation timestamp, 2026-10-13T21:41:32.040Z (5:41 p.m. Eastern). This corroborates a successful application password sign-in and is consistent with the user's report; it does not identify a human independently. The two older remaining sessions have no local proof record; absence alone is not evidence of malicious activity or a failed signature.
- The earlier missing session was still within its recorded expiry. Its deletion actor, reason and precise deletion time remain unknown. The signin handler creates a session; the signout handler deletes the current provider session. No evidence establishes that the latter handler caused this disappearance. Ordinary signout/provider session removal is plausible; compromise is not established by the count change. The recent signin does not retrospectively explain it.
- Rate-limit rows are now 87: five more than the original 82, three more than the stopped preflight's 84. Both earlier rows cryptographically match the owner-read subject/minute bucket using the existing private HMAC key. Their count of four can arise from workspace read requests; the exact routes and actor are unknown. The three latest rows match global authentication (count 1), owner-email authentication (count 1), and owner-read (count 4), consistent in timing with the reported signin. Matching subjects establishes limiter classification, not proof of who issued requests. Every earlier limiter row remains unchanged; preserve all new rows.
- All account non-session fields recorded by the baseline, the two files' metadata and downloaded SHA-256 hashes, all four totals rows, three invitations and three memberships remain unchanged. No account/resource removal, ownership change, sharing-reference change or permission-array change was observed. There are 99 current rows across the five tables; all row/object permissions remain empty. No orphan object or metadata-without-object was observed. The read covered complete paginated inventories, not a sample.

### Evidence availability and security assessment

The available Next development log contains no HTTP request lines or signin/signout route mentions. Request logging is intentionally disabled; this cannot reconstruct the missing session's history. Existing synthetic logging reports are not owner request evidence. The current owner Users.listLogs read returned HTTP 404 with no useful provider error type. This establishes unavailable audit evidence for this call, not that no events occurred, not a retention period, and not a proven permission/plan cause. No hosting/proxy/provider audit history was available for review. Raw log text, emails, session identifiers, HMACs and credentials were not printed.

There is no affirmative evidence of unauthorized access in the inspected data. The recent signin is corroborated; the older session removal remains an acknowledged evidentiary gap. No security mutation is proposed solely from counts. If the operator disowns the corroborated signin or other evidence indicates an unfamiliar successful authentication, account identity change or unauthorized action, keep the protocol stopped and review the specific account sessions/audit evidence, then obtain authorization for targeted session revocation/password recovery. Do not automatically revoke the owner or rotate credentials merely to make snapshots match.

### Proposed baseline and resumed-protocol rules

The separate ignored account-exit-baseline-proposed.json captures current account/session references, 99 rows, two objects, permissions, relationships and file hashes. account-exit-baseline-proposal-manifest.json records its digest and **PROPOSED_NOT_APPROVED** status; account-exit-reconciliation.json contains the private differences. Original and ID 140 snapshots remain intact. Fresh bucket/table/key-list evidence from IDs 137–139 remains historical, not reread or superseded here. This proposal is a point-in-time read, not a maintenance-held freeze. It does not change disposable counts, stable target binding, required authentication/receipt checks or authorization boundaries. The previous guarantee to preserve an already-missing session cannot be asserted; approval would explicitly adopt current sessions as the starting state while recording that unknown cause.

Before any resumed mutation, obtain explicit approval of this baseline, then refresh permissions/inventory/host/gate state and classify any new differences:

1. **Hard stop:** unexplained changes to account identity/status, membership/invitation binding, table/bucket/row/object permissions, ownership/recipients, stored hashes/metadata/totals, resource presence, operator-key scopes/expiry, project/host/root, target IDs or signed preview inventory. Stop for dirty/uncertain writes, failed authoritative reads, unmanaged writers, receipt/confirmation failure or any action outside the approved disposable scope. Do not rebase such changes silently.
2. **Assess separately:** expected session activity and limiter additions/counters. Preserve pre-existing limiter rows; classify additions using known subjects/buckets without exposing HMAC material. An explicitly acknowledged signin with corresponding provider session/local proof, documented protocol session creation/revocation, or expected limiter traffic may be recorded as operational differences instead of restarting the whole protocol. They still require a recorded explanation and must not invalidate receipt freshness/target binding, preservation assertions or the final signed preview. Counts alone are neither approval nor evidence of compromise.
3. **Unexplained session/limiter differences:** record and seek operator review before accepting a new baseline. The presently unexplained earlier session removal can only be accepted as an explicit known limitation by baseline approval; it is not a precedent to ignore future changes. Unexpected successful authentication or evidence of unauthorized action stops the protocol for account-security review.
4. Take the final inventory under the actually held shared maintenance gate. Keep confirmed external clients inactive. Any preservation-relevant difference after that inventory, even otherwise routine activity, requires reconciliation and a fresh valid preview before deletion. An uncertain mutation outcome remains a durable blocker until independently reconciled.

Checks passed: GET-only inventory/hash refresh, comparisons against both prior snapshots, HMAC limiter classification, signed local authentication-record verification and private evidence parsing. Audit evidence unavailable: owner logs returned 404. Local request history unavailable by design. No application tests/lint/build rerun was needed for documentation/private read-only analysis; earlier results remain separate. Live deletion and key lifecycle checks remain unrun. Await explicit approval of the proposed baseline before resuming the previously authorized protocol. Overall beta readiness and backup/log erasure are not claimed.


## Live exit preflight — stopped on preservation drift (2026-10-13, IDs 137–139)

The user's unchanged live-protocol authorization remains recorded, but this attempt stopped before any mutation under the explicit material-discrepancy rule. No accounts, synthetic files or temporary key were created. No permissions, Cloud data, sessions or existing resources were changed; no account exit ran.

Fresh authoritative discovery identified active Stillroom/stillroom in NYC, five users, no Functions or Sites. All five enabled tables have empty permissions and rowSecurity=true. The single bucket still has empty permissions, fileSecurity=true, the approved 20 MiB maximum/extensions and encryption/antivirus settings. Current paginated SDK reads found files 2, totals 4, limits 84, invitations 3, members 3: **96 rows**, all with empty permissions, and the same two private storage objects. Downloaded SHA-256 hashes match both the preserved baseline hashes and the file-row digests. File metadata, totals, invitations, members and all five accounts' recorded non-session fields are unchanged.

**Unresolved drift:** the owner account now has two sessions rather than the baseline's three. The missing session was created 2026-10-12T23:56:01.387Z and its recorded expiry is in October 2027; ordinary expiry does not explain its absence. No new owner session was observed. The reads do not establish who or what revoked it. Two new private rate-limit rows, created 2026-10-13T12:42:21.623Z and 13:48:46.640Z with count 4 each, are also present; all pre-existing rate-limit rows are unchanged. These additions fit application limiter data but their initiating requests are not proven. Preserve both; neither is disposable. No baseline was silently replaced and no session will be recreated to force a match. Confirm the session removal was intentional/expected, or investigate it, before explicitly accepting a refreshed preservation baseline and resuming.

The current authoritative key list contains only the existing runtime key with its unchanged six scopes and no expiry; no temporary operator key exists for this attempt. Thus no new key required revocation and rejected-use testing is unrun. The first organization key-list read lacked organization context and returned 404 team_not_found; providing the verified organization context succeeded. The bucket read returned one UNAVAILABLE/mcp_network_error and succeeded on its one bounded retry. Neither was treated as permission evidence until its successful response.

Local prerequisite checks: all three retired-entry synthetic checks passed; fresh sanitized process inspection observed the same Next server family/listener and no retired script process. Default coordination contained only its host marker, with no dirty/operation/closing blocker. Existing writer-containment/drain evidence is preserved, not rerun as a live deletion check. The prior explicit user confirmation that external clients remain inactive is carried forward, separately from observable process evidence. No process was stopped and no blocker was cleared.

New ignored private evidence: account-exit-current-preflight.json, account-exit-preflight-drift.json, account-exit-preflight-permissions-current.json and account-exit-preflight-processes.json. The original preservation-baseline-prerequisites.json and preceding containment evidence remain preserved. Key secrets, passwords, file contents and session secrets were not copied into these reports or printed.

Passed: identity, fresh complete table/bucket/row/object permissions, account/file inventory, byte hashes, original resource comparison, current key list, retired-script checks and local marker/process inspection. **Blocked:** acceptance/reconciliation of the unexplained missing owner session. Unrun: provisioning, authenticated receipt, disposable sharing, deletion/holds/retries, post-deletion preservation/access denials and temporary-key creation/revocation. No application code changed, so lint/type/build and the full local suite were not rerun; their previous results remain historical. No backup/log erasure or beta-readiness claim is made.

Next phase is narrowly reconciling this drift and approving the refreshed preservation baseline; no resource-count/scope/deletion expansion is proposed. Wait for the user's go before resumption, then recheck current prerequisites. Public notices, deployment and broader beta-readiness work remain pending.


## Writer-containment remediation — completed locally (2026-10-13, IDs 133–135)

This section supersedes the three-script containment blocker in IDs 128–132. No application/service/gate implementation changed. No Cloud calls, resource changes, account exit, permission changes, key creation or deletion occurred. The earlier private preservation and permission evidence remains untouched and historical; this phase does not refresh Cloud state.

- Retired .private/apply-totals.mjs, .private/live-access.ts and .private/complete-access.ts. Each now contains only a clear retirement message and unsuccessful exit status, with no imports, credential reads, SDK initialization or mutation body. Flags cannot reactivate them. The completed migration points to ACCESS_MIGRATION.md for review; historical access protocols point to the supported access operator and access-control runbook; the future exit protocol uses maintenance.ts/account-exit.ts and this runbook. No executable caller of the old scripts was found in current app/lib/scripts/tests; documentation mentions are historical evidence. These ignored local stubs are not publication files; clean checkouts do not need those old scripts.
- Searched application routes/services, supported operator scripts, browser live tests and executable private helpers. App routes enter handle/operation; direct file/enrollment/suspension/rate-limit/receipt services use the existing coordinator; administrative SDK transport rejects uncoordinated writes. Account-exit preview/apply require the actually held maintenance epoch. setup/access/verify-provider use the same operation gate; direct live-query writes use coordinated clients/operations. Browser lifecycle writes go through application routes. preview-access and the private preservation reader are read-only Cloud paths; logging/browser fixtures use local synthetic traffic. No additional retained Cloud-mutation bypass was found in this source review. This is not proof against arbitrary scripts outside the checkout or future edits.
- Added tests/writer-entrypoints.test.ts and its provider-tripwire.ts child-process fixture. All three actual retirement stubs execute in a restricted synthetic context and return failure plus replacement guidance without provider/filesystem capabilities. If those ignored historical files are absent on another checkout, the corresponding local-artifact checks explicitly skip. Supported access/setup preview controls succeed outside maintenance; access --apply, setup --apply and verify-provider refuse while closing without reaching the trapped SDK or fetch boundary. Tests use synthetic credentials and isolated local roots. Existing suite also covers draining direct upload/share workers, dirty outcomes, recovery and actual-held-gate account-exit enforcement.
- Fresh sanitized process inspection found the current localhost:3000 Next development-server family and tooling; no running retired script or additional observed Stillroom writer. No process was terminated. The current server honored the default persistent host gate: unauthenticated request 401 before maintenance, 503 while closing, then 401 after release. The gate waited for an admitted synthetic operation and rejected new direct operations and the operator preview. Initial/final default closing, dirty and operation markers were absent. This probe made zero Cloud calls and did not overwrite the previous preservation inventory. Evidence is private in writer-containment-processes.json, writer-containment-process-classification.json and writer-containment-drain.json.

**External operator confirmation:** the user explicitly confirmed in this phase that separate SDK/CLI tools, Appwrite Console mutation activity, automation and other operator clients will remain inactive throughout the future live protocol. This is the user's confirmation, not process telemetry or a capability of the local gate. The gate protects cooperative writers on this one persistent host/root; it does not control external clients, another host, a different private-root override, restored historical code or an administrator acting outside the procedure. All future protocol runners must use this same root and the existing coordinator.

Validation: **31/31 local tests passed, zero skipped; ESLint and TypeScript passed.** The first sandbox test attempt failed on Windows realpath permissions and a dependent operator-control assertion; the approved elevated rerun passed all checks. Production build and browser UI checks were not rerun because application code/UI/configuration were unchanged. Existing live access-control and preservation evidence remains distinct from these synthetic and local-server checks. No new live authorization/deletion claims are made.

The existing two-account/three-file/one-hour six-scope temporary-key protocol can proceed without changing approved resources or deletion scope, **only after the user's next go and fresh pre-mutation permission/inventory/host/dirty-state reconciliation**. The preservation baseline is not a current Cloud freeze. Keep the confirmed external clients inactive, retained-record cleanup disabled and every pre-existing account/row/file outside the disposable scope. Temporary-key revocation and independent preservation checks remain required by the existing protocol. Overall beta readiness is not established.


## Prerequisite reconciliation — local drain passed; containment remains conditional (2026-10-13, IDs 128–130)

This phase performed read-only Cloud reconciliation and a reversible local maintenance probe only. The successful IDs 124–126 bucket/table/key permission evidence remains preserved; no live account-exit resource was provisioned and no Cloud data, account, key or permission was changed. Fresh connector discovery again identified the intended NYC Stillroom project and reported zero project Functions and Sites. Application source was unchanged.

### Totals and preservation baseline

The older three totals rows were the seeded account row and the two preserved access-protocol tester rows. The fourth row belongs to the existing recorded owner account, confirmed by stable-ID equality against the private owner inventory and current account/member rows. It was created at 2026-10-13T05:56:46.043Z; all its counters are zero and it currently owns no file rows. The upload service creates missing owner totals through ensureTotals, so normal application activity is a possible explanation, **not proof of the initiating request**. Its precise creation origin remains unknown. Preserve all four totals rows; the extra row is not disposable.

The fresh ignored baseline records all five accounts with status, verification state, pseudonymous email comparison and session identifiers; all 94 rows (files 2, totals 4, limits 82, invitations 3, members 3), their permissions and relationships; and both stored objects with metadata and SHA-256 hashes of downloaded bytes. Every row/object permission array is empty. Both hashes match their file-row digest; there are no orphan objects or metadata rows missing an object. The owner is active; both previous protocol testers remain disabled with zero sessions and their two files remain present. These are current readbacks, not fresh authentication tests.

The GET-only SDK probe makes 14 reads per inventory, uses complete limit-100/cursor pagination for accounts, rows and files, and disables row-list caching. All reads succeeded. Bytes were hashed in memory, not saved or printed. A second inventory was captured while actually holding the shared maintenance gate and matched the preceding accounts, rows and file metadata/hashes exactly. Preserve every recorded pre-existing account, row, relationship, session state and object hash during the future disposable protocol. No existing record is an inferred test target.

Private evidence: .private/preservation-baseline-prerequisites.json, .private/preservation-baseline-before-drain.json, .private/drain-evidence.json and sanitized writer-process inventories. These paths are ignored; git ls-files .private returns no entries. No credential values or downloaded content were written to these reports. Identifiers and relationships remain private; ignore rules do not prevent a deliberate forced Git add and do not establish filesystem ACLs or backup privacy. Prior permission/key evidence is separate and was not replaced by cached data.

### Writer and drain evidence

A privileged read-only process inventory found one Stillroom Next development-server family serving localhost:3000; other observed Node processes were classified as Codex/MCP tooling. No legacy operator script was observed running. No process was terminated. The server's behavior, rather than its launch command alone, demonstrated use of the same default persistent .private coordination directory on this host.

The local probe verified: an unauthenticated file request returned 401 before maintenance; a synthetic admitted operation held the gate; beginMaintenance created closing state and waited; the running server returned 503 while closing; a new direct operation was rejected; releasing the admitted operation allowed drain; and the preservation inventory was reread under the held gate. The same no-apply operator preview succeeded outside maintenance and failed during it. After ending only the probe's maintenance epoch, the request again returned 401 and closing/operation/dirty state was empty. No account-exit case or provider write was executed. The HTTP probe had no cookies and therefore did not enroll users or consume application rate-limit rows.

No durable dirty.json, operation.json, closing.json or operator.lock blocker was found before the probe; the final state is also clear. No uncertain-write record was cleared or overridden. Absence of such markers cannot prove the outcome of writes made by clients that bypass coordination.

Source inspection confirms coordinated application request handling, direct file/enrollment/suspension services, supported setup/access/provider-verification scripts and direct live-query test writes. The browser lifecycle test writes through application routes. However, three historical ignored scripts (.private/apply-totals.mjs, .private/live-access.ts, .private/complete-access.ts) still contain direct SDK mutation paths outside the common gate. They were not executed or altered. A trusted operator could still run these or a separate SDK/Console client; the single-host gate cannot intercept them. A different allowed private-root override would also create a distinct gate. Current checks demonstrate the running application and tested operator path, not universal distributed-writer containment.

**Required intervention before the live protocol:** explicitly retire those three historical scripts from executable use or add the existing coordination controls, verify every intended live runner uses the same persistent root/host, and ensure no separate Console/SDK/remote writer is active. No unmanaged running Stillroom writer was identified to stop. Recheck process/root/dirty state and current permissions/inventory immediately before the approved mutations. The preservation snapshot is complete for the observed project records and stored bytes, but is point-in-time evidence, not protection against external writers after maintenance reopens.

### Checks and next boundary

Passed: fresh project/service discovery, paginated provider reads, owner/totals reconciliation, unchanged account/file preservation readback, both file hashes, real-server maintenance denial, in-flight drain, direct-operation denial, operator preview control/denial, clean release and ignored/untracked evidence checks. Initially the private probe used top-level await unsupported by tsx's CommonJS output; wrapping its entry point fixed the local harness before any gate/provider action. Sandbox process inspection/preview checks were denied by the local environment and succeeded with approved elevated execution; these were environment-dependent checks, not Cloud authorization passes.

Skipped: application regression/build reruns (no application code changed), direct authenticated access/revocation tests, live exit/deletion/failure-retry protocol and new key/revocation tests. Existing historical results remain distinct. No temporary key was created; the last authoritative key inventory is the preceding permission retry, not a new key-list check in this phase.

The approved two-disposable-account/three-file/one-hour six-scope-key protocol needs no target or scope expansion, but **must not start until writer containment is resolved and the user gives go**. Retained-record cleanup remains disabled; all existing accounts/uploads are preserved. Overall private-beta readiness remains unestablished.


## Read-only permission retry — passed (2026-10-13, IDs 124–126)

This fresh retry resolves the permission-read failure in the preceding attempt; it does not execute or expand the approved live protocol. Authoritative connector discovery returned active project Stillroom, project ID stillroom, NYC region, organization stillroom, Free tier-0. The local checkout/root, main branch and expected GitHub origin match. Current bucket/table/row/file/key reads used this explicit project context, not cached snapshots.

| Fresh read | Complete observed scope / result |
| --- | --- |
| Bucket list | 1 bucket, stillroom: permissions empty, fileSecurity=true, enabled, maximumFileSize=20971520, exact approved extension list, compression=none, encryption/antivirus=true, transformations=false. |
| Table list | Exactly files, totals, limits, invitations, members; all table permissions empty and rowSecurity=true. |
| All table rows | files 2; totals 4; limits 82; invitations 3; members 3. All **94 rows** have empty permissions. |
| Storage file list | **2 objects**, both with empty permissions. Metadata only: no file bytes downloaded or hashes reverified in this phase. |
| Project key list | Exactly one existing Stillroom runtime key, no expiry specified, with sessions.write, users.read, rows.read, rows.write, files.read, files.write. No temporary key listed. Secrets were neither saved nor printed. This does not repeat rejected-use checks for historical revoked keys. |

Pagination used limit 100, deterministic ID ordering and cursorAfter continuation when a page is full; every current list ended on its first non-full page. Row requests explicitly disabled list caching with ttl=0. All lists completed; no sampling was used. No permission discrepancy was found. The four current totals rows differ from an older completed-protocol inventory of three: do not infer ownership or delete an extra row. Reconcile the current records with the preserved private baseline before any live mutation.

**Project identity and the current permission prerequisite are established.** This is a point-in-time permission snapshot, not a transactionally frozen inventory, proof of current worker containment, account final states or byte-level preservation. Every Cloud read in this retry succeeded on the first attempt. A two-attempt cap with a one-second delay was available for transient failures but was not exercised. No configured SDK/CLI fallback was necessary. Prior context internal_error and table UNAVAILABLE/mcp_network_error remain recorded as historical failures; these fresh successes suggest a transient connector/service failure, but its underlying cause is not proven.

A local evidence-save command initially exceeded the Windows process command-line limit (CreateProcessInSandbox error 206); no Cloud request failed. Reducing the saved table metadata to necessary identifiers/security fields resolved it. Detailed resource IDs and permission inventories are in ignored, untracked .private/account-exit-permission-retry.json; no account emails, file contents or key secrets were copied into that report. The prior partial snapshot remains preserved.

Remaining prerequisites for the already-authorized live protocol: verify the single persistent host and common gate for every writer; stop unmanaged writers; prove draining and reconcile any durable dirty/crash blockers; reconcile existing accounts, all four totals rows and resource/hash preservation baseline; then use only the previously approved two accounts/three files/one at-most-one-hour six-scope operator key and bounded deletion/hold/retry sequence. Recheck for drift immediately before mutation and revoke/verify the temporary key on every completion/failure path. Retained-record cleanup remains disabled.

No accounts, files, keys, permissions, provider settings or data were created, changed or deleted in this phase. No maintenance/writer mutation or live protocol step began. Application source was unchanged; no tests/build were rerun for documentation-only updates. Overall beta readiness is not established. Await the user's go before the next phase; the existing protocol authorization remains preserved.


## Live account-exit attempt — permission preflight blocked (2026-10-13, IDs 121–122)

The user approved the bounded live protocol subject to authoritative permission reads and writer/drain verification. The expected checkout/root, main branch and GitHub remote were confirmed; all existing uncommitted work remains preserved.

**Stopped before provisioning or deletion, as required.** Appwrite context discovery returned an internal error. A project-scoped storage_list_buckets read for project stillroom succeeded: exactly one Stillroom bucket, ID stillroom, empty permissions, fileSecurity enabled, enabled=true, maximumFileSize=20971520, the approved extensions, compression=none, encryption/antivirus enabled and transformations disabled. This is fresh bucket evidence; it does not establish per-object permissions, actual stored-byte inventory, current project region/plan or user/key state. The next authoritative tables_db_list_tables request for database stillroom failed with UNAVAILABLE / mcp_network_error, message Connection failed, at the Appwrite MCP service. No further Cloud requests or mutations followed that failed prerequisite.

Passed: checkout identity and fresh bucket configuration read. Blocked: full table permission read and current project-context reconciliation. Unrun: row/object permission inventory, writer/drain reconciliation, disposable resources, authenticated receipt, deletion/hold/retry protocol, independent preservation hashes, direct-access denials and key-list/rejected-key verification. No key was created in this attempt, so no new key needed revocation; existing key state was not freshly verified. No accounts, files, permissions, provider settings or existing evidence were changed, and no communications were sent. Prior local 27-test/build/browser/logging evidence and earlier live access-control evidence remain historical, not substituted for this preflight.

Private read-result snapshot: .private/account-exit-live-preflight.json (ignored and untracked). Retained-record cleanup remains disabled. No application source change or test rerun was needed for this documentation-only outcome. The smallest next phase is a read-only connectivity/permission preflight retry; no scopes, resources or deletion boundaries need expansion. Wait for the user's go before resuming. Overall beta readiness is not established.


**Historical local prerequisite summary: permission reads subsequently passed; current writer-containment status is recorded above.** Server-issued receipts and a held single-host maintenance gate replace the old operator authentication/drain attestations. See VERIFICATION.md for current local evidence and ACCOUNT_EXIT_PREPARATION.md for the bounded future Cloud protocol.

Prepared 2026-10-13. This paragraph describes the historical local-only phase; the later bounded live protocol and its mutations are recorded above. This document does not activate a deletion deadline. Existing owner/protocol accounts and uploads must remain preserved.

## Approved scope and policy boundary

- Remove the exiting user's owned uploads and metadata, after revoking every recipient's access to those files. Remove their recipient references from other owners' files without deleting those files or altering those owners' totals.
- Revoke sessions, invalidate membership/invitation access, then remove totals, account and member row after owned resources and share references are confirmed gone. Downloaded copies cannot be recalled.
- Keep only the minimum revoked invitation record needed to prevent reuse during this beta. Fresh re-entry requires new operator approval, not an automatic blacklist expiry or silent invitation overwrite.
- Review justified exceptions every **30 days**: document reason, minimum necessary data and next review. Correspondence retention remains separately 90 days after closure, with its existing exceptions.
- Planned shutdown proposal: individual email plus an in-app notice and 30 days for individual downloads. No bulk export, guaranteed emergency notice, or effective public deletion/shutdown deadline. No communications or notices were implemented/sent in this phase.

## Minimum denial record

Existing `invitations` columns are all required. Reuse the original email-derived row ID and retain `state="revoked"`, `email=""`, `accountId=""`, empty permissions, plus provider-managed row metadata. The deterministic row ID remains pseudonymous personal data; it is **not** a keyed fingerprint or proof of anonymity. No extra table, key, profile, permanent blacklist, file content, completion-date column or account-ID field is retained in the denial payload. Existing signup/enrollment checks reject a revoked row; the normal operator invite command refuses duplicates.

**Approved policy trigger; cleanup remains disabled pending separate implementation/execution authorization:** after beta shutdown cleanup is verified and all admission paths are permanently closed. For approved earlier re-entry, separately review and deliberately replace only the revoked invitation with a fresh pending invitation; preserve verified-email binding and never backfill terms acceptance. No re-entry or tombstone-deletion command is added here.

The private execution inventory necessarily contains pseudonymous IDs, record hashes, session IDs and stages until cleanup is verified; it is not the long-term denial record. Proposed minimization: remove request/plan/journal once completion has been independently verified and any specifically justified audit need ends; keep only minimal case disposition in the correspondence record under its separate schedule. The exact completed-case cleanup trigger is approved in NOTICE_DECISIONS.md; implementation/execution remains separately gated. No existing evidence files were deleted.

## Authenticated request and private records

The workspace's **Request account exit** dialog records a request for manual review. It performs no deletion and sends no email. The requester confirms scope, signs in again if needed, and contacts the approved operator with the non-secret case reference. No receipt signature, session secret or password is returned, put in a URL, logged or persisted by browser code.

The server derives the account from the session. It requires verified active membership, a current Appwrite email/password session created within 10 minutes, and a signed local proof written only after this application's successful password sign-in. Cookie/page refresh and administrative session creation do not establish that proof. A receipt expires for initial use after 24 hours. Before execution it rechecks stable identity, membership and that exact session; email changes, missing sessions, cancellation, target mismatch, tampering and expiry stop initial approval. This proves control of a fresh authenticated session, not legal identity or protection against a stolen fresh session. Provider session-field behavior passed the bounded live test recorded above.

One outstanding case per account is retained. A repeat request retrieves that case rather than issuing another authorization. Cancellation is available through the dialog before claim while normal requests are admitted; during maintenance contact the operator to halt review. After claim, cancellation cannot undo completed removal. The receipt is claimed atomically under the gate for its case, original digest and maintenance epoch. Signed-journal retries remain possible after session revocation/expiry; a different case or epoch cannot reuse it.

Server-only records are under ignored .private/authentication and .private/exits/CASE_ID. Receipt/state signatures use the existing RATE_LIMIT_SECRET with separate purposes. Authentication proofs contain account/session IDs and provider creation time, never passwords or session secrets. Receipts also contain timestamps, environment and an identity HMAC. Plans contain resource IDs/hashes and holds; completed journals retain retry evidence. None is a public acceptance record. Do not rotate the signing secret during an unfinished case.

The operator independently matches the request's stable account ID to the reviewed inventory and puts only hold selections in **holds.json**:

```json
{ "heldFileIds": [], "accountHold": false }
```

Specific hold reasons, minimum retained data, responsible operator and the next 30-day review belong in restricted case notes. Account holds do not preserve every upload. The old request.json authentication boolean/timestamp is not used.

## Single-host maintenance and preview

All processes must run this instrumented build from the same canonical checkout and persistent private directory on **one host**. Production requires STILLROOM_COORDINATION_MODE=single-host. STILLROOM_PRIVATE_ROOT, if used, must be the same canonical descendant of .private for every app/operator process; test runners use isolated descendants. Different hosts, serverless/ephemeral workers, separate roots, old builds and unmanaged key/Console writers are unsupported. A hostname/mode check rejects known mismatches; it cannot discover an undisclosed second deployment. Confirm no such writer exists before live work. Direct Appwrite registration/authentication remains outside this gate.

Request handlers (including GET limiter/enrollment writes), workspace enrollment, upload/share/delete services, suspension and mutating operator scripts share an atomic filesystem lock. An admitted operation keeps it through completion. Maintenance first persists a closing marker, blocks new work before and after lock acquisition, then waits up to 30 seconds for the held operation. Timeout leaves closing in place; run drain later. New writes receive 503. Local sign-out clears the cookie even when provider revocation cannot run during maintenance. Whole-operation serialization is an intentional single-host beta throughput limit.

These commands are reference instructions, not current Cloud authorization. Credentials belong only in an approved local environment, never arguments/output/chat.

```powershell
node --conditions=react-server --import tsx scripts/maintenance.ts status
node --conditions=react-server --import tsx scripts/maintenance.ts begin
# If begin timed out, inspect status and reconcile blockers before:
node --conditions=react-server --import tsx scripts/maintenance.ts drain
node --conditions=react-server --import tsx scripts/account-exit.ts preview CASE_ID
```

Preview reads provider state under the held gate and writes a signed exact inventory with the maintenance epoch. Review the private target, environment, ownership, recipient references, totals, invitations, sessions, storage fingerprints and holds. Output contains counts and a digest. The closing marker remains across CLI invocations, so normal writers cannot run between preview and apply. No arguments to account-exit prints guidance without provider calls.

For an unclaimed stale preview only, preview CASE_ID --replace OLD_DIGEST requires the matching old signed digest, preserves the old preview privately, then writes the newly reviewed inventory. Claimed cases cannot be replaced. Initial receipt expiry still applies. Never hand-edit signatures, replace a journal, or restore bypass permissions.

## Explicit execution, holds and recovery

```powershell
node --conditions=react-server --import tsx scripts/account-exit.ts apply CASE_ID --confirm REVIEW_DIGEST --target STABLE_ACCOUNT_ID
```

The legacy --workers-drained flag rejects. Execution needs the actual held gate, matching epoch/environment/receipt/target, exact inventory and signed progress. Restrict membership/invitation, disable the account and revoke sessions; remove recipient references and mark all owned files deleting before erasing any bytes. Other owners' files/totals remain intact. Confirm each storage/metadata/account deletion and persist progress. Missing already-removed resources are retryable; unexpected changes stop for review. Holds prevent completion. No provider backup or recipient-download erasure is claimed.

To release a justified hold, update only its reviewed selections in holds.json and run release-holds CASE_ID. This local-only revision cannot add holds/resources or change the target. It prints a new digest for review before retrying apply. Keep maintenance closed throughout unfinished restrictions, cleanup or holds.

Every guarded non-GET SDK dispatch writes a durable in-flight marker before dispatch. Confirmed success or a known rejected 4xx result clears it. Network/unknown/server failures leave it dirty even when a service catches the error. Subsequent operations and maintenance execution fail closed. Crash locks never expire automatically. A provider timeout does not cancel accepted remote work.

**Recovery is deliberate, not automatic:** keep closing set; inspect the private lock's host/PID/start time and prove the originating process and any child workers have stopped. Reconcile actual provider transactions, pending/deleting rows, object IDs/hashes, shares and account/session state with the private inventory before deciding no write can still finish. Preserve the old lock/dirty records and reconciliation evidence privately. Only after this readback and operator review may those exact stale markers be archived out of their active names. Do not clear them merely because the PID died or a timeout elapsed. If the affected operation cannot be identified/reconciled, remain closed and escalate. This phase supplies no force-unlock or automatic dirty-clear command. Disk rollback, lost private storage or restored Cloud data also requires reconciliation; filesystem locks are not a distributed fence.

Once completion readback and independent review pass:

```powershell
node --conditions=react-server --import tsx scripts/maintenance.ts end MAINTENANCE_EPOCH
```

End requires the current epoch, a clean gate and complete signed journals for claimed plans. An unclaimed/cancelled preview may be abandoned without deleting data; ending maintenance invalidates its old epoch, so a later attempt needs a fresh preview. Known non-mutating errors release the operation lock safely; closing remains until this explicit command. Successful deletion has no undo.

## Disabled cleanup and publication safeguards

cleanup-preview CASE_ID reports the disabled policy and makes no provider calls. No destructive completed-case, revoked-invitation, authentication-proof or expired-limit cleanup is enabled. Proposed triggers remain: independently verified completion + closure + no justified hold for temporary records; verified shutdown cleanup + permanently closed admission for revoked invitations/minimal reconciliation records; elapsed counter expiry for bounded global limit cleanup. Exact authentication-proof cleanup should follow verified session revocation/expiry and absence of unfinished receipt references. The invitation/completed-case/hold triggers are approved policy in NOTICE_DECISIONS.md; implementation/execution and the separate expired-limit cleanup scope remain unapproved. None is a new legal retention period. Missing or revoked invitations deny enrollment, but deleting a denial record would remove the duplicate barrier to a later explicit operator invite. Never restore membership or legacy grants during cleanup.

.private and environment files are ignored/untracked; Next server tracing explicitly excludes them and browser code does not import receipt/gate secrets. This does not prevent an operator force-adding files or an unsafe external packaging process. Windows mode flags alone do not establish private ACLs. Protect the persistent directory with OS access controls and review publication candidates. Keep correspondence retention separate. No snapshot, account, upload or prior protocol evidence was deleted by this local phase.

## Provider limits and remaining verification

Official guidance checked during policy preparation: [Appwrite backups](https://appwrite.io/docs/advanced/security/backups) distinguishes paid self-managed backups from internal database disaster recovery; [audit logs](https://appwrite.io/docs/advanced/security/audit-logs) describes one-hour Free audit retention. Neither proves this project's Storage/auth/internal-log erasure timing. The procedure removes active API resources only. Project-specific backup/log coverage, restore handling and external host/mail retention remain unverified.

Proposed separate operator scopes: `users.read`, `users.write`, `rows.read`, `rows.write`, `files.read`, `files.write`. These cover inventory, disable/session/account removal, private row edits/deletion and object metadata/removal. No runtime scope changes, schema changes or extra indexes are required. The bounded live protocol verified these scopes and required empty-string writes; its temporary key was revoked and rejected on use. Future keys and destructive operations require their own authorization.

## Historical approved live-verification scope — completed, see evidence above

Use **two new disposable verified accounts**, A (exiting) and B (control), not the preserved owner/protocol accounts. Create their two invitations/member bindings and three synthetic tiny text uploads: two owned by A and shared with B; one owned by B and shared with A. Use one A-owned file as a specifically held item. Preserve original hashes privately. No real-user files or correspondence.

- Authenticate A's exit request without administrative identity substitution; preview/review exact resources. Deliberately change a harmless share state to prove stale-plan rejection, then prepare a fresh reviewed plan.
- Apply restriction/removal under the enforced drained maintenance gate. Check B cannot read either A file through app or direct Appwrite; A's old sessions are rejected; B's own file/hash and account remain intact. One held A file remains stored but inaccessible and account deletion incomplete.
- Release the hold through documented review and new digest, finish active-resource deletion, then repeat apply. Verify A's storage/metadata/totals/member/account absent, revoked invitation minimized/private, and B's file/hash/account preserved without A in recipients. Verify invitation reuse is denied; direct registration remains a separate provider-abuse boundary, not solved here.
- Local tests already cover injected lost responses and service errors; any live failure injection needs a separately bounded mechanism, not provider-wide disruption. No broad outage test is implied.
- Revoke any temporary operator key and verify list absence plus rejected use, including failure paths. B remains disabled/suspended/sessionless with its control file preserved unless a different final state is expressly approved. A's synthetic account/files are the only permanent deletions proposed. Extra registration/re-entry resources are not included without revised approval.

No such resources/key were created or actions executed now. Unpublished notices and proposed 30-day periods remain conditional until live verification and policy wording approval.
