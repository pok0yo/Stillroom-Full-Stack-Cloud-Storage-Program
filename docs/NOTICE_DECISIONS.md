# Notice and operating decisions — approved policy, unpublished

Recorded 2026-10-13 after the live exit protocol. The operator approved all three exact proposals below. This approves policy wording only: no publication, acceptance records, cleanup implementation/execution, communications or Cloud changes are authorized by this record.

## Separate approvals received 2026-10-14 after ID 187

- Substantive privacy/beta candidates approved conditionally: define a proportionate cleanup procedure or review trigger for expired rate-limit records; indefinite retention is not approved. TERMS_IMPLEMENTATION_PLAN.md proposes a reviewed cleanup procedure. Its implementation/cadence/execution remain gated.
- Exact terms-record retention approved as policy: retain the minimal record for each actually accepted terms version during participation; after independently verified exit and documented closure remove unless specifically held with reviews within 30 days; shutdown removal follows permanently closed admission and verified shutdown/account-exit processing, subject to holds. Dated public notice versions remain separate without account linkage. Real cleanup remains separately gated.
- Exactly one manual SR-MAIL-001 outbound and one reply authorized using the endpoints and text in ID 187. No additional messages. Give only the outbound step, wait for the user's observed result, then give the reply step. No delivery outcome yet.

These supersede earlier pending-approval labels for wording/retention/sending only. No application implementation, publication, acceptance record, Cloud mutation or cleanup authorization was given.

## 1. Account-exit handling target

> Aim to remove active account data and owned uploads within 30 calendar days after Stillroom receives a valid authenticated exit request with confirmed scope. Later operator acknowledgment or required reauthentication does not restart that clock. Retain only specifically identified data needed for an unresolved security/abuse/copyright report or an identified legal obligation, recording the reason and reviewing it every 30 days. Remove unheld data where safely separable; report incomplete work and delays rather than silently resetting the target. This is a target, not a guarantee of provider-backup/log or recipient-copy erasure.

## 2. Conditional planned shutdown

> Aim to give at least 30 calendar days’ notice before planned beta shutdown, by individual email to each tester’s verified address plus an in-app notice. Offer existing individual-file downloads while the service remains available; no bulk export or guaranteed emergency notice/download availability. Check delivery failures and use the in-app channel as a fallback. Do not publish or activate this arrangement until the mailbox/delivery process and in-app notice are tested.

## 3. Retention and cleanup triggers

> Keep the minimal revoked invitation until beta shutdown cleanup is verified and all admission paths are permanently closed; then remove it after a reviewed preview. Delete full completed-case receipts/plans/journals and unneeded authentication proofs only after independent completion verification, documented case closure, verified session revocation and no unfinished case references or specific hold. Keep only minimal case disposition under the separate 90-days-after-closure correspondence rule. For each hold, record the specific data, reason, responsible operator and next review within 30 days; release when its documented reason ends and complete cleanup. Existing preserved test artifacts need separate selection/approval.

## Implementation boundaries

### Notice identity, changes and terms direction — approved in preparation

The operator requested identification by their actual name as an individual operator based in Georgia, and the actual publication date as the effective date. On 2026-10-14 the operator explicitly supplied **Yuri Ante** as public operator and mailbox sender name. The effective date remains unset until actual approved publication.

Approved direction: notify active testers of material changes by email and in-app notice, provide advance notice where practical, explain urgent security changes promptly, and preserve dated versions. Prepare concise beta terms with an unchecked agreement checkbox before admission, separate from 18+/Georgia attestation; link privacy without blanket consent. Keep only terms version, timestamp and authenticated stable account ID; existing users agree prospectively.

Exact terms wording, version-change handling, record retention/access, implementation and publication remain pending review. No acceptance records or controls were created. On 2026-10-14 the operator confirmed control of yla.stillroom@gmail.com and a second address supplied privately in the conversation, and committed to checking inbox/spam each weekday, prioritizing security/abuse reports when received. Delivery is untested. See NOTICE_PUBLICATION_REVIEW.md and MAILBOX_VERIFICATION.md; no sending authorization is inferred.

### Eligibility-specific retention approval — 2026-10-13

The operator subsequently approved:

> During participation, retain only the minimum approved eligibility record.
>
> After independently verified account exit and documented case closure, remove eligibility-specific information when no specific documented hold requires it.
>
> Preserve separately the minimum revoked-invitation record required by the existing approved admission policy. Do not retain age/location attestations merely to prevent invitation reuse.
>
> At beta shutdown, remove eligibility records after admission is permanently closed and shutdown/account-exit processing is verified complete, except for documented holds.
>
> Review holds under the existing approved review schedule.

This phase authorizes local implementation and synthetic verification only. Per-case eligibility cleanup now has a preview and explicit confirmation gate (ELIGIBILITY.md); no real cleanup was executed. Full-case, invitation, correspondence and shutdown-wide cleanup remain disabled/unimplemented. Shutdown evidence cannot be replaced by a command-line assertion. The existing hold-review schedule is within 30 days, with a specific reason, minimum data, responsible operator and next review. This policy is not a provider erasure guarantee or publication approval.

The valid receipt’s first received/issued timestamp and confirmed scope establish the exit target start. The initial execution receipt is valid for 24 hours; a 30-day handling target does not extend it. Preserve the original case received date if safe reauthentication or a replacement receipt is required; never weaken freshness/replay checks. The local signed case tracker now preserves dates across receipt renewal and records holds, delays and verified closure; see CASE_TRACKING.md. Historical migration and live testing of the new tracking layer remain pending. Technical failures are delays to disclose, not invented retention exceptions or automatic clock resets. A justified legal hold needs an identified basis; no blanket legal retention requirement is assumed.

Shutdown needs a tested manual mailbox/delivery and bounce-review procedure plus an in-app notice; individual downloads already exist, bulk export does not. No test email was sent in this phase. Full-case cleanup needs preview, reference/hold checks, explicit selection and safe retries before any execution authorization. Do not delete shared evidence, preserved test artifacts or an active session’s proof just because a case closed. Standalone expired limiter cleanup remains a separate unresolved scope; logical expiry does not physically delete rows.

The clock and cleanup decisions are not new statutory deadlines. Any applicable legal requirement is assessed separately. Complete notice wording, operator identification/effective date, material-change communication, terms if adopted, and deployment/provider disclosures still need review. Neither privacy acknowledgment nor verified email is acceptance of beta terms.
