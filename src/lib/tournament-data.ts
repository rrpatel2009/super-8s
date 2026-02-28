/**
 * Tournament year registry — loads static datasets for different NCAA
 * tournament years. Each dataset provides 64 teams (with round-level
 * winsAtRound / elimAtRound arrays) and 12 demo users with picks.
 *
 * To add a new year:
 * 1. Create src/lib/demo-data-YYYY.ts with DEMO_TEAMS_YYYY and DEMO_USERS_YYYY
 *    exports (same format as demo-data.ts)
 * 2. Import them here and add to the TOURNAMENT_DATA map
 * 3. Add the year to AVAILABLE_YEARS
 */

import type { DemoTeam, DemoUser } from "@/lib/demo-data"
import { DEMO_TEAMS, DEMO_USERS } from "@/lib/demo-data"

export interface TournamentYear {
  year: number
  label: string
  teams: DemoTeam[]
  users: DemoUser[]
}

// ─── Tournament data registry ────────────────────────────────────────────────

const TOURNAMENT_DATA: Map<number, TournamentYear> = new Map([
  [
    2025,
    {
      year: 2025,
      label: "2025 NCAA Tournament",
      teams: DEMO_TEAMS,
      users: DEMO_USERS,
    },
  ],
  // Add more years here as data files are created:
  // [2024, { year: 2024, label: "2024 NCAA Tournament", teams: DEMO_TEAMS_2024, users: DEMO_USERS_2024 }],
])

/** Available years in descending order (most recent first) */
export const AVAILABLE_YEARS: number[] = [...TOURNAMENT_DATA.keys()].sort((a, b) => b - a)

/** Get tournament data for a given year. Falls back to most recent year. */
export function getTournamentData(year: number): TournamentYear {
  return TOURNAMENT_DATA.get(year) ?? TOURNAMENT_DATA.get(AVAILABLE_YEARS[0])!
}

/** Get all available tournament year entries for UI dropdown */
export function getAvailableTournaments(): Array<{ year: number; label: string }> {
  return AVAILABLE_YEARS.map(year => {
    const data = TOURNAMENT_DATA.get(year)!
    return { year: data.year, label: data.label }
  })
}
