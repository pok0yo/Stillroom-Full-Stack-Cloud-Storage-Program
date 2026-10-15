# Stillroom setup and deployment

## Current distribution: local portfolio source

Hosted beta operation is postponed. Run a supervised local demonstration with `npm run dev -- --hostname 127.0.0.1` and browse `http://localhost:3000` to match APP_ORIGIN; do not expose it through a public listener or tunnel. A configured demo still sends requests to Appwrite Cloud. Private credentials, records, browser state and live screenshots are not distributed. Unpublished notice candidates remain local, and the publication manifest stays null. The deployment section below describes future requirements, not a completed deployment.

## Terms flow — implemented but disabled

`lib/notice-content.ts` deliberately contains a null publication manifest. Do not populate it or treat an environment flag as approval to activate. Notice routes show status only. Activation needs explicit publication approval, actual effective date/immutable text, communication tests and fresh paginated bucket/table/row/file permission inspection with direct unauthorized-access tests. Existing provider grants could bypass application checks; stop and separately approve remediation if found.

Agreement records reuse `.private/terms` on the same persistent host/root as every writer. Ephemeral or distributed hosting is unsupported. Verify host ACLs, ignored/untracked storage, protected signing material and backup/recovery before activation. Synthetic restore passed but production restore, power-loss durability and backup erasure are unverified. Reconcile lost/corrupt records; never fabricate old timestamps. Keep notices/contact/signout/exit accessible while agreement is missing. Implement retention operations separately before collecting records under promises the operator cannot fulfill.

## Invitation-only migration — completed

The existing project has all five private tables and migrated file/totals permissions. The approved access-control protocol is complete; see [ACCESS_CONTROL.md](ACCESS_CONTROL.md) for the runbook and [BETA_READINESS.md](BETA_READINESS.md) for remaining blockers. Preserve the two protocol testers in their disabled/suspended state and their files. Do not rerun fresh-project setup or mutation tests without specific authorization. Some commands/results below describe the earlier baseline, not permission to repeat it.

## Approval boundary

The owner authorized and configured the existing Stillroom organization/project (`stillroom`, NYC) on Free (`tier-0`). Database and bucket IDs are both `stillroom`; tables are `files`, `totals`, `limits`, `invitations`, and `members`. Local credentials are stored only in ignored environment files. Do not rerun creation against these existing resources. Deployment, paid upgrades, additional dependencies, and unrelated resources remain approval-gated. The setup script is a dry run unless explicitly passed `--apply`; startup never provisions resources.

## Local runtime

Use Node 24 LTS and `npm ci` after dependency installation is authorized. The lockfile pins the dependency graph. Next.js 16.4, React 19.3, and node-appwrite 29.2 were checked against current package metadata. TypeScript 6 and ESLint 9 are used because the currently shipped Next.js lint plugins do not support TypeScript 7. ESLint 9 is upstream-deprecated; review a compatible toolchain upgrade before public deployment.

For a fresh checkout only, copy `.env.example` to `.env.local`, replace every placeholder, and keep it untracked. Preserve the existing configured `.env.local` in this checkout. Generate `RATE_LIMIT_SECRET` with a cryptographically secure generator (at least 32 random bytes) when initially configuring a new environment. Never use a `NEXT_PUBLIC_` variable for any Appwrite credential. `APP_ORIGIN` must exactly match the browser origin, including local port. Local HTTP cookies are permitted for development; production requires HTTPS. Do not copy `.env.local` into reports or issue trackers.

Without configuration, `npm run dev` displays an honest setup screen. It does not enable a simulated library. Use `npm run build` and `npm run start` for production-mode local verification; production configuration requires an HTTPS origin.

## Existing configured project

Use the existing NYC project `stillroom`, database/bucket `stillroom`, and Web platform `stillroom-local` for `localhost`. Keep the ignored environment files and six-scope runtime key. No creation script is needed. Start the local development server with `npm run dev`; see Verification below for test commands. Production deployment and changes to cloud resources require their own authorization. The provider results in VERIFICATION.md describe this existing project, not a guarantee about a fresh installation.

## Fresh-project provisioning only, after approval

The following sequence is for a new, empty project. Do not apply it to the configured Stillroom project or overwrite its environment file. The creation script is not an idempotent migration tool.

