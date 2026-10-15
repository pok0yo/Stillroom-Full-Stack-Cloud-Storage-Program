# Activation assessment — 2026-10-14, read-only

## Direction update — 2026-10-15

The operator confirmed no server/domain budget and prefers a supervised local portfolio demo. HOST_FIREWALL_REVIEW.md completes the read-only host/P1 assessment; no compatible hosted resource is selected. Hosted activation and P1 are parked. The prerequisites below remain requirements if hosting is reconsidered, not prerequisites for merely preparing clean source, truthful local-demo documentation or sanitized portfolio evidence. No publication/terms activation, Cloud change or public listener is authorized. Approved provisional usage reviews are manual and are defined in BETA_OPERATIONS.md. Recommended next approval is a bounded local source/demo release audit; do not ask again for the already approved weekday/50%/80% thresholds or proceed to paid hosting.

Publication manifest remains null; no live enforcement or effective notice was enabled. This phase made no application/source change, Cloud mutation, session creation, email or cleanup. Local inspection/GET-only evidence scripts and reports are private and ignored.

## Local evidence reconciliation

The prior full suite ran once: 40/41 passed, with the junction-creation test failing EPERM inside the Windows sandbox. The separate outside-sandbox maintenance run passed 4/4. After final storage/share refinements, the targeted terms/file/exit run passed 11/11. These are combined scoped evidence, not a later 41/41 full run. Final lint, types and build passed; browser fixtures and screenshots were checked separately. No unresolved local check justified rerunning in this assessment. Actual-host recovery and live activated terms paths remain unverified.

## Current provider reads

Connector discovery confirmed intended project Stillroom / stillroom / NYC. An initial table read failed with `mcp_network_error`; bounded retry succeeded. Bucket detail and all five table definitions were read through the existing connector: enabled, empty permissions, file/row security enabled; bucket maximum 20 MiB. The table listing returned five, below its 100-item page limit.

Existing runtime credentials, with transport restricted to GET, enumerated all rows/objects using cursor pagination. Counts: files 3, totals 5, limits 107, invitations 5, members 4 (124 rows total); 3 stored objects. All row/object permissions were empty. No hashes/content comparison was performed or required for this permission-only phase; preserve every resource. Private IDs/reports remain under `.private/activation-*`.

Guest direct checks covered all 124 known row IDs plus metadata/download/view for all three stored objects: 133 object requests returned 404. Six list endpoints returned 200, then independently reread as zero entries/zero total. Thus guest disclosure was not observed; do not say all 139 requests returned access-denied status. An initial checker expected only 401/403/404 and flagged the lists, resolved by inspecting their empty results. The GET-only SDK path first failed within network sandbox (`network_or_timeout`), then completed outside sandbox after approval.

Two preserved disposable-session cookies were validated with GET `/account`; both returned 401. No account was restored and no session minted. **Active authenticated direct-provider denial remains unverified in this phase.** Guest denial and rejected revoked sessions do not substitute for it. No key scopes or permissions were expanded.

Smallest remaining provider check: use an already-authenticated owner browser/session locally, first confirming its account with GET `/account`, then read the same known row/object/list endpoints without the admin key. Inspect owner-owned and other-owner resources as applicable and record only status/count evidence privately. Do not paste session credentials into chat. If no active session is available, stop and request approval for one ordinary sign-in/session creation for the existing owner (no new account/file/key); no such sign-in is authorized or performed in this phase. No new resource or scope is otherwise needed. Repeat permissions near activation because today's reads are point-in-time evidence, not a lock or ongoing monitor.

## Hosting assessment

No selected application host or deployable hosting configuration was found in the inspected repository/runbooks. Existing local configuration uses HTTP localhost, no private-root override, and unset `STILLROOM_COORDINATION_MODE`. This is local development evidence, not a production host. Production code requires explicit `single-host` mode; this assessment changes no settings.

