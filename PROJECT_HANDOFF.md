# C&K Feed Tickets — Project Handoff / Source of Truth
Last updated: 2026-11-11. **Project is at Stage 8 of 8 (final launch)**, with some outstanding Stage 3/4 corrections. Do NOT restart stages or redo verified tests. The user has invested approximately 15 days and 25–30 hours. Read this file and inspect actual GitHub code/Supabase schema before any new changes. Update this file after substantive milestones.

## Live systems
- GitHub repo: `Rebelworksfeed2026/CK-Feed-Tickets`
- Live app: https://rebelworksfeed2026.github.io/CK-Feed-Tickets/login-v23.html
- Main HTML: `login-v23.html`; associated `tank-groups.js`, `grouped-report.js`, `ticket-ocr-v17.js`, `ticket-photo-storage.js`.
- Supabase project ID: `przmlyzmwnixfgqdafyk`.
- Use connected GitHub and Supabase tools to inspect and change project; user is on iPhone, prefers one copy-link button and minimal instructions.
- GitHub latest main HTML commit at handoff: `fb5966dca32ff8ce4114bb2b9c01104e47666f49` (new correction UI, not yet live-tested). Always fetch current SHA before editing.

## Verified as working (do not repeat)
- Sean successfully signed in as sole administrator.
- Real feed ticket **102885**, 2026-11-11, **24.94 tons**, destination **Tank 106, A06**, was saved to `public.feed_tickets` with original photograph in private `ticket-photos` bucket. Cloud database row and storage object were independently verified.
- User verified ticket appears in the Nov 9–14 weekly sheet.
- User confirmed by screenshot on 2026-11-11 that **View photo** opens the actual saved original ticket. This required moving the photo viewer out of collapsed dashboard and fixing erroneous literal `\\n` in HTML script; now working.
- Large single camera button at top; scanner and ticket form appear only after selecting a photo; weekly sheet below; secondary panels collapsed; horizontal swipe for table on iPhone.
- Monday–Saturday delivery week; no Sunday deliveries.
- Supabase tables `drivers`, `feed_tickets`, `farms`, `farm_tanks`, `feed_managers`, `farm_manager_assignments` have RLS enabled.
- `feed_tickets` RLS: linked users can read; drivers can insert/update their own; admin can update any; office read-only. Private photo bucket, authenticated read policy.
- Database audit 2026-11-11: five active ticket rows with five photo references (not necessarily all independently tested).

## Accounts as verified by live database audit 2026-11-11
- Sean, C&K Farms, admin: linked to auth user; sign-in tested.
- Ricky, C&K Farms, driver: linked to auth user; sign-in by Ricky NOT yet tested.
- Jakeleg, C&K Farms, driver: directory record exists; NOT linked to auth user.
- Cody, Next Page, driver: directory record exists; NOT linked to auth user.
- Brenda, C&K Farms, office/read-only: directory record exists; NOT linked to auth user.
- Three auth.users total at audit; don't assume third belongs to any unlinked person. Do not invent email addresses or credentials. Ask only for missing invitation details when needed.

## Requirements / design decisions
- Sean sole administrator can edit any driver ticket. Ricky/Jakeleg/Cody edit only own; everyone can view others. Brenda office read-only.
- C&K Feed Tickets for Sean/Ricky/Jakeleg; Next Page Feed Tickets for Cody.
- Driver weekly report must match existing historical PDF layout: Day, Load, Ticket #, Tons, Destination, Daily Tons, Weekly Tons; heaviest 🟥, lightest 🟩, biggest day 🟦. Weekly totals, permanent searchable history, comparisons, yearly totals.
- Each ticket number unique; preserve original photos and ticket history; no duplicate insertion. OCR can be corrected manually.
- Farm/tank reporting must aggregate feed across ALL drivers, daily/weekly/monthly/yearly by farm, tank, and driver. Existing tanks unique across farms; keep exact destination strings and A06 code.
- Tackett Fish Farms owns all tanks. Austin Farms tanks 101,102,103,104,105,106,107,110; groups 101–105, 106/110, 107. Q Ponds and Maclewell Farm exist; do not invent their tanks. Manager McNeil assigned to all three effective 2026-11-11.
- User wants offline entry and later sync, and easy iPhone usage. Do not claim implemented until verified.
- No Sunday deliveries; weeks start Monday, end Saturday. May be very few loads early season.

## Stage 8 launch checklist — remaining or not yet fully verified
1. **Stage 3/4 carryover fixes:** user says a few corrections remained; exact original checklist NOT fully recovered. Inspect current app and ask only when necessary rather than assuming details.
2. **Ticket correction UI:** On 2026-11-11 added a `Correct` button per authorized weekly ticket row and `correctionPanel`, `CKCloud.correctTicket` PATCH. Existing database RLS reused. **NOT YET LIVE TESTED.** Preserve working photo viewer/camera. Verify correction UI and safe edit behavior; do not change real ticket 102885 without user direction.
3. Verify final weekly print/report calculations, format, historical lookup, daily/weekly comparisons and farm/tank totals against real records.
4. Verify Brenda office reporting and any Saturday report workflow; do not assume scheduled delivery exists.
5. Verify security with real accounts and offline behavior; offline not present in `login-v23.html` as of 2026-11-11.
6. Finish onboarding/linking Jakeleg, Cody, Brenda, test Ricky sign-in, and test each role's permissions.
7. Launch once outstanding checks pass. Don't declare finished early.

## Recent failure and lessons
The previous assistant repeatedly retested completed features after changing chats and lost Stage 8 context. This file is intended to prevent that. Inspect actual source and DB before modifying, preserve working features, avoid needless user retests, update this file whenever a task changes state. User says “Go” to proceed; perform actual changes through connected tools. Send a copyable Safari URL with fresh cache-busting query after web changes. Never ask user to rescan/re-enter ticket 102885.

## Resume instruction for new ChatGPT chat
“Read `PROJECT_HANDOFF.md` from GitHub repo `Rebelworksfeed2026/CK-Feed-Tickets`, inspect actual current code/database, resume **Stage 8 of 8** with Stage 3/4 carryovers. Do not redo completed features or tests. Update the handoff after each milestone. Start with the latest unverified correction UI and then remaining onboarding/launch work.”

