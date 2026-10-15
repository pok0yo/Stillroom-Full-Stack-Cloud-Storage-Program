# Expired rate-limit review — local implementation, 2026-10-14

Local implementation and synthetic verification are complete. A separately authorized one-row live test passed on 2026-10-15; see the final section. Routine cleanup, protected-record release and evidence minimization remain unauthorized. Publication stays null and live terms enforcement remains disabled.

## Approved cadence and scope

Approved: **one manual operator review each week during the small beta, plus a review before inviting testers**. Record the review date and next review date seven calendar days later; this is an operator task, not a scheduled job or a promise that every expired row is deleted within seven days. Missed reviews require a recorded reason and rescheduled review, not silent indefinite retention. Specific holds retain their approved review-within-30-days rule.

Resource scope is only the existing NYC Stillroom project's `stillroom` database, `limits` table. Do not touch files, storage objects, totals, invitations, membership, accounts, sessions, terms/exit records or schema. Existing server credentials already support rows.read/rows.write; no new key/scopes/resources are proposed. Keep all credentials server/operator-only.

The latest recorded authoritative inventory (2026-10-14, not reread here) contains **107 limiter rows**. Local ID-only comparison found 87 overlap the accepted earlier baseline and 100 overlap the preserved final exit inventory. These sets overlap; do not add their counts. Conservatively protect all 100 final-inventory rows until separate selection/release approval. The remaining seven are **unclassified, not approved deletion candidates**. Their expiry, holds and evidence references must be reviewed in a fresh preview. Consequently no exact deletion count is authorized or established by this proposal; it may be zero.

## Why weekly is proportionate

At 107 observed rows, a 100-row page size takes two pages. No evidence presently requires a daily process or a background cleanup worker. Weekly review is a reasonable starting cadence for the small beta, not a capacity guarantee. Record aggregate row count, eligible/protected/held counts, change since the last review, outstanding failures and any provider resource alerts. Reassess cadence only if observed growth, missed reviews, alerts or abuse make weekly handling inadequate.

The code creates one pseudonymous HMAC row per subject/time window and increments it within that window. Most windows are 60 seconds; verification uses 3600 seconds. Rate caps constrain requests for a subject/window (including the global authentication cap), not total historic rows or the number of distinct subjects over time. No verified quota headroom or growth rate is available from one snapshot. Direct Appwrite registration/resource abuse is a separate blocker which limiter cleanup cannot solve.

Weekly approved cleanup would reduce unnecessary counter/history retention and resource use with limited operator effort; more frequent cleanup would reduce accumulation further but increase work and maintenance interruptions. Protection/holds can leave rows longer, requiring explicit reasons and review. Indefinite retention is not approved.

## Preview selection and exact execution boundary

Extend existing `scripts/maintenance.ts` with a preview-default `limits-preview` action and a separate `limits-apply` action requiring `--apply`, an exact reviewed plan digest and actually held maintenance epoch. These interfaces are implemented below; real use remains approval-gated. A narrow `lib/limiter-cleanup.ts` helper may keep logic testable; reuse `admin`, `row`, private signed-record/atomic-save conventions and the existing maintenance gate. No dashboard, second coordinator or new tracking database.

1. Preview uses bounded cursor pagination and existing expiry index. Select only rows where numeric `expires` is **strictly before** a validated provider-time cutoff; equality is deferred. Missing/invalid expiry, uncertain time, unexpected permissions/schema/project, incomplete pagination, missing protection manifest or unresolved holds fail closed. Use authoritative response time, not an unverified operator-entered date. There is no invented post-expiry grace period.
2. Exclude every protected inventory/test row, specifically held row and unresolved case/reference. The operator must review external holds; absence from a local file alone does not prove no hold. Hold/protection selection is mandatory and bound into the signed preview. Do not reconstruct subject emails from HMAC IDs. Protected evidence release requires separate approval.
3. Save a private signed preview containing project/table, cutoff, selected row ID, expiry and digest of full observed row state (including update/version metadata), protection/hold manifest digest and counts. Console output contains only totals, status and confirmation digest, never row IDs or raw records. Preview performs no provider writes and does not acquire/delete data by default.
4. Applying later requires separate real-execution authorization, exact digest confirmation, an actually held shared gate, drained workers and confirmed inactive external writers. Under the gate, reread the preview and protection/holds, then each selected row. Require expiry still passed and the exact state digest unchanged. Do not automatically add rows that expired since preview. Stop before the changed/held row and report prior completed work; a revised selection needs a new preview/approval. A flag alone is not proof of maintenance.
5. Delete only a confirmed selected limits row through the existing coordinated client. Missing rows are classified as independently observed absent, not falsely attributed to this run. Never create/restore a deleted counter or reset a current limiter window. Do not change any permissions.

