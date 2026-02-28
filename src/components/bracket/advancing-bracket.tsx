"use client"

/**
 * AdvancingBracket — Full NCAA bracket visualization with winner propagation.
 *
 * Shows all 4 regions (R64 → E8) with a Final Four tab.
 * Winners of each game visually advance to the next round's slot.
 *
 * Supports two modes:
 *   - "picks": clickable team cells to select/deselect picks; winners from locked
 *     games advance into later rounds automatically.
 *   - "simulator": locked past-game results shown; future games are clickable to
 *     hypothetically pick winners that cascade through the bracket.
 */

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lock } from "lucide-react"
import type { DemoGameEvent } from "@/lib/demo-game-sequence"

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamInfo {
  id: string
  name: string
  shortName: string
  seed: number
  region: string
  logoUrl: string | null
  eliminated: boolean
  wins: number
  isPlayIn: boolean
}

interface AdvancingBracketProps {
  teams: TeamInfo[]
  mode: "picks" | "simulator"
  /** Picks mode: which teams are currently selected */
  selectedTeamIds?: Set<string>
  /** Picks mode: toggle a team selection */
  onToggleTeam?: (teamId: string) => void
  /** Simulator: game picks (gameId → winnerId) */
  gamePicks?: Record<string, string>
  /** Simulator: pick a game winner */
  onPickGame?: (gameId: string, winnerId: string) => void
  /** Full game sequence — used to determine locked results and propagation */
  gameSequence?: DemoGameEvent[]
  /** Current timeline position — games ≤ gameIndex are locked */
  gameIndex?: number
  disabled?: boolean
}

const REGIONS = ["East", "West", "South", "Midwest"] as const
const ROUND_LABELS = ["R64", "R32", "Sweet 16", "Elite 8"]
const R64_SEED_ORDER = [
  [1, 16], [8, 9], [5, 12], [4, 13], [6, 11], [3, 14], [7, 10], [2, 15],
] as const

// ─── Bracket slot types ────────────────────────────────────────────────────────

interface BracketMatchup {
  gameId: string | null
  topTeamId: string | null   // null = TBD
  bottomTeamId: string | null
  winnerId: string | null    // set if game is locked or hypothetically picked
  isLocked: boolean
  round: number
}

// ─── Build bracket for a region ───────────────────────────────────────────────

function buildRegionBracket(
  region: string,
  teams: TeamInfo[],
  gameSequence: DemoGameEvent[],
  gameIndex: number,
  gamePicks: Record<string, string>
): BracketMatchup[][] {
  // regionGames by round
  const regionGames = gameSequence.filter(g => g.region === region)
  const gamesForRound = (r: number) => regionGames.filter(g => g.round === r)

  // Build a lookup: gameId → { winnerId, isLocked }
  const gameResults = new Map<string, { winnerId: string; isLocked: boolean }>()
  for (const g of regionGames) {
    const isLocked = g.gameIndex <= gameIndex
    const pickedWinner = !isLocked ? gamePicks[g.gameId] : undefined
    if (isLocked) {
      gameResults.set(g.gameId, { winnerId: g.winnerId, isLocked: true })
    } else if (pickedWinner) {
      gameResults.set(g.gameId, { winnerId: pickedWinner, isLocked: false })
    }
  }

  // Helper: resolve winner of a game
  function getWinner(gameId: string | null): string | null {
    if (!gameId) return null
    return gameResults.get(gameId)?.winnerId ?? null
  }

  // R64 matchups (fixed by seed order)
  const regionTeams = teams.filter(t => t.region === region && !t.isPlayIn)
  const r64Games = gamesForRound(1)
  const r64: BracketMatchup[] = R64_SEED_ORDER.map(([seedA, seedB], i) => {
    const game = r64Games[i] ?? null
    const teamA = regionTeams.find(t => t.seed === seedA)
    const teamB = regionTeams.find(t => t.seed === seedB)
    const result = game ? gameResults.get(game.gameId) : undefined

    return {
      gameId: game?.gameId ?? null,
      topTeamId: teamA?.id ?? null,
      bottomTeamId: teamB?.id ?? null,
      winnerId: result?.winnerId ?? null,
      isLocked: result?.isLocked ?? false,
      round: 1,
    }
  })

  // Build R32 matchups from R64 winners
  const r32Games = gamesForRound(2)
  const r32: BracketMatchup[] = []
  for (let i = 0; i < 4; i++) {
    const topMatchup = r64[i * 2]
    const bottomMatchup = r64[i * 2 + 1]
    const game = r32Games[i] ?? null
    const result = game ? gameResults.get(game.gameId) : undefined

    r32.push({
      gameId: game?.gameId ?? null,
      topTeamId: getWinner(topMatchup.gameId),
      bottomTeamId: getWinner(bottomMatchup.gameId),
      winnerId: result?.winnerId ?? null,
      isLocked: result?.isLocked ?? false,
      round: 2,
    })
  }

  // Build S16 matchups from R32 winners
  const s16Games = gamesForRound(3)
  const s16: BracketMatchup[] = []
  for (let i = 0; i < 2; i++) {
    const topMatchup = r32[i * 2]
    const bottomMatchup = r32[i * 2 + 1]
    const game = s16Games[i] ?? null
    const result = game ? gameResults.get(game.gameId) : undefined

    s16.push({
      gameId: game?.gameId ?? null,
      topTeamId: getWinner(topMatchup.gameId),
      bottomTeamId: getWinner(bottomMatchup.gameId),
      winnerId: result?.winnerId ?? null,
      isLocked: result?.isLocked ?? false,
      round: 3,
    })
  }

  // E8 matchup from S16 winners
  const e8Games = gamesForRound(4)
  const e8Game = e8Games[0] ?? null
  const e8Result = e8Game ? gameResults.get(e8Game.gameId) : undefined
  const e8: BracketMatchup[] = [{
    gameId: e8Game?.gameId ?? null,
    topTeamId: getWinner(s16[0]?.gameId ?? null),
    bottomTeamId: getWinner(s16[1]?.gameId ?? null),
    winnerId: e8Result?.winnerId ?? null,
    isLocked: e8Result?.isLocked ?? false,
    round: 4,
  }]

  return [r64, r32, s16, e8]
}