## Recovered original stage history (2026-11-11, from earlier conversations)
- Original eight stages: 1 basic app/feed sheets COMPLETE; 2 cloud storage tested; 3 driver accounts/permissions, final live account testing pending; 4 ticket scanning/offline operation, final verification pending; 5 history/backups built; 6 reports/calculations built; 7 security/reliability near-complete, final verification; 8 live testing/final approval ALMOST COMPLETE, not a fresh stage.
- On 2026-11-10, earlier assistant reported Stage 4 offline queue/sync already built/tested, **but** audit of current `login-v23.html` found no offline logic. Investigate other files/versions before concluding offline feature absent; do not rewrite from scratch.
- Original Stage 3/4 carryovers included: actual signed-in role tests, account permissions, ticket number uniqueness, validation, edit/soft-delete/audit, offline syncing verification.
- Earlier conversation said Brenda may correct all drivers' tickets without being admin; newer Nov 11 app audit and handoff say Brenda office READ-ONLY. **This is an unresolved conflicting requirement; do not silently change permissions.** Ask user only if a change is actually necessary.
- Original Stage 8 remaining included report calculations/format, Saturday office delivery, final real-account tests, security warnings, launch. Real ticket/photo save and view was subsequently verified Nov 11; do not repeat.
- Previous report work included daily/weekly/monthly/yearly reports and All Drivers reporting correction for Office. Verify existing implementation before changing.

## Offline feature forensic audit (2026-11-11)
- GitHub historical commits `999f48be`, `d43084d8`, `7fe9c241` predate `login-v23.html`. Their `index.html` contains `localStorage` phone persistence and backup/export behavior; NOT evidence of working cloud sync queue.
- Current `login-v23.html`, `ticket-photo-storage.js`, `ticket-ocr-v17.js`, `grouped-report.js` have no `indexedDB`, `localStorage`, `serviceWorker`, `navigator.onLine`, `offlineQueue`, or `syncQueue` references. Old offline local storage should not replace current cloud app. Need integrate safely after checking app dependencies.

## Verified live database authorization (2026-11-11)
- Read actual `pg_policies` on `public.feed_tickets`: `Drivers can add own tickets` INSERT WITH CHECK driver.user_id=auth.uid and not office; `Linked drivers can view all feed tickets` SELECT; `Admin can correct all feed tickets` UPDATE USING/WITH CHECK private.is_feed_admin(); `Drivers can update own tickets` UPDATE USING/WITH CHECK driver.user_id=auth.uid and not office.
- No role-policy changes needed. This was independently checked against live Supabase. Never loosen permissions for non-admin drivers.

## Stage 8 progress — 2026-11-11 follow-up
- **Correction form display verified on real iPhone:** Sean opened Correct for ticket 102885; screenshot showed 2026-11-11, ticket 102885, 24.94 tons, Tank 106, A06 correctly prefilled. User tapped Cancel. **No correction was submitted; actual PATCH/save remains untested.** Do not ask to change ticket 102885 merely to test.
- GitHub main HTML changes since handoff: authorized correction checks, duplicate check includes archived/deleted ticket numbers, stale report/photo request guards, stale report/correction clearing when changing week or driver, safe sign-out cleanup and load-button reset, exact hundredths-of-ton arithmetic for weekly totals and ties. These are code changes, **not proof of full live end-to-end tests**.
- Current open items: live correction-save test on a safe test ticket; Ricky/other user login and role tests; Jakeleg/Cody/Brenda onboarding; offline save-and-sync (not verified); all-driver farm/tank daily/monthly/yearly totals; final report/print and security checks.
- User wants concise results, copy-link controls when testing, and no repetitive microstep narration. Continue substantive work rather than declaring app finished.

## Verified iPhone grouped-report milestone — 2026-11-11
- Sean signed in on iPhone and calculated the selected Monday-start week **2026-11-09** across **4 drivers**. The report displayed **1 load, 24.94 tons**, and provisional Austin tank group **106/110: 1 load, 24.94 tons**; unmatched destinations 0. These numbers match the previously verified real ticket 102885 (Tank 106, A06).
- Sean expanded **Weekly totals by driver** and confirmed **Sean — 1 load — 24.94 tons**. Initially the Tons column was clipped on iPhone; CSS was revised in `login-v23.html` (commit `9437def`). A subsequent iPhone screenshot **confirmed all three columns visible**. This UI test is PASSED.
- The grouped report includes collapsible daily, weekly, driver, company, destination, and provisional Austin tank-group views. Only the weekly group and weekly per-driver totals above have been verified against live iPhone screenshots; do not claim the other views have been fully tested.
- The grouped Austin matching remains **destination-text-based**, not true farm/tank foreign-key attribution. Do not claim farm/tank monthly/yearly reporting is complete.
- NEXT PRIORITIES: (1) test actual correction PATCH on a safe test record, never change real ticket 102885 for testing; (2) Ricky login/permissions and other driver/office onboarding; (3) implement and test true offline save/sync safely; (4) farm/tank identity and monthly/yearly reporting; (5) final print/export and launch checks.
- User prefers a **copy-link button** for iPhone, one concrete test request at a time, and no repetitive tiny updates. Do not ask to repeat the completed grouped-report layout test.

## Verified live correction and original-photo test — 2026-11-11
- Sean saved real delivery ticket 102887, dated 2026-11-11, 25.12 tons, initially destination `Tank 701, B1 & B3`, with original Delta Western photo.
- Using Correct on second weekly row, changed only destination to `EG1 309`; selected weekly report displayed `Tank EG1 309`, unchanged 25.12 tons, 2 loads and 50.06 tons total. Live PATCH correction test PASSED.
- Opened saved original photo afterward: original ticket 102887 still clearly displays `Tank 701, B1 & B3`. Photo retention/access test PASSED.
- Do not repeat correction/photo tests or modify ticket 102887 merely for testing. User says office may later update printed destination wording; preserve actual delivered tank `EG1 309` unless user instructs otherwise.
- NEXT: Ricky sign-in and permissions verification; then remaining onboarding, offline queue/sync, true farm/tank aggregation, final export and security tests.

## Stage 8 audit — 2026-11-12 (avoid duplicate work)
- Compared actual live source files `login-v23.html`, `grouped-report.js`, `farm-period-report.js` with handoff history. **Do not rebuild already implemented reporting**.
- Verified existing code exports `CKCloud.listTicketsForPeriod`, `CKCloud.listReportTankAllocations`, `CKCloud.listFarmsAndTanks` and loads the farm-period report. The report offers day, Monday–Saturday week, month and year; shows farm rollups, pond totals, driver breakdowns and incomplete assignments. This is **code inspection only**, not an iPhone acceptance test.
- Verified live Supabase policies for feed_tickets, ticket_tank_allocations, farms, farm_tanks and drivers; read access exists for linked feed members. No policy edits needed.
- Live database checked November allocations: Austin Farms tank 106 24.94 tons; Gililiand EG1 309 25.12 tons; total 50.06. No data modifications.
- Fixed only one newly identified UI defect: changing report period/date while loading could leave Calculate button disabled (commit `54c8f7f`).
- **Remaining priority**: one iPhone acceptance test of period report, then Ricky sign-in/role verification and onboarding, offline queue/sync audit, final print/export. Do not re-test verified ticket save, photo view, correction, or weekly report layout. Never change real tickets merely to test.