## Partial failures, retries and minimal evidence

Before dispatch, persist the selected ID/digest and operation state privately. Afterward independently read the row to confirm absence; journal only `confirmed absent`, `failed`, `unknown` or `not attempted`, plus sanitized error category. Stop on partial failure with counts and a nonzero exit; retain retry information. A local journal failure must stop before the next delete.

On unknown provider outcomes, leave the existing durable dirty blocker and maintenance closure intact. Independent GET reconciliation must establish absence or the unchanged original row before any operator-authorized blocker resolution; never clear it just to rerun. If unresolved, stop and document exactly which selected operation remains uncertain. Confirmed known failures can be retried against the same immutable selection after revalidation. Ordinary release of maintenance must use existing safe controls; do not bypass unfinished exit cases or clear another workflow's lock.

Retain only the IDs/digests/statuses necessary for the unfinished retry; no email, subject reconstruction, raw row dump or file contents. Approved local minimization trigger: after independent selected-row absence verification, documented closure and no specific hold/reference, discard the detailed cleanup preview/journal and keep only aggregate date/count/outcome under the existing 90-days-after-closure operational correspondence rule. Do not implement a broad evidence purge or touch original preserved inventories. If this minimization trigger is not approved, keep detailed cleanup disabled and resolve it before real operation.

## Focused synthetic test plan and files

Proposed source changes: `scripts/maintenance.ts`, new `lib/limiter-cleanup.ts`; existing `lib/maintenance.ts` only if necessary for safely exposing authoritative read/reconciliation behavior, never bypassing dirty/epoch protections. No runtime limiter algorithm/schema change. Tests: new `tests/limiter-cleanup.test.ts`, targeted `tests/maintenance.test.ts` and `tests/writer-entrypoints.test.ts`; update this runbook, SETUP/BETA_OPERATIONS/BETA_READINESS/VERIFICATION.

- Preview issues only GETs; default/invalid flags never delete. Paginate more than 100 rows with stable ordering, and block incomplete/stalled reads.
- Expired, equality, unexpired, malformed expiry and uncertain-clock cases; protected/unclassified/held/reference cases never selected.
- Wrong project/table/target, tampered digest/hold manifest, changed row/count/expiry, hold added after preview and newly expired extra rows block execution or remain excluded.
- Actual gate/drain and dirty-blocker enforcement; concurrent writer cannot update/create a counter during apply. External-writer limits documented.
- Known failure, lost delete response, independent absence, journal-write failure, interrupted retry and repeated completed run: exact selected rows only, no recreated counters, no lost unknown outcome and safe lock handling.
- Minimal output/private-record contents and verified closure minimization preserve held/unfinished/protected records and never touch other tables/files. Existing request-limit behavior remains intact.

Use isolated synthetic roots/provider mocks; no real counters deleted. Run focused tests, lint/types and relevant regressions after local implementation. Real preview/execution and any protected-record selection need later explicit authorization.

## Implemented local operator procedure — 2026-10-14

Weekly review and an additional review before inviting testers are approved. The local commands below are implemented; real preview, deletion and evidence closure remain separately gated. No Cloud calls or real cleanup were performed during implementation.

Evidence-minimization rule: retain selected IDs, expiry/state digests and retry statuses until every selected row is independently confirmed absent, closure is explicitly confirmed, and no specific hold or unfinished reference requires the evidence. Then atomically replace that run's detailed signed record with aggregate closure date, counts, outcome and a 90-days-after-closure review date. No timed purge is implemented. Original preservation inventories, classification decisions, other cases and their holds are not removed. This rule does not establish backup, filesystem-remnant or provider-log erasure.

### Private inputs and review

Use the existing persistent private root and server credentials. Preserve `activation-readonly-evidence.json` byte-for-byte: the implementation pins its SHA-256 and excludes all 107 IDs (100 protocol records and seven unclassified records), even if a classification mistakenly says eligible. Missing or changed evidence fails closed; do not update the pin to bypass protection.

Prepare `limiter-cleanup/review.json` privately with `environment` equal to the JSON string of `["https://nyc.cloud.appwrite.io/v1","stillroom","stillroom","limits"]`, `reviewedAt` as an ISO date, `externalHoldsReviewed: true`, `entries` containing `{id,state}` decisions, and `retainedRunIds` listing cleanup runs with holds or unfinished references. Allowed states are eligible, held, protected, unclassified and unresolved. Unlisted IDs are excluded. Only explicitly eligible, non-baseline records can be selected. Record reasons and hold reviews through existing private operator notes; no subject reconstruction. Review classification evidence when its purpose ends; this command does not purge the shared decision record or release protected evidence.

