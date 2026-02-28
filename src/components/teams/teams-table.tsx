"use client"

/**
 * TeamsTable — sortable table of all tournament teams with scoring stats.
 *
 * Per-team stats shown:
 *   Seed · Team · Region · Status · Wins · Remaining · Pickers · Score · PPR · TPS
 */

import { useState } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TeamRow {
  id: string
  name: string
  shortName: string
  seed: number
  region: string
  eliminated: boolean
  wins: number
  logoUrl: string | null
  pickerCount: number
}

interface TeamsTableProps {
  teams: TeamRow[]
}

type SortKey = "seed" | "region" | "wins" | "pickerCount" | "score" | "ppr" | "tps"
type SortDir = "asc" | "desc"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSeedTier(seed: number): "elite" | "strong" | "mid" | "longshot" {
  if (seed <= 4) return "elite"
  if (seed <= 8) return "strong"
  if (seed <= 12) return "mid"
  return "longshot"
}

const TIER_ROW_CLASS = {
  elite:    "border-l-2 border-l-primary/50",
  strong:   "border-l-2 border-l-blue-400/50",
  mid:      "border-l-2 border-l-emerald-400/50",
  longshot: "border-l-2 border-l-purple-400/50",
}

const TIER_BADGE_CLASS = {
  elite:    "bg-primary/20 text-primary/90",
  strong:   "bg-blue-400/20 text-blue-400/90",
  mid:      "bg-emerald-400/20 text-emerald-400/90",
  longshot: "bg-purple-400/20 text-purple-400/90",
}

const REGION_SHORT: Record<string, string> = {
  East: "E", West: "W", South: "S", Midwest: "MW",
}

const REGION_COLOR: Record<string, string> = {
  East:    "bg-blue-400/15 text-blue-400/80",
  West:    "bg-emerald-400/15 text-emerald-400/80",
  South:   "bg-amber-400/15 text-amber-400/80",
  Midwest: "bg-rose-400/15 text-rose-400/80",
}