## Verified iPhone monthly farm report — 2026-11-12
- User opened installed Home Screen app and expanded farm/pond reporting; confirmed all period choices visible. Selected Month and November 12, 2026, calculated live November report successfully.
- Screenshot: 6 November tickets, 150.16 total tons; 50.06 tons assigned to tanks; 100.10 tons not assigned. Austin Farms pond 106 = 24.94 tons; Gililiand EG1 309 = 25.12 tons. Both assigned rows show driver Sean. Four tickets flagged for allocation review: 102823 (21.76), 102838 (26.22), 102829 (25.95), 102841 (26.17). **Do not auto-assign or alter these tickets without user approval.**
- User screenshot exposed narrow columns with mid-number line breaks. Fixed farm-period report table layout to horizontally scroll with nowrap cells (commit 1784185). This visual fix still needs confirmation eventually, but no need to repeat calculation test.
- Monthly report acceptance: live calculation and correct verified allocations PASSED. Day/week/year report period calculations not yet individually acceptance-tested. Next priority: other accounts/Ricky login and role testing, or careful offline implementation audit. Do not rebuild reports.

## User clarification — 2026-11-12: test tickets
- User explicitly identified tickets **102823, 102838, 102829, 102841** as TEST tickets, not actual feed deliveries. Their combined 100.10 tons must not be presented as real production feed totals.
- Actual verified November deliveries are 102885 (24.94 tons Austin Farms pond 106) and 102887 (25.12 tons Gililiand EG1 309), totaling 50.06 tons.
- The current period report includes test tickets in the 150.16-ton overall ticket total; this is a reporting correctness issue. **Do not delete or mutate test records without permission.** Before implementing exclusion, inspect whether there is an existing test/production flag or archive convention and use it rather than introducing a duplicate system. Never classify other tickets as test without confirmation.

## Test ticket classification implemented — 2026-11-12
- Added `public.feed_tickets.is_test boolean not null default false` (existing RLS retained). User-confirmed test ticket numbers 102823, 102829, 102838, 102841 set to `true`; actual 102885 and 102887 remain false. No ticket deleted; no photo changed.
- `CKCloud.listTicketsForPeriod` now selects `is_test`; `farm-period-report.js` excludes flagged test tickets from daily/weekly/monthly/yearly production totals, with excluded test count/tons separately disclosed. GitHub commits `6fc969f`, `747636c`.
- Database post-change verified November 2026: production 2 tickets, 50.06 tons; test 4 tickets, 100.10 tons. **Period-report frontend update not yet retested on iPhone.**
- The existing weekly driver sheet and older grouped report may still show test tickets; do not claim all reporting screens exclude them until reviewed. Preserve test tickets for historical testing and duplicate detection.

## Weekly production reports now exclude test tickets — 2026-11-12
- Audited existing weekly sheet and all-driver grouped report; both previously counted user-confirmed test tickets. No duplicate reporting implementation added.
- `CKCloud.listWeeklyTickets` now reads `is_test`. Weekly driver sheet defaults to production tickets only; an opt-in `Include test tickets in this weekly sheet (testing only)` checkbox shows test history for corrections/review. The sheet heading discloses test exclusion or inclusion. Commit `052f6f0`.
- Existing `grouped-report.js` now filters `is_test===true` before computing all-driver weekly production totals, commit `ec40dab`. No changes to tickets/photos/allocations.
- Database November production remains 2 tickets 50.06 tons; test 4 tickets 100.10 tons. **These weekly UI changes are code-reviewed but not yet acceptance-tested on iPhone.**

## Weekly production sheet iPhone acceptance PASSED — 2026-11-12
- User screenshots of installed Home Screen app, week Monday 2026-11-09 through Saturday 2026-11-14: only two real tickets displayed, 102885 (24.94 tons) and 102887 (25.12 tons), 2 loads, 50.06 tons. Test tickets excluded. Weekly running totals 24.94, 50.06; heaviest 25.12, lightest 24.94, biggest day Wednesday 50.06. Sideways table scroll verified on iPhone.
- **Do not repeat weekly production ticket exclusion acceptance test.** All-driver grouped weekly report exclusion is code implemented but not separately acceptance-tested. Continue with remaining Stage 8 driver roles, offline and print/export verification.

## Driver accounts and permissions audited — 2026-11-12
- Direct Supabase query: Sean (admin), Ricky (driver), Jakeleg (driver), Cody (Next Page driver), Brenda (office/read-only) **all five have non-null `drivers.user_id` links**. No account creation or re-linking required.
- Audited RLS: linked drivers can view all feed tickets; non-office drivers can insert their own; update own tickets; administrator can update all; office cannot insert/update. Driver table SELECT for feed members and admin-only insert/update. No policy changes required.
- **Do not repeat account provisioning**. Remaining: actual sign-in on Ricky/Jakeleg/Cody/Brenda devices and UI role verification; account linkage alone does not confirm successful sign-in.

## 2026-11-12 offline audit / Brenda status
- User confirms Brenda has received her invitation, but user is awaiting her reply; **successful sign-in not confirmed**. Do not resend or recreate account.
- Re-inspected current live `login-v23.html`: ticket confirmation explicitly rejects `navigator.onLine===false` with `Ticket NOT saved`; `CKCloud.saveTicketWithPhoto` uploads photo then creates cloud ticket; no IndexedDB draft queue, service worker or reconnect upload worker. Prior offline prototype's localStorage is unrelated to current production cloud flow.
- Offline feature remains **NOT IMPLEMENTED**. Do not claim offline save/sync works. Implementation requires atomic durable photo+metadata local storage, per-driver isolation, reconnect auth, idempotent cloud upload, duplicate detection, clear queued/failed/synced statuses, and tests. Do not alter verified live tickets/photos.

