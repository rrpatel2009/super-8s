# Super 8s — Claude Code Context

## What This Is

Super 8s is a March Madness bracket contest app. Users pay an entry fee, pick **8 teams** from the NCAA tournament, and score points based on `seed × wins`. Includes a live leaderboard, score tracker, scenario simulator, admin panel, and a full interactive `/demo` mode — mirrors the entire app game-by-game with no sign-in required.

**Stack**: Next.js 16 App Router · React 19 · TypeScript · Prisma 7 · Neon PostgreSQL · NextAuth v5 (magic links via Resend) · Tailwind v4 · shadcn/ui · Vercel

---

## Dev Server

**Always start via Claude's preview tool or the JS wrapper — never `npm run dev` alone from a shell that lacks the NVM path.**

```bash
# Preferred: Claude Code preview tool (uses .claude/launch.json)
# preview_start "Next.js Dev"  ← runs start-dev.js on port 3000

# Manual fallback (sets NVM PATH then loads Next.js in the same process):
/Users/rrpatel/.nvm/versions/node/v24.11.1/bin/node start-dev.js
```

> **Why the wrapper?** Turbopack spawns child processes for PostCSS that inherit the system PATH (`/usr/bin:/bin`), which lacks the NVM-managed `node` binary. `start-dev.js` prepends the NVM bin dir to `process.env.PATH` before loading Next.js, so all child processes find `node`.
>
> `.claude/launch.json` points directly at `start-dev.js` — this is what `preview_start` uses.
>
> **If you update Node via NVM**, update the `runtimeExecutable` path in `.claude/launch.json` to match the new version. `start-dev.js` itself is portable (it derives the bin path from `process.execPath` at runtime).

### Dev Server: Healthy State & Expected Warnings

**The server is ready when `preview_logs` shows:**
```
✓ Ready on http://localhost:3000
```
That's the success signal. Stop checking logs once you see it.

**Do NOT attempt to fix these — they are expected and harmless:**
- `⚠ Compiled with warnings` — typically from Next.js 16 / React 19 experimental features
- `warn - Fast Refresh had to perform a full reload` — normal during cold starts
- `ExperimentalWarning: ...` from Node — expected with Turbopack
- Any `next-auth` / `@auth` deprecation notices — v5 is still beta
- TypeScript `as any` suppressions in `auth.ts` — intentional (see Gotchas)
- Prisma startup messages about query engine / WASM — normal with Neon adapter
- `[webpack.cache.PackFileCacheStrategy]` serialization warnings

**Do attempt to fix these:**
- Build errors that prevent compilation (`Error:`, `Module not found`, `SyntaxError`)
- Runtime errors thrown during page load (visible in `preview_console_logs` as red errors)
- 500 responses in `preview_network`

```bash
# Database
npm run db:migrate    # run migrations (dev)
npm run db:push       # push schema without migration file
npm run db:studio     # open Prisma Studio
npm run db:seed       # seed via prisma/seed.ts

# Other
npm run build         # production build
npm run lint          # ESLint
```

---

## Environment Variables

See `.env.example` for all required vars.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon **pooler** URL (used at runtime) |
| `DIRECT_URL` | Neon **direct** URL (used by Prisma migrations) |
| `AUTH_SECRET` | NextAuth secret — generate with `openssl rand -base64 32` |
| `AUTH_URL` | Base URL for auth redirects (e.g. `http://localhost:3000`) |
| `AUTH_RESEND_KEY` | Resend API key for magic link emails |
| `RESEND_FROM_EMAIL` | From address (e.g. `Super 8s <noreply@yourdomain.com>`) |
| `CRON_SECRET` | Bearer token for Vercel cron endpoint security |

---

## Project Structure

