# Historical case evidence review — approval pending

2026-10-13. Offline review and isolated synthetic rehearsal only. No live provider operations, original-record migration, closure, cleanup, new key or communications occurred.

## Evidence assessment

One preserved receipt was found in the execution history. Its HMAC, the corresponding password-authentication proof, signed plan and signed completed journal verified using the existing local signing secret without loading Appwrite credentials into the review process. Receipt, proof, plan and completed runner agree on the stable account/session/request and environment. Authentication preceded the request by 24,597 ms; initial receipt validity was 24 hours. No renewal was found.

The original receipt's `issuedAt` is **2026-10-13T21:50:14.853Z**, October 13 at 5:50:14.853 p.m. Eastern. The proposed 30-calendar-day target is **2026-11-12T22:50:14.853Z**, November 12 at 5:50:14.853 p.m. Eastern, accounting for the DST change. No filesystem timestamp, acknowledgment, later receipt or completion date supplies this start date.

| Evidence | What it establishes and limits |
| --- | --- |
| Signed receipt and password proof | Matching authenticated stable identity, request/session binding and timing. Locally HMAC-authenticated records, not an immutable provider audit. |
| Preserved live runner and successful run state | Disposable account created before its single request; runner submitted `confirm:true`. Current route rejects missing scope confirmation. Legacy receipt does not separately sign the request body or consent text. |
| Signed stale preview, final plan and journal | Specific synthetic held file, reviewed target, later hold-free plan and completed execution. No historical reason/operator/30-day review record is present; do not fabricate one. |
| Captured CLI results | Stale-plan refusal, held partial removal, completed result and maintenance release. These are recorded execution output, not independent provider evidence. |
| Separate saved final provider inventory | Independently collected at the time: exiting account, membership, totals and owned files absent; no owner/recipient reference remains; preserved incoming-share and revoked-invitation hashes match the plan. This phase recomputed those comparisons offline, not through new Cloud reads. |
| Saved preservation verdict | Corroborates baseline preservation and test containment; it is a derived local report. No fresh provider reads or signed case closure date were created here. |

## Proposed migration diff

The original `case.json` is absent. The ignored private proposal at `.private/case-review/historical-migration-preview.json` contains exact identifiers, each proposed value and its source. Public documentation deliberately omits stable account/resource IDs and identity fingerprints.

| Proposed field | Source / value |
| --- | --- |
| `version` | Migration schema constant `1` |
| `caseId` | First preserved signed receipt's request ID; separate field from future execution IDs |
| `accountId`, `identity`, `environment` | Unchanged signed receipt bindings; corroborated by proof/plan/run |
| `originalReceivedAt` | Signed `issuedAt`: 2026-10-13T21:50:14.853Z |
| `targetAt` | 30 Georgia calendar days later: 2026-11-12T22:50:14.853Z |
| `receiptIds` | The one preserved matching receipt; no renewal inferred |
| `origin` | `reviewed-preserved-receipts` |
| `status` | `open`: migration does not certify closure |
| `holds`, `events` | Empty initial tracking arrays, not a claim that historical holds/events never occurred. Final reviewed execution plan has no remaining holds. Historical evidence remains separate and preserved. |
| Closure/date/correspondence fields | Absent. No invented closure date or resulting correspondence timer. |

Decision: evidence supports presenting this **open-record migration** for operator approval and complete-history review. It does not justify reconstructing missing historical hold notes or marking the case closed. The earliest *available* signed request is corroborated by the isolated disposable-account run; deleted/unrecorded history cannot be disproved by filesystem inspection alone. If the operator knows of another qualifying request, pause migration and reconcile it. All originals remain unchanged. Future closure still requires its documented independent checks; this phase does not authorize those Cloud reads.

## Local rehearsal

15 targeted tests passed on an isolated source copy with only synthetic fixture records. The copied historical-receipt test used the actual CLI for migration preview, reviewed migration and status; remaining tests exercised authenticated renewal without target reset, identity/expiry boundaries, missing-pointer recovery, holds/reviews/delays, partial completion, closure refusal and successful mocked independent verification. No original case was copied with its secrets or migrated.

The runner passed only allowlisted OS environment variables. An inherited preload blocked environment-file loading, original private-record reads/writes, fetch/http/https/socket connections, including child processes; isolation probes passed. Existing dependencies were reused. The Windows sandbox run hit private-directory realpath EPERM; approved execution outside that sandbox passed with these rehearsal guards still enabled. An initial preload-path quoting error was corrected before tests ran; it caused no provider activity. All 75 original private evidence files matched their before/after SHA-256 hashes. Private reports remain ignored/untracked.

No production application source changed. Build, lint, browser and broad regression checks were not repeated; previous results remain historical. New tracking-layer Cloud behavior, provider logs/backups and formal historical closure remain unverified. Cleanup stays disabled.

## Next blocker to close

Do not add another tracking feature merely to migrate a preserved synthetic test case. The smallest next operational phase is the approved **18+/Georgia invitation-eligibility checklist and contrary-information handling procedure**, using direct confirmation without identity documents or full birth dates. Completion criterion: a reviewed operator checklist/runbook that prevents invitation until eligibility is confirmed and explains how contrary information pauses access review. No invitations, account changes, terms acceptance or Cloud mutation are implied. Notice wording/publication, mailbox verification, registration-abuse containment, recovery/reliability/accessibility checks and deployment logging/configuration remain separate blockers.
