# Stillroom portfolio acceptance — Phase 1, 2026-10-15

## Fixed scope and completion boundary

The original implementation brief, later approved DESIGN-figma.md and current source were compared against the published claims. The approved design supersedes the original neutral/teal palette. This release is a source/local portfolio application backed by Appwrite when configured; it is not an offline backend, hosted beta or production deployment. Hosted administration, hosting, Firewall and policy development are deferred, not prerequisites to completing this portfolio release.

Evidence labels: **local** = synthetic unit/service tests; **fixture** = actual React components with simulated HTTP; **route** = running unconfigured Next application; **historical live** = the already recorded bounded Appwrite protocols, not refreshed Cloud state. No completed live protocol was reopened.

## Finite acceptance checklist

| ID / requirement | Evidence and result |
| --- | --- |
| 01 — Application in the intended root | Met. Next/React/TypeScript source remains in the original repository; genuine README ancestor and published application commit preserved. No separate app directory or portfolio-site migration. |
| 02 — Signup, signin, verification, protected pages, signout | Met within recorded scope. Historical live authentication/verification and session evidence; current real unconfigured login/verification screens, disabled unavailable actions and protected API denial. No fresh signup/email sent during acceptance. |
| 03 — Owned overview, counts/bytes by type, recent uploads | Met. Local transactional totals/lifecycle tests, fixture overview and historical live totals evidence. Pending/deleting bytes are not represented as ready-file usage. |
| 04 — My Files and Shared with Me | Met. Current fixture navigation/recipient UI and historical live owner/recipient isolation; direct service tests enforce authorization. |
| 05 — Picker/drop upload, progress, validation | Met with limits disclosed. Current picker/drop fixture; source distinguishes XHR transfer from confirmed storage. Local size/content/name/encoding checks enforce 20 MiB and allowed formats. Every maximum-size media/provider processing path is not live-proven. |
| 06 — Metadata and safe previews | Met with limits disclosed. Current escaped text/dialog fixture; source uses private image/audio/video routes, escaped text and PDF download fallback. Browser codec support and every media variant are not certified. No automatic captions or document conversion is promised. |
| 07 — Rename, original download, confirmed delete | Met. Current fixture rename/delete/cancel and download-link/returned-byte assertions; historical live original-byte hashes and lifecycle. Fake-host Edge attachment saving is not claimed as a fixture pass. |
| 08 — Exact-email sharing and revocation | Met. Current fixture share/revoke and recipient read-only UI; local 20-recipient/ownership controls plus historical live app/direct-provider denial evidence. Sharing requires eligible invited membership, a documented narrowing of unrestricted registered-user sharing. |
| 09 — Search, type filter, sort, 25-item cursor pagination | Met with limits disclosed. Current fixture request parameters/next/previous; local query validation and historical live two-page queries. Date queries ran historically without explicit chronological-order assertions; concurrent cursor changes may require refresh. |
| 10 — Desktop/mobile states | Met. Current desktop/mobile fixtures cover loading, empty, permission, partial-total, upload-error and success states; screenshots inspected. 320/390/1440 CSS-pixel layouts exercised across the selected tests. |
| 11 — Keyboard/accessibility | Met within tool scope. Accessible upload label and higher-contrast input boundaries fixed. Keyboard focus/return, Escape, labels, accessible tree, reduced motion and 320px reflow tested. Axe WCAG A/AA tagged checks found no violations in tested states. Actual screen-reader speech, native browser zoom and formal WCAG certification are unavailable/unclaimed. 320px is 400%-equivalent reflow from a 1280px viewport, not a claim of a native zoom test. |
| 12 — Security/integrity/recovery | Met within bounded evidence. Server-derived identities, private provider defaults, rechecks after byte retrieval, CSRF/CSP, persistent limits and explicit partial states remain. Historical direct-access/access-exit protocols and current local regressions suffice; no claim of universal security, E2E encryption, provider erasure or outage resilience. |
| 13 — Fresh-source setup | Met within local scope. Isolated source copy built and served without original environment/private records, reusing installed dependencies. Real setup/login/routes and fixture workspace checked. README/.env.example/schema/setup explain independently supplied credentials and newly created operator records. No fresh dependency installation or live-project provisioning was performed. |
| 14 — Portfolio deliverables/claims | Met. README architecture/security/design attribution and original improvements, setup/deployment limits, factual case study and evidence boundaries reviewed. No invented metrics, user impact or staged development history. |
| 15 — License/assets/publication hygiene | Met locally. MIT choice explicitly approved; LICENSE/package metadata and THIRD_PARTY_NOTICES distinguish own source from dependencies and design references. No bundled proprietary fonts/tutorial assets or dependency binaries. Private data, real environments, live screenshots and unpublished legal candidates remain excluded. Recheck exact staging before Phase 2. |
| 16 — Tagged portfolio release | Pending Phase 2 approval/execution. Existing source is on main at a2c1d774d7d667b72080ad9f4499bad9a41da510. This phase has made no commit/tag/push. |

