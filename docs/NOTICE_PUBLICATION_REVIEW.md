# Notice publication review — not approved for publication

Source-release reconciliation, 2026-10-15: substantive candidates and terms-record retention were approved subject to the recorded gates; the local agreement implementation is complete but disabled, and the basic mailbox test closed with return Spam delivery and unverified headers/times. Older pending/not-run statements below describe their preparation stages, not current status. Exact candidate files remain local and ignored during source publication. This document is a historical implementation review, not an effective notice or authorization to publish/activate one. Current scope is recorded in TERMS_IMPLEMENTATION_PLAN.md, MAILBOX_VERIFICATION.md and BETA_READINESS.md.

2026-10-14 implementation update: the local prospective agreement flow passed synthetic checks but is disabled. `/privacy` and `/terms` expose only unpublished-status messages. No candidate text, effective date, acceptance backfill or live enforcement was published. TERMS_IMPLEMENTATION_PLAN.md records remaining activation gates; this supersedes earlier statements that no route/control exists, not the prohibition on publication/activation.

Latest status, 2026-10-14: substantive wording conditionally approved with an expired rate-limit cleanup clarification; terms-record retention approved as policy; two manual SR-MAIL-001 messages authorized separately. No sending result yet. These supersede earlier pending labels below, not the implementation/publication gates. See TERMS_IMPLEMENTATION_PLAN.md for inspected callers, exact affected files, exit exemptions, direct-provider prerequisite, storage/recovery and focused tests. No implementation authorized.

Prepared 2026-10-13. Review candidates: PRIVACY_NOTICE_DRAFT.md and BETA_NOTICE_DRAFT.md. No notice routes, agreement controls or acceptance records were created in this phase.

## Decisions received in this phase

- Public identification, supplied 2026-10-14: Yuri Ante, individual operator based in Georgia, with the approved contact address; also the approved mailbox sender name.
- Effective date: the actual publication date, never backdated. No date has been assigned yet.
- Material changes: notify active testers by email and in-app notice; advance notice where practical, prompt explanation of urgent security changes, and preserved dated versions. These channels still require implementation/testing.
- Beta terms: prepare concise terms with an unchecked agreement checkbox before admission, separate from 18+/Georgia attestation. Link the privacy notice without blanket consent. Record only terms version, timestamp and authenticated stable account ID. Existing users must agree prospectively. This policy decision is not approval of the newly drafted use/review clauses or implementation in this preparation-only phase.
- Mailbox inputs supplied 2026-10-14: operator confirms control of the contact inbox and a second controlled address; checks inbox and spam each weekday, prioritizing security/abuse when received. This is user confirmation, not observed delivery. The personal test endpoint stays in the conversation rather than publication files.

## Concise publication diff

| Area | Candidate change / evidence boundary |
| --- | --- |
| Eligibility | Keeps explicit 18+/Georgia residence and distinguishes attestation from verified proof. No DOB, ID or precise location collection. |
| Exit | Keeps authenticated operator mediation, owned-file/access removal, preservation of other owners' files and the approved 30-day target/start/exception rules. No self-service or universal erasure claim. |
| Cleanup | Replaces stale “all cleanup disabled” wording with manual eligibility-only support versus unavailable full-case/invitation/shutdown-wide cleanup. No real cleanup is claimed. |
| Provider access | States no end-to-end encryption; suitable operator/provider access is possible. NYC is configured project region, not a guarantee covering all processing/copies. Host details and infrastructure retention remain publication gates. |
| Cookies | Matches source: HttpOnly, SameSite Strict, Secure when configured origin uses HTTPS, provider-session expiry; signout clears cookie and attempts revocation. No cookie banner or blanket consent added. |
| Terms | Changes the beta notice from informational-only to a proposed concise agreement, as requested. New clauses and version-change rule remain approval candidates; no acceptance is inferred from login, eligibility or email verification. |
| Identity/date/changes | Names Yuri Ante; actual publication date remains unset. Incorporates the approved material-change channels and dated-version policy without pretending they are implemented. |
| Contact | Preserves yla.stillroom@gmail.com, five-business-day acknowledgment target, security/abuse prioritization and separate correspondence retention. Test plan verifies two-message routing only. |
| Shutdown | Keeps the conditional 30-day planned-shutdown arrangement withheld from activation until email and in-app notice tests pass; no bulk export or emergency guarantee. |

## Exact wording still needing approval

Read both candidates in full, including proposed use/review rules, checkbox text and renewed-agreement rule. Proposed renewed agreement applies when a new version materially changes participation/use requirements, before continued beta use; editorial corrections and privacy-notice updates alone do not create agreement. Any separate consent or legally required notice would require its own assessment rather than treating a privacy link as permission.

Before collecting terms records, approve the proposal below and implement authenticated stable-account binding, prospective existing-user behavior and version enforcement. Preserve signout and necessary privacy/account-exit routes. Do not retroactively label existing users as agreeing. No new Cloud column/table is proposed or approved here.

