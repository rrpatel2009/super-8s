import { NextRequest, NextResponse } from "next/server"
import { syncTournamentData } from "@/lib/espn"

// Vercel cron job route (protected by CRON_SECRET env var)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await syncTournamentData()
  return NextResponse.json(result)
}