### Commands (not authorization to execute against Cloud)

Use the existing Node/tsx operator invocation and environment loading for `scripts/maintenance.ts`:

- `limits-preview`: GET-only provider selection and a local signed preview; no delete. At most 100 pages of 100 rows. Incomplete/duplicate pagination fails without saving a usable preview. Strict expiry cutoff uses the earlier of provider Date header and local request start; missing Date, over-10-second response or over-60-second clock disagreement stops review.
- After separate execution approval, use existing `begin`/`drain` maintenance controls, ensure external writers are inactive, then `limits-apply RUN_ID --apply --confirm DIGEST --holds-reviewed --external-writers-inactive`. The command acquires the actual existing epoch lock and checks durable uncertainty; flags alone cannot grant access. Every deletion rechecks the pinned baseline, unchanged review, expiry and full row digest including update time, then independently checks absence.
- `limits-reconcile RUN_ID`: GET-only observations, including while dirty. Never clears blockers, rewrites the selection or silently accepts changed data. Resolve uncertain outcomes through separately reviewed existing maintenance procedures; no automatic dirty-marker deletion.
- After complete independent verification and reference/hold review, `limits-close RUN_ID --confirm DIGEST --holds-reviewed` explicitly minimizes only that completed run under maintenance. Unfinished work, changed review, a retained-run reference, reappearing rows or leftover temporary journal files blocks closure. Aggregate records are not automatically deleted after 90 days.
- End maintenance only through existing safe controls. A partial result exits nonzero. Known failures may retry the same digest after checks; uncertain writes remain blocked. Changed selections require a new reviewed preview, preserving old retry state. Never restore a missing counter or delete a recreated row.

Only limits rows are deletion targets. Outputs contain run identifiers, confirmation digests and aggregate statuses, not resource IDs, counter contents, email or credentials. Private records remain ignored and server/operator-only. This is single-persistent-host coordination; it cannot control external Console/SDK clients.

### Local evidence

Synthetic coverage includes more-than-one-page selection; 107 unconditional exclusions; missing classifications/holds; expiry equality and renewed/changed rows; preview and explicit-command rejection; real gate enforcement; known partial failure retry; lost-response durable uncertainty; GET-only reconciliation; signed record closure minimization and temporary-evidence protection. See VERIFICATION.md for exact results and the separate sandbox path-test limitation. Real eligible count remains unestablished; no release/deletion count is approved.



## Current read-only inventory and preview — 2026-10-14 Eastern / 2026-10-15 UTC

The user authorized inventory/classification/preview only. Connector discovery initially returned mcp_network_error and succeeded on one retry, confirming active project Stillroom, ID stillroom, region nyc. Existing runtime credentials addressed that project's limits endpoint; no credentials/scopes were created or changed. Sandboxed SDK attempts failed with DNS ENOTFOUND. The approved outside-sandbox GET-only run succeeded.

Two complete unfiltered cursor inventories matched exactly: two pages each, 100-row page size, hard 100-page bound. Current total is **107**, comprising **100 protected protocol-evidence rows and seven previously unclassified rows**. All 107 are expired; zero active/boundary rows, zero malformed rows, zero new IDs, zero missing baseline IDs, zero changes to previously recorded row permissions. The old inventory only establishes IDs/permissions: do not infer unchanged historic counter values/expiry from it. No cause needs to be invented for a row-count difference because none was observed.

All 107 remain excluded; **eligible/candidate count is zero**. The seven unclassified rows still lack established origin/disposition. No record was cleared of external holds for deletion. Conservative review excludes everything, so no unknown hold or missing evidence is treated as permission to delete. Shared classification and original inventory evidence remain intact.

The existing previewLimits handler (the same handler used by limits-preview) ran under the existing operation lock with additional SDK/fetch guards rejecting non-GET methods and endpoints outside the current limits list. Preview performed GET-only provider reads and private local saves. The operation lock serialized local coordinated writers across both inventories and preview, then released normally. Initial/final coordination was idle with no closing epoch or dirty blocker. No maintenance closure, process termination or blocker clearing occurred. This does not establish control over external Console/SDK clients.

