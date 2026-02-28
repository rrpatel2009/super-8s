"use client"

/**
 * LeaderboardHistoryChart
 *
 * Interactive recharts line chart showing leaderboard score history game-by-game.
 *
 * Features:
 * - Solid lines from 0 → gameIndex showing actual scores (auto-tracks timeline)
 * - Dashed optimal trajectory lines from gameIndex → end:
 *     Starts at naive TPS (all alive picks win everything, ignoring bracket conflicts).
 *     Steps DOWN each time two of a user's picks are scheduled to conflict.
 *     Ends at bracket-aware TPS at the rightmost point.
 * - Y-axis mode toggle: Max TPS (shows full upside) vs Max Score (zooms in on race)
 * - Play button: animates score history from 0 → current gameIndex
 * - Highlighted line for the current user/persona
 * - Round boundary reference lines
 * - Draggable cursor for tooltip exploration (does NOT mask data)
 */

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Play, Pause } from "lucide-react"
import { cn } from "@/lib/utils"
import type { HistorySnapshot } from "@/types"
import type { RoundBoundary, DemoGameEvent } from "@/lib/demo-game-sequence"

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeaderboardHistoryChartProps {
  /** Full precomputed history from DemoContext */
  history: HistorySnapshot[]
  /** Current demo position — data auto-displays up to this */
  gameIndex: number
  /** Total games count */
  totalGames: number
  /** Round boundary markers */
  roundBoundaries: RoundBoundary[]
  /** Highlighted user's userId */
  highlightUserId?: string
  /** User names (userId → name) */
  userNames: Record<string, string>
  /** Full game sequence for trajectory computation */
  gameSequence?: DemoGameEvent[]
}

// ─── Color palette ────────────────────────────────────────────────────────────

const PALETTE = [
  "#f97316", // orange (primary — reserved for highlighted user)
  "#60a5fa", // blue
  "#34d399", // green
  "#f472b6", // pink
  "#a78bfa", // purple
  "#fbbf24", // yellow
  "#2dd4bf", // teal
  "#fb923c", // orange-light
  "#818cf8", // indigo
  "#4ade80", // lime
  "#e879f9", // fuchsia
  "#94a3b8", // slate
]

// ─── Trajectory computation ───────────────────────────────────────────────────

/**
 * Computes the "optimal trajectory" for each user's TPS going forward.
 *
 * Starting point: naive TPS = currentScore + Σ seed×(6-wins) for all alive picks,
 * ignoring bracket conflicts (this is always ≥ bracket-aware TPS).
 *
 * Walking future games: TPS only changes when two of a user's picks are in the
 * same game (conflict). The pick with lower remaining PPR is "eliminated" and
 * their potential is subtracted. Single-pick games are score-neutral (TPS stays flat).
 *
 * The trajectory ends at the bracket-aware TPS at the final game.
 */
