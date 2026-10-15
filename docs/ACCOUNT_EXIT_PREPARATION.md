# Live account-exit prerequisites and approval proposal

## Local prerequisite completion — 2026-10-13 (IDs 112–119 and continuation)

Local-only implementation replaces operator-entered request authentication and the drain flag with server-issued, purpose-signed receipts and an enforced single-host gate. Password sign-in proof plus current-session readback, 10-minute freshness, 24-hour initial validity, stable target/identity, cancellation, claim/digest/epoch binding and signed retries are implemented. Application handlers, GET side effects, page enrollment, mutation services and known operator writers participate. Unknown provider outcomes remain dirty across requests/restarts; no automatic force-unlock exists. No Cloud resources, credentials, accounts, uploads or permissions changed in this phase.

Revoked-invitation, completed-case, proof and expired-limit destructive cleanup remains disabled pending approval of the documented triggers. Retry records and holds remain private. See ACCOUNT_EXIT.md for current commands; the earlier review below is historical evidence, not current instructions.


2026-10-13. **Preparation only; live execution is blocked.** This review supersedes any suggestion that the current `--workers-drained` flag and operator-entered request record are sufficient for live deletion. No application code, Cloud resource, account, file, key or permission was changed. Documentation and an ignored source-hash baseline were written locally.

## Resolved observations

- Checkout/root: canonical Stillroom checkout, main, expected GitHub origin. Existing uncommitted implementation preserved; applicable root AGENTS.md and installed ECC security-review guidance reviewed.
- Current connector context: project Stillroom / `stillroom`, NYC, active, Free (`tier-0`); one database, one bucket, five users, no Functions or Sites. These counts do not establish individual account states.
- Current tables: files, totals, limits, invitations, members; empty table permissions and row security enabled. Invitation columns email/state/accountId and member columns email/state are required and available. No new schema needed for the proposed single-host prerequisites.
- Current key list: only Stillroom runtime, scopes sessions.write, users.read, rows.read, rows.write, files.read, files.write. No temporary operator key is currently listed. Key secrets were not output. The organization-key-list attempt failed; the project-key-list read succeeded.
- Local non-secret settings match localhost:3000 and NYC endpoint/project/database/bucket `stillroom`. Bucket-detail connector calls failed twice; object permissions and bucket limits were **not freshly reverified**. Prior evidence remains historical. Preflight must resolve that read failure and inspect actual rows/objects before live mutation.
- Prior 19 local tests are useful for sequential state/failure handling. They do not test concurrent application writers, session-derived exit requests, real provider deletion or receipt replay.

## 1. Authenticated request: current gap and smallest proposal

`lib/appwrite.ts:session()` validates the HttpOnly session through Appwrite Account.get, derives stable `$id`, checks verified email and membership. Origin checks, body bounds and rate limits already exist. None of these is called to authenticate the human who produces the CLI `request.json`. `previewExit()` only trusts its boolean/timestamp and rechecks the account's stored identity. A signed plan proves integrity after that step, not that the user requested deletion.

**Proposed local implementation:** one authenticated confirmation screen/action and a server-generated private receipt; no automatic deletion endpoint or mail verification flow.

1. User signs in through existing email/password UI and explicitly requests account exit with a short statement of scope. The POST accepts confirmation only, never a caller-supplied target ID/email. Apply existing Origin/CSRF, body bounds and rate limits.
2. Server derives account ID from the session, checks verified active membership, and checks the current provider session's creation time/identity. Proposed freshness: session created within **10 minutes**; otherwise ask for sign-out/sign-in. Reject impersonation/admin substitution. This is evidence of account-session control, not legal identity verification or proof against a stolen fresh session. No password, cookie or token is requested in support correspondence.
3. Server writes an immutable, purpose-signed receipt to the common ignored private root: receipt version, random request ID, stable account ID, provider session ID (not secret), request time, scope version, environment identity and expiry. Display a non-secret case reference to the user; do not return a bearer authorization token or put it in a URL/log.
4. Proposed initial authorization window: **24 hours**. CLI loads/verifies the original server receipt, matches provider identity/session and scope, and binds it to the reviewed inventory. Operator-entered `authenticated: true` can no longer authorize a new case. Expired, cancelled, tampered or reused receipts reject before mutation; cancellation before first execution must be supported in the private case workflow. Receipt is atomically claimed for one case before restrictions; retries use that already-approved case despite session revocation, never open a fresh deletion authorization.
5. Hold IDs/reasons are separate operator decisions, not fields the requester can use to redirect deletion. Server time and stable ID govern; email changes or account replacement trigger review. A suspended/unverified/mismatched identity requires a separately defined recovery path rather than weakening checks.