1. Create a new Appwrite Cloud project in the chosen region. Review plan quotas and pricing before accepting anything paid. Add a Web platform for localhost and the eventual application hostname. Enable email/password authentication and email verification delivery. Check that verification messages can be delivered and that the callback `/verify` is allowed. Use separate verified accounts for owner and recipient checks.
2. Create a temporary setup API key with database/table/column/index and bucket creation scopes as exposed by the current Appwrite Console. Supply it through environment variables, never source files. Inspect `scripts/schema.ts` and run `node --import tsx scripts/setup.ts` to print the complete schema. After approval, run `node --env-file=.env.local --import tsx scripts/setup.ts --apply`. This creates the database, five tables, and bucket within the already selected project. The script stops on error and preserves resources; it deliberately does not overwrite existing resources. Inspect partial setup in the Console before retrying.
3. Confirm every column and index is **available** in the Console before running the app. All tables use `permissions: []` and row security enabled. The bucket uses `permissions: []`, file security enabled, maximum size **20,971,520 bytes**, and the explicit extension allowlist. Encryption and antivirus are requested. Do not grant `any`, `users`, or individual users bucket permissions, storage-file permissions, or table write permissions.
4. Replace the temporary key with a narrowly scoped runtime key: `sessions.write`, `users.read`, row read/write, and file read/write scopes (`rows.read`, `rows.write`, `files.read`, `files.write` in the current Console). Confirm transaction endpoints work with the runtime database scopes. Do not keep schema/bucket administration scopes in the app. Validate signup separately against your project's auth configuration.
5. Create an approved email invitation using the access runbook, then start the app, create an account, sign in, request verification, and open the link in the same signed-in browser. The confirmation deliberately checks that the link belongs to the current account. If opened in another browser, sign in to that account and reopen the original link. Confirm verification tokens do not appear in reverse-proxy access logs; redact query strings for `/verify`.

## Schema and indexes

The exact machine-readable definition is `scripts/schema.ts`. All string columns use explicit `varchar` types, not deprecated generic strings.

| Table | Columns | Access |
| --- | --- | --- |
| files | owner(36), name(180), searchName(180), size(integer), mime(100), kind(16), recipients(array of 36-character IDs), status(16), digest(64) | Server only; app checks owner/recipient |
| totals | document/image/audio/video Bytes and Count integers | Server only; app checks owner |
| limits | count and expires integers | Server only |
| invitations | email(320), state(16), accountId(36) | Server only |
| members | email(320), state(16); row ID is account ID | Server only |

Files have key indexes on `owner`, `searchName`, `size`, `kind`, and `status`; Appwrite's system columns supply creation-time and ID ordering. Limits have an `expires` index. Inline index creation uses `attributes`, although returned index objects use `columns`. The NYC shared database rejects indexes on arrays; `recipients` is deliberately not indexed. Live session-scoped contains queries on recipients, combined name/type filters, all four sort queries, and two-page traversal passed with 26 disposable records. Explicit result-order assertions cover name and size only; oldest/newest queries and pagination passed, but chronological ordering was not explicitly asserted. No compound index or client-side full-library fallback was needed for those checks. Large-library performance remains unmeasured.

`Query.contains` performs normalized, case-insensitive substring matching using the stored lowercase name, including short searches. Owned/shared queries remain bounded at **26 rows**: 25 displayed plus one continuation sentinel. All sorts include the ID as a stable tie breaker. Cursor pagination is not a snapshot: concurrent renames/deletes can move or invalidate a cursor; refresh from the first page in that case. The dashboard reads one totals row and at most six recent file rows.

## Integrity and recovery

Upload: validate bytes → persist a private `pending` file journal → upload private bytes with the same ID → transactionally mark `ready` and increment totals. Storage and database are not one transaction. A timeout may have succeeded remotely, so uncertain uploads retain their journal and are never silently deleted or reported as successful. Refresh before retrying.

Pending recovery is operator-only to prevent deleting bytes while an upload is still running. Stop/drain all app upload workers first. Find the pending row by the ID in My Files, then inspect the bucket for that same ID and verify size and SHA-256 against the row. If complete, atomically mark it ready and add its type count/bytes to the owner's totals using a TablesDB transaction. Otherwise set status to `failed` (preserving all fields and empty row permissions), restart the app, and let the owner delete it. Never change a ready row to failed or increment totals twice. Retain the pending row if the storage request outcome is still uncertain.

Deletion: transactionally mark `deleting`, remove recipient permissions, and decrement totals once; delete storage bytes; then delete metadata. If either cleanup fails, the owner can retry Delete. Missing storage bytes are safe to retry. Dashboard totals measure ready owned files; pending and deleting objects may still consume provider storage until cleanup completes. Inspect those states during operations; do not use dashboard totals as a provider billing meter.

The limits table stores HMAC-derived identifiers, not email addresses. Authentication has a persistent global ceiling of 120 attempts/minute and 10/email/minute; verification is 3/hour/user; file reads 120/minute/user, content 60, writes 40, shares 10 and uploads 15. The global auth bucket is intentionally conservative and can affect availability under abuse; review trusted-edge controls before high-traffic release. Do not trust an arbitrary `X-Forwarded-For` header. Follow LIMITER_CLEANUP_PROPOSAL.md for approved weekly and pre-admission review: expiry alone never authorizes deletion. The supported tool excludes protected, held, unclassified and unresolved records and rechecks under maintenance. All 107 preserved baseline rows remain excluded; a separate one-row synthetic live cleanup passed. No scheduler or general real cleanup is authorized.