```
src/
  app/
    (auth)/           # login, verify-request, error pages (no layout)
    (protected)/      # authenticated user pages — layout redirects to /login
      picks/          # pick submission/editing form
      leaderboard/    # live standings
      scores/         # live game scores from ESPN
      simulator/      # hypothetical scoring tool
    admin/            # ADMIN or SUPERADMIN only — layout guards + sidebar
      users/          # manage users, mark isPaid, change roles
      settings/       # picks deadline, payout structure, charities
      sync/           # manual ESPN data sync trigger
      content/        # markdown CMS for content pages
    demo/             # PUBLIC — no auth. Full app mirror with game-by-game timeline
      leaderboard/    # demo leaderboard + score history chart
      picks/          # demo picks form with auto-pick strategies
      scores/         # demo scores grid
      simulator/      # demo scenario simulator with docked leaderboard
      bracket/        # full 64-team tournament bracket visualization
      admin/          # demo admin panel (users, settings, sync)
        users/
        settings/
        sync/
    [slug]/           # public content pages rendered from DB
    api/
      auth/           # NextAuth handlers
      picks/          # GET/POST/PUT user picks
      scores/         # live ESPN game data (60s cache)
      leaderboard/    # leaderboard computation (no-store)
      admin/          # admin API routes (role-gated)
      cron/sync/      # Vercel cron: syncs ESPN every 5 minutes
  components/
    ui/               # shadcn/ui primitives (don't edit — use `npx shadcn add`)
    admin/            # user-table, sync-button, settings-form, content-editor
    demo/             # demo-control-panel, demo-navbar
    picks/            # picks-form, team-card, play-in-slot, quick-pick-generator, bracket-view, picks-tracker
    leaderboard/      # leaderboard-table, leaderboard-history-chart
    scores/           # scores-grid
    simulator/        # simulator-panel (with docked leaderboard sidebar)
    bracket/          # advancing-bracket (dual picks+simulator mode), tournament-bracket (read-only)
    layout/           # navbar
  lib/
    auth.ts           # NextAuth full config (Prisma adapter + Resend + events)
    auth.config.ts    # Edge-safe auth config (no Prisma — used by middleware)
    espn.ts           # ESPN API fetch, transform, and full sync logic
    scoring.ts        # ALL scoring logic lives here (includes Optimal 8)
    prisma.ts         # Prisma client singleton with Neon adapter
    demo-data.ts      # Real 2025 NCAA team data (winsAtRound/elimAtRound) + 12 demo users with actual picks
    demo-game-sequence.ts  # Game-by-game engine: derives ~63 games, computes state
    demo-context.tsx  # DemoProvider React context — all demo state + computed data
    bracket-ppr.ts    # Bracket-aware PPR algorithm (resolves bracket conflicts)
    tournament-data.ts     # Tournament year registry (add future years here)
    demo-users-2025.ts     # Real 2025 participant picks (REAL_2025_USERS export)
    utils.ts          # cn() clsx/tailwind-merge utility
  types/index.ts      # shared TypeScript types + NextAuth module augmentation
  generated/prisma/   # Prisma-generated client (do not edit — run prisma generate)
  middleware.ts       # Route protection (imports auth.config only — Edge-safe)
prisma/
  schema.prisma       # source of truth for DB schema
  seed.ts             # bootstraps AppSettings singleton
```

---

## Database & Prisma

- **Provider**: Neon (serverless PostgreSQL). Uses `@prisma/adapter-neon` for edge-compatible connections.
- **Generated client**: `src/generated/prisma` — **non-default path**. Always import from `@/generated/prisma`, never `@prisma/client`.
- **Path alias**: `@/` → `src/` (tsconfig.json).
- After editing `schema.prisma`: run `npm run db:migrate` (dev) or `npm run db:push` (quick). `prisma generate` runs automatically post-migration.
- **AppSettings singleton**: always `id: "main"`. Use `prisma.appSettings.findUnique({ where: { id: "main" } })`.

---

## Authentication

