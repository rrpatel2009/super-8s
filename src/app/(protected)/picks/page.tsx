import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PicksForm } from "@/components/picks/picks-form"

export const dynamic = "force-dynamic"

async function getPicksData(userId: string) {
  const [teams, playInSlots, existingPicks, settings] = await Promise.all([
    prisma.team.findMany({
      where: { isPlayIn: false },
      orderBy: [{ region: "asc" }, { seed: "asc" }],
    }),
    prisma.playInSlot.findMany({
      include: { team1: true, team2: true, winner: true },
      orderBy: [{ region: "asc" }, { seed: "asc" }],
    }),
    prisma.pick.findMany({
      where: { userId },
      include: {
        team: true,
        playInSlot: { include: { team1: true, team2: true, winner: true } },
      },
    }),
    prisma.appSettings.findUnique({ where: { id: "main" } }),
  ])

  return { teams, playInSlots, existingPicks, settings }
}

export default async function PicksPage() {
  const session = await auth()
  const { teams, playInSlots, existingPicks, settings } = await getPicksData(session!.user.id)

  const deadlinePassed =
    settings?.picksDeadline ? new Date() > new Date(settings.picksDeadline) : false

  const defaultCharities = (settings?.defaultCharities as Array<{ name: string; url?: string }>) ?? []

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">My Picks</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Select exactly 8 teams. You{deadlinePassed ? " could " : " can "}edit picks until the
          deadline
          {settings?.picksDeadline
            ? `: ${new Date(settings.picksDeadline).toLocaleString()}`
            : " (not set yet)"}
          .
        </p>
      </div>

      {deadlinePassed && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          The picks deadline has passed. Your picks are locked.
        </div>
      )}

      <PicksForm
        teams={teams}
        playInSlots={playInSlots}
        existingPicks={existingPicks}
        deadlinePassed={deadlinePassed}
        defaultCharities={defaultCharities}
      />
    </div>
  )
}
