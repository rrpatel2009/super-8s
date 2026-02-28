"use client"

/**
 * Demo Simulator — reuses real SimulatorPanel with demo data + full game sequence.
 */

import { SimulatorPanel } from "@/components/simulator/simulator-panel"
import { useDemoContext } from "@/lib/demo-context"

export default function DemoSimulatorPage() {
  const { leaderboardData, aliveTeams, teamsData, gameSequence, gameIndex } = useDemoContext()

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Scenario Simulator</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Pick winners for upcoming games to see how the leaderboard would change.
        </p>
      </div>
      <SimulatorPanel
        initialLeaderboard={leaderboardData}
        aliveTeams={aliveTeams as Parameters<typeof SimulatorPanel>[0]["aliveTeams"]}
        allTeams={teamsData as Parameters<typeof SimulatorPanel>[0]["allTeams"]}
        gameSequence={gameSequence}
        gameIndex={gameIndex}
      />
    </div>
  )
}