function computeOptimalTrajectories(
  history: HistorySnapshot[],
  gameIndex: number,
  gameSequence: DemoGameEvent[],
  totalGames: number
): Record<string, (number | null)[]> {
  if (!history.length || gameIndex < 0) return {}

  const anchorIndex = Math.min(gameIndex, history.length - 1)
  const anchorSnapshot = history[anchorIndex]
  if (!anchorSnapshot) return {}

  const result: Record<string, (number | null)[]> = {}

  for (const entry of anchorSnapshot.entries) {
    const uid = entry.userId

    // Build alive picks map: teamId → seed (skip play-in and eliminated picks)
    const alivePicks = new Map<string, number>()
    let naiveTps = entry.currentScore

    for (const pick of entry.picks) {
      if (!pick.eliminated && !pick.isPlayIn && pick.seed > 0) {
        alivePicks.set(pick.teamId, pick.seed)
        naiveTps += pick.seed * Math.max(0, 6 - pick.wins)
      }
    }

    const trajectory: (number | null)[] = new Array(totalGames).fill(null)
    let currentNaiveTps = naiveTps

    // Set starting value at the current game position
    if (gameIndex < totalGames) {
      trajectory[gameIndex] = currentNaiveTps
    }

    // Walk future games: only conflict events change the trajectory
    for (let i = gameIndex + 1; i < totalGames; i++) {
      const game = gameSequence[i]
      if (!game) {
        trajectory[i] = currentNaiveTps
        continue
      }

      const winnerInPicks = alivePicks.has(game.winnerId)
      const loserInPicks = alivePicks.has(game.loserId)

      if (winnerInPicks && loserInPicks) {
        // CONFLICT: both of this user's picks meet in this game.
        // Keep the one with higher remaining PPR (seed × remaining rounds).
        // Before round r, remaining games = 7 - r (including this round).
        // Higher seed NUMBER = higher PPR contribution in this contest.
        if (game.winnerSeed < game.loserSeed) {
          // Winner has lower seed# (better team) → lower PPR contribution → eliminate winner pick
          currentNaiveTps -= game.winnerSeed * (7 - game.round)
          alivePicks.delete(game.winnerId)
        } else {
          // Loser has lower or equal seed# → lower PPR contribution → eliminate loser pick
          currentNaiveTps -= game.loserSeed * (7 - game.round)
          alivePicks.delete(game.loserId)
        }
      }
      // Single-pick or no-pick games: TPS is score-neutral (pick wins → +seed score, -seed PPR)

      trajectory[i] = currentNaiveTps
    }

    result[uid] = trajectory
  }

  return result
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LeaderboardHistoryChart({
  history,
  gameIndex,
  totalGames,
  roundBoundaries,
  highlightUserId,
  userNames,
  gameSequence = [],
}: LeaderboardHistoryChartProps) {
  const [chartCursor, setChartCursor] = useState(gameIndex)
  const [isDragging, setIsDragging] = useState(false)
  const [yAxisMode, setYAxisMode] = useState<"tps" | "score">("tps")
  const [animateIndex, setAnimateIndex] = useState<number | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const animIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Keep chartCursor ≤ gameIndex (for tooltip exploration)
  const clampedCursor = Math.min(Math.max(chartCursor, 0), gameIndex)

  // Extract all unique userIds from the first snapshot
  const userIds = history.length > 0
    ? history[0].entries.map(e => e.userId)
    : []

  // Build flat chart data — one point per game
  const chartData = history.map((snap, i) => {
    const point: Record<string, number | string> = {
      gameIndex: i,
      label: snap.roundLabel,
    }
    for (const entry of snap.entries) {
      point[`${entry.userId}_score`] = entry.currentScore
    }
    return point
  })

  // Assign colors (highlighted user always gets orange)
  const colorMap: Record<string, string> = {}
  let paletteIdx = 1
  for (const uid of userIds) {
    if (uid === highlightUserId) {
      colorMap[uid] = PALETTE[0]
    } else {
      colorMap[uid] = PALETTE[paletteIdx % PALETTE.length]
      paletteIdx++
    }
  }

  // ── Optimal trajectory computation ────────────────────────────────────────
  const trajectories = useMemo(() => {
    if (!gameSequence.length || gameIndex < 0) return {}
    return computeOptimalTrajectories(history, gameIndex, gameSequence, totalGames)
  }, [history, gameIndex, gameSequence, totalGames])

  // ── Y-axis domain ─────────────────────────────────────────────────────────
  const anchorIndex = gameIndex >= 0 ? Math.min(gameIndex, history.length - 1) : 0
  const anchorSnapshot = history[anchorIndex]

  const yAxisMax = useMemo(() => {
    if (!anchorSnapshot) return 100
    if (yAxisMode === "score") {
      const maxScore = Math.max(...anchorSnapshot.entries.map(e => e.currentScore), 1)
      return Math.ceil(maxScore * 1.1)
    } else {
      // TPS mode: use max naive TPS across all users (trajectory start value)
      let maxVal = 1
      for (const entry of anchorSnapshot.entries) {
        const traj = trajectories[entry.userId]
        if (traj && gameIndex >= 0 && gameIndex < traj.length && traj[gameIndex] !== null) {
          maxVal = Math.max(maxVal, traj[gameIndex] as number)
        } else {
          // Fall back to bracket-aware TPS if no trajectory
          maxVal = Math.max(maxVal, entry.tps)
        }
      }
      return Math.ceil(maxVal * 1.1)
    }
  }, [anchorSnapshot, yAxisMode, trajectories, gameIndex])

  // ── Play/pause animation ───────────────────────────────────────────────────
  const stopAnimation = useCallback(() => {
    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current)
      animIntervalRef.current = null
    }
    setAnimateIndex(null)
  }, [])

  const handlePlayPause = useCallback(() => {
    if (animateIndex !== null) {
      // Currently playing — pause
      stopAnimation()
    } else {
      // Start playing from 0
      setAnimateIndex(0)
      animIntervalRef.current = setInterval(() => {
        setAnimateIndex(prev => {
          if (prev === null || prev >= gameIndex) {
            if (animIntervalRef.current) clearInterval(animIntervalRef.current)
            animIntervalRef.current = null
            return null // done
          }
          return prev + 1
        })
      }, 150)
    }
  }, [animateIndex, gameIndex, stopAnimation])

  // Stop animation when gameIndex changes (timeline scrubbed)
  useEffect(() => {
    stopAnimation()
  }, [gameIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => () => {
    if (animIntervalRef.current) clearInterval(animIntervalRef.current)
  }, [])

  // Effective index for solid lines (animated or real)
  const effectiveIndex = animateIndex !== null ? animateIndex : gameIndex

  // ── Drag handling (tooltip exploration only — doesn't mask data) ───────────

  function getGameIndexFromMouseX(e: React.MouseEvent<HTMLDivElement>): number {
    if (!chartRef.current) return clampedCursor
    const rect = chartRef.current.getBoundingClientRect()
    const leftMargin = 60
    const rightMargin = 20
    const usableWidth = rect.width - leftMargin - rightMargin
    const x = e.clientX - rect.left - leftMargin
    const fraction = Math.max(0, Math.min(1, x / usableWidth))
    return Math.round(fraction * (totalGames - 1))
  }

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    const idx = getGameIndexFromMouseX(e)
    setChartCursor(Math.min(idx, gameIndex))
  }, [gameIndex, totalGames]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const idx = getGameIndexFromMouseX(e)
    setChartCursor(Math.min(idx, gameIndex))
  }, [isDragging, gameIndex, totalGames]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleMouseUp = useCallback(() => setIsDragging(false), [])

  // Custom tooltip — shows both Score and TPS
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean
    payload?: Array<{ name: string; value: number; color: string; dataKey: string }>
    label?: number
  }) => {
    if (!active || !payload?.length) return null
    const snap = history[label ?? 0]
    const isProjZone = (label ?? 0) > effectiveIndex

    // Score entries for the actual zone
    const scoreEntries = payload.filter(p => p.dataKey?.endsWith("_score"))
    // Trajectory entries for the projection zone
    const trajEntries = payload.filter(p => p.dataKey?.endsWith("_traj"))

    return (
      <div className="bg-popover border border-border/60 rounded-lg px-3 py-2 shadow-lg text-xs max-w-[220px]">
        <p className="font-semibold mb-1.5 text-muted-foreground">
          {isProjZone ? "Optimal Trajectory" : (snap?.gameLabel ?? `Game ${label}`)}
        </p>
        {!isProjZone && scoreEntries.length > 0
          ? [...scoreEntries]
              .sort((a, b) => b.value - a.value)
              .map(p => {
                const uid = p.dataKey.replace("_score", "")
                return (
                  <div key={uid} className="flex justify-between gap-3">
                    <span style={{ color: p.color }}>{userNames[uid] ?? uid}</span>
                    <span className="font-mono font-bold">{p.value}</span>
                  </div>
                )
              })
          : [...trajEntries]
              .filter(p => p.value !== null && p.value !== undefined)
              .sort((a, b) => b.value - a.value)
              .map(p => {
                const uid = p.dataKey.replace("_traj", "")
                return (
                  <div key={uid} className="flex justify-between gap-3">
                    <span style={{ color: p.color }}>{userNames[uid] ?? uid}</span>
                    <span className="font-mono font-bold text-muted-foreground">{Math.round(p.value)}</span>
                  </div>
                )
              })
        }
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Advance the timeline to see score history
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header with controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-xs text-muted-foreground">
          Solid = actual scores · Dashed = optimal trajectory
          {gameIndex >= 0 && (
            <span className="text-muted-foreground/60"> · Drag to explore</span>
          )}
        </p>
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Y-axis mode toggle */}
          <div className="flex rounded border border-border/40 overflow-hidden text-[10px]">
            <button
              className={cn(
                "px-2 py-1 transition-colors",
                yAxisMode === "tps"
                  ? "bg-primary/20 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted/40"
              )}
              onClick={() => setYAxisMode("tps")}
            >
              Max TPS
            </button>
            <button
              className={cn(
                "px-2 py-1 transition-colors border-l border-border/40",
                yAxisMode === "score"
                  ? "bg-primary/20 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted/40"
              )}
              onClick={() => setYAxisMode("score")}
            >
              Max Score
            </button>
          </div>
          {/* Play/pause button */}
          {gameIndex > 0 && (
            <button
              className="h-6 w-6 rounded border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              onClick={handlePlayPause}
              title={animateIndex !== null ? "Pause animation" : "Play score history"}
            >
              {animateIndex !== null
                ? <Pause className="h-3 w-3" />
                : <Play className="h-3 w-3" />
              }
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      <div
        ref={chartRef}
        className="select-none"
        style={{ cursor: isDragging ? "ew-resize" : "col-resize" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />

            <XAxis
              dataKey="gameIndex"
              type="number"
              domain={[0, totalGames - 1]}
              tickCount={7}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickFormatter={(v: number) => {
                const boundary = roundBoundaries.find(b => b.gameIndex === v)
                return boundary ? boundary.roundLabel.split(" ")[0] : ""
              }}
            />

            <YAxis
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              width={36}
              domain={[0, yAxisMax]}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Round boundary reference lines */}
            {roundBoundaries.map(b => (
              <ReferenceLine
                key={b.gameIndex}
                x={b.gameIndex}
                stroke="rgba(255,255,255,0.12)"
                strokeDasharray="4 2"
                label={{
                  value: b.roundLabel.split(" ")[0],
                  position: "insideTopRight",
                  fill: "#64748b",
                  fontSize: 9,
                }}
              />
            ))}

            {/* Future zone shading (beyond current effectiveIndex) */}
            {effectiveIndex >= 0 && effectiveIndex < totalGames - 1 && (
              <ReferenceArea
                x1={effectiveIndex}
                x2={totalGames - 1}
                fill="rgba(255,255,255,0.02)"
                stroke="none"
              />
            )}

            {/* Timeline position marker (primary visual anchor) */}
            {gameIndex >= 0 && (
              <ReferenceLine
                x={gameIndex}
                stroke="#f97316"
                strokeWidth={2}
                strokeDasharray="none"
                label={{
                  value: "▼",
                  position: "top",
                  fill: "#f97316",
                  fontSize: 10,
                }}
              />
            )}

            {/* Animation playhead (when animating, show where we are) */}
            {animateIndex !== null && animateIndex !== gameIndex && (
              <ReferenceLine
                x={animateIndex}
                stroke="#a78bfa"
                strokeWidth={1.5}
                strokeDasharray="4 2"
              />
            )}

            {/* Exploration cursor (subtle secondary indicator) */}
            {gameIndex >= 0 && clampedCursor !== gameIndex && animateIndex === null && (
              <ReferenceLine
                x={clampedCursor}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            )}

            {/* Solid score lines — visible from 0 → effectiveIndex */}
            {userIds.map(uid => {
              const isHighlighted = uid === highlightUserId
              const color = colorMap[uid]
              const scoreKey = `${uid}_score`
              return (
                <Line
                  key={`score-${uid}`}
                  type="monotone"
                  dataKey={scoreKey}
                  stroke={color}
                  strokeWidth={isHighlighted ? 2.5 : 1}
                  dot={false}
                  strokeOpacity={isHighlighted ? 1 : 0.55}
                  strokeDasharray={undefined}
                  connectNulls
                  activeDot={{ r: isHighlighted ? 5 : 3, fill: color }}
                  name={uid}
                  data={chartData.map((d, i) => ({
                    gameIndex: d.gameIndex,
                    [scoreKey]: i <= effectiveIndex ? (d[scoreKey] as number) : null,
                  }))}
                />
              )
            })}

            {/* Dashed optimal trajectory lines — from gameIndex onward */}
            {/* Only shown when we have trajectory data (gameSequence provided) */}
            {gameIndex >= 0 && userIds.map(uid => {
              const isHighlighted = uid === highlightUserId
              const color = colorMap[uid]
              const trajKey = `${uid}_traj`
              const traj = trajectories[uid]
              if (!traj) return null

              return (
                <Line
                  key={`traj-${uid}`}
                  type="monotone"
                  dataKey={trajKey}
                  stroke={color}
                  strokeWidth={isHighlighted ? 2 : 0.8}
                  strokeOpacity={isHighlighted ? 0.7 : 0.25}
                  strokeDasharray="6 3"
                  dot={false}
                  connectNulls
                  name={`traj-${uid}`}
                  legendType="none"
                  data={chartData.map((d, i) => {
                    const base = { gameIndex: d.gameIndex }
                    if (i < gameIndex) return { ...base, [trajKey]: null }
                    const val = traj[i]
                    return { ...base, [trajKey]: val !== null && val !== undefined ? val : null }
                  })}
                />
              )
            })}

            {/* Fallback flat lines when no gameSequence provided */}
            {gameIndex >= 0 && !gameSequence.length && userIds.map(uid => {
              const isHighlighted = uid === highlightUserId
              const color = colorMap[uid]
              const trajKey = `${uid}_traj`
              const flatTps = anchorSnapshot?.entries.find(e => e.userId === uid)?.tps ?? 0

              return (
                <Line
                  key={`traj-${uid}`}
                  type="monotone"
                  dataKey={trajKey}
                  stroke={color}
                  strokeWidth={isHighlighted ? 2 : 0.8}
                  strokeOpacity={isHighlighted ? 0.7 : 0.25}
                  strokeDasharray="6 3"
                  dot={false}
                  connectNulls
                  name={`traj-flat-${uid}`}
                  legendType="none"
                  data={chartData.map((d, i) => {
                    const base = { gameIndex: d.gameIndex }
                    if (i < gameIndex) return { ...base, [trajKey]: null }
                    if (i === gameIndex) return { ...base, [trajKey]: flatTps }
                    return { ...base, [trajKey]: flatTps }
                  })}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 px-1">
        {userIds.map(uid => (
          <div key={uid} className="flex items-center gap-1.5">
            <div
              className="h-2 w-5 rounded-full"
              style={{
                backgroundColor: colorMap[uid],
                opacity: uid === highlightUserId ? 1 : 0.6,
              }}
            />
            <span
              className="text-xs"
              style={{ color: colorMap[uid], opacity: uid === highlightUserId ? 1 : 0.7 }}
            >
              {userNames[uid] ?? uid}
              {uid === highlightUserId && (
                <Badge className="ml-1 h-3.5 px-1 text-[9px] bg-primary/20 text-primary border-0">
                  you
                </Badge>
              )}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-border/40">
          <div className="h-0 w-5 border-t border-dashed border-muted-foreground/40" />
          <span className="text-xs text-muted-foreground">Optimal trajectory</span>
        </div>
      </div>
    </div>
  )
}
