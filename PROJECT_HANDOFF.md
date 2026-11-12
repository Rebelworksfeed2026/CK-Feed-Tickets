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
