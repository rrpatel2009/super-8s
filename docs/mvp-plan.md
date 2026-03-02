# Super 8s — MVP Plan

> **Last updated:** Mar 3, 2026  
> **Status: MVP is built. Tournament starts Mar 19.**

---

## 1. What's Built (Current State)

Everything planned for the MVP is complete. The codebase is production-ready pending a Vercel deploy and DB seed.

| Feature | Status | Notes |
|---|---|---|
| Neon PostgreSQL + Prisma 7 schema | ✅ Done | |
| NextAuth v5 magic-link auth (Resend) | ✅ Done | |
| ESPN scoreboard sync (cron + manual) | ✅ Done | Every 5 min via Vercel cron |
| Leaderboard with Points + TPS + bracket-aware PPR | ✅ Done | Sort: Points desc → TPS desc |
| Picks form (8-team pick, deadline enforcement) | ✅ Done | View modes: Region / All / By Seed |
| Live scores page (60s refresh) | ✅ Done | |
| Simulator with cascade bracket + docked leaderboard | ✅ Done | AdvancingBracket dual-mode |
| Full tournament bracket page (`/demo/bracket`) | ✅ Done | Auto-updates with timeline |
| Optimal 8 score tracking | ✅ Done | Theoretical ceiling line on chart |
| Admin panel (users, settings, sync, CMS) | ✅ Done | |
| `/demo` mode (full app, no auth, in-memory) | ✅ Done | Real 2025 bracket data + actual picks |
| Demo timeline scrubber + play/pause | ✅ Done | |
| Leaderboard history chart | ✅ Done | Solid scores + dashed TPS + Optimal 8 line |
| `vercel.json` with cron config | ✅ Done | |
| Google Sheets integration | ⏸ Deferred | See §4 — not needed for 2025 |
| Vercel production deploy | ⬜ Pending | See deploy.md |

---

## 2. What's NOT in MVP (by design)

- **Google Sheets integration** — original plan was to bootstrap from the Sheet. Actual 2025 participant picks are already captured in `src/lib/demo-users-2025.ts` + the CSV at `docs/2025picks.csv`. A one-time seed script is sufficient; a live Sheets API integration is deferred.
- **Real-time WebSockets** — 60s ESPN poll is fine for March Madness pace.
- **Payment processing** — manual `isPaid` flag set by admin in `/admin/users`.
- **Email notifications on score updates** — not needed for MVP.
- **Public leaderboard without login** — demo mode covers this use case.
- **Separate Express/Node.js BE** — Next.js API routes + RSCs cover it cleanly.

---

## 3. Pre-Tournament To-Do (Before March 19)

### 3.1 Infrastructure (~March 16 deadline)

- [ ] Create Neon production project; copy pooler URL + direct URL.
- [ ] Set up Resend sending domain; get API key.
- [ ] Upgrade Vercel account to **Pro** (required for 5-min cron).
- [ ] Generate `AUTH_SECRET` and `CRON_SECRET` (`openssl rand -base64 32`).

### 3.2 Deploy

```bash
# Run migration against production Neon
DATABASE_URL="..." DIRECT_URL="..." npx prisma migrate deploy

# Seed AppSettings singleton
DATABASE_URL="..." DIRECT_URL="..." npm run db:seed

# Deploy to Vercel
vercel --prod
```

### 3.3 Data Bootstrap

The 2025 participants and their picks are already in `src/lib/demo-users-2025.ts` and `docs/2025picks.csv`. Options:

**Option A (recommended):** Write a one-off seed script using the existing `REAL_2025_USERS` data to upsert users + picks directly into Neon. This is a ~30-line `npx tsx` script.

**Option B:** Manually add participants via the Prisma Studio GUI (`npm run db:studio`).

### 3.4 Admin Setup Post-Deploy

- [ ] Set picks deadline in `/admin/settings` (or mark it passed if tournament has begun).
- [ ] Flip `isPaid = true` for paid participants in `/admin/users`.
- [ ] Trigger one manual ESPN sync via `/admin/sync` to seed teams + games.
- [ ] Verify leaderboard renders at `/leaderboard`.

### 3.5 Verification Checklist

- [ ] `/demo` loads and timeline scrubs correctly.
- [ ] `/demo/bracket` shows the full 64-team bracket.
- [ ] Magic link email arrives and login works.
- [ ] Cron fires in Vercel Dashboard → Logs → Cron.
- [ ] `/leaderboard` shows real participants with correct scores.
- [ ] `/scores` shows live game data.

---

## 4. Deferred: Google Sheets Integration

The original plan called for a live Google Sheets API integration for Day 0 bootstrap and ESPN fallback. This is **not needed for 2025** because:

1. 2025 picks are already captured in `demo-users-2025.ts` / `2025picks.csv`.
2. The demo mode already plays back the full tournament with real data.
3. ESPN has been reliable for past tournaments; a Sheet fallback adds complexity for marginal resilience.

**If this becomes necessary** (e.g. ESPN API changes for 2026):

| File | Action |
|---|---|
| `src/lib/sheets.ts` | Create — Google Sheets v4 service account client |
| `prisma/seed-from-sheet.ts` | Create — one-time CLI bootstrap |
| `src/lib/espn.ts` | Modify — wrap `syncTournamentData()` with Sheet fallback |
| `src/app/api/admin/sheets/route.ts` | Create — admin-triggered Sheet import endpoint |
| `src/app/admin/sheet-import/page.tsx` | Create — admin UI |

Required env vars for Sheets:
```
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_SHEETS_ID=
```

---

## 5. Architecture Decisions (Resolved)

| Decision | Choice | Rationale |
|---|---|---|
| FE/BE separation | Next.js monorepo (RSC + API routes) | Idiomatic App Router; clean boundary already in place |
| Leaderboard computation | Direct Prisma in RSC + `/api/leaderboard` for client | RSC path is faster; API route covers client-refresh needs |
| PPR calculation | Bracket-aware (bracket-ppr.ts) | Naive PPR overstates projections when two picks share a bracket path |
| Demo data | Static TypeScript (demo-data.ts + demo-users-2025.ts) | Zero DB dependency; instant scrubbing |
| Simulator | Client-side bracket cascade, no DB writes | AdvancingBracket in simulator mode; leaderboard updates live in sidebar |
| ESPN first-use | Upsert → wins/eliminated in Team model | Single authoritative win count used in all scoring |
| User access | Open magic-link, admin flips isPaid | Simple for a private 12-person contest; add allowlist in 2026 if needed |

---

## 6. 2026 Planning Notes

For next year, open items to address before the tournament:

1. **Invite allowlist** — add `allowedEmails` to `AppSettings` and check in the `signIn` callback.
2. **Pre-computed demo snapshots** — generate the 63-step JSON at build time instead of on-render.
3. **Bracket-aware PPR memoization** — cache per `(teamIds, gameIndex)`.
4. **SSE/KV leaderboard** — move from N-client polling to one cron write + streamed reads.
5. **Google Sheets integration** — if 2026 picks are collected via Google Form again.
6. **Demo data as a DB table** — allow admins to add historical years without a code deploy.

See `docs/architecture.html` §11 for full details on each suggestion.

---

*This document lives at `docs/mvp-plan.md`. Deploy guide is at `docs/deploy.md`.*
