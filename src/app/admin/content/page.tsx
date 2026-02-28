import { prisma } from "@/lib/prisma"
import { ContentPageList } from "@/components/admin/content-page-list"

export const dynamic = "force-dynamic"

export default async function AdminContentPage() {
  const pages = await prisma.contentPage.findMany({
    orderBy: { createdAt: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content Pages</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage public-facing pages (rules, prizes, about, etc.)
        </p>
      </div>
      <ContentPageList pages={pages} />
    </div>
  )
}