## CORRECTION: Historical offline tests recovered — 2026-11-12
- User correctly states offline tests were already performed. Retrieved prior conversation records: **Nov 5–6 Cloud Beta C&K Feed Tickets** tests confirmed offline ticket save, automatic cloud sync on reconnect, offline photo retention and subsequent photo cloud upload; UI showed `1 ticket waiting to sync`. Test ticket was removed. **Do not repeat these historical tests.**
- Recovered actual GitHub file `offline-queue.js` (9,855 chars), an IndexedDB offline queue built for the earlier `index.html` Cloud Beta, using `#entry` and Supabase client auth. Previous handoff's claim that no offline queue exists in repo was incorrect. **Do not rebuild from scratch.**
- Current Home Screen `login-v23.html` does not load `offline-queue.js`; it explicitly blocks offline save. Thus historical Beta test PASSED, but integration into current Home Screen version is outstanding. Carefully adapt/reuse existing queue only after compatibility/security audit, preserve real tickets/photos. No iPhone retest requested at this stage.
- Brenda received invitation; awaiting sign-in response.

## CONSOLIDATED NO-REPEAT AUDIT — 2026-11-12 (authoritative current checklist)
**Completed / do not repeat:** Home Screen app and Sean sign-in; live ticket/photo cloud save, original photo viewing and correction PATCH; weekly sheet with running totals and marker/scroll acceptance; Monday–Saturday week; farm/pond directory and two actual allocations; monthly farm report calculation; production/test flag and weekly production-only iPhone acceptance; all five drivers linked; feed_tickets RLS role policy audit; historical Cloud Beta offline queue/photo/sync tests. No live tickets/photos altered.
**Built but limited verification:** farm-period report day/week/year period outputs and revised test exclusion/nowrap; grouped all-driver test exclusion; actual print-to-PDF layout; client role visibility with Ricky/Jakeleg/Cody/Brenda accounts; duplicate detection code (do not rerun risky real-ticket test).
**Actual outstanding engineering:** integrate existing `offline-queue.js` (Cloud Beta, uses `#entry`/Supabase client) with current `login-v23.html` (uses CKCloud, no offline queue loaded), preserving photo+metadata, account isolation, safe idempotent reconnect and user-visible pending state; verify export/print formatting; audit security/storage and release behavior. Current HTML includes `window.print()` and weekly print handler, so DO NOT rebuild print feature.
**External pending:** Brenda invitation received but sign-in confirmation pending; Ricky/Jakeleg/Cody actual login and role UI tests pending. Do not recreate accounts or resend invites.
**Potential product decision:** prior records conflict on Brenda edit permissions (some earlier discussions say office can correct; current database enforces read-only). Do not silently change; clarify only when relevant.
**Avoid repeats:** do not redo original Cloud Beta offline tests, monthly calculation, weekly sheet, photo save, correction, or user creation. For offline, only verify integration in current Home Screen build after adapting prior code.

## Offline integration compatibility audit — 2026-11-12
- Inspected full existing `offline-queue.js` and current `login-v23.html`. Old module assumes global Supabase JS `supabase.createClient`, DOM IDs `entry`, `save`, `ticket`, `tons`, `dest`, `date`, `week`, `rows`, `app` and an old 50-ton numeric rule. Current app uses embedded `CKCloud`, `draftNumber`, `draftTons`, `draftDestination`, `draftDate`, `confirmSave`, `verifiedTicket`, a mandatory ticket photo, and permits up to 100 tons. **Never just append the old script**: its initialization would fail and/or target wrong fields.
- Old module's queue keys are `ticket_number` and include `user_id`; photo stored as ArrayBuffer. Old sync directly inserts feed_tickets and uploads photos, while new `CKCloud.saveTicketWithPhoto` uploads photo first and inserts ticket. Existing old sync handles same-ticket different-details conflicts but not the current app's complete validation, soft-deleted duplicate semantics, or per-user queue UI. Need preserve safe photo retry semantics and avoid cross-user sync.
- Integration steps remaining: add adapted queue helper for current CKCloud/session; durable IndexedDB ticket+photo writes; user-scoped pending view; verified ticket duplicate check before upload; cloud save/photo idempotency and partial failure recovery; connect to current `confirmSave` and sign-in/out, sync on reconnect; acceptance-test only this NEW integration (not prior Beta test). Do not change live ticket path until adapter is ready and reviewed.
- No production HTML changes in this audit; existing live app remains unchanged.

## 2026-11-12 offline integration progress — STAGED ONLY
- Created `offline-current-adapter.js` in GitHub commit `d4ee95d8bd20169ea6a181407ca958a993beede9`. It adapts the original Beta IndexedDB idea to current CKCloud ticket shape, preserves original photo bytes, scopes queue records by user ID, rejects duplicate queued ticket numbers, and retains local copies on cloud duplicate/conflict rather than silently deleting them.
- **NOT loaded by live `login-v23.html`; NOT yet integrated or tested.** No live app behavior changed and no ticket/photo data touched. This is a safe staging milestone, not completion.
- Important remaining design issue: CKCloud currently uploads photo before insert; partial failures may leave private orphan photos. Before activating adapter, implement safe retry/reconciliation, account identification, UI pending state, reconnect trigger and confirm-save flow, and verify JS syntax. Avoid automatic sync until conflict and photo idempotency are handled.

## Offline staged adapter validation correction — 2026-11-12
- Confirmed current CKCloud exports `myProfile`, `findTicketNumber`, `saveTicketWithPhoto` required by staged adapter.
- Corrected escaping in staged adapter validation regexes (date and image MIME), commit `dfa59df3640d931075ac577240f6ad6baa6bc3e0`. The previous staged version would have rejected valid dates/photos. Live HTML remains unchanged.
- Staged adapter still NOT activated. Remaining critical integration: signed-in user ID from `CKCloud.myProfile().user_id`, offline confirm-save UI and pending counter, sync on reconnect, photo upload partial-failure reconciliation and safe duplicate resolution. No claim of current Home Screen offline readiness.

## User instruction (2026-11-12)
User explicitly requests assistant finish all possible remaining work independently and contact user only when action is required. Do not repeat previously passed Beta offline test. Do not claim staged code is live. Current `login-v23.html` confirmation preview requires cloud lookup and save explicitly blocks offline, so merely loading the staged adapter is insufficient. Need code integration with careful testing and safe retry semantics before deployment. Pending human sign-ins for Ricky/Jakeleg/Cody/Brenda and visual PDF approval remain external dependencies.

