import { prisma } from "@/lib/prisma"
import { computeLeaderboard } from "@/lib/scoring"
import { SimulatorPanel } from "@/components/simulator/simulator-panel"

export const dynamic = "force-dynamic"

export default async function SimulatorPage() {
  const [teams, users] = await Promise.all([
    prisma.team.findMany({
      where: { isPlayIn: false },
      orderBy: [{ region: "asc" }, { seed: "asc" }],
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isPaid: true,
        picks: {
          include: {
            team: true,
            playInSlot: { include: { team1: true, team2: true, winner: true } },
          },
        },
      },
      where: { picks: { some: {} } },
    }),
  ])

  const usersWithCharity = users.map((u) => ({
    ...u,
    charityPreference: u.picks[0]?.charityPreference ?? null,
  }))

  const leaderboard = computeLeaderboard(usersWithCharity)
  const aliveTeams = teams.filter(t => !t.eliminated)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scenario Simulator</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Pick winners for upcoming games to see how the leaderboard would change. Results are not saved.
        </p>
      </div>
      <SimulatorPanel
        initialLeaderboard={leaderboard}
        aliveTeams={aliveTeams}
        allTeams={teams}
      />
    </div>
  )
}
