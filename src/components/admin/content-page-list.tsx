"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, ExternalLink, Pencil, Trash2 } from "lucide-react"
import type { ContentPage } from "@/generated/prisma"

interface ContentPageListProps {
  pages: ContentPage[]
}

export function ContentPageList({ pages: initialPages }: ContentPageListProps) {
  const router = useRouter()
  const [pages, setPages] = useState(initialPages)
  const [newSlug, setNewSlug] = useState("")
  const [newTitle, setNewTitle] = useState("")
  const [creating, setCreating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  async function handleCreate() {
    if (!newSlug || !newTitle) {
      toast.error("Slug and title are required")
      return
    }
    setCreating(true)
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: newSlug, title: newTitle, content: "", isPublished: false }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Failed to create page")
        return
      }
      const page: ContentPage = await res.json()
      setPages((p) => [...p, page])
      setNewSlug("")
      setNewTitle("")
      setDialogOpen(false)
      toast.success("Page created. Click Edit to add content.")
    } finally {
      setCreating(false)
    }
  }

  async function togglePublish(page: ContentPage) {
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: page.id, isPublished: !page.isPublished }),
    })
    if (!res.ok) {
      toast.error("Failed to update")
      return
    }
    const updated: ContentPage = await res.json()
    setPages((p) => p.map((pg) => (pg.id === updated.id ? updated : pg)))
    toast.success(updated.isPublished ? "Published" : "Unpublished")
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this page?")) return
    const res = await fetch(`/api/admin/content?id=${id}`, { method: "DELETE" })
    if (!res.ok) {
      toast.error("Failed to delete")
      return
    }
    setPages((p) => p.filter((pg) => pg.id !== id))
    toast.success("Deleted")
  }

  return (
    <div className="space-y-4">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> New page
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Content Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="e.g. rules, prizes"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              />
              <p className="text-xs text-muted-foreground">Page will be at /{newSlug}</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Pool Rules"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <Button onClick={handleCreate} disabled={creating} className="w-full">
              {creating ? "Creating..." : "Create page"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {pages.length === 0 && (
        <div className="rounded-md border p-8 text-center text-muted-foreground">
          No content pages yet. Create one to get started.
        </div>
      )}

      <div className="divide-y rounded-md border">
        {pages.map((page) => (
          <div key={page.id} className="flex items-center justify-between p-3 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{page.title}</p>
                <p className="text-xs text-muted-foreground">/{page.slug}</p>
              </div>
              <Badge variant={page.isPublished ? "default" : "outline"} className="text-xs flex-shrink-0">
                {page.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Switch checked={page.isPublished} onCheckedChange={() => togglePublish(page)} />
              <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                <Link href={`/admin/content/${page.slug}`}>
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
              </Button>
              {page.isPublished && (
                <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                  <Link href={`/${page.slug}`} target="_blank">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => handleDelete(page.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