## Concrete fixes and verification

Application changes are limited to the missing upload-input accessible label and form-control boundary contrast (#999 on white was approximately 2.85:1; #767676 is approximately 4.54:1). Existing components and dependencies are reused. No authorization, provider permission, terms activation, policy or administration behavior changed.

Browser additions use the already installed axe-core through the locked development toolchain, not a new dependency. They check actual component actions and accessible roles, enforce no external browser requests in the new fixtures/public-route audit, and separate returned fixture bytes from an actual saved attachment. An initial test run exposed a label-selector collision and an intercepted-host download cancellation; these were test-boundary issues. A subsequent selector used accessible combobox roles rather than exact implicit-label text. No product security control was weakened to pass them.

Current test totals and final command outcomes are recorded in VERIFICATION.md. The isolated build warned about nested lockfiles because the synthetic source copy is inside the original checkout; it completed successfully. That warning is not a fresh-clone dependency-installation pass. Screenshots remain ignored under test-results and were visually inspected, not substituted for live backend evidence.

## Disclosed limitations and deferred work

No further feature implementation is required by this finite checklist. Phase 2 approval should explicitly accept these documented portfolio limits: no fresh live-project/install test, no new all-format/max-size/outage/concurrency stress proof, no actual assistive-reader/native-zoom session, bounded buffered media, manual pending recovery and five development-only audit findings. Production-only audit was zero on the same-day recorded graph; only root license metadata changed afterward.

Hosted beta/public deployment remain deferred: a compatible single persistent host and private backups/recovery, direct-registration/resource-abuse containment, infrastructure logging/retention, notice/terms publication/activation and operating communications are future decisions. Local-only frontend access does not stop requests directly to the existing Appwrite endpoint. No universal availability or abuse protection is implied.

## Proposed Phase 2 actions — require go

1. Recheck source, secret exclusions and remote divergence; stage only the reviewed changed files. Create one accurately dated commit, `Finalize Stillroom portfolio acceptance and licensing`, using the already verified GitHub no-reply identity. Preserve both existing ancestors.
2. Push main normally. Create annotated tag `v0.1.0-portfolio` at that commit and push only that tag; do not move an existing tag if present.
3. Publish a GitHub source release titled `Stillroom portfolio application` for that verified tag, describing the local portfolio scope and limitations below. Attach no private evidence, binaries or dependency bundles. Verify main/tag/release and report the links. No deployment.

Proposed release description: Stillroom is a tutorial-inspired Next.js/React/TypeScript file library with server-mediated Appwrite access, explicit sharing/revocation, bounded uploads, recoverable operations and a responsive original interface. This portfolio release adds final accessibility fixes, reproducible non-live browser acceptance, MIT licensing and accurate setup/evidence documentation. Historical live protocols and current local/fixture checks are distinguished. Hosted beta and public deployment are deferred; this release makes no production-readiness or universal-security claim.
