# Super 8s — Deployment Guide

> **Last updated:** Mar 3, 2026  
> **Target:** Vercel (Pro) + Neon PostgreSQL + Resend

---

## Cost & Plan Strategy

| Period | Vercel Plan | Monthly Cost |
|---|---|---|
| March Madness (Mar 19 – Apr 6) | **Pro** | $20 |
| Off-season | **Hobby (Free)** | $0 |
| Neon DB (any period) | Free tier, auto-pauses | $0 |
| Resend | Free tier (100 emails/day) | $0 |

**Upgrade to Pro by March 16** — the `*/5 * * * *` cron requires Pro (Hobby allows only 2 crons/day). Downgrade back to Hobby after April 6.

---

## Pre-Deploy Checklist

Run through this **before** running `vercel --prod` for the first time.

### 1. Infrastructure Setup

- [ ] **Neon** — create a production project; grab the **pooler URL** (`DATABASE_URL`) and **direct URL** (`DIRECT_URL`) from the Neon dashboard.
- [ ] **Resend** — verify a sending domain; get `AUTH_RESEND_KEY` and decide `RESEND_FROM_EMAIL`.
- [ ] **Vercel** — upgrade account to Pro before deploying (required for 5-min cron).

### 2. Generate Secrets

```bash
# Auth secret (NextAuth)
openssl rand -base64 32

# Cron bearer token
openssl rand -base64 32
```

### 3. Run Database Migration (against production Neon)

```bash
DATABASE_URL="<your-neon-pooler-url>" \
DIRECT_URL="<your-neon-direct-url>" \
npx prisma migrate deploy
```

### 4. Seed the Database

Run the Prisma seed to bootstrap the `AppSettings` singleton:

```bash
DATABASE_URL="<your-neon-pooler-url>" \
DIRECT_URL="<your-neon-direct-url>" \
npm run db:seed
```

Then manually add users, teams, and picks via the admin panel or by running Prisma Studio:

```bash
npm run db:studio
```

> **Note on picks data:** For 2025, participant picks are already captured in `src/lib/demo-users-2025.ts`. A one-time script can be written to import these into the production DB if needed, using `npx tsx` against the Neon database.

---

## Vercel Setup

### Install & Link

```bash
npm i -g vercel
vercel link          # first time only — associates repo with Vercel project
```

### Set Environment Variables

Set these in the **Vercel dashboard** (Project → Settings → Environment Variables) or via CLI:

```bash
vercel env add DATABASE_URL              production
vercel env add DIRECT_URL               production
vercel env add AUTH_SECRET              production
vercel env add AUTH_URL                 production   # https://your-domain.vercel.app
vercel env add AUTH_RESEND_KEY          production
vercel env add RESEND_FROM_EMAIL        production
vercel env add CRON_SECRET              production
```

> **Note on `AUTH_URL`:** Must match the domain magic-link emails link to. If you add a custom domain later, update this env var and redeploy.

### Deploy

```bash
vercel --prod
```

---

## Cron Configuration

Already defined in `vercel.json` — no changes needed:

```json
{
  "crons": [{ "path": "/api/cron/sync", "schedule": "*/5 * * * *" }]
}
```

The cron calls `/api/cron/sync` with `Authorization: Bearer <CRON_SECRET>`. Verify it's firing in **Vercel Dashboard → Logs → Cron**.

---

## Post-Deploy Verification

- [ ] Visit `/demo` — confirm demo mode renders without auth, scrub timeline, check bracket page.
- [ ] Send a magic-link email to yourself — confirm arrival and login flow works.
- [ ] Check Vercel Logs → Cron — verify `*/5` invocations appear after first trigger.
- [ ] Visit `/admin/settings` — set the picks deadline.
- [ ] Visit `/admin/users` — confirm seeded users appear.
- [ ] Visit `/leaderboard` and `/scores` — confirm data renders from Neon.
- [ ] Visit `/admin/sync` — manually trigger one ESPN sync; check logs for `SyncResult`.

---

## Seasonal Operations Runbook

### Before the Tournament (~March 16)
1. Upgrade Vercel account to **Pro**.
2. Ensure all env vars are set in Vercel dashboard.
3. Run `vercel --prod` (or push to `main` — Vercel auto-deploys on push to `main`).
4. Run DB migration + seed if not done: `npx prisma migrate deploy && npm run db:seed`.
5. Set picks deadline in `/admin/settings`.
6. Add all participants via `/admin/users` and flip `isPaid` as payments come in.

### During the Tournament (Mar 19 – Apr 6)
- **Cron** runs every 5 min automatically — monitor in Vercel Logs → Cron.
- Use `/admin/sync` for a manual ESPN sync if the cron hasn't fired recently.
- Use `/admin/users` to flip `isPaid` as payments come in.
- Monitor `/leaderboard` directly — if scores look stale, trigger a manual sync.

### After the Tournament (~April 7)
1. Downgrade Vercel account back to **Hobby** ($0/mo).
2. Neon automatically pauses compute after inactivity — no action needed.
3. The app continues to serve pages; the 5-min cron stops firing on Hobby (no live updates, fine for off-season).
4. The `/demo` mode continues to work fully — it's pure in-memory, no DB required.

---

## Updating for 2026

1. Create `src/lib/demo-data-2026.ts` with the new team bracket data.
2. Create `src/lib/demo-users-2026.ts` with participant picks.
3. Register the new year in `src/lib/tournament-data.ts`.
4. Update the ESPN sync logic in `src/lib/espn.ts` if ESPN changes their API structure.
5. Run `npm run db:migrate` to apply any schema changes.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Magic links don't work | `AUTH_URL` mismatch | Ensure `AUTH_URL` matches the exact deployed domain |
| Cron not firing | On Hobby plan | Upgrade to Pro |
| `PrismaClientInitializationError` | Missing `DATABASE_URL` | Check env vars in Vercel dashboard |
| ESPN sync fails silently | `CRON_SECRET` mismatch | Re-check `CRON_SECRET` env var in Vercel matches your `.env` value |
| `/demo` shows blank data | `demo-data.ts` issue | Check browser console; likely a `computeStateAtGame` error |
| Build fails on Vercel | Turbopack vs production Next.js | Run `npm run build` locally first to reproduce |
