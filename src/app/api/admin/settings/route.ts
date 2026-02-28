import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function getSettings() {
  return prisma.appSettings.upsert({
    where: { id: "main" },
    create: { id: "main", picksDeadline: null, payoutStructure: [], defaultCharities: [] },
    update: {},
  })
}

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = session.user.role
  if (role !== "ADMIN" && role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const settings = await getSettings()
  return NextResponse.json(settings)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = session.user.role
  if (role !== "ADMIN" && role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { picksDeadline, payoutStructure, defaultCharities } = body

  const updated = await prisma.appSettings.upsert({
    where: { id: "main" },
    create: {
      id: "main",
      picksDeadline: picksDeadline ? new Date(picksDeadline) : null,
      payoutStructure: payoutStructure ?? [],
      defaultCharities: defaultCharities ?? [],
    },
    update: {
      picksDeadline: picksDeadline ? new Date(picksDeadline) : null,
      payoutStructure: payoutStructure ?? [],
      defaultCharities: defaultCharities ?? [],
    },
  })

  return NextResponse.json(updated)
}