## 2026-11-12 offline integration preview (not production)
- Created `login-offline-preview.html` from active `login-v23.html`, commits `ceb1ff61fa31199783ecd5e5f2541f39df3c57b8` and `0aa7c6071cd37cd7e2502212091518d4892a4fca`. This separate preview loads `offline-current-adapter.js`, accepts offline preview/confirm-save with original photo into IndexedDB, reports queued ticket numbers, syncs on reconnect, preserves queue on errors/duplicates, and uses cached profile only for a previously authenticated non-office driver on that device when offline.
- Production `login-v23.html` **unchanged**. Preview has not had device acceptance testing. Important: existing current HTML `showSignedIn` still attempts cloud listDrivers when offline; offline ticket entry may need to be made visible manually; preview should be reviewed/verified before promotion. The queue preserves data on ambiguous upload/insert failures; it does not automatically reconcile orphaned photos. Need robust recovery, photo validation and duplicate conflict handling before production release.
- User requested independent work until human verification needed. Do not send preview to drivers or replace Home Screen URL until code and device tests pass.

## 2026-11-12 safe offline retry milestone
- Updated `offline-current-adapter.js` (`c285c4309d59646960beb29b4942104c98a228fe`): on existing cloud ticket number or ambiguous photo/ticket upload failure, persist `needs_review` in IndexedDB, keep original image and metadata, block subsequent automatic retries. Failed cloud duplicate lookups do not attempt uploads. This is deliberately fail-closed; administrator resolution UI and safe manual reconciliation still required.
- Updated `login-offline-preview.html` (`82122a7dc0f08d40723b83231843279cff694cde`) to show `(needs review)` for blocked queued tickets. Live `login-v23.html` remains unchanged. No live iPhone test yet.

## 2026-11-12 offline/online duplicate prevention
- Preview `login-offline-preview.html` updated (`f90696bc89e8fb1029d835842125fa3a6ccd73c6`): online preview duplicate check and final online save both check locally queued ticket numbers before attempting cloud save. This closes a path where an offline pending ticket could otherwise be uploaded twice via online entry. No production change.
- Important outstanding: confirm page can launch while entirely offline (service worker/cache), durable queue and storage quota behavior, app syntax/browser acceptance, offline photo capture on iPhone, manual review/reconciliation for `needs_review`, final live activation only after acceptance. Prior Beta offline success does not prove new preview integration.

## 2026-11-12 offline preview shell cache
- Added `offline-preview-sw.js` commit `ee746fb10907ecc986463b6ab4354bd90e0c858e`, registered only in `login-offline-preview.html` commit `f1f54a2ba989759a87870cf10afa779b7d3dd6c8`. Cache contains preview HTML and local JS/image assets, never intercepts Supabase or non-GET requests. Purpose: allow repeat opening preview without internet after a successful online install/cache.
- Confirmed named JS assets exist in repository; icon fetch is binary and text fetch cannot decode it, not evidence of absence. **Not device-tested**, and SW install could fail if any asset returns error. Production login-v23.html remains unchanged; service worker is scoped to GitHub Pages repo root but only intercepts allowlisted preview resources.
- Known concerns before release: offline authentication cached profile needs careful security review; iOS offline launch acceptance, camera/photo validation, IndexedDB durability, `needs_review` resolution, and preview JS parsing all still unverified. Do not declare production-ready.

## 2026-11-12 preview code audit and cache refresh
- Offline adapter photo validation now matches production private photo helper: JPEG/PNG/WebP only, 0 < size <= 10 MB (`99c4f00f1dabe823b2874d8f45d50679aadab145`).
- Offline preview service worker updated to `ck-offline-preview-shell-v2`: network-first for allowlisted local preview shell files, cached fallback when disconnected; no cloud/API or non-GET interception (`9b2f7fa9119cf812a72612879204def93479dd8b`). Avoids serving indefinitely stale app code after updates.
- JavaScript parse checks via JS Function constructor passed for adapter, SW, and all three inline preview scripts. This is syntax-only; no browser or iPhone functional test has been performed. Production unchanged.

## 2026-11-12 offline-only UI finalization
- Preview `login-offline-preview.html` commit `481f6432f2cdacd34a6bc69ed43f2bffc0eca0a8`: hide cloud-only admin/manager controls offline, re-enable on online event. All three inline preview scripts passed JavaScript parse checks after change. No production modifications.
- Next gate is human iPhone preview acceptance (existing Beta test already passed historically, but current preview differs); do not silently promote preview or assume iPhone test has passed. Test on nonproduction example ticket and avoid uploading a fake ticket to live cloud unless clearly marked as test.

## 2026-11-12 iPhone offline photo acceptance and scanner fallback
- User tested preview on iPhone: reopened in Airplane Mode on second try and selected existing ticket screenshot/photo offline; preview displayed image. The first attempt did not reopen and user only reopened by tapping link in ChatGPT. Do NOT claim Home Screen/offline launch reliability fully passed.
- OCR showed `Scanner library could not load` offline. Root cause: `ticket-ocr-v17.js` loads Tesseract.js from external CDN dynamically, plus language/worker assets. It is not self-contained offline. Preview-only copy `ticket-ocr-offline-preview.js` (`7ff7b0f9fca2c118724ff7fe94ffcfa92fd65dcc`) now displays clear manual-entry instructions when offline and scanner absent; it does not falsely claim offline OCR. Preview HTML switched to this copy (`023cdeeb9f9fc88e56fdaa9a989347cd19934692`), service worker cache v3 includes it (`e3f2dfdf2ad7a5aab164173654de734737621030`). Production OCR unchanged.
- JS syntax checks passed for three preview inline scripts, preview scanner and SW. Next user acceptance: manual entry/preview while offline; do not save previously existing ticket 102887 or any actual duplicate; use non-production test only after safe handling agreed. Offline OCR itself remains a product gap requiring bundling scanner/worker/language assets or alternate on-device OCR.

## 2026-11-12 09:24 CT — actual iPhone offline preview acceptance
- User opened preview while online, switched to Airplane Mode, selected existing photo `IMG_4884.png`, manually entered ticket 102887 (25.12 tons), and tapped `Check ticket number / preview` while offline. Screenshot clearly showed OFFLINE confirmation panel with date 2026-11-12, ticket 102887, tons 25.12, destination `Tank 701, B1 & B3`, photo `IMG_4884.png`. This **passes offline manual ticket/photo validation and confirmation preview**. Destination/date were test inputs, not verified real ticket metadata.
- User switched internet back on to send screenshot (expected). User returned to welcome screen; screenshot showed `Offline queue: no tickets waiting.` **No Save Ticket & Photo action was taken.** No cloud records were modified and no duplicate was created. Do not repeat this acceptance test.
- Code review confirms preview service worker v3 caches its HTML and scanner fallback; offline queue adapter persists original photo bytes in IndexedDB; automatic sync is coded to run on reconnect with duplicate check and fail-closed review. **Actual current-preview offline Save Ticket & Photo, automatic cloud sync, and Home Screen standalone offline launch are not yet end-to-end accepted.** Do not label complete. Live production page unchanged.
- User repeatedly requests assistant to proceed autonomously; prioritize code audits and safe checks, avoid creating real/test records or requesting duplicate steps.

