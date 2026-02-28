import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { syncTournamentData } from "@/lib/espn"

export async function POST() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = session.user.role
  if (role !== "ADMIN" && role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const result = await syncTournamentData()
  return NextResponse.json(result)
}
