# Direct registration and resource abuse — read-only review, 2026-10-15

Status: **containment remains pending; hosted beta parked**. The subsequent HOST_FIREWALL_REVIEW.md records the operator's zero-budget local-demo preference and approved provisional manual thresholds. P1 settings and residual risks remain unapproved. This phase inspected source, current settings and official documentation. No provider setting, account, key, rule, row or file was changed; no authentication, email or load test ran. Completed access-control, account-exit and limiter protocols were preserved.

## Observed configuration

Current connector discovery confirms active Stillroom, project stillroom, NYC, organization stillroom on Free/tier-0. Detailed sanitized readback is ignored in `.private/registration-review/2026-10-15.json`.

| Current read | Observed result |
| --- | --- |
| Account / email-password | Both enabled; the application uses them. |
| Other listed auth methods | Magic URL, email OTP, anonymous, team invites, JWT, phone and passkey disabled. Provider team invites are unrelated to our invitations table. OAuth providers are configured separately and were not enumerated in this phase. |
| User-limit policy | total=0. Upstream implementation interprets zero as no account-count ceiling; do not confuse this with zero permitted users or the plan's monthly active-user allocation. |
| Email restrictions | Deny free, aliased and disposable email policies all disabled. Current Free plan also reports free/disposable/canonical/corporate email-validation support=false; do not assume a readable policy can be enabled on Free. |
| Sessions / SMTP | Session limit10; custom SMTP disabled and unsupported by current Free-plan flags. |
| Firewall | Disabled; zero custom rules. Current plan includes two rules, price0. |
| Other API surfaces | GraphQL, avatars, teams, Storage and other listed services enabled. Enabled service is not evidence that an untrusted caller may create its resources; authorization still matters. |
| Five tables | files, totals, limits, invitations, members: enabled, permissions=[], rowSecurity=true; columns/indexes available. Limits count/expires are required integers; expiry index available. |
| Bucket | Enabled, permissions=[], fileSecurity=true, maximum20971520 bytes (20MiB), encryption/antivirus enabled. |

The limits-table read that failed in the previous phase succeeded on this phase's first read. The other four tables and bucket also succeeded. Intermittent catalog-discovery connection failures were distinct from successful configuration reads. No failed live cleanup check was inferred, and no cleanup protocol was reopened. Fresh table/bucket metadata does not constitute a new exhaustive row/file permission or direct-access test.

## Source-traced boundaries

| Path / control | What it protects | What it does not establish |
| --- | --- | --- |
| Application signup | `app/api/auth/[action]/route.ts` checks Origin/site, bounded JSON/password/name, persistent global120/min and email10/min, then exact-email pending invitation before keyed Account.create. | Origin is not bot authentication: a nonbrowser can supply it. No proof of invitation is imposed on direct provider requests. |
| Application signin | Password session is created with the server key; recent-auth proof and HttpOnly cookie follow. | Nonmembers may authenticate; admission is checked later. Credential stuffing against the route can consume provider and local proof work. |
| Verification through the app | Session, auth-user10/min, pending invitation and verification3/hour/user; confirmation binds the link to the session's stable account ID. | Does not set a provider-wide email quota. Existing bound accounts are already verified; a changed email cannot claim membership by bypassing these checks. |
| Membership / file services | `lib/membership.ts`, `lib/terms.ts` and `lib/files.ts` require verified active identity, bound membership and owner/recipient authorization. Downloads recheck after fetching bytes. Prospective terms controls exist but remain disabled by a null publication manifest. | Does not prevent provider account creation, sessions or emails outside app routes. No live terms enforcement is claimed. |
| Provider data permissions | Private table/bucket defaults and prior direct-access protocol separate data access from account authentication. | New registrations still consume resources despite lacking file access. This phase did not repeat the earlier direct-denial protocol. |
| Upload validation and rate | 20MiB maximum, validated contents and upload15/min/member. | No lifetime per-member storage cap, total file-count quota or download-byte budget. A trusted/compromised member can exhaust shared resources. |

`lib/http.ts` writes its persistent counter before denying excessive app traffic. The shared global counter is checked before per-email counters, which limits downstream admitted work, but every attempted request can still consume database requests. In later windows more pseudonymous rows can accumulate. Supported weekly limiter review is not ingress protection. Maintenance is local single-host coordination, not a firewall for direct provider clients.