## 2026-11-12 — Brenda onboarding pending; user requests no repeated interruptions
- Brenda sent screenshot from Windows desktop of older local `index.html` interface (Sean/Ricky/Jakeleg/Cody tabs and Add feed ticket) with URL fragment visibly containing `error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired`. Do not interpret as a successful office login. User emailed Brenda the direct secure `https://rebelworksfeed2026.github.io/CK-Feed-Tickets/login-v23.html` link at ~09:50 CT. Await Brenda's screenshot or report; do not ask her to repeatedly test. Password setup/invite validity may still need correction. No permission changes.
- Reviewed current preview code: `syncOfflineQueue` runs on reconnect and on signed-in initialization; `CKOfflineStaged.sync` checks cloud ticket number, retains original photo if uncertain, blocks duplicates. `saveTicketWithPhoto` validates driver, photo, date, ticket, and uploads photo before inserting ticket, with explicit partial-failure error. This is a **static code review**, not an actual offline save/sync success test. No production data altered.

## 2026-11-12 — preview sync result visibility improvement
- Found a UI bug in preview: `syncOfflineQueue` displayed `Synced N ticket(s)` but its `finally` called `updateOfflineStatus()`, which immediately overwrote success with `Offline queue: no tickets waiting.` This made it hard to confirm whether automatic sync succeeded. Fixed **preview only** in commit `f4fbdd25238c2f160ebf7d229e4655ebd5b6f7ad`: store last successful sync status in `offlineStatus.dataset.lastSync` and show it after queue refresh; clear prior status at start of a new sync. All three inline JS scripts passed parse checks. This is not proof of end-to-end sync. Production page unchanged.

## 2026-11-12 — offline sync manual retry in preview
- Added `Retry saved ticket sync` button to preview-only `login-offline-preview.html` (`acd7a4e27b99f1cf3de2becc5727fefe86ecf613`). Visible only when online with at least one queued item not already blocked for manual review; it invokes existing guarded `syncOfflineQueue()` and its cloud duplicate checks, not a bypass. Addresses scenario where automatic reconnect sync fails due to temporary network/auth conditions and no new online event occurs. Blocked `needs_review` tickets cannot be retried through this button. All three inline scripts parse. **No actual cloud sync test yet.** Production page unchanged.

## 2026-11-12 — iOS resumed-browser offline sync check
- Preview-only `login-offline-preview.html` commit `1a4f347f8af12c34a62e5a709493785d2099c7d7`: added guarded `pageshow` and `visibilitychange` checks to call existing `syncOfflineQueue` when an authenticated iOS browser tab returns online. Complements online event and manual retry because iOS may suspend tabs during connectivity changes. Existing `offlineBusy` prevents concurrent sync. All three inline JS scripts parse. Actual end-to-end sync still unverified. Live page and data unchanged.

## 2026-11-12 — blocked queue safety
- Preview-only `login-offline-preview.html` commit `d22e922dad7a0e38e7aa3ec2e2423a838877b7a0`: if all offline queue records are `needs_review`, skip repeated automatic sync attempts and show administrator review required. Hide retry button while a sync is active. No blocked record is deleted or retried. Three inline scripts parse. Actual offline save/sync remains untested. Live unchanged.

## 2026-11-12 — live Supabase read-only security audit
- Ran Supabase `get_advisors(type=security)` against `przmlyzmwnixfgqdafyk`: one WARN `auth_leaked_password_protection` (leaked password protection disabled), remediation https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection. Do not silently change auth configuration; consider enabling before launch.
- Queried `pg_policies` read-only for `drivers`, `feed_tickets`, `farms`, `ticket_tank_allocations`. Confirmed: authenticated linked users can SELECT, `feed_tickets` INSERT requires matching `drivers.user_id=auth.uid()` and `is_office=false`; own UPDATE requires same and WITH CHECK; admin UPDATE via `private.is_feed_admin()` with WITH CHECK; office users have no feed ticket write policies. `ticket_tank_allocations` INSERT/UPDATE/DELETE requires owning driver or admin; farms INSERT/UPDATE admin only. This is policy inspection, not a real-account penetration test. No rows or settings changed.

## 2026-11-12 — offline blocked ticket diagnostic visibility
- Preview-only `login-offline-preview.html` commit `c3f176020635d9e25efa9363eb1d9f8e790e5c5c` displays `needs_review` reason from existing IndexedDB queue metadata, including possible duplicate/ambiguous cloud upload, beside the ticket number. This helps sole admin distinguish why a ticket is blocked without resubmitting or deleting its original photo. No data changes, all three inline scripts parsed. Still needs live iPhone acceptance.

## 2026-11-12 — read-only live ticket integrity audit
- Supabase SQL: 13 total feed_tickets, 13 distinct ticket numbers, 2 active real tickets totaling 50.06 tons, 4 active test tickets, 7 soft-deleted/archived rows. All 6 active tickets have non-null photo_path. 2 ticket_tank_allocations rows, zero missing parent feed_tickets. No data mutated.
- Static code review: `farm-period-report.js` filters `is_test===true` out of production totals; `grouped-report.js` filters `is_test!==true` and deduplicates IDs. These are code checks, not complete end-user report rendering tests. Do not confuse archived 7 records with new active tickets.

## 2026-11-12 — database-level duplicate enforcement verified
- Read-only `pg_indexes` query confirms `public.feed_tickets` has `feed_tickets_ticket_number_key`, a UNIQUE btree index on `ticket_number` across all rows, plus primary key on `id`. This enforces uniqueness independently of client-side checks, including concurrent uploads. No database changes made. Note: unique index also includes archived rows, consistent with historical ticket-number reuse prohibition.

## 2026-11-12 — read-only account linkage check
- Queried `public.drivers` for name, company, `is_admin`, `is_office`, and whether `user_id` is populated. All five configured accounts (Sean, Ricky, Jakeleg, Cody, Brenda) have non-null linked user IDs. Sean is sole admin; Brenda office-only; others ordinary drivers. Cody company Next Page, others C&K Farms. This does NOT prove login/password/invite success, user confirmation, or permission behavior in a live browser. Brenda's prior `otp_expired` remains unresolved. No accounts modified.

