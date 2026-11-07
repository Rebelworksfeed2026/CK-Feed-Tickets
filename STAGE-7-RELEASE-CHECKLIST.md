# Stage 7 — Release and deployment readiness (2026-11-07)

## Release
- Live app: cloud-beta.html on GitHub Pages. Original index.html remains unchanged.
- JavaScript is versioned in the HTML to force fresh Safari loads.
- Supabase project: przmlyzmwnixfgqdafyk. Frontend contains a publishable key, never a service-role key.
- Saturday–Friday week; driver tabs; cloud save and correction; camera OCR; private photo uploads; offline IndexedDB queue; cloud sync; CSV details export; printable weekly report; history search.

## Verified without writing feed records
- Source JavaScript parses; HTML asset references match deployed file names.
- RLS: linked signed-in drivers may read tickets; own-driver inserts/updates; administrator corrections. Photo storage bucket is private, with authenticated access policies.
- Database audit on 2026-11-07: 0 active tickets, 8 archived tickets, 4 drivers, 1 linked driver, 1 private photo bucket.
- Export is a CSV of ticket details, not a backup of photo bytes or an automated restore system.
- OCR recognized ticket number, tons, and destination on one actual historical ticket photograph, which was not saved.

## Known warnings / follow-up
- Supabase security advisor: leaked-password protection disabled (Auth dashboard setting).
- Supabase security advisor: public.is_feed_admin() SECURITY DEFINER function callable by authenticated users. It is referenced by RLS; do not revoke without a tested replacement.
- Three additional drivers are not yet linked to user accounts.
- Browser end-to-end testing, live cloud insert, photo retrieval, offline recovery, Safari printing, and multi-driver access need live testing. Do not mark them as verified.

## Stage 8 live-test acceptance checklist
1. Refresh existing Safari cloud-beta page; sign in and verify correct driver tab and Saturday week.
2. Photograph first NEW ticket. Confirm OCR fields against the paper ticket before saving.
3. Save exactly once; verify row, photo access, daily/weekly totals, and history search.
4. Try the same ticket number again: duplicate must be rejected.
5. With a subsequent real ticket, test offline save, reconnection, automatic sync, and preservation of unsaved drafts.
6. Test corrections, comparisons when previous-week records exist, CSV export, and print/PDF.
7. Onboard remaining drivers, verify each sees permitted records and cannot edit others; verify admin correction.
8. Resolve or formally accept remaining security warnings before full production sign-off.

Do not create sample production tickets or modify the original prototype.

## 2026-11-07 Stage 8 additional preflight
- Executed the standalone Node.js preflight: PASS (week boundaries, input validation, daily and weekly arithmetic, equal-load comparison, duplicate identity). These are isolated logic tests, not browser end-to-end tests.
- Inspected the SECURITY DEFINER administrator function. It is a read-only EXISTS query checking the signed-in user's linked driver admin flag; anon cannot execute it, authenticated can. Because it is referenced in live RLS, permissions were not changed without a role-based integration test. Advisor warning remains.
- Leaked-password protection requires Auth dashboard configuration; warning remains.
- GitHub source and current versioned asset references were verified. An independent HTTP check of the GitHub Pages URL was inconclusive because external network resolution failed in the test environment; live availability is NOT independently confirmed.
- No active ticket rows were created or modified. Final mobile Safari and live save/photo/offline tests remain for the user.