// ─── Team cell ─────────────────────────────────────────────────────────────────

function BracketTeamCell({
  teamId,
  teams,
  isWinner,
  isLoser,
  isLocked,
  isSelected,
  isTBD,
  position,
  mode,
  onClick,
  disabled,
}: {
  teamId: string | null
  teams: TeamInfo[]
  isWinner: boolean
  isLoser: boolean
  isLocked: boolean
  isSelected: boolean
  isTBD: boolean
  position: "top" | "bottom"
  mode: "picks" | "simulator"
  onClick: () => void
  disabled?: boolean
}) {
  const team = teamId ? teams.find(t => t.id === teamId) : null

  const borderClass = position === "top" ? "border-b border-b-border/20" : ""

  if (isTBD || !team) {
    return (
      <div className={cn(
        "h-7 px-2 flex items-center gap-1.5 text-[10px] text-muted-foreground/40",
        borderClass
      )}>
        <span className="text-[9px] w-3 text-center">—</span>
        <span>TBD</span>
      </div>
    )
  }

  const dimmed = isLoser || (isLocked && !isWinner && mode === "simulator")
  const clickable = !disabled && !(isLocked && mode === "simulator")

  return (
    <button
      onClick={clickable ? onClick : undefined}
      disabled={!clickable || disabled}
      type="button"
      className={cn(
        "h-7 px-2 flex items-center gap-1.5 text-[10px] w-full text-left transition-all",
        borderClass,
        isSelected && mode === "picks"
          ? "bg-primary/15 text-foreground font-semibold"
          : isWinner && mode === "simulator" && isLocked
          ? "bg-primary/10 text-foreground font-semibold"
          : "hover:bg-muted/40",
        dimmed && "opacity-30 line-through",
        !clickable && "cursor-default",
        disabled && !isSelected && "opacity-40 cursor-not-allowed",
      )}
    >
      {/* Seed badge */}
      <span className={cn(
        "text-[9px] font-bold w-3 text-center shrink-0",
        isSelected && mode === "picks" ? "text-primary" : "text-muted-foreground"
      )}>
        {team.seed}
      </span>

      {/* Logo */}
      {team.logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={team.logoUrl} alt="" className="h-3.5 w-3.5 object-contain shrink-0" />
      )}

      {/* Name */}
      <span className="truncate flex-1">{team.shortName}</span>

      {/* Selected indicator (picks mode) */}
      {isSelected && mode === "picks" && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
      )}

      {/* Winner indicator (simulator mode) */}
      {isWinner && mode === "simulator" && isLocked && (
        <span className="ml-auto text-primary text-[9px] font-bold shrink-0">✓</span>
      )}

      {/* Locked indicator */}
      {isLocked && mode === "simulator" && !isWinner && !dimmed && (
        <Lock className="ml-auto h-2.5 w-2.5 text-muted-foreground/40 shrink-0" />
      )}
    </button>
  )
}

