# Host and Firewall compatibility — read-only review, 2026-10-15

## Decision and scope

The operator confirmed no existing server/VPS/domain/hosting credit and no budget for a live server/domain, preferring a local portfolio demo. **Recommend the existing Windows checkout for supervised local demonstration and source/demo preparation; postpone hosted beta operation and P1 activation.** Do not redesign authentication, move private records to another database, expose the PC through a tunnel, or provision a free ephemeral host to force a deployment.

Approved provisional operations are now weekday/pre-admission usage review, investigation of unexplained account growth, review at50% utilization and pausing new admissions at80%. The measurable definitions below are manual instructions, not deployed enforcement. P1 was approved for evaluation only; no rule or settings change is authorized.

Current read-only connector observations: active Stillroom/stillroom/NYC, Free/tier-0, no Sites/Functions resources, Firewall disabled and zero rules. This phase changed documentation/private evidence only. No server was started, network port opened, credentials changed or existing protocol rerun.

## Existing resource and hosting requirements

The known resource is the existing Windows x64 PC and canonical Stillroom checkout, Node24.19.0, plus the existing Free Appwrite project. There is no evidence of another suitable always-on host; the operator explicitly reported none. Local APP_ORIGIN is HTTP localhost:3000; private-root override and explicit coordination mode are unset in the current local environment. Production code requires single-host mode. This is not a production deployment assessment pass.

| Requirement | Current local evidence / hosted implication |
| --- | --- |
| One coordination root | `lib/maintenance.ts` confines records to the canonical checkout's .private or a descendant, rejects redirected roots and binds coordination to hostname. All writers/operators need this same root. Generic external volume paths, release symlinks or replica-local roots do not meet current checks. |
| Durable private records | Records persist locally and exclusive temporary-save/rename is implemented. Power-loss durability/fsync and a real host recovery copy are not established. Do not equate atomic replacement with tested backups. |
| Restrictive access | Read-only .private ACL inspection: four entries, inheritance enabled, no allow entry for Everyone/Authenticated Users/BUILTIN Users. This limited ACL inspection is not proof against every effective group membership, same-user tool, administrator, disk loss or backup reader. No ACL was changed. |
| Backup and restore | Existing tests restore signed synthetic terms records into an isolated root. They do not prove full-machine recovery, all-case/journal restoration, protection of signing keys or a deployed-host restore. A restored hostname binding can fail on another machine; review migration without blindly clearing dirty/closing markers. |
| HTTPS / ingress | No public hostname, TLS ingress or trusted proxy is configured. Local HTTP cookies differ from production Secure cookies. A hosted system needs native body/request/connection controls before Next and authenticated caching exclusions. |
|20MiB requests | Source buffers and validates up to20971520 file bytes; prior tests do not establish an unknown host's ingress limit, memory/concurrency or duration behavior. Proxy allowance must accommodate the actual request plus transport overhead. |
| Stable controlled egress | No public egress address was collected or verified. A desktop/home NAT may change or be shared. No address is authorized for P1. |

Detailed hardware CIM inspection was unavailable in the sandbox; no RAM value was inferred from that failure. It was unnecessary to retry for the selected supervised-demo scope. No unrelated machine/account inventory was performed. Next's [self-hosting guide](https://nextjs.org/docs/app/guides/self-hosting) recommends a reverse proxy; generic Node support does not establish compatibility with this app's private coordination layout.

## Actual request-path compatibility

| Flow | Current source path and P1 implication |
| --- | --- |
| Signup/signin | Browser posts to relative /api/auth routes; server Account SDK calls Appwrite. An approved server egress should allow the existing invited signup/password flow. No browser Appwrite SDK is imported by current application code. This is source inference, not a live WAF pass. |
| Verification | Browser visits Stillroom's /verify, which posts to its auth route; server session-client verification/readback calls Appwrite. Both keyed and session-only server traffic must be allowed. Links generated for the old localhost origin are not a hosted-origin test. |
| Account recovery | No application password-recovery request/confirmation route was found. Public provider recovery/password setup cannot be claimed compatible: P1 would deny direct off-host API calls. Do not disable it and imply an app replacement exists. A reviewed recovery procedure remains a gap if hosted operation resumes. |
| Upload/share/revoke | Browser calls Stillroom /api/files; membership/owner/recipient checks and provider writes run on the server. Keep those checks, empty permissions and maintenance unchanged. |
| Preview/download | Image/audio/video/text/download links use relative /api/files/.../content, including ranges. Server fetches whole bytes and rechecks authorization. No direct presigned Appwrite URL is returned by current code. Host bandwidth/memory limits and both authorization checks still need hosted verification. |
| Realtime/WebSockets | No subscribe/WebSocket/realtime client use found in app/lib/scripts. SDK installation alone does not establish an active connection. Provider Realtime remains an available separate protocol; API-wide HTTP wording does not prove upgrade/frame/existing-connection enforcement. |
| GraphQL | No current app GraphQL request, but the enabled provider service supports registration/session mutations and batching at /v1/graphql. Any future rule must be checked on that outer endpoint, not just /account. |
| Other services | Enabled APIs include avatars, teams, storage and administrative surfaces. P1 would intentionally deny off-host API consumers too. It is not a pass for separate Function/Site/custom-domain/Realtime interfaces. Current resource counts show no deployed Functions/Sites. |
| Operators/monitoring | Direct SDK scripts from this PC would be denied if only a future VPS were allowed. They must run on the approved host and shared root; merely allowing an operator's unrelated PC IP permits another provider entry point. Console usage inspection has a documented exemption; MCP/CLI exemption was not established and must not be assumed. |
| Backups/recovery | Host-native disk snapshots may avoid Appwrite API calls, but Appwrite exports and SDK readback would need permitted egress and current credentials. Backups include sensitive private records/keys and require restricted access and an approved retention/restore plan. Copying a snapshot to a new host/IP is not a ready recovery procedure. |

