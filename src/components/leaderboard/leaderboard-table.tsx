"use client"

import { useEffect, useState, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Heart, ChevronDown, ChevronUp, TrendingUp, Sparkles } from "lucide-react"
import type { LeaderboardEntry, ResolvedPickSummary } from "@/types"

// ── Seed-tier helpers (consistent with picks/team-card color scheme) ──────────

function getSeedTier(seed: number): "elite" | "strong" | "mid" | "longshot" {
  if (seed <= 4) return "elite"
  if (seed <= 8) return "strong"
  if (seed <= 12) return "mid"
  return "longshot"
}

const TIER_CLASSES = {
  elite: { card: "border-primary/40", badge: "bg-primary/20 text-primary/90", quad: "bg-primary/70", solid: "bg-primary text-primary-foreground" },
  strong: { card: "border-blue-400/40", badge: "bg-blue-400/20 text-blue-400/90", quad: "bg-blue-400/70", solid: "bg-blue-500 text-white" },
  mid: { card: "border-emerald-400/40", badge: "bg-emerald-400/20 text-emerald-400/90", quad: "bg-emerald-400/70", solid: "bg-emerald-500 text-white" },
  longshot: { card: "border-purple-400/40", badge: "bg-purple-400/20 text-purple-400/90", quad: "bg-purple-400/70", solid: "bg-purple-500 text-white" },
}

// ── Inline logo strip — always visible in the leaderboard row ──────────────

function PicksLogoStrip({ picks, padTo }: { picks: ResolvedPickSummary[], padTo?: number }) {
  const activePicks = picks.filter(p => !p.eliminated)
  const eliminatedPicks = picks.filter(p => p.eliminated)

  const emptySlots = Math.max(0, (padTo || 0) - picks.length)

  if (!picks.length && !emptySlots) return null

  const renderPick = (pick: ResolvedPickSummary) => (
    <div
      key={pick.teamId}
      className="relative w-7 h-7 shrink-0"
      title={`${pick.shortName} (#${pick.seed})${pick.eliminated ? " — eliminated" : ""}`}
    >
      <div
        className={`relative w-7 h-7 rounded-sm border overflow-hidden flex items-center justify-center p-0.5 text-[8px] font-bold ${pick.eliminated
          ? "grayscale opacity-40 border-border/30 bg-muted/20"
          : `border-border/50 bg-background shadow-sm ${TIER_CLASSES[getSeedTier(pick.seed)].card}`
          }`}
      >
        {pick.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pick.logoUrl} alt="" className="w-full h-full object-contain" />
        ) : (
          <span className="text-[7.5px] font-bold text-muted-foreground leading-none text-center px-0.5 break-all">{pick.shortName.substring(0, 3)}</span>
        )}
      </div>
      {/* Tiny seed badge for inline strip */}
      <div className={`absolute -bottom-1 -right-1 w-[14px] h-[14px] rounded-sm flex items-center justify-center text-[7.5px] font-black shadow-sm border border-background ${TIER_CLASSES[getSeedTier(pick.seed)].solid}`}>
        {pick.seed}
      </div>
    </div>
  )

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
      {activePicks.map(renderPick)}

      {eliminatedPicks.length > 0 && (
        <>
          {activePicks.length > 0 && (
            <div className="w-[2px] h-5 bg-red-500/60 rounded-full mx-0.5 shrink-0" />
          )}
          {eliminatedPicks.map(renderPick)}
        </>
      )}

      {Array.from({ length: emptySlots }).map((_, i) => (
        <div key={`empty-${i}`} className="w-7 h-7 rounded-sm border border-border/30 bg-muted/10 shrink-0" title="Empty slot" />
      ))}
    </div>
  )
}

function PickCard({ pick }: { pick: ResolvedPickSummary }) {
  const tier = getSeedTier(pick.seed)
  const tierCls = TIER_CLASSES[tier]
  const pts = pick.seed * pick.wins

  return (
    <div className={`flex flex-col items-center gap-1.5 w-16 ${pick.eliminated ? "opacity-60 grayscale" : ""}`}>
      {/* Logo container */}
      <div className={`relative w-12 h-12 rounded-lg border flex items-center justify-center bg-card shadow-sm ${tierCls.card} p-1.5`}>
        {pick.logoUrl ? (
          <img src={pick.logoUrl} alt={pick.shortName} className="w-full h-full object-contain" />
        ) : (
          <span className="text-[10px] font-bold text-muted-foreground">{pick.shortName.substring(0, 3)}</span>
        )}

        {/* Prominent Seed Badge */}
        <div className={`absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded flex items-center justify-center text-[9px] font-black shadow-sm ${tierCls.solid}`}>
          {pick.seed}
        </div>
      </div>

      {/* Shaded square with details */}
      <div className={`w-full rounded border p-1.5 flex flex-col items-center justify-center text-center ${tierCls.badge}`}>
        <span className="text-[9px] font-extrabold truncate w-full">{pick.shortName}</span>
        <div className="flex flex-col items-center gap-0 text-[9px] mt-0.5 opacity-90 font-medium">
          <span className="font-semibold text-[8px] opacity-80 uppercase tracking-wider">{pick.wins} Wins</span>
          <span className="font-mono font-bold mt-0.5">{pts > 0 ? `${pts} pts` : "–"}</span>
        </div>
      </div>
    </div>
  )
}