## 2026-11-12 — auth activation status audit
- Read-only join of `public.drivers.user_id` to `auth.users`: Sean `email_confirmed=true`, `ever_signed_in=true`. Brenda, Ricky, Jakeleg, Cody each `email_confirmed=false`, `ever_signed_in=false`. All five profile links exist, but only Sean has completed activation. This explains why a profile link alone does not mean Brenda can log in and is consistent with her observed expired OTP invitation. Need a deliberate new invitation/password setup workflow, not duplicate profiles; coordinate to avoid interrupting Brenda repeatedly. No user/auth settings modified.

## 2026-11-12 — read-only farm/tank allocation reconciliation
- SQL compared `feed_tickets.tons` to summed `ticket_tank_allocations.tons` for all six active tickets. Production ticket 102885 24.94/24.94 tons, 102887 25.12/25.12 tons, combined 50.06/50.06. No real ticket allocation mismatch. Four active test tickets 102823, 102829, 102838, 102841 have zero allocation; report code filters `is_test=true` out of production totals. No data changed. This verifies stored allocation arithmetic, not browser-rendered reports or all future data.

## 2026-11-12 — offline queue blocked-row continuation fix
- `offline-current-adapter.js` commit `aea8c4280291cfe14ba2c0f15c967ee980486010`: in `sync`, skip records already `needs_review` instead of throwing and halting the entire queue. The blocked record/photo stays untouched, and later pending tickets may sync using the existing cloud duplicate check and fail-closed ambiguous-upload logic. Any newly encountered duplicate/ambiguous upload still halts the run for safety; no unsafe automatic retry.
- `offline-preview-sw.js` cache version v3 -> v4 commit `dd69b50a036795dc6dc380f18f7cebd4f36e9ead` to pick up adapter change. JS parse checks passed. Preview only, not live; end-to-end behavior still requires testing.

## 2026-11-12 — Stage 8 offline preview partial-sync clarity
- Rechecked preview HTML 3 inline scripts, offline SW and IndexedDB adapter syntax: all parse. All seven local external scripts referenced by preview are included in offline SW cache asset list. Corrected preview `syncOfflineQueue` message in commit `cc1e21f81be6ce106ec5e51c00b16b61a0034eb0` to show how many synced and how many remain, avoiding misleading `Synced 0` success when only review-blocked items remain. No production changes. **Still not an end-to-end iPhone/cloud acceptance test.** Keep original Stage 8 five-item checklist; do not count small patches as new stages.

## 2026-11-12 — Sean-first operational launch decision
- User explicitly prioritizes using his own working account now, without waiting for Brenda/Ricky/Jakeleg/Cody activation. Do not gate Sean's ticket entry on their sign-ins. Do not repeat completed historical offline tests.
- Read-only review of `login-v23.html`: contains authenticated cloud save with photo, duplicate safeguards, weekly/report interface; all 8 inline JS blocks parse. **Production `login-v23.html` does NOT contain offline queue functionality** (no `offline` references). Preview is separate. Do not tell user live app supports offline saving or silently promote preview. Existing Sean auth confirmed and signed in; live browser end-to-end save not freshly tested in this review.
- Operational guidance: Sean can begin using live `login-v23.html` for ONLINE loads, provided he confirms a real save when available. Offline capability remains preview-only pending safe acceptance/promotion. Other accounts can activate later. No live files/data changed.

## 2026-11-12 — live login onboarding blocker isolated
- Read-only audit of live `login-v23.html`: sign-in form exposes email/password only; `CKCloud.signIn` uses `/auth/v1/token?grant_type=password`. No password recovery (`/auth/v1/recover`), invitation acceptance (`/auth/v1/verify`), or password setup UI appears in live page. Existing Brenda invite expired; Brenda/Ricky/Jakeleg/Cody auth accounts remain unconfirmed/never signed in. Thus sending direct login URL alone does not solve first-time setup; avoid asking them to repeatedly attempt login.
- Sean has confirmed working account; prioritize his online operational use independently. Next onboarding action: safely design/test one-time invitation/recovery flow and correct redirect behavior before contacting coworkers again. Do not silently modify live login, send emails, or change auth settings without proper checks.

## 2026-11-12 — onboarding method research (no coworker action)
- Supabase current docs confirm `signInWithOtp` with `shouldCreateUser:false` permits existing-user-only email magic link sign-in, avoiding accidental creation of unlinked accounts; redirect URL must be allowlisted in Auth URL Configuration. Password recovery uses `resetPasswordForEmail` and requires password update UI after recovery. Existing live `login-v23.html` has neither flow and old expired invitation remains unusable. Avoid sending coworkers another untested link. Next technical step is inspect/confirm auth redirect configuration and implement isolated tested onboarding flow; do not silently edit production or send email. No data/accounts changed.

## 2026-11-12 — launch gate audit, no coworker contact
- Rechecked live `login-v23.html` scripts: both nonempty inline JS blocks parse; secure password sign-in, photo save confirmation, printable reports present. Live app has **no offline save** and no CSV/JSON export interface; do not promise either in production. Production remains suitable for Sean's online ticket entry, not full offline-feature launch.
- User explicitly prohibits further coworker requests until app is complete and ready. No invites or emails sent. Account activation (Brenda/Ricky/Jakeleg/Cody) must be designed and tested without coworker involvement before any outreach. Supabase Auth email redirect allowlist remains unverified; avoid claiming magic link onboarding ready.
- Launch blockers remain: safely promote accepted offline feature after verification; reliable auth activation/link handling; final user-facing end-to-end checks. Do not repeatedly re-audit syntax or historic offline tests as substitute for acceptance.

## 2026-11-12 — offline duplicate queue continuation
- Fixed preview adapter: a cloud-confirmed duplicate queued ticket is now marked `needs_review`, retained with original photo, and skipped so later independent queued tickets can sync. Previously sync threw and prevented later records. An ambiguous cloud save still halts safely; no automatic retry of ambiguous outcome. Adapter commit `0f3a17ea12f1ef4367c41dc2f8e209a025c4a96f`, SW cache v5 commit `40284b5ab919fae5e6520520a72b535409d07c7c`. JS parse checks passed. **Preview only**, no live promotion, no ticket/account changes, no coworker requests. Runtime end-to-end test still pending; do not equate parse check with acceptance.