## Verification

- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
- Start the app separately, then `npm run test:e2e`. The default suite expects **no backend configuration** for its setup tests. It uses installed Microsoft Edge; set a supported local browser channel in the Playwright config if necessary. No browser download is required on this machine.
- Workspace fixture tests bundle the actual component with esbuild already present through tsx. Their mocked HTTP responses only test UI behavior, never Appwrite authorization.
- After separate migration and live-test approval, use already invited/enrolled disposable accounts. For this configured project, `.env.live-test` holds disposable-account credentials and IDs, ignored by Git. Run `node --env-file=.env.local --env-file=.env.live-test node_modules/@playwright/test/cli.js test tests/browser/live.spec.ts tests/browser/live-queries.spec.ts tests/browser/live-ui.spec.ts` against the development server. Tests check actual file lifecycle, permissions, 26-record pagination and responsive authenticated UI. The query test creates metadata fixtures directly in the real provider; those are not uploads and do not update dashboard totals. It deletes its own rows afterward. The two test accounts were administratively verified, so these suites do not prove email delivery. Never print or commit the environment files.
- Run `node --env-file=.env.local --env-file=.env.live-test --conditions=react-server --import tsx scripts/verify-provider.ts` for real persistent-limit exhaustion and seeded pending/failed/deleting recovery checks. This calls production service functions against Appwrite and cleans up its own records; it does not inject a provider outage.
- Completed live checks are listed in VERIFICATION.md: core lifecycle, direct permission denials, real rate-limit exhaustion, seeded recovery and 26-record pagination. The owner reported sign-in success and the provider confirmed verified email; mail contents and delivery timing were not inspected.
- Remaining release checks include explicit oldest/newest ordering assertions, each supported media format and 20 MiB boundary uploads, concurrent sharing/deleting, and deliberate storage/database outages. The pagination fixture uses real-provider metadata rows rather than 26 uploaded files. These limits must not be represented as completed by the local tests.

## Deployment, after separate approval

Use a persistent Node-capable deployment that supports request bodies above 20 MiB, sufficient request duration for Appwrite upload/download, and the App Router Node runtime. Many serverless hosts have lower body limits; do not deploy there without addressing that constraint. Configure an ingress body limit of 20 MiB plus small header overhead, connection/body timeouts, concurrent request limits, and HTTPS. The handler independently enforces the actual byte limit even without Content-Length.

File bodies are buffered (at most 20 MiB each) for content validation and hashing; downloads and each media range request also fetch the whole file from Appwrite. This is a bounded portfolio implementation, not a large-scale streaming service. Size the Node process and concurrency limits accordingly. The strict CSP uses per-request nonces; only development permits unsafe-eval for Next.js tooling. Do not relax production policy to mask errors.

## Official references consulted

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [Appwrite SSR authentication](https://appwrite.io/docs/products/auth/server-side-rendering)
- [TablesDB transactions](https://appwrite.io/docs/products/databases/tablesdb/transactions) — free-plan transaction limit is 100 operations; this app uses small transactions.
- [Queries](https://appwrite.io/docs/products/databases/tablesdb/queries) and [ordering](https://appwrite.io/docs/products/databases/tablesdb/order)
- [Storage buckets](https://appwrite.io/docs/products/storage/buckets) — provider documentation describes a 20 MB encryption/processing threshold. The app's 20 MiB limit is explicit; do not claim every maximum-size object receives provider encryption/antivirus processing without confirming the provider's exact threshold.

Signature checks are not full format validation or malware detection. Appwrite antivirus is defense in depth, not a safety guarantee. HTML, SVG, archives and executables are rejected; PDFs are download-only; text is escaped. Treat downloaded documents and CSV formulas as untrusted.

## Single-host exit coordination

Production now requires STILLROOM_COORDINATION_MODE=single-host and persistent, OS-restricted .private storage in the canonical checkout. All app/operator workers must use exactly that directory (or the same configured descendant). No multi-host/serverless/ephemeral deployment is supported by this gate. Request mutation serialization, maintenance commands and uncertain-write recovery are documented in ACCOUNT_EXIT.md. Private records are excluded from Git and Next server traces; do not package them as deployable assets. Existing .env.local secrets were not changed.

## Limiter operator commands

See LIMITER_CLEANUP_PROPOSAL.md for `scripts/maintenance.ts` limits-preview/apply/reconcile/close. Reuse the existing server-only environment and single persistent private root. Do not run these against Cloud without the relevant phase approval. No new dependency, key, schema or scheduler is needed. Missing pinned baseline or explicit classification prevents selection; all 107 preserved baseline IDs remain excluded.