- **Provider**: Magic link via [Resend](https://resend.com). No passwords.
- **Strategy**: Database sessions (`Session` table).
- **Roles**: `USER | ADMIN | SUPERADMIN`. First registered user is auto-promoted to `SUPERADMIN` via the `createUser` event in `auth.ts`.
- **Config split**: `auth.config.ts` is Edge-safe (no Prisma imports) and used by `middleware.ts`. `auth.ts` has the full config with the Prisma adapter.
- **Route protection**: `(protected)/layout.tsx` → redirects to `/login`. `admin/layout.tsx` → redirects non-admins to `/leaderboard`. `/demo` is **public** (no auth).
- **Prisma adapter cast**: `PrismaAdapter(prisma as any) as any` in `auth.ts` — the adapter types lag Prisma 7. This is expected and intentional.

---

## Core Domain: Scoring

All scoring logic is in `src/lib/scoring.ts`.

```
Score per team:   seed × wins
PPR (Potential):  seed × max(0, 6 − wins)  — 0 if eliminated
TPS (Projected):  currentScore + PPR
Optimal 8:        best possible score achievable by any 8-team combination at the current
                  game state (greedy: pick teams with highest remaining seed × possible wins,
                  tie-break by TPS desc)
```

- **6 wins** = full run from Round of 64 to Championship.
- **Round 0 (play-in) wins don't count** toward score — only rounds 1–6.
- **Bracket-aware PPR** (demo mode): `bracket-ppr.ts` resolves bracket conflicts — two picked teams that share a bracket path can't both win all remaining games. The algorithm caps each team's max reachable round at the earliest conflict point. Used in demo leaderboard, chart projections, and picks tracker.
- **Optimal 8**: theoretical ceiling — the highest score any 8-team entry could have at any point in the timeline. Shown as a dashed reference line on the leaderboard history chart. Never decreases as the tournament progresses.
- **Play-in picks**: resolve to the team that wins the play-in game. Until resolved, the slot shows both team names and contributes 0 to scoring.
- **Leaderboard sort**: Points desc → TPS desc → name asc.
- **Top 4** on the leaderboard display their charity preference.
- **Simulator**: applies hypothetical win/elimination overrides client-side — no DB writes.

---

## Picks Rules

- Each user submits exactly **8 picks** (teams or play-in slots).
- Deadline controlled by admins in `AppSettings.picksDeadline`. POST/PUT to `/api/picks` returns 400 after deadline.
- `isPaid = true` must be set by an admin. Paid status is shown on the leaderboard and used for payout logic.
- `charityPreference` lives on the `Pick` model but is logically per-user. The API sets it on all of a user's picks at once.

---

## Demo Mode (`/demo`)

The demo is a **full app mirror** — every page (`/demo/leaderboard`, `/demo/picks`, `/demo/scores`, `/demo/simulator`, `/demo/admin/*`) reuses the exact same real components, driven by a `DemoProvider` context instead of the database/API. No auth required.

### Architecture

```
DemoProvider (src/lib/demo-context.tsx)
  ├── State: selectedYear, gameIndex, isPlaying, currentPersona, demoUserPicks, demoSettings
  ├── Computed: leaderboardData, scoresData, teamsData, aliveTeams, leaderboardHistory
  └── Passed as props to real components via demoMode={true}
```

**`demoMode` prop pattern**: Every shared component accepts `demoMode?: boolean`. When set:
- Skips API fetches and auto-refresh intervals
- Syncs data from `initialData`/`initialGames` props via `useEffect` when those props change (i.e., when the timeline advances)
- Disables submit/save actions that would hit the API (routes them to context callbacks instead)

### Key Files

| File | Role |
|---|---|
| `src/lib/demo-data.ts` | Real 2025 NCAA team data (`winsAtRound[]`, `elimAtRound[]`) + 12 demo users with actual picks |
| `src/lib/demo-users-2025.ts` | `REAL_2025_USERS` export — actual participant picks for the 2025 tournament |
| `src/lib/demo-game-sequence.ts` | Derives ~63 individual games from round-level data; computes state at any game index |
| `src/lib/demo-context.tsx` | `DemoProvider` — all timeline state, computed shapes, fake session, Optimal 8 series |
| `src/lib/tournament-data.ts` | Year registry; add future years here as new `demo-data-YYYY.ts` modules |
| `src/app/demo/layout.tsx` | Wraps all demo pages in `DemoProvider` + `DemoControlPanel` + `DemoNavbar` |
| `src/app/demo/bracket/page.tsx` | Full 64-team bracket page using `TournamentBracket` component |
| `src/components/demo/demo-control-panel.tsx` | Fixed bottom bar: year selector, persona picker, scrubber, play/pause, speed |
| `src/components/demo/demo-navbar.tsx` | Pulls fake session from context → renders real `Navbar` with `demoMode` + `linkPrefix="/demo"` |
| `src/lib/bracket-ppr.ts` | Bracket-aware PPR algorithm — resolves bracket conflicts for accurate TPS |
| `src/components/picks/quick-pick-generator.tsx` | Auto-pick dialog: Chalk / Balanced / Cinderella / Random strategies |
| `src/components/picks/bracket-view.tsx` | Interactive NCAA bracket visualization with zoom + conflict warnings |
| `src/components/picks/picks-tracker.tsx` | 2x2 region grid tracker with seed-tier dots + bracket-aware TPS |
| `src/components/bracket/advancing-bracket.tsx` | Dual-mode bracket: `picks` (team selection) + `simulator` (cascade game picks) |
| `src/components/bracket/tournament-bracket.tsx` | Read-only 64-team bracket visualization used on `/demo/bracket` |
| `src/components/leaderboard/leaderboard-history-chart.tsx` | Recharts line chart: solid score lines + dashed TPS projections + Optimal 8 reference line |
| `src/components/simulator/simulator-panel.tsx` | Bracket-driven scenario picker with docked leaderboard sidebar |

### Game-by-Game Engine (`demo-game-sequence.ts`)

- `generateDemoGameSequence(teams)` — walks round transitions 1→6, pairs winners/losers using R64 seed matchups and bracket position logic. Produces `DemoGameEvent[]` (~63 entries).
- `computeStateAtGame(games, idx)` — replays games 0..idx, returns `Map<teamId, {wins, eliminated}>`.
- `computeLeaderboardAtGame(...)` — produces `LeaderboardEntry[]` (exact type `LeaderboardTable` expects).
- `computeGamesAsLiveData(...)` — produces `LiveGameData[]` (exact type `ScoresGrid` expects).
- `computeTeamsForPicks(...)` — produces Prisma `Team`-shaped objects for `PicksForm`.
- `getRoundBoundaries(games)` — returns round start indices for chart reference lines and jump buttons.
- `getR64Matchups(teams)` — returns `Map<teamId, { opponentId, opponentName, opponentShortName, opponentSeed }>`. Used by demo picks page to show "vs #X Opponent" on team cards. Accepts a structural type (works with both `DemoTeam[]` and `computeTeamsForPicks` output).

### Leaderboard History Chart (`leaderboard-history-chart.tsx`)

- Recharts `LineChart` with one series per demo user (12 users × 2 = 24 line paths).
- **Unified view** — no Score/TPS toggle. Solid lines = actual scores, dashed lines = projected TPS on the same graph.
- **Auto-shows data** up to current `gameIndex`. Solid lines always render from 0 → `gameIndex` automatically as timeline advances.
- **Dashed TPS projections** from `gameIndex` → end. Seamlessly connect to solid lines at the current position (start from current score at `gameIndex`).
- **Optimal 8 line**: distinct dashed gray reference line showing the theoretical best possible score. Computed in `DemoProvider` and passed via `leaderboardHistory`. Labeled in the chart legend.
- **Timeline position marker**: solid orange `ReferenceLine` at `x={gameIndex}` with ▼ indicator.
- **Draggable cursor**: mouse drag sets `chartCursor` for tooltip exploration only — does NOT mask solid line data.
- **Bracket-aware TPS**: projection lines use bracket-aware PPR values (from `bracket-ppr.ts`), accounting for bracket conflicts.
- Round boundaries shown as subtle vertical dashed reference lines.
- Current persona's line highlighted (2.5px, full opacity vs 1px, 55% for others).
- Legend with user color swatches + "Projected TPS" dashed indicator + "Optimal 8" dashed gray swatch.

### Quick-Pick Strategies (`quick-pick-generator.tsx`)

Four strategies, each picking 2 teams per region (8 total):

| Strategy | Logic |
|---|---|
| **Chalk** | Seeds 1 & 2 from each region |
| **Balanced Mix** | One team per seed tier (1-4, 5-8, 9-12, 13-16) × 2 regions |
| **Cinderella** | Seeds 8-12 (upset bait) + one 4-7 seed per region |
| **Random** | 2 random alive teams per region (time-seeded) |

### Pre-Tournament Picks Experience

The demo picks page (`/demo/picks`) provides full context for team selection when `gameIndex = -1` (pre-tournament):

- **Deadline enforcement tied to timeline**: `deadlinePassed = gameIndex >= 0`. When tournament has started, picks are locked with a "deadline passed" banner. When pre-tournament, form is open.
- **Scoring explainer**: collapsible card explaining `seed × wins` formula with examples, strategy tips, and max potential (`seed × 6`).
- **Interactive bracket view**: within the scoring explainer, a full NCAA bracket visualization (`BracketView`) replaces the text matchup list. Teams can be toggled directly from the bracket. Shows conflict warnings when two picked teams share a bracket path.
- **First-round matchup info on team cards**: each team card shows "vs #X Opponent · Max Xpts" via the optional `matchupInfo` prop on `TeamCard`. Populated via `getR64Matchups()` and passed through `PicksForm`'s optional `matchupInfoMap?: Map<string, string>` prop.
- **Clear picks button**: next to Auto-pick button. Empties all selections and remounts the form.
- **Persona-switch fix**: `PicksForm` key includes `currentPersona.userId` to ensure the form remounts when switching personas.
- **Picks hint in control panel**: when `gameIndex >= 0` and on `/demo/picks`, the control panel shows a hint to scrub left to test picking.

### Bracket View (`bracket-view.tsx`)

Interactive NCAA bracket visualization per region:
- **Layout**: 4 columns (R64 → R32 → S16 → E8) per region, with CSS flexbox and increasing vertical gaps.
- **Region tabs**: East / West / South / Midwest with pick count badges per region.
- **Team cells**: clickable for pick selection, highlighted with `bg-primary/15` when selected.
- **Conflict detection**: `sharesBracketPath()` checks if two picked teams in the same region would meet. `getMeetingRound()` determines which round they collide. Conflict warnings shown above bracket (e.g., "#1 vs #5 meet in S16").
- **Zoom controls**: ZoomIn / ZoomOut / Reset buttons controlling `transform: scale(zoomLevel)`.
- **Imports `seedToSlot()`** from `bracket-ppr.ts` for bracket positioning.

### Enhanced Picks Tracker (`picks-tracker.tsx`)

Replaces the simple 8-dot row in the PicksForm sticky bar when `enableViewModes` is true:
- **2x2 region grid**: East/West on top row, South/Midwest on bottom, matching NCAA bracket orientation.
- **Seed-tier colored dots**: primary (seeds 1-4), blue (5-8), emerald (9-12), purple (13-16).
- **Region counters**: "E:2 W:1 S:3 MW:2" labels in each quadrant.
- **Bracket-aware starting TPS**: shows `Max TPS: X` computed via `computeBracketAwarePPR` with all selected teams at 0 wins. Displays "(conflict)" warning when bracket conflicts reduce TPS below naive calculation.
- **Exports `SEED_TIERS`** constant used by picks-form's "By Seed" view mode.

### View Modes (`picks-form.tsx`)

When `enableViewModes` prop is true (demo mode only):
- **By Region** (default): existing 4-tab layout with region pick counts.
- **All Teams**: single grid showing all 64 teams sorted by seed.
- **By Seed**: grouped into 4 tiers — Elite (1-4), Strong (5-8), Mid (9-12), Longshot (13-16). Each tier has a colored header with count badge.

### Seed-Tier Color Scheme

Consistent color scheme used across bracket-view, picks-tracker, team-card, and picks-form:

| Tier | Seeds | Dot Color | Badge Color |
|------|-------|-----------|-------------|
| Elite | 1-4 | `bg-primary` | `bg-primary/15 text-primary/80` |
| Strong | 5-8 | `bg-blue-400` | `bg-blue-400/15 text-blue-400/80` |
| Mid | 9-12 | `bg-emerald-400` | `bg-emerald-400/15 text-emerald-400/80` |
| Longshot | 13-16 | `bg-purple-400` | `bg-purple-400/15 text-purple-400/80` |

Team cards (`team-card.tsx`) use tier colors on the seed badge when not selected.

### Tournament Bracket Page (`/demo/bracket`)

- Uses `TournamentBracket` component to render all 64 teams across 4 regions and 6 rounds.
- Updates automatically as the demo timeline advances — teams are colored/faded based on current `teamState` (eliminated vs alive).
- Winners of each game shown connected by SVG connector lines.
- Accessible from the Demo Navbar under the "Bracket" link.

### Simulator with Docked Leaderboard (`simulator-panel.tsx`)

- The simulator now uses `AdvancingBracket` in `mode="simulator"` for game selection.
- **Cascade logic**: picking a winner in an earlier game automatically cascades that team into subsequent rounds as the expected participant (shown as TBD if no pick yet).
- **Docked leaderboard sidebar**: the right side of the page shows a live-updating leaderboard sorted by simulated score (Points desc, TPS desc). Updates on every game pick change.

### Advancing Bracket — Dual Mode (`advancing-bracket.tsx`)

Single component serving two contexts:

| Mode | Props Used | Behavior |
|------|-----------|----------|
| `picks` | `selectedTeamIds`, `onToggleTeam`, `disabled` | Pre-tournament team selection; highlights picked teams |
| `simulator` | `gamePicks`, `onPickGame`, `gameIndex` | Click matchups to pick winners; cascades forward through bracket |

**Cascade algorithm** (simulator mode):
1. For each game, derive participants from prior game results in the same bracket subtree.
2. If a prior game is locked (past `gameIndex`), the actual winner feeds forward.
3. If a prior game is unlocked and the user picked a winner, that pick feeds forward as the expected participant.
4. If no pick exists, the next round slot shows "TBD".
5. This cascades from R64 all the way to the Championship.

### Bracket-Aware PPR (`bracket-ppr.ts`)

The naive PPR formula (`seed × (6 - wins)`) ignores bracket conflicts — two picked teams in the same region can't both win all remaining games. The bracket-aware algorithm resolves this:

**Algorithm** (greedy bottom-up):
1. Map each alive picked team to its bracket slot via `seedToSlot(seed)` (8 slots per region from R64 seed matchups).
2. Group by region. Walk merge levels R32 → S16 → E8:
   - At each merge, if both halves contain picked alive teams, the team with higher `seed × remaining_rounds` advances; the other's max reachable round is capped.
3. Cross-region: apply same collision logic for F4 (East vs West, South vs Midwest) and Championship.
4. Per-team PPR = `seed × max(0, maxReachableRound - currentWins)`.

**Exports**:
- `computeBracketAwarePPR(pickedTeamIds, teamInfoMap)` → `{ totalPPR, perTeam: Map<string, number> }`
- `seedToSlot(seed)` → bracket position 0-7
- `TeamBracketInfo` type

**Integration**: `computeLeaderboardAtGame()` in `demo-game-sequence.ts` uses bracket-aware PPR instead of naive per-team calculation. This flows into all TPS values, leaderboard sorting, chart projections, and the picks tracker.

### Control Panel

- **Visual identity**: distinctly darker background (`oklch(0.07 0.012 264)`), prominent orange top border (`border-t-2 border-primary/50`), stronger glow. Clearly separated from app content.
- **DEMO MODE badge**: larger, orange-tinted toggle tab with `glow-orange-sm` utility. Always visible.
- **DEMO watermark**: subtle `DEMO` badge fixed at `top-[68px] right-4` in demo layout — always visible even when panel is collapsed.
- **Year selector**: triggers `setSelectedYear()` — resets game index, picks, and persona.
- **Persona selector**: switches between 12 participant personas + Demo Admin + Super Admin. Switching to admin reveals the Admin nav link.
- **Timeline scrubber**: drag or click. Round-jump buttons (`⏮ ⏭`) snap to round boundaries.
- **Play/pause**: auto-advances at 0.5×/1×/2×/4× speed.
- **Picks hint**: when on `/demo/picks` with `gameIndex >= 0`, shows "Set timeline to Pre-Tournament to test picks".

### Demo Data: Real 2025 Participants

`src/lib/demo-users-2025.ts` contains `REAL_2025_USERS` — the actual picks submitted by the 2025 Super 8s participants. `demo-data.ts` imports this and uses it as the `users` array. This makes the demo accurately reflect real player strategies and results.

- To swap in new participant data, update `demo-users-2025.ts` and ensure all pick team IDs match the team IDs in `demo-data.ts`.
- The demo users array in `demo-data.ts` must stay in sync with the picks (all `picks[]` values must be valid team IDs).

### Updating for Future Tournaments

1. Create `src/lib/demo-data-YYYY.ts` with `DemoTeam[]` and `DemoUser[]` for the new year.
2. Create `src/lib/demo-users-YYYY.ts` with `REAL_YYYY_USERS` for real participant picks.
3. Register it in `src/lib/tournament-data.ts` (`AVAILABLE_YEARS` array + `getTournamentData` switch).
4. The rest of the engine picks it up automatically.

### Admin Dashboard (`/demo/admin`)

The demo admin dashboard mirrors `src/app/admin/page.tsx`:
- **Stat grid**: Entries (users with picks), Paid, Total Users, Teams — all computed from `DemoContext`.
- **Info cards**: Picks Deadline (from `demoSettings`) and Tournament Data (shows game progress from timeline).
- **Quick nav cards**: links to Users, Settings, Sync.

### Role Editing in Demo Admin

Admin users page supports role editing:
- `DemoUser` type has optional `role?: "USER" | "ADMIN" | "SUPERADMIN"` field.
- `updateDemoUser(userId, { role })` in context spreads the role onto the user state.
- When current persona is SUPERADMIN, `UserTable` shows a role selector (USER ↔ ADMIN) for non-superadmin users.

### shadcn `tooltip` Component

The `@/components/ui/tooltip` component is **not** auto-generated by shadcn — it was hand-created at `src/components/ui/tooltip.tsx` (uses `@radix-ui/react-tooltip` which is already installed). Do not delete it.

---

## ESPN Integration

`src/lib/espn.ts` handles all ESPN communication:

- **`fetchESPNScoreboard()`** — Next.js `revalidate: 60` cache. Used by `/api/scores`.
- **`syncTournamentData()`** — no-cache fetch, upserts Teams + TournamentGames, updates wins/eliminated, resolves PlayInSlots.
- **Round detection**: parses `competition.notes[0].headline` (e.g. `"Elite Eight"`).
- **Cron**: Vercel runs `/api/cron/sync` every 5 minutes (`vercel.json`). Requires `Authorization: Bearer <CRON_SECRET>`.
- **Manual sync**: admins trigger from `/admin/sync`.

---

## UI Conventions

- **Design system**: Dark-first. Background is deep slate (`oklch(0.10 0.008 264)`), primary accent is orange (`oklch(0.72 0.18 42)`). Defined as CSS variables in `globals.css`.
- **Always use design tokens** — never hardcode Tailwind color classes like `orange-500` or `orange-50`. Use `text-primary`, `bg-primary/10`, `border-primary/40`, etc.
- **Custom utilities** in `globals.css`:
  - `.glow-orange` / `.glow-orange-sm` — box shadow glow for CTAs
  - `.text-gradient-orange` — orange gradient text for hero headings
  - `.bg-court` — subtle court-texture background pattern
  - `.rank-badge-gold` / `.rank-badge-silver` / `.rank-badge-bronze` — rank indicator dots
- **shadcn/ui**: Add new components with `npx shadcn add <component>`. Never hand-edit files in `src/components/ui/`.
- **Tailwind v4**: No `tailwind.config.js`. Config lives in `postcss.config.mjs`; theme in `globals.css` CSS variables.
- **`cn()` utility** (`src/lib/utils.ts`): always use for conditional class merging.
- **Server Components by default**. Add `"use client"` only for event handlers, hooks, or browser APIs.
- **Toast notifications**: `import { toast } from "sonner"`.

---

## Key Gotchas

- **Prisma client path**: import from `@/generated/prisma`, not `@prisma/client`. The client is generated at a non-default path.
- **Auth config split**: never import `prisma` in `auth.config.ts` — it runs in the Edge runtime via middleware.
- **Play-in slots**: identified by `(seed, region)` composite unique key. Seeds 11–16 in each region can have play-in games.
- **`AppSettings` singleton**: `id` is always the string `"main"`. Use upsert in seeds/settings routes to guarantee it exists.
- **Content pages at `/[slug]`** are publicly accessible (no auth). This catch-all is at the root app level — be careful adding top-level routes that could conflict.
- **Leaderboard API** uses `cache: "no-store"` — scores change frequently.
- **Scores API** uses `revalidate: 60` — ESPN data is cached 60 seconds.
- **Turbopack module cache**: if a new `src/components/ui/*.tsx` file is added and Turbopack still throws `Module not found`, stop the server, delete `.next/`, and restart. The cache doesn't always pick up newly created files mid-session.
- **Demo `ScoresGrid`**: must pass `roundNames={ROUND_NAMES}` — it's a required prop. Use the constant defined locally in the demo scores page (or import `ROUND_NAMES` from `src/lib/espn.ts`).
- **Demo `leaderboardHistory` is precomputed** for all 63 game steps on every render — this is intentional for smooth chart dragging. If adding many more demo users, consider memoizing more aggressively.