The 10-minute/24-hour values are proposed safeguards requiring approval, not retention periods or public deletion deadlines. Existing functionality supplies identity validation and sign-in; receipt issuance, recency checking, single-use/cancellation state and CLI enforcement need implementation. No additional runtime scopes are proposed: current-session reads use the user's session. Current SDK includes Account.getSession; confirm provider response fields during the later test. [Official Account reference](https://appwrite.io/docs/references/cloud/server-nodejs/account).

## 2. Retained records and concrete cleanup triggers

**Source result:** absent invitation -> denial, not automatic creation. `invitation()` rejects 404/non-invited states; `enroll()` requires a matching pending invitation and empty binding. `scripts/access.ts invite` explicitly creates a pending invitation and rejects duplicates. Deleting a revoked invitation cannot by itself reactivate it, but it removes the duplicate barrier for a later explicit operator invite. An existing active member would still be active regardless of that deletion, so the cleanup precondition must prove account/member/owned-resource/share cleanup first. No live cleanup/re-entry experiment was performed.

| Record | Minimum necessary state and proposed cleanup trigger |
| --- | --- |
| Revoked invitation during beta | Existing email-derived row ID; `state=revoked`, empty email/accountId and permissions, provider-required system fields. This is pseudonymous, not anonymous. No permanent blacklist. Delete only after verified beta shutdown cleanup **and admission permanently closed**, or deliberately replace for explicitly approved fresh re-entry with no restored membership or old sessions. |
| Temporary receipt / plan / progress | Stable target ID, private affected resource/session IDs, hashes, hold references and retry stages are necessary until completion readback. Never retain passwords, session secrets or file bytes here. At independent completion verification plus case closure and no justified hold, remove full receipt/plan/progress/temp copies; retain only minimal case disposition under the separate approved correspondence policy. No fixed new retention period is invented. |
| Minimal completed-exit reconciliation record | Proposed private record: revoked invitation lookup ID, completion timestamp and completed status, with non-sensitive case reference if needed. No profile, file names/content, session IDs or full resource list. Keep until the shutdown/admission-closure trigger (or separately reviewed re-entry); use it to check restored admission records. If restoration needs more evidence than this, stop and review rather than silently retaining full inventories forever. |
| Justified hold | Specific record/file IDs, documented reason, minimum necessary evidence, next review and responsible operator. Review every **30 days**, as approved. Delete/release when the reason ends and complete remaining cleanup; preserve retry state until that is independently verified. A hold is not blanket permission to retain every upload/profile. |
| Correspondence | Existing 90-days-after-closure rule and documented exceptions remain unchanged; do not start closure timer while unresolved. No duplication of private file contents into the mailbox. |
| Other references | Owned rows/objects, totals/member and incoming recipient IDs removed by exit. Rate-limit IDs are HMAC-derived and not enumerable by user after the fact; their logical expiry is not physical deletion. Proposed bounded global expiry cleanup removes only rows whose expiry has passed, under coordination, never all users' live counters. This separate cleanup needs local implementation and explicit live approval; do not describe current exit as erasing all related data. |

Backup restore/replay is a separate reactivation path: keep admission closed while reconciling restored accounts, invitations/members and file references against completed exits. Never restore old bindings or grants wholesale. These triggers and minimal reconciliation fields require operator approval. No tombstone, evidence or rate-limit row was deleted in this preparation.

## 3. Worker coordination: concrete open paths