// ─── Single matchup card ───────────────────────────────────────────────────────

function BracketMatchupCard({
  matchup,
  teams,
  selectedTeamIds,
  mode,
  onToggleTeam,
  onPickGame,
  disabled,
}: {
  matchup: BracketMatchup
  teams: TeamInfo[]
  selectedTeamIds: Set<string>
  mode: "picks" | "simulator"
  onToggleTeam?: (teamId: string) => void
  onPickGame?: (gameId: string, winnerId: string) => void
  disabled?: boolean
}) {
  const handleTeamClick = (teamId: string) => {
    if (mode === "picks") {
      onToggleTeam?.(teamId)
    } else if (mode === "simulator" && matchup.gameId && !matchup.isLocked) {
      onPickGame?.(matchup.gameId, teamId)
    }
  }

  const topIsWinner = matchup.winnerId === matchup.topTeamId
  const bottomIsWinner = matchup.winnerId === matchup.bottomTeamId

  return (
    <div className="border border-border/40 rounded-md overflow-hidden bg-card/30 min-w-[120px]">
      <BracketTeamCell
        teamId={matchup.topTeamId}
        teams={teams}
        isWinner={topIsWinner}
        isLoser={!!matchup.winnerId && !topIsWinner}
        isLocked={matchup.isLocked}
        isSelected={matchup.topTeamId ? selectedTeamIds.has(matchup.topTeamId) : false}
        isTBD={!matchup.topTeamId}
        position="top"
        mode={mode}
        onClick={() => matchup.topTeamId && handleTeamClick(matchup.topTeamId)}
        disabled={disabled}
      />
      <BracketTeamCell
        teamId={matchup.bottomTeamId}
        teams={teams}
        isWinner={bottomIsWinner}
        isLoser={!!matchup.winnerId && !bottomIsWinner}
        isLocked={matchup.isLocked}
        isSelected={matchup.bottomTeamId ? selectedTeamIds.has(matchup.bottomTeamId) : false}
        isTBD={!matchup.bottomTeamId}
        position="bottom"
        mode={mode}
        onClick={() => matchup.bottomTeamId && handleTeamClick(matchup.bottomTeamId)}
        disabled={disabled}
      />
    </div>
  )
}

// ─── Region bracket ───────────────────────────────────────────────────────────