The content route fetches and hashes the entire object before applying a requested byte range. Repeated small range requests can therefore consume full-object provider downloads. Its60/minute limit is not a byte budget. This is another residual resource risk for active members, separate from uninvited account creation.

Direct REST account creation needs a project ID without an invitation or secret API key. An earlier bounded live protocol demonstrated uninvited creation followed by correct application denial; it was not rerun. Current official reference gives10 creation requests/hour/IP, with keyed-server exemption. Distributed IPs evade a per-IP ceiling. Provider verification requires a signed-in account; recovery is another direct email path. No precise current project-wide authentication-email allowance was established. This review triggered none. See [Account reference](https://appwrite.io/docs/references/cloud/client-web/account), [verification](https://appwrite.io/docs/products/auth/verify-user) and [rate limits](https://appwrite.io/docs/advanced/security/rate-limits).

**GraphQL coverage matters:** the service is enabled and official documentation describes account/session creation and batched operations at `/v1/graphql`. A rule only matching `/v1/account` would not cover that outer path. This is a documented additional entry point, not a newly executed exploit. See [GraphQL](https://appwrite.io/docs/apis/graphql).

## Supported choices, cost and limits

- **User ceiling:** policy is configurable; documentation says existing users can continue when the ceiling is reached, while new signup is rejected. Current upstream Account.create checks the ceiling without a key exemption at that check. Thus rate-limit exemption is not evidence of user-cap exemption; filling the cap would also break this app's invited Account.create signup. Upstream main is supporting source, not proof of the Cloud deployment version. A cap with headroom is a finite pool attackers can occupy, not an invitation allowlist. A cap below current count is an alternative only with separately reviewed operator-provisioned admission/password setup. Sources: [policies](https://appwrite.io/docs/partners/project/policies), [upstream Account controller](https://github.com/appwrite/appwrite/blob/main/app/controllers/api/account.php).
- **Email category restrictions:** not a per-invitation allowlist. Blocking free email would exclude intended Gmail users, and this project's Free-plan feature flags do not entitle email validation. Not proposed. [Email policies](https://appwrite.io/docs/products/auth/email-policies).
- **Service/auth toggles:** email-password controls both signup and signin. Disabling Account for session clients would affect current account reads/verification/exit authentication; keyed-server exceptions do not make our session-only client exempt. Blanket disabling or adding admin credentials to session clients is not proposed. [Services](https://appwrite.io/docs/partners/project/services), [auth methods](https://appwrite.io/docs/partners/project/auth-methods).
- **Free Firewall:** two rules/project, disabled rules also consume slots; IP/path/method predicates are available without a premium add-on. API rules cover keyed calls too; Console management remains available according to documentation. A simple deny rule can preserve the second slot. API-key/session/Authorization headers are stripped before conditions, so do not match those as a server exception. Public custom markers/Origin/User-Agent are spoofable. Paid GeoDB/state detection is neither needed nor proposed, and IP geography does not prove Georgia eligibility. [Rules](https://appwrite.io/docs/products/firewall/rules), [conditions](https://appwrite.io/docs/products/firewall/conditions).
- **Firewall throttling/challenges:** IP quotas permit distributed abuse and aggregate legitimate SSR traffic under the server's address. Documented WAF throttling fails open if its limiter is unavailable. API challenges return403 rather than an interactive browser challenge page, so enabling them blindly could break SSR. These are not the preferred first control. [Actions](https://appwrite.io/docs/products/firewall/actions).
- **CORS/default abuse protection:** CORS constrains browser behavior, not an attacker-operated HTTP client. Provider documentation describes infrastructure DDoS protection without promising a project-specific resource or email budget. [Abuse protection](https://appwrite.io/docs/advanced/security/abuse-protection).

## Current resource observations

The organization readback reports Free price0 and two Firewall slots, with allocations corresponding to5GB bandwidth,2GB storage,75000 monthly active users,500000 database reads and250000 writes. These are shared organization allowances, not per-invitation budgets. Current usage readback for the billing interval2026-10-11 through2026-11-10 reports3732 reads,629 writes,7563446 bandwidth bytes and753812 total storage bytes. It reports usersTotal6, which must not be equated with the monthly-active-user metric without a definition. Counters can lag. Current low usage does not demonstrate attack resilience or support attributing every request to a known actor.

The plan's messages allocation was not interpreted as an authentication-email quota. Delivered mail, actual provider email throttles, quota accounting of denied traffic and remaining real-time headroom remain unknown. Canonical pricing's rendered content did not expose all Free cards; the current organization plan payload supplied these allocations rather than a guessed historic price table. [Pricing](https://appwrite.io/pricing), [Free plan behavior](https://appwrite.io/docs/advanced/billing/free).

Free over-limit behavior can prevent new users/uploads or deny API access. There is no approved paid upgrade/overage response. A deny rule is not a zero-cost-traffic guarantee: blocked API requests still reach the provider and can appear in its Passed as well as Denied series. Do not sum those series as unique requests or assume all quota charges disappear. [Traffic metrics](https://appwrite.io/docs/products/firewall/monitor).

## One recommended proposal: P1, server-only provider API plus manual response

**Evaluated candidate, now parked for the local-demo direction:** one Free API deny rule with controlled server egress, retaining invited self-signup and file permissions. Manual thresholds are provisionally approved below. No authentication redesign, CAPTCHA, new key, dependency, dashboard or scheduler is proposed. No production host/egress is selected and residual availability risk is not approved. See HOST_FIREWALL_REVIEW.md for the completed compatibility assessment.

### Exact setting changes proposed, not applied

On project stillroom only: enable Firewall (currently false) and add exactly one rule with ID `stillroom-server-only`, name `Stillroom server-only API`, action **deny**, resourceType **api**, resourceId empty, priority0, enabled=true. Conditions contain `notEqual` on attribute `ip` for each separately approved server egress address, with one address per condition and all conditions ANDed. With one address:

```json
{
  "ruleId": "stillroom-server-only",
  "name": "Stillroom server-only API",
  "resourceType": "api",
  "priority": 0,
  "enabled": true,
  "conditions": [
    { "method": "notEqual", "attribute": "ip", "values": ["UNRESOLVED_APPROVED_SERVER_EGRESS"] }
  ]
}
```

This is a non-executable review candidate: the value is deliberately unresolved, not an invented IP. Include every verified IPv4/IPv6 egress address as a separate notEqual condition; otherwise legitimate alternate-family traffic may be blocked. No path/method exception is proposed, so coverage includes REST account/email routes, GraphQL, Storage and other project APIs. Trusted traffic simply does not match; no broad bypass rule that skips later controls is needed. One rule uses one of two Free slots. See [conditions](https://appwrite.io/docs/products/firewall/conditions) and [API scope](https://appwrite.io/docs/products/firewall/scopes).

Required preconditions: choose an already authorized single persistent host with durable private storage and controlled, stable egress; verify it is not a shared third-party NAT available to arbitrary tenants. A changing residential IP or shared Free-host IP is insufficient without a separately reviewed risk decision. The current local checkout is not a selected production host. No host provisioning, paid IP service or deployment is approved here. If no suitable zero-additional-cost existing host is available, postpone hosted tester access rather than silently purchase hosting or accept shared egress.

**Application code changes: none for P1.** Source currently sends browser actions to relative Stillroom routes; Appwrite calls are server-side. Keep the Account/email-password services, current cap and data permissions unchanged. Current operator scripts must run from the same allowed host; off-host direct SDK access will be denied too. Use existing Console recovery; verify its actual access before activation. Host ingress throttling before database-backed counters remains a deployment prerequisite, not something this Appwrite rule provides. Select the host before drafting its product-specific ingress configuration; do not trust arbitrary X-Forwarded-For.

Exact files affected by the later approved implementation: `docs/SETUP.md` for verified host/egress and host-native ingress instructions; `docs/BETA_OPERATIONS.md` for the accepted review/response procedure; this review, `docs/BETA_READINESS.md` and `docs/VERIFICATION.md` for actual checks. No new application file, environment secret, Cloud schema, acceptance record or tracking store is proposed. Rule management uses the existing authorized Console/operator context with wafRules.read/write and project-level configuration capability; never add management scopes to the runtime key. If existing operator access cannot perform the action, stop and request a precise permission review, not a new key by default.

### Manual operating response (thresholds provisionally approved; other actions stay gated)

- Review organization usage, registered-account count versus approved admission activity, available auth/email errors and Firewall outcomes each weekday and before each admission batch. Reuse existing private operator notes. This is not continuous/on-call monitoring; weekend/detection gaps are a residual risk. Keep the separately approved weekly/pre-tester limiter review unchanged.
- Treat any unexplained account-count increase or provider resource/email warning as an immediate investigation signal when observed. A count delta alone is not proof of compromise. Compare approved invitations/admission activity privately before labeling an account abusive; do not delete or suspend it solely from the count.
- Approved provisional thresholds: at50% of the measurable quotas defined in HOST_FIREWALL_REVIEW.md, review projected consumption; at80%, manually pause new admissions. Review usage each weekday and before admission, and investigate unexplained account growth. This is not automatic enforcement or a hard budget; no numeric email allowance is invented. Other incident mutations still need their proper approval.
- For confirmed ongoing app-driven writes, the existing maintenance begin/drain procedure can pause coordinated operations. Check durable uncertainty and never force-clear locks. This interrupts authenticated requests, including fresh exit-request issuance; preserve existing request dates and cases, keep contact/notices and local signout accessible, document the outage and restore safe authenticated exit handling promptly. Do not pretend an upload-only switch exists. Merely pausing invitations does not stop existing members' uploads.
- For direct-provider activity despite P1, preserve minimal aggregate evidence, verify rule state/egress/GraphQL coverage and stop onboarding. Console disable of this one rule is a compatibility rollback, not an abuse-containment action. Account suspension/session revocation uses the existing reviewed workflow only after separate target authorization. No automatic account deletion, email sending, emergency paid upgrade or protected-row release is authorized.
- Record only check time, aggregate usage/count delta, reason/action, existing case reference if needed and next review. Do not store passwords, tokens, raw auth bodies or newly reconstructed email lists. Apply existing case/hold/correspondence rules; no new retention period or evidence purge is introduced.

Residual risks needing explicit acceptance: allowed-host compromise/shared egress, attacks through public Stillroom routes, aggregate resource exhaustion before a weekday review, malicious/compromised active members without lifetime storage quotas, provider email behavior and WAF-denied bandwidth/quota accounting. P1 is a direct-provider barrier, not full DDoS protection or a proof of bounded monthly consumption. The current Free design does not yet establish adequate overall containment; do not mark this blocker complete before compatible hosting, live boundary checks and operating-risk decisions are resolved.

### Focused verification and rollback for later approval

Before a live change, refresh project/rules and record the original wafEnabled=false/rules-empty state privately; confirm exact server addresses and Console recovery. Dry-match predicates on synthetic trusted/untrusted IPv4/IPv6 cases and confirm all-method/all-path coverage without credentials. No code test package is needed just to inspect this documentation.

After separately approved activation, use one low-volume request per route from trusted and untrusted networks; no load test. Cover REST account creation and GraphQL accountCreate, legacy/current verification and recovery paths, signin, raw table/storage and any alternate project API host. Do not submit real account-creation or email payloads without separately approving exact disposable resources/addresses and failure cleanup. Start non-mutating route probes and verify WAF-specific403/action/rule headers; an application validation error is not proof of a Firewall block. Do not interpret a blocked query as proof that row permissions alone denied access.

Separately approved legitimate-flow tests must cover invited signup, password signin, actual verification/enrollment, existing-session use, file access and revocation, local signout and authenticated account exit through the host. No weakened membership, receipt, gate or permission check is acceptable to make the rule pass. Refresh preservation evidence only as needed; do not repeat completed destructive exit/limiter tests.

Rollback: through confirmed Console access, disable only the new rule, then restore the saved Firewall enabled state if no other rule/settings appeared. Read back both, retain rule/evidence for review, preserve all accounts/uploads/permissions and keep admissions paused. That rollback reopens the known direct-provider surface and must not be described as securing it. Prefer maintenance until a safe fix is reviewed. Do not delete the rule/evidence or widen to shared CIDRs to obtain a pass.

If controlled egress is unavailable, bounded alternatives are (a) separately reviewed operator-provisioned admission with a filled user cap, local signup messaging and secure password bootstrap/recovery, accepting that emails/other requests still need containment; or (b) postpone hosted tester access. Neither is implemented or accepted. Do not temporarily reopen a public signup slot and race an invited tester against attackers.

**Current next approval:** the host compatibility review is complete in HOST_FIREWALL_REVIEW.md. Thresholds are provisionally approved; do not ask for them again. The operator selected a local portfolio demo with no paid server/domain. P1 activation is parked. Recommend a bounded local source/demo release audit next, with no publication, Cloud changes or public listener. A future hosted phase would still require exact egress/ingress, recovery, tests and separate mutation/residual-risk approval.