## 2026-11-12 — isolated existing-account onboarding preview
- Created `account-setup-preview.html` (commits `2655ca4e051a251e6e43e92a10e9c5ea19cfda18`, `5325387507d96fe34bb9f10562c3c2aa6372afc9`). Standalone preview only, not linked from production login. Sends `/auth/v1/otp?redirect_to=<preview-url>` with `create_user:false` for existing accounts, parses implicit-flow callback fragment, verifies `/auth/v1/user` and linked `/rest/v1/drivers` profile, then saves session in existing `ck-feed-auth-v1` key and opens `login-v23.html`. Removes callback tokens from address bar. JS syntax checked. **NOT YET TESTED END-TO-END.** Supabase Auth redirect allowlist must include preview URL, and email template must return to specified redirect; without that, activation may fail. Do not send coworkers this preview or claim account onboarding complete. No OTP email was triggered, no account/data changes, live untouched.

## 2026-11-12 — redirect allowlist user-confirmed, callback hardened
- User screenshots of Supabase Auth URL Configuration show **one Redirect URL** saved, displaying GitHub Pages path ending `CK-Feed-Tickets/account-setup-previe...` (truncated on iPhone). Site URL unchanged. Treat exact full allowlist value as not completely visually verifiable from truncated screenshot; user pasted recommended full URL.
- `account-setup-preview.html` commit `cc64c3eb8eeab14fc28042759c226ff5c2e5801f` handles expired auth callback errors from query parameters as well as URL hash, removes error parameters from browser URL, and fetches full linked profile fields consistent with live `myProfile`. Syntax checked, no real login/OTP sent. Do not claim end-to-end sign-in works yet. No coworker contact, no production changes.

## 2026-11-12 — real account onboarding acceptance passed (Sean)
- User requested OTP through `account-setup-preview.html`; page confirmed request accepted. User opened newest email link on iPhone; screenshot at 11:01 AM showed `C&K Feed Tickets` live `login-v23.html` displaying `Welcome, Sean`, `Access: Administrator · C&K Farms`, `New delivery` and weekly dashboard. **Actual end-to-end one-time email sign-in passed for Sean's existing account**. Do not ask user to repeat.
- This verifies allowlisted redirect, OTP callback, session handoff, linked profile and admin display for Sean. Does **not** verify first-time unconfirmed coworker accounts, office-only permissions, or offline synchronization. User prohibits coworker testing/contact until app ready. No new ticket created or changed.

## 2026-11-12 — database authorization policy recheck
- Read-only `pg_policies` query verified `drivers` SELECT linked-member/own, INSERT and UPDATE admin only; `feed_tickets` SELECT linked members, INSERT non-office own driver only, UPDATE own non-office or admin; `ticket_tank_allocations` writes own active ticket or admin; `farms` writes admin only. This supports intended office read-only and driver edit separation at RLS policy level. Not a live session acceptance test for other users. No schema or data changes. Do not ask coworkers to test before launch.

## 2026-11-12 — offline preview disconnected-sync guard
- Preview-only adapter `offline-current-adapter.js` now refuses sync if `navigator.onLine===false`, leaving saved tickets untouched (commit `3ce42e7673d6b1422c59b9e8bd9a0506bbce7198`). Offline preview SW cache bumped to v6 (commit `10bdb038b1dd189419e3295246ee120752658233`). JS syntax checked; real end-to-end sync not re-tested. Production `login-v23.html` unchanged. User will independently log next actual feed ticket online when available; do not fabricate a test ticket.

## 2026-11-12 — read-only live authorization verification
- Queried Supabase `pg_policies` for `public.drivers`, `public.feed_tickets`, `public.ticket_tank_allocations`, `public.farms`, and `storage.objects` ticket photo policies. Confirmed ticket INSERT requires matching authenticated driver with `is_office=false`; UPDATE own or admin, office has no edit policy; linked users SELECT; farms admin-only writes; tank allocation writes own/admin; ticket photo INSERT requires owner user-ID folder and non-office member; ticket photo SELECT restricted to linked accounts. This is policy inspection, **not** actual coworker login test.
- No DB mutation, production change, account email, or ticket changes. User's Sean magic-link acceptance already passed and must not be repeated. Offline preview still not released.

## 2026-11-12 — offline sync authorization recheck
- Preview-only `offline-current-adapter.js` now rechecks `cloud.myProfile()` before uploading any queued ticket, requiring same `user_id` and non-office profile; failure retains all queued tickets/photos. Prevents cached offline driver queue being silently uploaded after office-only role change. Commit `44191121c338281a2f386d5019d866611d17f716`; preview SW cache bumped v6 to v7 commit `0608788f159dcaa5de2a69c76e7d6f083329fbfe`. JS syntax checks passed, runtime integration not yet tested. No production/account/ticket changes.

## 2026-11-12 — offline integration static gate (no release)
- Re-fetched current GitHub adapter, preview page and SW. All parsed successfully: adapter, 3 preview inline JS blocks, SW. Verified `CKCloud.myProfile` exists to support new sync authorization check, `CKOfflineStaged.enqueue` is wired to offline photo save, uncertain cloud upload preserves queued copy via `markBlocked`, and SW handles only same-origin GET requests for listed assets. These are **static integration checks**, not actual IndexedDB/network end-to-end tests; do not claim offline launch acceptance.
- No production change, no ticket or account change, no coworker contact. Offline preview remains staged until actual save/sync acceptance and offline standalone behavior are verified.

## 2026-11-12 — user changes launch scope: ONLINE ONLY
- User explicitly stated offline operation is not important: without internet, the app should simply not work. **Remove offline queue, delayed sync, offline Home Screen operation and offline OCR from launch requirements.** Do not promote `login-offline-preview.html` or `offline-current-adapter.js`; keep live `login-v23.html` as stable online-only release candidate.
- Next launch work: clear connection-required feedback, ensure online save/report behavior, review one-time email onboarding and access permissions, final online launch acceptance. Do not contact coworkers until ready. No live code changed by this scope update.

## 2026-11-12 — primary online login now links to tested OTP onboarding
- Owner explicitly wants actual unfinished work, not repeated audits. Added a visible `Sign in with a one-time email link instead` link **inside** the login form of production `login-v23.html`, pointing to the separately proven `account-setup-preview.html` OTP flow. Existing password sign-in untouched. Because link is inside the form, it disappears when the form hides after login. Commits `d702819d2d4c6e4a7d97aa65bebe6d188ef5e2c6` and `824c097ddb3075d8cb08dd35fd4caa464ceeba69`; inline JS syntax parsed. No new user/browser acceptance performed. No coworker contact, tickets, or Supabase changes.