Required hosting shape: one persistent Node host with all application/operator processes sharing the same canonical private root and maintenance lock. Persist private records and signing material through restarts/releases; verify restrictive effective filesystem ACLs rather than relying on Unix mode bits on Windows. No multiple independent roots, ephemeral functions, distributed replicas or unattended external writers. Verify HTTPS, request/time/memory limits for buffered 20 MiB files, graceful draining/restart, durable uncertain-write markers and recovery.

Host selection is an operator decision: identify the proposed provider/machine, OS, storage persistence, cost ceiling and who maintains it. Then inspect that host's actual controls without provisioning. A generic “Node support” claim is insufficient. No vendor price/product compatibility recommendation is made here. Before activation, rehearse protected backup/restore of the real chosen storage layout with synthetic data, verify version/signature continuity and holds, and document backup access/retention plus host/proxy logs. Existing isolated restore is not evidence of production backups, fsync/power-loss durability, or provider erasure.

## Smallest expired-limiter proposal — awaiting approval

Recommend **one operator review each week, plus a review before inviting testers**. This is a proposed operational cadence, not an automatic deletion job or a newly approved retention deadline.

Preview only rows with server `expires` at/before an authoritative review cutoff, using the existing expiry index and bounded pages. Exclude unexpired rows, specifically held data and every protected baseline/protocol/test row unless separately selected and approved. Unknown protection/reference status blocks selection. Keep only counts/digest and minimal private retry identifiers; no subject reconstruction or publication of IDs.

After separately approved implementation and later target-specific execution: acquire the existing maintenance gate, drain writers, confirm external writers inactive, reread each row and compare reviewed ID/version/content digest and expiry before deletion. Stop on changed records, clock uncertainty or durable uncertain-write blockers. Reconcile missing rows through independent reads; safe retries never switch targets or clear unknown outcomes merely to proceed. Document narrowly scoped exceptions with responsible operator and next review within the approved 30-day hold schedule. No protected evidence is automatically disposable because its limiter window expired.

Tradeoff: weekly review limits unnecessary accumulation of pseudonymous counters and storage usage without a frequent background job. It adds manual work and typically retains unheld expired counters until the next approved cleanup, not a guaranteed seven-day maximum. Faster cleanup reduces retained history/resource use but needs more operator effort; longer intervals retain more data. Missed reviews or holds must be visible, not indefinite retention by default. Cadence, implementation and actual deletions need separate approvals; this phase implements none.

## Concrete activation gates

| Gate | Evidence needed to close |
| --- | --- |
| Current permissions / guest access | Observed pass above; refresh near activation and stop on drift. |
| Active-account direct access | Locally validated existing active session; direct list/known-ID checks without admin key; no disclosure. |
| Host selected and compatible | Named host/OS/storage/cost decision; one persistent shared root, effective ACLs, explicit production mode and coordinated restart/drain demonstrated. |
| Backup/recovery and infrastructure logging | Actual-host synthetic restore, private key/version continuity, access/retention controls and request-log canary checks; disclose remaining provider limitations. |
| Basic mailbox task — closed | Outbound Inbox user-reported; return Spam user-reported/screenshot-supported. Expanded sender/Reply-To and exact receipt times unverified; inbox placement not passed. Weekday Inbox/Spam monitoring preserved. No retest required for basic closure. |
| Notices/communication | Final effective date and immutable text, tested material-change/in-app channels, conditional shutdown support, explicit publication/activation approval. |
| Retention operation | Approve limiter cadence; implement/verify preview and reference/hold safeguards under separate scope; real cleanup separately authorized. Terms/case retention operation must match approved policy. |
| Existing beta blockers | Resolve direct-registration abuse, intended-tester eligibility evidence, account recovery and outstanding reliability/accessibility checks from BETA_READINESS; do not infer overall readiness from agreement tests. |

Current next proposal: approve LIMITER_CLEANUP_PROPOSAL.md for weekly review and local synthetic implementation only. Basic mailbox task is now closed with limitations. Host selection remains a deployment-specific decision; do not activate merely because local checks pass.