| Path | Why existing controls are insufficient |
| --- | --- |
| Upload: `lib/files.ts:upload` | Membership is checked before totals/pending-row creation and before a separate storage write/transaction. An already-admitted upload can resume after exit inventory or deletion, leaving metadata/bytes after account removal. |
| Share/rename: `mutate` | Eligibility is checked outside the transaction. A paused share request can re-add an exiting recipient after restriction, or overwrite the deletion procedure's nontransactional share cleanup. |
| File delete | Multi-stage row/storage/totals operations can race operator cleanup; rechecks are not a drain mechanism. |
| Auth and apparently read-only routes | Signup/session creation and verification write provider state; `session()`/workspace page may enroll; GET routes create/increment rate-limit rows. Checking HTTP verb alone misses writers. |
| Operator scripts / recovery | access, setup and verify-provider plus manual recovery can write using server credentials. Existing `.private/exits/operator.lock` is consulted only by exit CLIs. |
| Direct provider clients | Empty row/object grants deny ordinary direct file writes, subject to fresh readback. Direct account/session/email changes remain possible; app maintenance cannot stop all provider authentication traffic. API-key/Console writers can bypass any local gate. |

The current signed preflight catches earlier drift but cannot prevent changes after its reads. Tests are sequential mocks, so their passes do not close these races.

**Smallest proposed enforcement for this checkout: a single-host, shared-filesystem maintenance gate.** It is not a multi-host deployment solution.

- All participating workers and CLIs use one canonical ignored private gate directory. Use an atomic cross-process exclusive operation lock around entire provider-operation units, including enrollment/rate-limit side effects, upload body/read/write completion and service calls. Nested helpers reuse the same scope. Reject/briefly defer competing app requests rather than implementing a distributed queue; the serialization cost is acceptable only if approved for this small local beta.
- Maintenance controller persists a closing marker first. New work checks before **and after** taking the operation lock, so a queued old request cannot slip through. Existing admitted work retains its lock until provider requests finish; operator waits for it, then holds the same exclusive lock from authoritative preview through final verification. A provisional preview before drain is informational only and cannot authorize deletion.
- Gate must wrap `lib/http.ts:handle`, the workspace server-page enrollment path, and all mutating operator scripts/service entry paths. Include signup/sign-in/verification, limiter writes on GETs, recovery and new exit-request issuance. During maintenance, affected requests return a fixed 503 before provider writes. Permit local cookie clearing/sign-out without provider writes; resume provider revocation later. No silent fallback if shared private storage is missing/unwritable.
- Exceptions, crashes or uncertain SDK outcomes must not masquerade as successful drain. Keep durable dirty/in-flight state; never auto-expire a stale lock. Require ownership/PID and provider-state reconciliation before clearing it. Node process death or a timeout does not cancel an accepted provider storage write. Exit remains blocked while any operation outcome is uncertain.
- Exit requires an actual held gate capability/epoch, not the `--workers-drained` boolean. Keep maintenance closed across failure/hold; resumption revalidates inventory. Release only after explicit operator verification, never in an unconditional finally after failure. Application restarts must see the persistent marker and remain closed.
- No other host/copy/old build may retain an active writer credential during verification. Verify participating processes/builds before the test. If an uninstrumented writer cannot be excluded, this local proposal is insufficient: stop for a separate provider-side credential/ingress containment plan. Console/API-key administrators remain a trusted boundary; do not claim a filesystem gate revokes their power.
- Ordinary direct Appwrite account registration is an unresolved abuse path, not a file authorization bypass. Disable/revoke the exiting account before deletion; re-read stable identity and authorization state. Direct account changes before disable force review, not target substitution. Test old-session rejection and direct metadata/object requests; do not promise to stop every uninvited provider account creation.

**No path was closed in code in this preparation**, because application changes require approval. Do not run live deletion with the existing implementation.

## 4. Smallest concrete local implementation scope for approval

