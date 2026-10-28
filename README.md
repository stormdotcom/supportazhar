# Support for Azhar Shafi

A Vite/React appeal with public funding and UPI updates, a reported daily collection card, and a PIN-only `/manage` page. Supabase stores the appeal content and operational data. `data.json` is the initial seed and the visibly marked fallback snapshot if live reads fail.

## Local site

Copy `.env.example` to `.env` and fill in the project URL, publishable key, and the administrator's Supabase Auth email. The local `.env` is ignored by Git. `VITE_` values are public in the built site; the email is an account identifier, not a secret.

```bash
npm install
npm run dev
npm run build
```

Vercel must have `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SUPABASE_ADMIN_EMAIL` in its build environment. `vercel.json` rewrites deep links to the app for direct visits and refreshes.

## Database

The initial migrations create the tables, grants, RLS policies, UPI event trigger, and original rows. The 28 October migration adds Shaina N S as the primary UPI account, marks the three older UPI accounts inactive, and records the change in the timeline. These changes were applied to the configured project. For another project, run `supabase db push` with that project's database connection. Do not rerun the initial seed against a live project or duplicate the historical timeline.

`campaign_content.content` is JSONB for the static appeal story, account and contact details, and volunteer copy. Funding figures, per-account UPI status, timeline events, and daily collection reports are typed columns in separate tables. Only the operational tables can be edited through `/manage`. Public roles can read the published data but cannot write it.

## Admin sign-in

`/manage` shows only a six-digit PIN field and signs in directly with Supabase Auth using the configured email and PIN as the Auth password. No PIN or PIN hash is bundled in the client. Supabase Auth stores its password hash. Create one confirmed Auth user in the Supabase Dashboard with that email and PIN, then set its `raw_app_meta_data.role` to `appeal_admin` using the Auth admin API or this SQL in the Supabase SQL Editor (replace the placeholder email):

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"appeal_admin"}'::jsonb
where email = 'ADMIN_EMAIL_HERE';
```

Disable public sign-ups. The browser keeps the Auth session in `sessionStorage` and signs out after 30 minutes of inactivity. It also records a boolean interface flag in `localStorage` under an unobvious key, but this flag grants no database access. Admin writes require a valid Supabase Auth session with the server-controlled `app_metadata.role` claim under RLS. A six-digit Auth password is weaker than the original server-side PIN-verifier design; Supabase's IP-based Auth rate limits apply, but the custom global PIN lockout does not apply to this direct sign-in flow.

## Editorial workflow

In `/manage`, save funding figures, each UPI switch and optional reason, a daily amount for a specified IST date, or a manual timeline event. A genuine UPI switch writes its timeline event in the same database transaction. Saving the same state creates no event. Automatic events cannot be edited; manual events can be edited or unpublished. Historical entries from `data.json` retain their original displayed time, including the entry with no exact activation time.

The older UPI accounts remain inactive until an administrator confirms availability and switches them back on. The 24-hour note is a time to recheck their limits, not an automatic reactivation. Shaina's supplied QR contains a UPI ID and payee name; no account number or IFSC was provided for her account.

The volunteer poster generator still uses the bundled `data.json` snapshot. Refresh that snapshot from verified live values before distributing a newly generated poster; site updates do not regenerate image files automatically.