Operator name and mailbox inputs are resolved by the user's statements. Exact final wording, agreement retention, and sending remain unapproved. Hosting/provider-log details remain separate deployment evidence gaps. A candidate with a publication gate is not ready to publish merely because its prose is polished.

## Smallest local implementation proposal — not authorized, 2026-10-14

Inspected local `scripts/schema.ts`: invitations have email/state/accountId, members have email/state, and files/totals/limits have their existing operational fields. There is no terms field/table. This is source inspection, not a new live schema read. Do not overload invitation/member state or create a Cloud table merely for agreement tracking.

- Reuse the existing persistent private root, coordinated writes and signed-record conventions. Store only authenticated stable account ID, immutable terms version and server timestamp per accepted version, in private server-only records. An integrity envelope is technical metadata, not an extra personal-data profile. No email, IP, user-agent or checkbox telemetry. No new dependency, Cloud scope or schema is needed for this proposal. Protect these records like existing private case records; never bundle, log or return another account's record.
- Add public `/privacy` and `/terms` pages with approved immutable text and actual publication date; a linked unchecked agreement control uses the existing interface conventions. Keep age/residence attestation and privacy disclosure separate. Do not publish unresolved bracketed gates.
- Verified-email binding and membership can establish identity before agreement, but file-workspace admission and protected file operations require current agreement. Existing members agree prospectively. Use server-bound account identity/time, explicit affirmative input, CSRF/rate limits, strict version validation and idempotent writes. A changed displayed version requires review again; repeat submission must not fabricate a new first-agreement time.
- Enforce the agreement requirement in protected server/service paths and sharing-recipient eligibility, not only a hidden workspace button. Keep sign-in/verification, notices/contact, sign-out and necessary authenticated account-exit paths usable without accepting new terms. Do not weaken membership, file authorization or receipt controls. Existing provider file grants can outlive application gating; inventory them before activation and separately propose any necessary provider restriction. No Cloud change is authorized here, and the local agreement gate must not be represented as provider-level revocation.
- Scope: notice pages/agreement route and component, login/verification/workspace links, `app/operator-contact.tsx` correction above, authenticated caller/service checks around `lib/membership.ts` and `lib/files.ts`, private-record helper using `lib/maintenance.ts`, and corresponding account-exit inventory/cleanup references. Inspect all callers before implementation. Reuse existing tests/fixtures/config; no analytics, acceptance backfill or dashboard.
- Proposed retention, awaiting approval: retain the minimal record for each actually accepted version during participation. After independently verified exit and documented case closure, remove it unless a specific documented hold applies; review holds within 30 days. At shutdown, remove after admission is permanently closed and shutdown/account-exit processing is verified complete, subject to holds. Keep dated public notice versions separately without account linkage. Do not borrow the correspondence 90-day period or invent a legal retention duty. Any cleanup requires preview, reference/hold checks and explicit execution approval; existing cleanup remains unchanged.
- Before activation, test missing/false agreement, wrong account, suspended membership, stale version, repeat submission, direct service/recipient checks, existing-user prospective flow and exit/sign-out exemptions. Test private-path/integrity/maintenance protections and held/unfinished cleanup. Verify unchecked keyboard-accessible control, linked labels, focus/errors/loading/mobile layout; run relevant tests, lint/types/build. Signed private storage remains single-host only; restore/loss behavior must fail closed and never invent historical agreement.

Activation depends on approved wording/retention, tested implementation and communication channels, and resolved hosting disclosures. This proposal creates no records or routes and does not authorize execution.

## Existing interface correction for a later approved edit

`app/operator-contact.tsx` still says uploaded-file retention is unresolved and describes email as the initial account-exit route. Do not change application behavior in this preparation phase. Proposed replacement for that paragraph:

> For account exit, submit a request while signed in after recent password authentication and confirm its scope. The operator reviews and carries out removal; this is not automatic deletion. Email the operator if you need help. Accounts and uploads remain during participation without automatic inactivity deletion; provider backup/log erasure is not established.

This change should accompany the later notice/interface implementation, with keyboard/link/error checks. It does not activate an unpublished handling deadline by itself.

## Review limits and source grounding

The review reconciled approved decisions with source and recorded verification evidence, not live provider state. The official [FTC consumer privacy guidance](https://www.ftc.gov/business-guidance/privacy-security/consumer-privacy) emphasizes honoring privacy promises; its [personal-information guide](https://www.ftc.gov/business-guidance/resources/protecting-personal-information-guide-business) supports collecting/retaining only needed data with an explicit retention process. These support keeping unverified promises gated; they do not certify these notices, determine Stillroom's statutory coverage or settle contract enforceability. No new jurisdiction-specific obligation, waiver, content license or refund policy was inferred.

Documentation checks only: approved contact consistency, required policy wording, cookie-source comparison, unresolved gate inventory and Markdown diff checks. Application code did not change; build/browser/provider tests were not rerun. Mailbox evidence remains not-run; see MAILBOX_VERIFICATION.md for the exact later sending authorization.
