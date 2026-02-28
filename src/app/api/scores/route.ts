import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { fetchESPNScoreboard, transformESPNEvents } from "@/lib/espn"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const data = await fetchESPNScoreboard()
    const games = transformESPNEvents(data.events)
    return NextResponse.json(games)
  } catch {
    return NextResponse.json({ error: "Failed to fetch scores from ESPN" }, { status: 502 })
  }
}