- New `lib/exit-request.ts`, `app/api/account-exit/request/route.ts` and a small workspace confirmation component/link: fresh-session request, signed private receipt, cancellation before claim and single-use lifecycle. Reuse existing forms/styles/auth/body/CSRF/logger. No email or auto-deletion.
- New `lib/maintenance.ts` and `scripts/maintenance.ts`: persistent shared gate, cross-process drain, dirty/crash recovery and receipt claim coordination. Integrate `lib/http.ts`, `app/page.tsx`, `lib/appwrite.ts`, `lib/files.ts`, `lib/membership.ts`, `lib/suspension.ts` and relevant scripts (`account-exit`, `access`, `setup`, `verify-provider`) so every known provider writer participates. Document direct Console/old-build boundary and abort conditions.
- Update `lib/account-exit.ts` and `scripts/account-exit.ts`: reject fabricated request booleans; consume verified receipt; require gate ownership; sign preview under drain; distinguish retained records from cleanup-complete state. Add preview-only cleanup inventory and guarded cleanup for receipt/denial/expired-limit proposals only after their triggers are approved; no live cleanup now.
- Add local receipt, concurrency, crash/retry and missing/revoked-invitation cleanup tests. Two worker processes must race a paused upload/share against maintenance: either operation completes before preview or is rejected, and no write occurs while deletion owns the gate. Test GET/enrollment/limiter and operator-script bypasses, restart into maintenance, lost responses/dirty lock, request replay/expiry/tampering/target mismatch, cancellation and both absent/revoked invitation denial. Run tests/lint/types/build and relevant confirmation UI accessibility checks.
- Update ACCOUNT_EXIT, BETA_OPERATIONS, BETA_READINESS and VERIFICATION; keep notices unpublished. No dependencies, Cloud resources, keys, acceptance records or global changes are needed for this local phase.

## 5. Exact later live protocol — not authorized by local approval

### Resources and immutable boundaries

Two **new disposable** accounts A (exit target) and B (control), two specifically approved invitations, their member/totals records and sessions. Synthetic emails/passwords stay private. For no-email testing, separately approve administrative email-verification flags for **these test accounts only**; they then sign in normally and submit requests through the actual receipt endpoint. This proves account-session control, not real mailbox delivery or human identity. Do not impersonate A with an admin-minted session for request verification.

Exactly three tiny UTF-8 text files:

| File | Owner / sharing | Intermediate and final result |
| --- | --- | --- |
| A1 | A, shared with B | B revoked before deletion; bytes and metadata deleted. |
| A2 | A, shared with B; deliberate documented test hold | Inaccessible but preserved during hold; deleted only after explicit hold release/new digest. |
| B1 | B, shared with A | Only A's recipient reference removed; B's bytes/hash/metadata/totals preserved. |

No existing owner/protocol account, file, grant or credential may be changed. The baseline must privately inventory existing resource IDs/states/hashes without printing secrets, then assert the test's IDs are new and disjoint. No broad `suspend(B)` sweep over unrelated files: finalize B with a **targeted** disable, session revocation and B-member suspension. Existing suspension scans/re-writes all file rows, so it is outside this narrow cleanup boundary.

### Sequence and evidence

1. Resolve bucket read failure; privately read row/object permissions and selected final account states, baseline totals and only-runtime key list. Verify Free, project/region/schema and build/gate identity. Stop on material drift. Create exactly the approved disposable resources; save IDs, original hashes and final-state intent in ignored inventory.
2. Prove fabricated/expired/wrong-account/replayed receipts reject locally and against the new endpoint without creating extra accounts/files. A signs in freshly and submits scope confirmation. Bind receipt to A's stable ID. Operator independently matches A to private inventory; explicitly confirms signed plan digest, environment and target. Deliberate harmless share-state drift must invalidate a provisional plan; authoritative preview is regenerated only after gate drain.
3. Hold an A upload completion or share operation at a deterministic application boundary during setup using the same three files; request maintenance. It must wait for completion or reject new work, never declare drain while a provider call is pending. Attempts during maintenance must create no rows/files/shares/limit records. No extra uploads are admitted just to test rejection. No provider-wide outage or permission change is proposed.
4. Authoritative signed preview under the gate; restrict A, sessions and A-owned sharing. Test a controlled local interruption after confirmed A1 storage deletion but before its metadata step. Stop/resume with signed journal, maintenance still closed, and fresh Cloud readback. The private harness may stop at a selected step; never print SDK payloads or simulate a passing provider response. Then cleanup A1; A2 hold keeps account deletion incomplete.
5. Release only A2's test hold after reviewed local evidence and new digest. Finish deletion and repeat apply. Verify A account/member/totals/owned rows/objects absent, incoming shares removed, revoked invitation fields minimal/private; B1 matches original hash. Check A's old session rejected and B's direct requests cannot read deleted/held A data or regrant it. A missing invitation also denies enrollment in local tests; do not delete a live revoked invitation merely to demonstrate a cleanup trigger that has not occurred.
6. While maintenance remains closed, use a narrowly scoped **read-only diagnostic path** to exercise the real authorization/content service with already-established A/B sessions and no limiter/enrollment writes, or wait for safe explicit release after final cleanup. A generic maintenance 503 is not evidence of authorization denial. Confirm normal B access after reopening, then perform only targeted B disable/member suspension/session revocation. Preserve B1 and B's invitation/totals/account. Existing resources must match baseline; no bulk cleanup.
7. Independently verify key revocation and final states; save only necessary private evidence, report partial outcomes honestly. No deadline/public notice is activated by passing this protocol alone.

