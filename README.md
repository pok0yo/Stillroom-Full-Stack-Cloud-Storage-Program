# Stillroom

A restrained, private cloud file library built in the root of this repository. A monochrome editorial interface, generous pastel panels, and deliberately limited sharing keep the interface focused on finding and keeping files.

This is a local portfolio project, not a hosted service. The invitation-only migration and bounded live access-control and account-exit protocols passed against Appwrite. Hosted beta operation and public deployment are deferred. The finite [portfolio acceptance checklist](docs/PORTFOLIO_ACCEPTANCE.md) separates this release from that future work; [verification](docs/VERIFICATION.md) records evidence and limits. Publishing this source does not establish production readiness.

## What is implemented

- Email/password accounts, email verification, session-protected pages and sign-out.
- Authenticated manual exit requests and a preview-first operator procedure with single-host draining; a bounded disposable-account protocol passed live. Routine deletion and retained-record cleanup require their own reviewed scope. Provider backup/log erasure is unverified. See [ACCOUNT_EXIT.md](docs/ACCOUNT_EXIT.md).
- Prospective terms-agreement controls are implemented and synthetically tested, but the publication manifest is null and enforcement is disabled. No prior agreement is fabricated.
- Owned storage totals by type and recent uploads; My Files and Shared with Me.
- File picker and drag/drop upload, measured transfer progress, server validation, and recoverable partial-operation states.
- File details, safe media/text previews, original downloads with SHA-256 verification, rename, and confirmed deletion.
- Exact-email sharing with active invited members, owner-only management, and revocation.
- Name substring search, type filters, date/name/size sorting, and 25-item cursor pagination.
- Responsive navigation, keyboard focus, native modal dialogs and status announcements.

Supported: PDF, UTF-8 TXT/CSV, JPEG/PNG/WebP, MP3/WAV and MP4/WebM. Maximum upload: **20 MiB**. No folders, public links, versions, billing or collaborative editing.

## Run and configure

Read [the setup guide](docs/SETUP.md) before installing dependencies or creating resources. After installation is approved, use Node 24, `npm ci`, and `npm run dev -- --hostname 127.0.0.1`; open `http://localhost:3000` to match the example origin. Copy `.env.example` to untracked `.env.local` and configure your own approved Appwrite project. Without configuration, the application shows a setup screen rather than fictional data. Nothing creates cloud resources on startup. A configured local demonstration still uses Appwrite Cloud; it is not an offline backend.

`scripts/setup.ts` prints a dry-run schema by default. Applying it requires approval and `--apply`. No credentials are committed. See [verification status](docs/VERIFICATION.md) for what has actually been checked.

To inspect the real workspace UI without credentials, an Appwrite project or a running server, use `npm run test:e2e -- tests/browser/workspace.spec.ts` after installing the documented dependencies and having a supported browser available. This is a clearly simulated HTTP fixture, not an offline backend or a substitute for live authorization evidence. It saves screenshots under ignored `test-results/`. The default browser channel is Microsoft Edge; see setup for alternatives. No browser or dependency is downloaded by this command.

A fresh checkout creates its own private coordination/eligibility records as documented; it must not copy the operator's ignored records. Signup alone does not grant admission. Limiter cleanup and historical case commands intentionally require private evidence not distributed with this source and are not necessary to browse files. The setup guide distinguishes a read-only UI inspection from connecting an independently configured backend.

## Architecture and security

Next.js App Router with React and TypeScript; Node route handlers use Appwrite's server SDK, TablesDB, authentication and Storage. The browser talks only to same-origin routes. A fresh session client derives the acting user. Verified invitation binding and active membership gate protected access. Server-only administrative access handles bounded metadata queries and storage after explicit ownership/recipient checks.

The migrated metadata model has no client row permissions; bounded live tests verified direct metadata and storage denial. File content is delivered only after session, membership, and owner/recipient authorization, with non-cacheable responses and safe MIME/disposition headers. Only the owner can rename, delete, share or revoke. Recipients can view/download. Account resolution uses an exact email and bounded server-side query; no searchable user directory is exposed. The sharing result can still indicate whether an address is eligible, so lookup is rate-limited. Invitation checks protect application access but do not prevent direct Appwrite registration or its resource consumption.

Persistent limits, strict-origin mutation checks, HttpOnly SameSite cookies, a nonce-based CSP, bounded request bodies, normalized inputs, content checks and UTF-8 decoding protect the boundaries. Pending/deleting journals and transactional totals preserve information when storage and database outcomes diverge. See the setup guide for the operator recovery procedure and limitations.

## Tutorial credit and original work

The project concept was inspired by the JavaScript Mastery Google Drive/storage-management tutorial and [adrianhajdin/storage_management_solution](https://github.com/adrianhajdin/storage_management_solution). The original commit in this repository contains only its title README. Tutorial inspiration covers the storage dashboard, authentication and file-management feature set; Stillroom's implementation and verification are described here without claiming the underlying concept as original.

Stillroom adds its own visual identity, strict file format policy, server-mediated storage access, explicit owner/recipient isolation, email verification gate, revocation, recoverable operation journals, transactional type totals, CSP/CSRF protections, and tests that distinguish local simulations from real provider verification. It is not affiliated with Google.

## Known limits

The authorized Free NYC Appwrite project is configured. Core live file lifecycle, two-user isolation, direct SDK permission denials, pagination, transactional totals and recovery checks have passed; see [verification](docs/VERIFICATION.md) for their exact scope. The application is not deployed. Concurrent mutation stress, real provider outages and all maximum-size media paths remain unverified. Interrupted uploads can require operator recovery; they are never silently discarded. File signatures do not guarantee malware safety. Media range requests buffer the bounded original file. Development-tooling audit findings remain unresolved.

For a factual portfolio narrative, see [the case-study draft](docs/CASE_STUDY.md).

## Design implementation

The supplied DESIGN-figma.md is adapted to the application: black/white controls, pill CTAs, a lime storage panel, lilac authentication panel, large sans-serif headings, and mono labels. The desktop sidebar remains; mobile navigation uses a full-canvas native dialog. System font fallbacks avoid proprietary font downloads. See [design notes](docs/DESIGN_IMPLEMENTATION.md) and the included synthetic UI screenshots. Live-account screenshots, private records, real environment files and unpublished notice drafts are excluded from publication.

## License

Stillroom's own source is available under the [MIT License](LICENSE), approved by the operator. Dependencies retain their own licenses; optional image-processing binaries include LGPL components. See [third-party credits and distribution boundaries](THIRD_PARTY_NOTICES.md). This source release does not distribute node_modules or application binaries.