Official [SSR documentation](https://appwrite.io/docs/products/auth/server-side-rendering) matches the server-mediated architecture. [GraphQL](https://appwrite.io/docs/apis/graphql) and [Realtime](https://appwrite.io/docs/apis/realtime), including its [WebSocket endpoint](https://appwrite.io/docs/apis/realtime/custom-endpoint), explain why unused protocols must not be silently treated as blocked.

## What documentation establishes about P1

The current candidate is one api-scoped deny rule, priority0, with an ANDed ip-notEqual condition for each approved egress. No match means normal processing; it does not grant permissions. An earlier-priority matching bypass or under-quota rate-limit rule would stop later evaluation, so the complete ordered rule list must be reviewed. Current rule count is zero. [Priority](https://appwrite.io/docs/products/firewall/priority).

[Conditions](https://appwrite.io/docs/products/firewall/conditions) document single-IP/CIDR matching and AND semantics, with IP supplied by Appwrite's network observation. Key/session/Authorization and forwarded headers cannot supply a trusted-server exception. IPv4 examples/CIDR behavior are documented; inspected pages did not explicitly establish IPv6 normalization, mapped IPv4, dual-stack failover or the effect of IP reassignment. Those require bounded actual-network checks. Shared egress admits other tenants/users behind that egress and is not exclusive identity.

[API scope](https://appwrite.io/docs/products/firewall/scopes) is documented for project /v1 API traffic. That is a design expectation for HTTP REST/GraphQL, not evidence that every hostname, realtime upgrade or existing connection is covered. A Site/Function rule is a different scope. The [Firewall overview](https://appwrite.io/docs/products/firewall) explicitly includes SDK/API-key traffic while exempting the Console. Keyed endpoint rate-limit exemption therefore does not imply Firewall exemption. Rules do not retroactively prove closure of already established connections.

Console exemption is the intended lockout escape: an operator blocked from the application/API should use an independent browser/network with working owner credentials/MFA to disable only the new rule and read back the state. This is not verified merely because this connector can read settings. Lost Console credentials/MFA or provider outage can still prevent recovery. A bounded rule-toggle recovery drill from outside allowed egress is required before reliance. Disabling the rule restores compatibility by reopening direct API access; it does not contain an attack.

## Cost and operational comparison (three candidates only)

| Option | Recurring service cost and fit | Operator burden |
| --- | --- | --- |
| Existing PC, supervised local demo — **recommended** | New hosting/domain charges **$0**; existing Appwrite Free stays$0 within its limits. Existing PC electricity/Internet are unpriced existing costs, so this is not a claim of zero total ownership cost. No public listener/tunnel is proposed. | Start explicitly on loopback only when demonstrating; maintain private records and monitor the existing Cloud project. No availability promise or tester operation. |
| Render Free — rejected for this implementation | Advertised compute$0, but not a compatible$0 deployment: local changes disappear and no persistent disk is available; default outbound ranges are shared. Paid changes would be needed and are out of budget. | Would force coordination/storage changes or paid components. Neither is proposed. |
| Single Linux Lightsail VPS — deferred, out of budget | Public-IPv4 2GB/60GB instance **$12/month**, plus snapshot storage **$0.05/GB-month**, any domain renewal, transfer overages and tax; Appwrite Free$0. Example60 billed snapshot GB-months makes$15 before domain/tax/overage. Total is usage-dependent, not a$12 fixed all-in guarantee. No trial credits assumed. | OS/security patching, TLS/reverse proxy, private ACLs, backup/restore, egress validation, monitoring and incident recovery.2GB is a candidate size, not a tested memory guarantee. |

Sources: [Render Free filesystem restrictions](https://render.com/docs/free), [shared outbound ranges](https://render.com/docs/outbound-ip-addresses), [Lightsail steady-state instance and snapshot pricing](https://aws.amazon.com/lightsail/pricing/). No paid account, domain, server, trial or IP resource was created. A provider-assigned address still requires verification of actual outbound source and lifecycle; advertising a static inbound IP is not that test. The operator's zero budget rules out the paid candidate without further purchase discussion.

## Approved provisional manual quota definitions

Use the organization-wide effective plan/usage view for the billing interval, not an app dashboard or one tester's totals. Current plan readback is Free. GB quantities below retain provider display units; verify its byte basis before writing a conversion. Do not assume decimalGB and GiB are interchangeable.

| Measured allowance |50% manual review |80% pause new admissions |
| --- | --- | --- |
| Database reads500000/billing period |250000 reads |400000 reads |
| Database writes250000/billing period |125000 writes |200000 writes |
| API bandwidth5GB/billing period |2.5 providerGB |4 providerGB |
| Total storage2GB, current level (not monthly reset) |1 providerGB |1.6 providerGB |
| Monthly active users75000, **only if a defined MAU metric is available** |37500 MAU |60000 MAU |
| Executions750000/billing period, if consumed |375000 |600000 |
| Realtime messages2000000/billing period, if consumed |1000000 |1600000 |
| Concurrent Realtime connections250, if observable |125 simultaneous |200 simultaneous |

Primary current-app quotas are reads, writes, bandwidth and storage. Unused-service counters still deserve review if they rise unexpectedly. Registered usersTotal6 is not a substitute for MAU; investigate unexplained registered-account growth separately regardless of percentage. No auth-email allowance was established, so no invented50%/80% email count applies. These percentages do not apply to20MiB per-file validation, session limits, app request rates, Firewall rule slots or number of projects.

Review each weekday and before any future admission batch. At50%, inspect the trend, cause and headroom; at80%, stop issuing new invitations/approving admissions and record the decision. This is manual, does not revoke already issued invitations, stop existing uploads, deny APIs or enforce a hard budget. Existing pending invitations may remain usable; changing their provider state or suspending accounts requires separate exact-target authorization. A missed review, lagging counter, unexpected account or provider warning requires recorded investigation, not automatic deletion or an unapproved plan upgrade. Record unavailable metrics as unknown. Keep original holds/correspondence and weekly limiter policies separate; no new retention duration or scheduler.

## Required bounded tests if hosted operation is reconsidered

No test below ran or is authorized by this phase. Avoid repeating completed destructive protocols.

1. On the chosen persistent host, use isolated synthetic records to prove same-root writer/drain behavior, ACL restrictions, restart/power-loss handling as applicable and encrypted/restricted backup restore. Reconcile hostname binding, signatures, unfinished cases and dirty markers; never force-clear them. Verify ingress HTTPS, uncached authenticated responses, maximum-body/boundary handling, bounded memory/time and actual outbound IPv4/IPv6 after restart.
2. With separately approved rule activation and confirmed Console escape, make a small fixed set of harmless requests from allowed and disallowed networks to REST and GraphQL, all configured API hostnames and WebSocket upgrade paths. Record WAF-specific headers/403 rather than mistaking app validation or a row denial for a WAF match. Test an already established realtime connection only if one is specifically approved; do not infer frame enforcement from one failed handshake.
3. Verify legitimate app signin, signup/enrollment/verification, preview/range/download/upload/share and authenticated exit remain functional. Any account, email, file, session/revocation or sharing mutation needs separately enumerated disposable targets and approval; no load or email test is implied by a read-only probe. Account recovery needs an actual reviewed workflow first.
4. From an outside network, prove owner Console access can disable the rule, observe readback and safely restore the reviewed configuration. Confirm off-host SDK/monitoring behavior and a replacement-host restore with new egress before promising recoverability. Preserve rollback evidence; do not minimize it here.

## Source/demo completion versus a hosted beta

A local demonstration, clean source repository, accurate case study and sanitized screenshots/recording can show the implemented product without buying a host/domain. A static export cannot replace the authenticated Next server/API as a working cloud-storage service. A screenshot or UI fixture must not be presented as proof of live backend behavior; existing bounded provider evidence remains separate.

The recommended next phase is a **local source/demo release audit and preparation**: inspect publication candidates for secrets/private records, reconcile current setup/test/case-study claims, define a loopback-only owner demonstration and identify sanitized existing material. Do not publish, commit/push, start a public listener, create new demo resources or execute uploads/emails as part of that audit without the appropriate scope. Remaining build/accessibility/reliability defects should be reported/fixed only under its subsequent authorization; a hosted-beta checklist is not a requirement to claim merely that a local demo exists.

Residual risk remains even with no hosted app: the existing Appwrite Cloud project is reachable directly and retains accounts/uploads. Local-only frontend access does not disable provider registration, eliminate email/resource abuse or prove backup erasure. Keep the approved manual reviews; do not delete or reconfigure the project to save cost without separate approval. P1 and full hosted beta are parked, not proven or accepted.

**Next approval:** proceed with the bounded local source/demo release audit above, at$0 additional service cost, with no Cloud mutations, publication, deployment, dependencies or paid resources. No host purchase or Firewall activation is recommended.
