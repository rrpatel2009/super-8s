import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function requireAdmin(role: string) {
  return role !== "ADMIN" && role !== "SUPERADMIN"
}

export async function GET() {
  const session = await auth()
  if (!session?.user || requireAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const pages = await prisma.contentPage.findMany({ orderBy: { createdAt: "asc" } })
  return NextResponse.json(pages)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || requireAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { slug, title, content, isPublished } = await req.json()
  if (!slug || !title) return NextResponse.json({ error: "slug and title required" }, { status: 400 })

  const page = await prisma.contentPage.create({
    data: { slug, title, content: content ?? "", isPublished: isPublished ?? false },
  })
  return NextResponse.json(page)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user || requireAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id, slug, title, content, isPublished } = await req.json()
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  const page = await prisma.contentPage.update({
    where: { id },
    data: { slug, title, content, isPublished },
  })
  return NextResponse.json(page)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user || requireAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  await prisma.contentPage.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
