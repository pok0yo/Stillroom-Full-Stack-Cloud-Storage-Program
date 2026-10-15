# Contact mailbox verification — bounded test evidence

## Basic test closed with limitations — 2026-10-14

Closed at the user's request; no additional message or mailbox-setting change is needed to close this basic task. Outbound Inbox delivery was user-reported. Return Spam delivery was user-reported and screenshot-supported. Expanded sender/Reply-To and exact receipt times were not verified. **Inbox placement is not marked passed.** The approved operator routine remains Inbox and Spam checks each weekday, prioritizing security/abuse when received. This closes only the bounded two-message task, not universal delivery, future shutdown/material-change communications or hosting readiness.

Minimal private disposition records closure on 2026-10-14 and the separate correspondence review date 2027-01-12 (90 calendar days later). No automatic timer, reminder, cleanup or email deletion was created/executed. Existing documented holds still apply. Earlier preparation/no-closure statements below are historical and superseded.

## Observed result — 2026-10-14

The operator reports sending the authorized SR-MAIL-001 outbound once and finding it in the second controlled inbox, then sending the single reply and finding it in the contact mailbox's Spam folder. The supplied screenshot visibly shows the test thread in Spam, reply sender display name Yuri Ante and displayed time 6:13 PM. Its quoted original header shows Yuri Ante at the approved contact address, October 14, 2026 at 6:11 PM. These are displayed message times, not independently verified receipt times; timezone is not shown. Reply sender address/Reply-To are collapsed and receiving account address is not visible, so those details remain operator-reported or uninspected.

Result: two-way delivery reported; return Spam placement directly supported by screenshot. Do not mark return inbox placement passed, infer universal deliverability or attribute a specific technical cause from Gmail's generic spam explanation. Weekday Spam monitoring remains important. Minimal evidence is in ignored `.private/mailbox-verification/result.json`; no message bodies, screenshot copies or raw headers stored there. No additional test messages or mailbox changes authorized. Case closure is not recorded and no retention timer/cleanup was executed. Historical preparation text below is superseded by this result, not authorization to repeat the test.

2026-10-14 update: the user explicitly authorized exactly the manual SR-MAIL-001 outbound and reply specified in ID 187, with no additional messages. Authorization supersedes the earlier pending-sending labels below. No receipt/sender/routing result has been reported. Provide only the outbound step first; wait for the user's observations before giving the reply step. Record operator-reported evidence as such; do not infer universal deliverability.

No email has been sent. This plan does not authorize publication, invitations, account changes or cleanup.

## Address and operator decisions

The approved address is **yla.stillroom@gmail.com**, matching `app/operator-contact.tsx`, BETA_OPERATIONS.md and the recorded operator approval. That establishes spelling/configuration consistency, not current mailbox control or delivery.

Inputs received 2026-10-14: public/displayed sender name **Yuri Ante**; operator confirms control of this inbox and supplies a second controlled address in the conversation. Check inbox and spam each weekday, prioritizing security and abuse reports when received. Do not publish the personal second endpoint in repository documentation. These are operator statements, not independently observed delivery evidence. Never provide passwords, cookies, recovery codes or verification links. Existing target: acknowledge ordinary requests within five business days, without guarantee. A working mailto link does not prove monitoring or receipt.

No callable Gmail connector is available in this session. Use the manual path after explicit two-message authorization; do not install/link anything. Prepared reference: `SR-MAIL-001`. Outbound sender is Yuri Ante at the approved contact address; recipient is the exact second controlled address supplied in the conversation. Subject: `Stillroom contact delivery test — SR-MAIL-001`. Body: `This is the approved Stillroom contact mailbox delivery test SR-MAIL-001. No account action is requested.` Reply to the contact address in that thread, subject `Re: Stillroom contact delivery test — SR-MAIL-001`, body `Received SR-MAIL-001. This reply tests the Stillroom contact inbox routing. No account action is requested.` The response presents both exact endpoints for approval. No authorization to send has been received.

## Exact bounded test for later authorization

After the operator explicitly approves the two addresses and sending, perform **exactly one outbound message and one reply**, manually in the operator's mail clients. No connector installation, account linking, new inbox, contacts, forwarding rules, filters or Cloud resources are required.

1. From `yla.stillroom@gmail.com`, send to the approved second address. Subject: `Stillroom contact delivery test — TEST_REFERENCE`. Body: `This is the approved Stillroom contact mailbox delivery test TEST_REFERENCE. No account action is requested.` Use a harmless unique test reference; no attachments, links, account IDs or real support content. Inspect From and any Reply-To before sending; record whether the displayed sender name is the approved public identity.
2. In the second inbox, locate the message and note receipt time and initial folder (inbox, spam/junk, other, or not found). Inspect visible From and Reply-To; verify Reply targets **yla.stillroom@gmail.com**, not another address. Reply once in the same thread: `Received TEST_REFERENCE. This reply tests the Stillroom contact inbox routing. No account action is requested.` In the contact inbox, check receipt, initial folder, sender display and reply routing. Record delay/bounce or failure accurately. Do not resend, change settings or add another recipient without further authorization.

If a message is absent, check both inbox and spam/junk and record it as pending/not received at the observation time. Do not invent a maximum delivery time or treat delay as a guaranteed permanent failure. A bounce or wrong reply address is a failed test; preserve only the minimal error category needed for follow-up. Reading a message after moving it from spam does not convert the original spam-placement result to an inbox pass.

## Minimal private evidence

After the authorized test, write a small ignored `.private/mailbox-verification/result.json` or equivalent existing private operator record. Do not store message bodies, passwords, raw headers, full screenshots or an unrelated mailbox export.

Record only: test reference; the two approved endpoints (or a private alias for the second after linkage is established); send/receive observation timestamps; original folder per direction; whether From/display name/Reply-To matched; reply destination; bounce/error category if any; operator-control confirmation; approved monitoring routine; evidence source (`operator-reported` or `directly-observed`); and passed/failed/pending outcome. Keep exact sender details private if they expose an unintended personal identity; public documentation should state only whether they matched approval.

Classify the test as routine correspondence and apply the separately approved 90-days-after-closure rule, with documented exceptions as applicable. Do not start that clock while a delivery/routing problem remains unresolved. No automatic deletion or erasure of mail-provider backups is implied, and no record is created merely to claim a test passed.

## What a pass means

A pass demonstrates, at that time, sending ability from the approved mailbox, receipt at the selected second inbox, working reply routing and receipt back at the contact mailbox, plus the observed sender presentation and folder placement. Operator-reported results must remain labeled as such. Current sign-in/control and a realistic monitoring commitment supplement the delivery evidence; they are not an independent security audit.

It does **not** establish future deliverability, inbox placement for every provider, permanent mailbox ownership/security, continuous monitoring, compliance with every response target, bulk shutdown-email delivery, Appwrite verification-email delivery, domain-wide authentication, mail-provider retention/backup erasure or a tested in-app notice. Those claims cannot be inferred from two messages.

## Required authorization

Before sending, obtain: `I authorize one outbound test from yla.stillroom@gmail.com to [my specified address] and one reply back, using the prepared subject/body and approved sender name. I control both accounts and will perform the test locally.` If the assistant is to send through an existing connector instead, authorization must explicitly identify that sender, recipient and action; do not infer connector access from account-control confirmation. Current phase authorizes neither method of sending.