Read-only maintenance diagnostics need local implementation/tests or a revised approved verification method; they must not introduce a public bypass or new write route. Test-only pauses must be private runner instrumentation, not unguarded runtime debug endpoints.

### Operator key: six scopes, no broader scopes

| Scope | Necessary calls in the standalone inventory/removal verifier |
| --- | --- |
| users.read | Read stable user identity/status and session inventory/readback. |
| users.write | Create/verify disposable users if approved; disable, revoke their sessions and delete A. |
| rows.read | Inventory and read back files, totals, invitations and members. |
| rows.write | Create test invitation/member state; revoke sharing, minimize invitation and delete target rows. |
| files.read | Read object metadata/hash evidence and prove absence/preserved B1 bytes. |
| files.write | Create synthetic objects through approved app setup and delete A objects during exit; standalone deletion requires this even if upload uses runtime. |

All six are used by this standalone procedure; a read-only preview needs only the three read scopes. Fewer scopes for the full test would require delegating privileged work to the connector/runtime and would not reduce total authority. No keys.write, schema, bucket, deployment or runtime-scope expansion. Session creation uses existing app auth; operator session inventory/revocation uses Users APIs. Scope mapping follows current official [Users reference](https://appwrite.io/docs/references/cloud/server-rest/users), [Appwrite scope catalogue](https://appwrite.io/docs/partners/apps/scopes) and installed SDK, with earlier live session-revocation evidence; exact deletion behavior remains to test. Do not broaden permissions to overcome a failure without revised approval.

Key expiry must be at most **one hour from creation**, preferably 55 minutes to allow cleanup. Record its non-secret ID/expiry privately **before** any test mutation. No secret in terminal arguments/output, browser, publication files or Git. Wrap test work in cleanup/finally revocation through the independent Console connector; the test key must not manage itself. After success/failure, confirm key-list absence and 401 on a harmless read using the revoked key. If interrupted, first inspect/revoke the known key and constrain disposable accounts through authorized targeted cleanup; do not create a replacement automatically. If connector/revocation is unavailable, report incomplete, rely only on the expiration upper bound and verify revocation/expiry rejection on resumption. Expiry alone is not a completed explicit-revocation check. Never claim completion with an active key.

### Precise future Cloud approval required

Create one temporary six-scope key; two new disposable users (and test-only verification flags), two invitation bindings/member records, two totals records, the app's bounded test rate-limit rows, three objects/file rows and their sharing/session state. Modify only those resources for stale-preview, hold, restriction and cleanup tests. Permanently delete A, its two files/metadata, totals/member and sessions; retain its minimized revoked invitation. Targetedly disable/suspend/session-revoke B while preserving B1/account/totals/invitation. Revoke the temporary key and verify it. No live denial-record deletion, expired-limit bulk cleanup, new table/index/bucket, paid upgrade, existing runtime-key rotation or existing-account mutation is included. Local gate/receipt writes are private filesystem work, not Cloud schema additions.

## Historical local implementation approval proposal (now implemented)

Approve **local prerequisite implementation only** as listed in section 4, with proposed 10-minute session freshness, 24-hour initial receipt window, single-host shared gate, cleanup triggers in section 2 and mocked/concurrent verification. Continue to prohibit Cloud mutations and live deletion. After this passes, review the concrete two-account/three-file protocol again before authorizing its exact Cloud effects. If multi-host deployment or different receipt/retention choices are intended, revise this proposal first.

Remaining operator decisions: cleanup triggers are unapproved. Freshness windows and single-host maintenance/serialization were approved and implemented locally. The existing 30-day justified-hold review is unchanged. Public deletion/shutdown deadlines remain unpublished. No additional policy assumptions are treated as approval.
