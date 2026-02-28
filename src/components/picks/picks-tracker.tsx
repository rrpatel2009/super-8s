"use client"

/**
 * PicksTracker — enhanced 8/8 picks tracker with 2x2 region grid.
 *
 * Shows picks organized by region in a 2x2 grid matching NCAA bracket orientation:
 *   ┌──────┬───────┐
 *   │ East │ West  │
 *   │ ●●   │ ●     │
 *   ├──────┼───────┤
 *   │South │M.West │
 *   │ ●●●  │ ●●    │
 *   └──────┴───────┘
 *
 * Dots are color-coded by seed tier:
 *   Elite (1-4): primary/orange
 *   Strong (5-8): blue
 *   Mid (9-12): green
 *   Longshot (13-16): purple
 *
 * Also shows starting TPS (bracket-aware max potential) and region counters.
 */

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { computeBracketAwarePPR, type TeamBracketInfo } from "@/lib/bracket-ppr"
import type { SelectedPick } from "@/components/picks/picks-form"

// ─── Seed tier config ───────────────────────────────────────────────────────

export const SEED_TIERS = [
  { label: "Elite",    range: [1, 4]   as const, dotClass: "bg-primary",      textClass: "text-primary" },
  { label: "Strong",   range: [5, 8]   as const, dotClass: "bg-blue-400",     textClass: "text-blue-400" },
  { label: "Mid",      range: [9, 12]  as const, dotClass: "bg-emerald-400",  textClass: "text-emerald-400" },
  { label: "Longshot", range: [13, 16] as const, dotClass: "bg-purple-400",   textClass: "text-purple-400" },
] as const

export function getSeedTierDotClass(seed: number): string {
  if (seed <= 4) return "bg-primary"
  if (seed <= 8) return "bg-blue-400"
  if (seed <= 12) return "bg-emerald-400"
  return "bg-purple-400"
}

// ─── Region layout (matches NCAA bracket visual orientation) ────────────────

const REGION_GRID = [
  { region: "East",    short: "E" },
  { region: "West",    short: "W" },
  { region: "South",   short: "S" },
  { region: "Midwest", short: "MW" },
] as const

// ─── Types ──────────────────────────────────────────────────────────────────

interface TeamLike {
  id: string
  seed: number
  region: string
  name: string
  shortName: string
  eliminated: boolean
  wins: number
}

interface PicksTrackerProps {
  selected: SelectedPick[]
  teams: TeamLike[]
  maxPicks: number
}

// ─── Component ──────────────────────────────────────────────────────────────

export function PicksTracker({ selected, teams, maxPicks }: PicksTrackerProps) {
  const selectedTeamIds = new Set(selected.map(s => s.teamId).filter(Boolean))

  // Map selected IDs to team info
  const selectedTeams = useMemo(() => {
    return teams.filter(t => selectedTeamIds.has(t.id))
  }, [teams, selectedTeamIds]) // eslint-disable-line react-hooks/exhaustive-deps

  // Per-region picks
  const regionPicks = useMemo(() => {
    const map = new Map<string, TeamLike[]>()
    for (const { region } of REGION_GRID) {
      map.set(region, selectedTeams.filter(t => t.region === region))
    }
    return map
  }, [selectedTeams])

  // Bracket-aware starting TPS
  const bracketTPS = useMemo(() => {
    if (selectedTeams.length === 0) return 0
    const infoMap = new Map<string, TeamBracketInfo>()
    for (const t of selectedTeams) {
      infoMap.set(t.id, { seed: t.seed, region: t.region, wins: t.wins, eliminated: t.eliminated })
    }
    const { totalPPR } = computeBracketAwarePPR(
      selectedTeams.map(t => t.id),
      infoMap
    )
    // TPS = currentScore + PPR; for pre-tournament (0 wins), currentScore = 0
    const currentScore = selectedTeams.reduce((s, t) => s + t.seed * t.wins, 0)
    return currentScore + totalPPR
  }, [selectedTeams])

  // Naive TPS for comparison
  const naiveTPS = useMemo(() => {
    return selectedTeams.reduce((s, t) => {
      if (t.eliminated) return s
      return s + t.seed * Math.max(0, 6 - t.wins) + t.seed * t.wins
    }, 0)
  }, [selectedTeams])

  const remaining = maxPicks - selected.length
  const hasConflict = bracketTPS < naiveTPS && selectedTeams.length > 0

  return (
    <div className="flex items-center gap-3">
      {/* 2x2 region grid */}
      <div className="grid grid-cols-2 gap-px bg-border/30 rounded-lg overflow-hidden">
        {REGION_GRID.map(({ region, short }) => {
          const picks = regionPicks.get(region) ?? []
          return (
            <div key={region} className="bg-card/60 p-1.5 min-w-[52px]">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[8px] font-semibold text-muted-foreground/60 uppercase">{short}</span>
                {picks.length > 0 && (
                  <span className="text-[8px] font-bold text-foreground/70">{picks.length}</span>
                )}
              </div>
              <div className="flex gap-0.5 flex-wrap">
                {picks.map(t => (
                  <div
                    key={t.id}
                    className={cn("h-2.5 w-2.5 rounded-full transition-all", getSeedTierDotClass(t.seed))}
                    title={`#${t.seed} ${t.shortName}`}
                  />
                ))}
                {/* Empty slots (show at least 2 per region) */}
                {Array.from({ length: Math.max(0, 2 - picks.length) }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-2.5 w-2.5 rounded-full bg-muted-foreground/10" />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Count + TPS info */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold">
            <span className="text-primary">{selected.length}</span>
            <span className="text-muted-foreground">/{maxPicks}</span>
          </span>
          {remaining > 0 && (
            <span className="text-[10px] text-muted-foreground hidden sm:block">Pick {remaining} more</span>
          )}
          {selected.length === maxPicks && (
            <span className="text-[10px] text-primary font-medium">Ready</span>
          )}
        </div>
        {selected.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">
              Max TPS: <span className="font-mono font-bold text-foreground/80">{bracketTPS}</span>
            </span>
            {hasConflict && (
              <span className="text-[9px] text-amber-400" title={`Naive max: ${naiveTPS} — reduced due to bracket conflicts`}>
                (conflict)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
