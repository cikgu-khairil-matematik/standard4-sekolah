# Standard 4 Sekolah — GitHub Pages + Supabase

Prepared 18 October 2026. The original tenant's school code is **BBA8284**. The owner-confirmed trial school now uses **UJI-ROZIANA**. Internal tenant IDs and Supabase Auth user IDs remain unchanged, so existing IDs/passwords can be reused after activation of the migrated data.

## Current state

- Existing Site: https://standard-4-sktd-2026.krel-adam.chatgpt.site
- Existing Site remains the live source of records until cutover. Its BBA8284 code change is already deployed.
- Supabase project: `zuyapvltmvkdgifvhhkj` (Standard 4 Sekolah).
- New Edge API: `/functions/v1/standard4-api`.
- Existing school documents are staged with `enabled=false`. They deliberately reject use until the final consistent snapshot is verified and the old writer is frozen.
- GitHub repository/publication is pending. The connected GitHub account is `cikgu-khairil-matematik`; its installation covers all repositories, but the repository `standard4-sekolah` was created through the owner browser. The connector cannot create a repository or change Pages settings.

## Publishing the prepared frontend

Create an empty repository named `standard4-sekolah` under the intended account. Upload the sanitized release tree, including `docs/` and its `.nojekyll`. Enable GitHub Pages from `main`, `/docs`. The public build is path-relative and can run at `https://<owner>.github.io/standard4-sekolah/`.

The API CORS allowlist currently includes `https://cikgu-khairil-matematik.github.io` and the original Site only. Update it if a different owner or domain is used. Backend keys are provided by the Edge runtime; never copy a secret/service-role key into the frontend or repository. No publishable key is required by the function gateway because the function authenticates JWTs and application session capabilities itself.

To edit and rebuild the frontend:

```sh
npm install
npm run build
```

Commit package-lock.json after installation. All direct package versions and the Edge SDK are pinned. The checked-in `docs/` directory can be published without running npm.

## Data and transaction design

Private `s4_schools` holds one document per school. The document includes its teachers, accounts, hashed application sessions/invitations, assessments, roster imports and audit log. A write uses an atomic compare-and-swap against the school revision; both assessment and audit are committed together. A stale revision retries from fresh membership/assignments. Schools are independent transaction boundaries. This is appropriate for school-sized rosters, not a general high-volume database architecture.

RLS is enabled, and all direct `anon`/`authenticated` table and function privileges are revoked. The Edge API verifies the Supabase user with `getUser`, checks the hashed, expiring application session and active membership, then enforces school and stage permissions. A separate server-only service client executes the committed operation. User-editable JWT metadata is never used for roles. The API key is never exposed. The security advisor's no-policy informational notices are intentional: direct browser access is denied. Leaked password protection is a project-level advisory that remains disabled and should be enabled if available for the selected plan.

Sessions in the browser are held in sessionStorage and are isolated from encrypted offline backups. Offline snapshots/drafts remain AES-GCM encrypted and expire after seven days without refresh. Submitted records and administrative changes require online use. Old-origin browser storage cannot automatically move to github.io: users should synchronize their drafts first, or export an encrypted backup and restore it on the new origin.

## Required cutover (not yet performed)

1. Confirm the new GitHub Pages page loads and the API CORS origin matches.
2. Prevent new writes in **all** old D1 POST routes (data, school and account changes), while retaining old-origin offline draft export. Show a migration banner with the new URL; do not silently redirect unsynchronized drafts.
3. Export the latest schools, teachers, assessments, memberships, invitation hashes, imports and audit logs. Convert snake_case fields to camelCase; parse assessment score JSON; preserve every ID, role, stage, score, category, evaluator and timestamp. Do not copy ephemeral sessions, provisioning grants or rate limits.
4. Replace only the staged, disabled documents in one Postgres transaction. Compare full data fields against the final D1 snapshot and verify all school counts. Then enable the migrated tenants.
5. Test an existing account with the owner's own password, test cross-school denials, and verify login through the published GitHub URL. Do not ask for or log the password.
6. Update the old Site banner, synchronize/restore offline drafts, and share the verified new URL. Keep the old D1 backup until migration is accepted.

## Verification

The isolated domain tests cover PYD/PP1/PP2 access, teacher visibility, server evaluator identity, revision conflicts/idempotency, submitted locks/reopening, roster/category preservation, renaming assignments, invitation secrecy, immediate account/session revocation, resets and audit. Existing encrypted offline engine tests are retained. Actual Supabase API checks passed on a dedicated temporary school: ID/password login, activation and replay rejection, stage permissions, forced evaluator identity, conflict/idempotent retries, official locking/reopening, token refresh, immediate reset/session revocation, CORS and scoped reset. Its four temporary Auth users were banned and the test school was disabled with no remaining sessions. Production teacher/assessment rows were never used for writes in those tests.

Phone installation, full browser rendering, and real browser offline behavior have not been tested in this environment. Finish those checks after GitHub publication. Existing backup: Standard4_Sandaran_Sebelum_Pemindahan_20261018.json (private; never commit it).
