import type { Pick, Team, PlayInSlot } from "@/generated/prisma"
import type { LeaderboardEntry, ResolvedPickSummary } from "@/types"
import { computeBracketAwarePPR, seedToSlot, type TeamBracketInfo } from "@/lib/bracket-ppr"

type PickWithRelations = Pick & {
  team: Team | null
  playInSlot: (PlayInSlot & { winner: Team | null; team1: Team; team2: Team }) | null
}

type UserWithPicks = {
  id: string
  name: string | null
  email: string
  isPaid: boolean
  charityPreference?: string | null
  picks: PickWithRelations[]
}

// Resolve a pick to its effective team (handles play-in slot resolution)
export function resolvePickTeam(pick: PickWithRelations): Team | null {
  if (pick.team) return pick.team
  if (pick.playInSlot?.winner) return pick.playInSlot.winner
  return null
}

// seed × wins for a single team
export function teamScore(team: Team): number {
  return team.seed * team.wins
}

// PPR for a single alive team: seed × (6 - current_wins)
// Max 6 wins = path from R64 to championship
export function teamPPR(team: Team): number {
  if (team.eliminated) return 0
  return team.seed * Math.max(0, 6 - team.wins)
}

// Build pick summary for display
function buildPickSummary(pick: PickWithRelations): ResolvedPickSummary | null {
  const team = resolvePickTeam(pick)
  if (!team) {
    // Unresolved play-in slot — show slot info if available
    if (pick.playInSlot) {
      return {
        teamId: pick.playInSlotId ?? "",
        name: `${pick.playInSlot.team1.name} / ${pick.playInSlot.team2.name}`,
        shortName: `${pick.playInSlot.team1.shortName}/${pick.playInSlot.team2.shortName}`,
        seed: pick.playInSlot.seed,
        wins: 0,
        eliminated: false,
        logoUrl: null,
        isPlayIn: true,
        playInSlotId: pick.playInSlotId,
      }
    }
    return null
  }
  return {
    teamId: team.id,
    name: team.name,
    shortName: team.shortName,
    seed: team.seed,
    region: team.region,
    wins: team.wins,
    eliminated: team.eliminated,
    logoUrl: team.logoUrl,
    isPlayIn: team.isPlayIn,
    playInSlotId: pick.playInSlotId,
  }
}

export function computeUserScore(user: UserWithPicks): Omit<LeaderboardEntry, "rank"> {
  let currentScore = 0
  let ppr = 0
  let teamsRemaining = 0
  const picks: ResolvedPickSummary[] = []

  for (const pick of user.picks) {
    const summary = buildPickSummary(pick)
    if (summary) picks.push(summary)

    const team = resolvePickTeam(pick)
    if (!team) continue

    currentScore += teamScore(team)
    if (!team.eliminated) {
      teamsRemaining++
      ppr += teamPPR(team)
    }
  }

  return {
    userId: user.id,
    name: user.name ?? user.email,
    email: user.email,
    isPaid: user.isPaid,
    currentScore,
    ppr,
    tps: currentScore + ppr,
    teamsRemaining,
    picks,
  }
}

export function computeLeaderboard(users: UserWithPicks[]): LeaderboardEntry[] {
  const scores = users.map((u) => computeUserScore(u))

  // Sort: TPS desc, then currentScore desc as tiebreaker, then name asc
  scores.sort(
    (a, b) => b.tps - a.tps || b.currentScore - a.currentScore || a.name.localeCompare(b.name)
  )

  return scores.map((s, i) => ({
    ...s,
    rank: i + 1,
    charity: i < 4 ? (users.find((u) => u.id === s.userId)?.charityPreference ?? null) : null,
  }))
}

// ─── Optimal 8 helper ────────────────────────────────────────────────────────

export interface Optimal8Team {
  id: string
  seed: number
  region: string
  wins: number
  isPlayIn: boolean
}

export interface Optimal8Result {
  teamIds: string[]
  score: number
  ppr: number
  tps: number
}

/**
 * Computes the 8 currently alive teams that would yield the highest bracket-aware TPS.
 *
 * Algorithm (greedy):
 * 1. Sort alive non-play-in teams by individual PPR (seed × (6-wins)) descending.
 * 2. Pick top 2 per region (8 total). Within each region, prefer teams from different
 *    bracket halves (slots 0-3 vs 4-7) to avoid E8 conflicts.
 * 3. Run bracket-aware PPR on the selected 8 to get the true total.
 */
export function computeOptimal8(
  aliveTeams: Optimal8Team[],
  teamInfoMap: Map<string, TeamBracketInfo>
): Optimal8Result {
  const regions = ["East", "West", "South", "Midwest"]
  const selectedIds: string[] = []

  for (const region of regions) {
    const regionTeams = aliveTeams
      .filter(t => t.region === region && !t.isPlayIn)
      .sort((a, b) => {
        // Sort by PPR descending (higher seed # × remaining games wins)
        const pprA = a.seed * Math.max(0, 6 - a.wins)
        const pprB = b.seed * Math.max(0, 6 - b.wins)
        return pprB - pprA
      })

    if (regionTeams.length === 0) continue

    // Prefer one from each bracket half (slots 0-3 = top half, 4-7 = bottom half)
    const topHalf = regionTeams.filter(t => {
      const slot = seedToSlot(t.seed)
      return slot >= 0 && slot <= 3
    })
    const bottomHalf = regionTeams.filter(t => {
      const slot = seedToSlot(t.seed)
      return slot >= 4 && slot <= 7
    })

    const picks: Optimal8Team[] = []

    if (topHalf.length > 0 && bottomHalf.length > 0) {
      // One from each half — minimizes E8 conflict
      picks.push(topHalf[0], bottomHalf[0])
    } else if (regionTeams.length >= 2) {
      // Same half — just take top 2
      picks.push(regionTeams[0], regionTeams[1])
    } else {
      picks.push(regionTeams[0])
    }

    selectedIds.push(...picks.map(t => t.id))
  }

  // Compute bracket-aware PPR for the selection
  const { totalPPR } = computeBracketAwarePPR(selectedIds, teamInfoMap)

  // Compute score
  let score = 0
  for (const id of selectedIds) {
    const info = teamInfoMap.get(id)
    if (info) score += info.seed * info.wins
  }

  return {
    teamIds: selectedIds,
    score,
    ppr: totalPPR,
    tps: score + totalPPR,
  }
}

// ─── Simulator helper ──────────────────────────────────────────────────────────

export interface HypotheticalState {
  [teamId: string]: { wins: number; eliminated: boolean }
}

export function computeSimulatedLeaderboard(
  entries: LeaderboardEntry[],
  hypothetical: HypotheticalState
): LeaderboardEntry[] {
  const simulated = entries.map((entry) => {
    let currentScore = 0
    let ppr = 0
    let teamsRemaining = 0

    for (const pick of entry.picks) {
      const override = hypothetical[pick.teamId]
      const wins = override !== undefined ? override.wins : pick.wins
      const eliminated = override !== undefined ? override.eliminated : pick.eliminated

      currentScore += pick.seed * wins
      if (!eliminated) {
        teamsRemaining++
        ppr += pick.seed * Math.max(0, 6 - wins)
      }
    }

    return {
      ...entry,
      currentScore,
      ppr,
      tps: currentScore + ppr,
      teamsRemaining,
    }
  })

  simulated.sort(
    (a, b) => b.tps - a.tps || b.currentScore - a.currentScore || a.name.localeCompare(b.name)
  )

  return simulated.map((s, i) => ({ ...s, rank: i + 1 }))
}
