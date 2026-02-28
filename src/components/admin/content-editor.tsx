"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Code } from "lucide-react"
import type { ContentPage } from "@/generated/prisma"

interface ContentEditorProps {
  page: ContentPage
}

export function ContentEditor({ page }: ContentEditorProps) {
  const [title, setTitle] = useState(page.title)
  const [content, setContent] = useState(page.content)
  const [isPublished, setIsPublished] = useState(page.isPublished)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: page.id, slug: page.slug, title, content, isPublished }),
      })
      if (!res.ok) {
        toast.error("Failed to save")
        return
      }
      toast.success("Page saved")
    } finally {
      setSaving(false)
    }
  }

  // Simple markdown preview (basic transformations)
  const preview = content
    .replace(/^# (.+)$/gm, "<h1 class='text-2xl font-bold mb-3 mt-4'>$1</h1>")
    .replace(/^## (.+)$/gm, "<h2 class='text-xl font-semibold mb-2 mt-4'>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3 class='text-lg font-semibold mb-2 mt-3'>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>")
    .replace(/\n\n/g, "</p><p class='mb-3'>")
    .replace(/^(?!<[h|l])(.+)$/gm, "<p class='mb-3'>$1</p>")

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-48 space-y-1">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="flex items-end gap-2">
          <div className="space-y-1">
            <Label>Published</Label>
            <div className="flex items-center gap-2 h-9">
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
              <span className="text-sm text-muted-foreground">
                {isPublished ? "Visible at /" + page.slug : "Draft"}
              </span>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="edit">
        <TabsList>
          <TabsTrigger value="edit" className="flex items-center gap-1.5">
            <Code className="h-3.5 w-3.5" /> Edit
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" /> Preview
          </TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[500px] font-mono text-sm"
            placeholder="Write your content in Markdown..."
          />
          <p className="text-xs text-muted-foreground mt-2">Supports Markdown: # heading, **bold**, *italic*, - lists</p>
        </TabsContent>
        <TabsContent value="preview">
          <div
            className="min-h-[500px] rounded-md border p-4 prose max-w-none"
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
