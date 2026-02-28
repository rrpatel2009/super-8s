import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import ReactMarkdown from "react-markdown"

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Don't intercept known routes
  const reservedSlugs = ["login", "verify-request", "error", "leaderboard", "picks", "scores", "simulator", "admin"]
  if (reservedSlugs.includes(slug)) notFound()

  const page = await prisma.contentPage.findUnique({ where: { slug } })
  if (!page || !page.isPublished) notFound()

  const session = await auth()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar session={session} />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
        <div className="prose prose-neutral max-w-none">
          <ReactMarkdown>{page.content}</ReactMarkdown>
        </div>
      </main>
    </div>
  )
}

export async function generateStaticParams() {
  const pages = await prisma.contentPage.findMany({
    where: { isPublished: true },
    select: { slug: true },
  })
  return pages.map((p) => ({ slug: p.slug }))
}
