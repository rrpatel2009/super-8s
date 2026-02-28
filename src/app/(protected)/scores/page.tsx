import { fetchESPNScoreboard, transformESPNEvents, ROUND_NAMES } from "@/lib/espn"
import { ScoresGrid } from "@/components/scores/scores-grid"

export const dynamic = "force-dynamic"

export default async function ScoresPage() {
  let games: import("@/types").LiveGameData[] = []
  let error: string | null = null

  try {
    const data = await fetchESPNScoreboard()
    games = transformESPNEvents(data.events)
  } catch {
    error = "Could not load scores from ESPN. Try again shortly."
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Live Scores</h1>
        <p className="text-muted-foreground text-sm mt-1">
          NCAA Tournament games · Updates every 60 seconds
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <ScoresGrid initialGames={games} roundNames={ROUND_NAMES} />
      )}
    </div>
  )
}