export function ExpandedPicksGrid({ picks }: { picks: ResolvedPickSummary[] }) {
  const regions = [
    { name: "West", id: "West" },
    { name: "East", id: "East" },
    { name: "Midwest", id: "Midwest" },
    { name: "South", id: "South" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 w-full bg-muted/10 p-4 border-t border-border/50">
      {regions.map((region) => {
        const regionPicks = picks.filter(p => p.region === region.id);

        return (
          <div key={region.id} className="rounded-xl border border-border/60 bg-card p-3 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 px-2.5 py-1 bg-muted/60 text-[9px] font-bold uppercase tracking-wider text-muted-foreground rounded-bl-lg border-l border-b border-border/40">
              {region.name}
            </div>

            <div className="flex flex-wrap gap-4 mt-3">
              {regionPicks.length > 0 ? (
                regionPicks.map(pick => <PickCard key={pick.teamId} pick={pick} />)
              ) : (
                <span className="text-[10px] text-muted-foreground/50 italic py-2 pl-1">No picks</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Optimal 8 card ────────────────────────────────────────────────────────────

export interface Optimal8Data {
  score: number
  ppr: number
  tps: number
  picks: ResolvedPickSummary[]
}

function Optimal8Card({ data }: { data: Optimal8Data }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-primary/25 bg-primary/5 mb-3 overflow-hidden transition-all shadow-sm shadow-primary/10">
      <button
        className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Label + scores */}
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-xs font-bold text-primary">Optimal 8</p>
              <p className="text-[10px] text-muted-foreground">Best available picks by TPS potential</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs shrink-0">
            <div className="text-right">
              <p className="text-muted-foreground text-[10px]">Score</p>
              <p className="font-mono font-semibold">{data.score}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-[10px]">PPR</p>
              <p className="font-mono text-muted-foreground">+{data.ppr}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-[10px]">TPS</p>
              <p className="font-mono font-bold text-primary text-base">{data.tps}</p>
            </div>
          </div>
        </div>
        {/* Team logos */}
        <div className="mt-2 pt-2 border-t border-primary/15">
          <PicksLogoStrip picks={data.picks} padTo={8} />
        </div>
      </button>

      {/* Expanded picks */}
      {isExpanded && (
        <ExpandedPicksGrid picks={data.picks} />
      )}
    </div>
  )
}

interface LeaderboardTableProps {
  initialData: LeaderboardEntry[]
  currentUserId?: string
  demoMode?: boolean
  optimal8?: Optimal8Data
}

type SortKey = "rank" | "currentScore" | "ppr" | "tps" | "teamsRemaining"
type SortDir = "asc" | "desc"

export function LeaderboardTable({ initialData, currentUserId, demoMode, optimal8 }: LeaderboardTableProps) {
  const [data, setData] = useState<LeaderboardEntry[]>(initialData)
  const [loading, setLoading] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>("currentScore")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Sync initialData → data when it changes in demo mode (timeline scrubbing)
  useEffect(() => {
    if (demoMode) setData(initialData)
  }, [demoMode, initialData])

  const refresh = useCallback(async () => {
    if (demoMode) return
    setLoading(true)
    try {
      const res = await fetch("/api/leaderboard")
      if (res.ok) {
        setData(await res.json())
        setLastUpdated(new Date())
      }
    } finally {
      setLoading(false)
    }
  }, [demoMode])

  useEffect(() => {
    if (demoMode) return
    const id = setInterval(refresh, 30_000)
    return () => clearInterval(id)
  }, [refresh, demoMode])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir(key === "rank" || key === "teamsRemaining" ? "asc" : "desc")
    }
  }

  const sorted = [...data].sort((a, b) => {
    const mult = sortDir === "asc" ? 1 : -1
    return (a[sortKey] - b[sortKey]) * mult
  })

  const SortBtn = ({ col, label }: { col: SortKey; label: string }) => (
    <button
      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors group"
      onClick={() => handleSort(col)}
    >
      {label}
      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
        {sortKey === col && sortDir === "asc" ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </span>
      {sortKey === col && (
        <span className="text-primary">
          {sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </span>
      )}
    </button>
  )

  const rankStyle = (rank: number) => {
    if (rank === 1) return "bg-primary/20 text-primary border-primary/30 shadow-sm"
    if (rank === 2) return "bg-slate-200/20 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 shadow-sm"
    if (rank === 3) return "bg-orange-800/10 text-orange-800 dark:text-orange-400 border-orange-800/20 shadow-sm"
    return "bg-muted/60 text-muted-foreground border-transparent"
  }

  return (
    <div className="space-y-3">
      {/* Header bar */}
      {!demoMode && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Auto-refreshes every 30s · Last updated {lastUpdated.toLocaleTimeString()}
          </p>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      )}

      {/* Column headers */}
      <div className="hidden sm:grid grid-cols-[2.5rem_1fr_3.5rem_4rem_4rem_4rem_3.5rem] gap-2 px-4 py-2">
        <SortBtn col="rank" label="#" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Player</span>
        <div className="text-right"><SortBtn col="teamsRemaining" label="Left" /></div>
        <div className="text-right"><SortBtn col="currentScore" label="Pts" /></div>
        <div className="text-right"><SortBtn col="ppr" label="PPR" /></div>
        <div className="text-right"><SortBtn col="tps" label="TPS" /></div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">$</span>
      </div>

      {/* Optimal 8 card (above real leaderboard) */}
      {optimal8 && <Optimal8Card data={optimal8} />}

      {/* Rows */}
      <div className="space-y-1.5">
        {sorted.length === 0 && (
          <div className="bg-card border border-border rounded-xl py-16 text-center text-muted-foreground text-sm">
            No picks submitted yet
          </div>
        )}

        {sorted.map((entry) => {
          const isMe = entry.userId === currentUserId
          const isExpanded = expandedId === entry.userId

          return (
            <div
              key={entry.userId}
              className={`rounded-xl border overflow-hidden transition-all duration-200 ${isMe
                ? "border-primary/40 bg-primary/5 shadow-sm shadow-primary/10"
                : "border-border bg-card hover:border-border/80"
                }`}
            >
              {/* Main row */}
              <button
                className="w-full text-left"
                onClick={() => setExpandedId(isExpanded ? null : entry.userId)}
              >
                <div className="grid grid-cols-[2.5rem_1fr_3.5rem_4rem_4rem_4rem_3.5rem] gap-2 items-center px-4 py-3">
                  {/* Rank */}
                  <div
                    className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${rankStyle(entry.rank)}`}
                  >
                    #{entry.rank}
                  </div>

                  {/* Name */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm truncate">{entry.name}</span>
                      {isMe && (
                        <Badge variant="outline" className="text-[10px] border-primary/50 text-primary h-4 shrink-0">You</Badge>
                      )}
                    </div>
                    {entry.charity && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                        <Heart className="h-2.5 w-2.5 text-rose-400" />
                        {entry.charity}
                      </div>
                    )}
                    {/* Inline picks logo strip — always visible */}
                    {entry.picks.length > 0 && (
                      <PicksLogoStrip picks={entry.picks} />
                    )}
                  </div>

                  {/* Teams remaining */}
                  <div className="text-right">
                    <span
                      className={`text-sm font-mono font-medium ${entry.teamsRemaining === 0
                        ? "text-muted-foreground"
                        : entry.teamsRemaining >= 4
                          ? "text-green-400"
                          : "text-amber-400"
                        }`}
                    >
                      {entry.teamsRemaining}
                      <span className="text-muted-foreground text-xs">/8</span>
                    </span>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <span className="font-mono font-semibold text-sm">{entry.currentScore}</span>
                  </div>

                  {/* PPR */}
                  <div className="text-right">
                    <span className="font-mono text-sm text-muted-foreground">+{entry.ppr}</span>
                  </div>

                  {/* TPS */}
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-primary">{entry.tps}</span>
                  </div>

                  {/* Paid */}
                  <div className="flex justify-center">
                    {entry.isPaid ? (
                      <div className="w-2 h-2 rounded-full bg-green-400" title="Paid" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-red-400/50" title="Unpaid" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded picks */}
              {isExpanded && entry.picks.length > 0 && (
                <ExpandedPicksGrid picks={entry.picks} />
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      {data.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3" />
            TPS = Score + PPR (Possible Points Remaining)
          </div>
          <span>{data.length} entr{data.length === 1 ? "y" : "ies"}</span>
        </div>
      )}
    </div>
  )
}
