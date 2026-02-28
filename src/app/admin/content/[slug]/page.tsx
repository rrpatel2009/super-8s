import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ContentEditor } from "@/components/admin/content-editor"

export const dynamic = "force-dynamic"

export default async function AdminContentEditorPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = await prisma.contentPage.findUnique({ where: { slug } })
  if (!page) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit: {page.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">/{page.slug}</p>
      </div>
      <ContentEditor page={page} />
    </div>
  )
}