Preview digest: `99ea75b8c5d5f1f4cc6aebadb598b436b5a420a61015375dc13d3416c0c18fc3`.
Private evidence: `.private/limiter-cleanup/inventory-2026-10-15T03-05-58.685Z.json`, the corresponding preview-result file, `review.json`, and signed run `f44714f5-fc6a-4302-a102-48b5cba95c11.json`. The preview scanned/excluded 107, selected zero. Its generic `complete: true` means the empty selection has no pending items; it is NOT evidence of live deletion or verified cleanup closure. No apply, close, minimization or protected release ran.

Next scope: no cleanup of current rows is justified. A live deletion test is unnecessary for this zero-candidate review, but required before claiming the deletion path provider-verified. If separately approved, the smallest controlled test is exactly one new private synthetic limits row (unique synthetic ID, count 0, expiry 60 seconds before creation, no row permissions), using existing credentials; explicitly classify only that row, preview and confirm its digest, apply under held/drained maintenance with external writers inactive, independently verify absence and all 107 baseline rows preserved. No new key/schema, no protected release, no other deletion, and no detailed-evidence closure without separate approval. Preserve partial-failure evidence and stop on uncertain writes. Alternatively wait for documented disposable candidates; do not release the seven unknown records just to test.

## Approved one-row live test completed — 2026-10-15

This later, separately authorized phase supersedes earlier statements that no live limiter execution has run. The user approved exactly one synthetic row and confirmed external Console/SDK/automation writers would remain inactive. Current connector discovery confirmed active Stillroom / stillroom / nyc. Existing runtime credentials completed required row reads/writes without a new key or widened scopes. Optional table-metadata connector reads failed twice with connection errors; current table metadata was not verified in this phase. The existing count/expires schema and current full rows were used; no schema/permission change occurred.

Preflight started 2026-10-15T04:24:22.643Z. Two bounded, unfiltered inventory passes matched the preceding full-row evidence: 107 rows, zero changed contents/metadata/permissions, zero missing/extra IDs. All 100 protocol rows and seven previously unclassified rows remained excluded. The pinned original evidence hash stayed unchanged. Process inspection found no running Stillroom app/operator/retired-script writer; external inactivity is the user's confirmation, not a property enforced by the local gate. No process was stopped.

Draining was exercised without Cloud writes: an admitted local operation held the shared lock, closing waited, a new operation was rejected, and releasing the admitted operation allowed draining to complete. The actual maintenance lock was acquired and the preservation baseline was rechecked before creation. No uncertain-write blocker existed.

Exactly one isolated synthetic ID was saved privately before dispatch. Its non-hex prefix cannot match the application's 36-hex-character HMAC limiter IDs. It was created once with count 0, expiry already 60 seconds in the past using a checked provider clock, and empty permissions. Readback confirmed those values. Inventory then contained 108 rows with all 107 originals unchanged. The prior classification file was preserved separately; only the synthetic ID was added as eligible.

The existing preview handler under maintenance selected exactly the designated ID/expiry: scanned108, excluded107, selected1. Digest, recorded before deletion:

`651b22f24f11909a802cf3a879d2d88177b7a0ffcf7edc13be87d854f57a3eeb`

The supported scripts/maintenance.ts limits-apply command received the exact run/digest confirmation and acquired the actual maintenance epoch lock. Additional transport guards permitted only limits reads, the one designated creation in the harness, and one exact-target deletion in the CLI. Apply reported selected1/absent1/complete=true and zero unknown results. A separate raw authenticated GET returned 404 for the target. Two final SDK inventory passes matched each other and all 107 original full rows, including contents, metadata and permissions; no extras remained.

Supported maintenance end succeeded. Final closing=null, dirty=false, locked=false. Exactly one creation attempt and one deletion attempt occurred. No uncertain outcome, replacement row, live failure injection or broad retry was needed. No limits-close, minimization or protected release ran. Signed preview/progress and full evidence remain private.

Evidence: ignored .private/limiter-cleanup/live-one-row-2026-10-15/ contains target/state/epoch, preflight, before-mutation, after-creation and final inventories, original classification and classification used. Signed run/progress is retained in the parent limiter-cleanup directory. No credentials or detailed row IDs are included in public reports.

This verifies the normal live one-row deletion path. Failures/retries, uncertain outcomes and minimization remain synthetically verified only. No application source/configuration changed; tests/lint/types/build/browser were not repeated. Routine cleanup of current107 rows remains unauthorized. No existing eligible row is established. Next work should address an existing beta blocker, such as direct-registration/resource-abuse containment, rather than repeat this completed protocol. Publication and terms activation remain gated.