function RegionBracket({
  region,
  teams,
  gameSequence,
  gameIndex,
  gamePicks,
  selectedTeamIds,
  mode,
  onToggleTeam,
  onPickGame,
  disabled,
}: {
  region: string
  teams: TeamInfo[]
  gameSequence: DemoGameEvent[]
  gameIndex: number
  gamePicks: Record<string, string>
  selectedTeamIds: Set<string>
  mode: "picks" | "simulator"
  onToggleTeam?: (teamId: string) => void
  onPickGame?: (gameId: string, winnerId: string) => void
  disabled?: boolean
}) {
  const rounds = useMemo(() => {
    return buildRegionBracket(region, teams, gameSequence, gameIndex, gamePicks)
  }, [region, teams, gameSequence, gameIndex, gamePicks])

  // Region champion (winner of E8)
  const e8 = rounds[3][0]
  const champion = e8?.winnerId ? teams.find(t => t.id === e8.winnerId) : null

  return (
    <div className="overflow-x-auto pb-2">
      <div
        className="flex gap-2 min-w-fit"
        style={{ transform: "scale(1)", transformOrigin: "top left" }}
      >
        {rounds.map((roundMatchups, roundIdx) => {
          // Vertical spacing increases each round to align bracket tree
          const gapStyles: string[] = [
            "gap-1",
            "gap-[58px]",
            "gap-[130px]",
            "gap-[274px]",
          ]

          return (
            <div key={roundIdx} className="flex flex-col">
              {/* Round label */}
              <p className="text-[8px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-1 px-0.5">
                {ROUND_LABELS[roundIdx]}
              </p>
              <div className={cn("flex flex-col", gapStyles[roundIdx] ?? "gap-1")}>
                {roundMatchups.map((matchup, i) => (
                  <div key={i} className="flex items-center">
                    <BracketMatchupCard
                      matchup={matchup}
                      teams={teams}
                      selectedTeamIds={selectedTeamIds}
                      mode={mode}
                      onToggleTeam={onToggleTeam}
                      onPickGame={onPickGame}
                      disabled={disabled}
                    />
                    {/* Connector to next round */}
                    {roundIdx < rounds.length - 1 && (
                      <div className="w-2 h-px bg-border/30 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Region champion slot */}
        <div className="flex flex-col justify-center ml-1">
          <p className="text-[8px] font-semibold text-primary/50 uppercase tracking-wider mb-1 px-0.5">
            Champ
          </p>
          <div className="h-7 px-2 flex items-center gap-1.5 rounded-md border border-primary/25 bg-primary/5 text-[10px] font-semibold min-w-[80px]">
            {champion ? (
              <>
                {champion.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={champion.logoUrl} alt="" className="h-3.5 w-3.5 object-contain shrink-0" />
                )}
                <span className="truncate text-primary">{champion.shortName}</span>
              </>
            ) : (
              <span className="text-primary/40">{region}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Final Four view ──────────────────────────────────────────────────────────

function FinalFourView({
  teams,
  gameSequence,
  gameIndex,
  gamePicks,
  selectedTeamIds,
  mode,
  onToggleTeam,
  onPickGame,
}: {
  teams: TeamInfo[]
  gameSequence: DemoGameEvent[]
  gameIndex: number
  gamePicks: Record<string, string>
  selectedTeamIds: Set<string>
  mode: "picks" | "simulator"
  onToggleTeam?: (teamId: string) => void
  onPickGame?: (gameId: string, winnerId: string) => void
}) {
  // Get regional winners from E8 results
  function getRegionalChampion(region: string): string | null {
    const e8Game = gameSequence.find(g => g.region === region && g.round === 4)
    if (!e8Game) return null
    if (e8Game.gameIndex <= gameIndex) return e8Game.winnerId
    return gamePicks[e8Game.gameId] ?? null
  }

  const f4Games = gameSequence.filter(g => g.round === 5)
  const championship = gameSequence.filter(g => g.round === 6)

  const gameResults = new Map<string, { winnerId: string; isLocked: boolean }>()
  for (const g of [...f4Games, ...championship]) {
    const isLocked = g.gameIndex <= gameIndex
    if (isLocked) {
      gameResults.set(g.gameId, { winnerId: g.winnerId, isLocked: true })
    } else if (gamePicks[g.gameId]) {
      gameResults.set(g.gameId, { winnerId: gamePicks[g.gameId], isLocked: false })
    }
  }

  // F4 matchup pairs: East vs West, South vs Midwest
  const f4Pairs: [string, string][] = [["East", "West"], ["South", "Midwest"]]

  const f4Matchups = f4Pairs.map(([rA, rB], i) => {
    const game = f4Games[i] ?? null
    const result = game ? gameResults.get(game.gameId) : undefined
    return {
      gameId: game?.gameId ?? null,
      topTeamId: getRegionalChampion(rA),
      bottomTeamId: getRegionalChampion(rB),
      winnerId: result?.winnerId ?? null,
      isLocked: result?.isLocked ?? false,
      round: 5,
    } as BracketMatchup
  })

  const champGame = championship[0] ?? null
  const champResult = champGame ? gameResults.get(champGame.gameId) : undefined
  const champMatchup: BracketMatchup = {
    gameId: champGame?.gameId ?? null,
    topTeamId: f4Matchups[0]?.winnerId ?? null,
    bottomTeamId: f4Matchups[1]?.winnerId ?? null,
    winnerId: champResult?.winnerId ?? null,
    isLocked: champResult?.isLocked ?? false,
    round: 6,
  }

  const champion = champMatchup.winnerId ? teams.find(t => t.id === champMatchup.winnerId) : null

  const handlePickGame = (gameId: string, winnerId: string) => {
    onPickGame?.(gameId, winnerId)
  }

  return (
    <div className="flex gap-8 items-start pt-2 overflow-x-auto pb-2">
      {/* F4 matchups */}
      <div className="flex flex-col gap-2">
        <p className="text-[8px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-1">
          Final Four
        </p>
        {f4Matchups.map((matchup, i) => (
          <div key={i} className="flex items-center gap-2">
            <BracketMatchupCard
              matchup={matchup}
              teams={teams}
              selectedTeamIds={selectedTeamIds}
              mode={mode}
              onToggleTeam={onToggleTeam}
              onPickGame={handlePickGame}
            />
            <div className="w-4 h-px bg-border/30 shrink-0" />
          </div>
        ))}
      </div>

      {/* Championship */}
      <div className="flex flex-col self-center">
        <p className="text-[8px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-1">
          Championship
        </p>
        <BracketMatchupCard
          matchup={champMatchup}
          teams={teams}
          selectedTeamIds={selectedTeamIds}
          mode={mode}
          onToggleTeam={onToggleTeam}
          onPickGame={handlePickGame}
        />
      </div>

      {/* Champion */}
      {champion && (
        <div className="flex flex-col self-center">
          <p className="text-[8px] font-semibold text-primary/50 uppercase tracking-wider mb-1">
            Champion
          </p>
          <div className="h-10 px-3 flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 min-w-[100px]">
            {champion.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={champion.logoUrl} alt="" className="h-5 w-5 object-contain" />
            )}
            <div>
              <p className="text-[10px] font-bold text-primary">{champion.shortName}</p>
              <p className="text-[9px] text-muted-foreground">#{champion.seed} {champion.region}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AdvancingBracket({
  teams,
  mode,
  selectedTeamIds = new Set(),
  onToggleTeam,
  gamePicks = {},
  onPickGame,
  gameSequence = [],
  gameIndex = -1,
  disabled,
}: AdvancingBracketProps) {
  // Count picks per region for tab badges (picks mode)
  const regionPickCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    if (mode !== "picks") return counts
    for (const region of REGIONS) {
      counts[region] = teams.filter(
        t => t.region === region && selectedTeamIds.has(t.id)
      ).length
    }
    return counts
  }, [teams, selectedTeamIds, mode])

  // Count locked games in Final Four for tab badge
  const f4Count = useMemo(() => {
    return gameSequence.filter(g => g.round >= 5 && g.gameIndex <= gameIndex).length
  }, [gameSequence, gameIndex])

  return (
    <div className="space-y-2">
      <Tabs defaultValue="East">
        <TabsList className="w-full grid grid-cols-5">
          {REGIONS.map(region => (
            <TabsTrigger key={region} value={region} className="gap-1 text-xs">
              {region}
              {mode === "picks" && regionPickCounts[region] > 0 && (
                <span className="bg-primary/20 text-primary text-[10px] font-bold px-1 rounded-full">
                  {regionPickCounts[region]}
                </span>
              )}
              {mode === "simulator" && (() => {
                const done = gameSequence.filter(
                  g => g.region === region && g.round <= 4 && g.gameIndex <= gameIndex
                ).length
                return done > 0 ? (
                  <span className="bg-muted/60 text-muted-foreground text-[10px] font-bold px-1 rounded-full">
                    {done}
                  </span>
                ) : null
              })()}
            </TabsTrigger>
          ))}
          <TabsTrigger value="Final Four" className="gap-1 text-xs">
            F4
            {f4Count > 0 && (
              <span className="bg-muted/60 text-muted-foreground text-[10px] font-bold px-1 rounded-full">
                {f4Count}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {REGIONS.map(region => (
          <TabsContent key={region} value={region} className="mt-3">
            <RegionBracket
              region={region}
              teams={teams}
              gameSequence={gameSequence}
              gameIndex={gameIndex}
              gamePicks={gamePicks}
              selectedTeamIds={selectedTeamIds}
              mode={mode}
              onToggleTeam={onToggleTeam}
              onPickGame={onPickGame}
              disabled={disabled}
            />
          </TabsContent>
        ))}

        <TabsContent value="Final Four" className="mt-3">
          <FinalFourView
            teams={teams}
            gameSequence={gameSequence}
            gameIndex={gameIndex}
            gamePicks={gamePicks}
            selectedTeamIds={selectedTeamIds}
            mode={mode}
            onToggleTeam={onToggleTeam}
            onPickGame={onPickGame}
          />
        </TabsContent>
      </Tabs>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground px-1">
        {mode === "picks" && (
          <>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
              Selected
            </span>
            <span>Click any team to select/deselect</span>
          </>
        )}
        {mode === "simulator" && (
          <>
            <span className="flex items-center gap-1">
              <Lock className="h-2.5 w-2.5" />
              Locked results
            </span>
            <span className="flex items-center gap-1">
              <span className="text-primary font-bold">▶</span>
              Click future teams to pick winners
            </span>
          </>
        )}
      </div>
    </div>
  )
}