function teamStats(team: TeamRow) {
  const score = team.seed * team.wins
  const ppr = team.eliminated ? 0 : team.seed * Math.max(0, 6 - team.wins)
  const tps = score + ppr
  const remaining = team.eliminated ? 0 : Math.max(0, 6 - team.wins)
  return { score, ppr, tps, remaining }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TeamsTable({ teams }: TeamsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("tps")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir(key === "seed" ? "asc" : "desc")
    }
  }

  const sorted = [...teams].sort((a, b) => {
    const statsA = teamStats(a), statsB = teamStats(b)
    let diff = 0
    switch (sortKey) {
      case "seed":        diff = a.seed - b.seed; break
      case "region":      diff = a.region.localeCompare(b.region); break
      case "wins":        diff = a.wins - b.wins; break
      case "pickerCount": diff = a.pickerCount - b.pickerCount; break
      case "score":       diff = statsA.score - statsB.score; break
      case "ppr":         diff = statsA.ppr - statsB.ppr; break
      case "tps":         diff = statsA.tps - statsB.tps; break
    }
    return sortDir === "asc" ? diff : -diff
  })

  const SortBtn = ({ col, label, className }: { col: SortKey; label: string; className?: string }) => (
    <button
      className={cn(
        "flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors group",
        className
      )}
      onClick={() => handleSort(col)}
    >
      {label}
      <span className={sortKey === col ? "text-primary" : "opacity-0 group-hover:opacity-60"}>
        {sortDir === "asc" && sortKey === col
          ? <ChevronUp className="h-3 w-3" />
          : <ChevronDown className="h-3 w-3" />
        }
      </span>
    </button>
  )

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-border/50 bg-muted/20 flex-wrap">
        {(["elite", "strong", "mid", "longshot"] as const).map(tier => (
          <div key={tier} className="flex items-center gap-1.5">
            <div className={cn("w-2 h-2 rounded-full", {
              "bg-primary": tier === "elite",
              "bg-blue-400": tier === "strong",
              "bg-emerald-400": tier === "mid",
              "bg-purple-400": tier === "longshot",
            })} />
            <span className="text-[10px] text-muted-foreground capitalize">{tier}</span>
          </div>
        ))}
        <span className="text-[10px] text-muted-foreground ml-auto">
          {teams.filter(t => !t.eliminated).length} alive · {teams.filter(t => t.eliminated).length} eliminated
        </span>
      </div>

      {/* Header */}
      <div className="hidden md:grid grid-cols-[2.5rem_1fr_3rem_4rem_3rem_3.5rem_4rem_4rem_4rem_4rem] gap-2 px-4 py-2 bg-muted/30 border-b border-border/50">
        <div className="text-right"><SortBtn col="seed" label="#" /></div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Team</span>
        <SortBtn col="region" label="Rgn" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
        <div className="text-right"><SortBtn col="wins" label="W" /></div>
        <div className="text-right">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rem</span>
        </div>
        <div className="text-right"><SortBtn col="pickerCount" label="Picks" /></div>
        <div className="text-right"><SortBtn col="score" label="Pts" /></div>
        <div className="text-right"><SortBtn col="ppr" label="PPR" /></div>
        <div className="text-right"><SortBtn col="tps" label="TPS" /></div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/30">
        {sorted.map(team => {
          const tier = getSeedTier(team.seed)
          const { score, ppr, tps, remaining } = teamStats(team)
          const regionShort = REGION_SHORT[team.region] ?? team.region

          return (
            <div
              key={team.id}
              className={cn(
                "grid grid-cols-[2.5rem_1fr_3rem_4rem_3rem_3.5rem_4rem_4rem_4rem_4rem] gap-2 items-center px-4 py-2.5 transition-colors hover:bg-muted/20",
                TIER_ROW_CLASS[tier],
                team.eliminated && "opacity-55"
              )}
            >
              {/* Seed */}
              <div className="text-right">
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", TIER_BADGE_CLASS[tier])}>
                  #{team.seed}
                </span>
              </div>

              {/* Team name + logo */}
              <div className="flex items-center gap-2 min-w-0">
                {team.logoUrl ? (
                  <img src={team.logoUrl} alt="" className="h-5 w-5 object-contain shrink-0" />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold shrink-0">
                    {team.shortName[0]}
                  </div>
                )}
                <span className={cn(
                  "text-sm font-medium truncate",
                  team.eliminated && "line-through text-muted-foreground"
                )}>
                  {team.name}
                </span>
              </div>

              {/* Region */}
              <div>
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", REGION_COLOR[team.region])}>
                  {regionShort}
                </span>
              </div>

              {/* Status */}
              <div>
                {team.eliminated ? (
                  <Badge variant="outline" className="text-[9px] h-4 border-muted-foreground/30 text-muted-foreground">
                    Out
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[9px] h-4 border-green-500/50 text-green-400">
                    Alive
                  </Badge>
                )}
              </div>

              {/* Wins */}
              <div className="text-right font-mono text-sm">{team.wins}</div>

              {/* Games remaining */}
              <div className="text-right">
                <span className={cn(
                  "font-mono text-sm",
                  remaining === 0 ? "text-muted-foreground" : "text-amber-400"
                )}>
                  {remaining}
                </span>
              </div>

              {/* Picker count */}
              <div className="text-right">
                <span className={cn(
                  "font-mono text-sm",
                  team.pickerCount === 0 ? "text-muted-foreground" : "text-foreground"
                )}>
                  {team.pickerCount}
                </span>
              </div>

              {/* Score */}
              <div className="text-right font-mono text-sm font-medium">{score}</div>

              {/* PPR */}
              <div className="text-right">
                <span className="font-mono text-sm text-muted-foreground">+{ppr}</span>
              </div>

              {/* TPS */}
              <div className="text-right">
                <span className="font-mono text-sm font-bold text-primary">{tps}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
