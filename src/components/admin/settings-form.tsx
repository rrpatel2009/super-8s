"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2 } from "lucide-react"

interface Payout {
  place: number
  label: string
  amount: string
}

interface Charity {
  name: string
  url?: string
}

interface SettingsFormProps {
  initialDeadline: string | null
  initialPayouts: Payout[]
  initialCharities: Charity[]
  demoMode?: boolean
  onDemoSave?: (deadline: string | null, payouts: Payout[], charities: Charity[]) => void
}

export function SettingsForm({ initialDeadline, initialPayouts, initialCharities, demoMode, onDemoSave }: SettingsFormProps) {
  const [deadline, setDeadline] = useState(
    initialDeadline ? new Date(initialDeadline).toISOString().slice(0, 16) : ""
  )
  const [payouts, setPayouts] = useState<Payout[]>(
    initialPayouts.length > 0
      ? initialPayouts
      : [
          { place: 1, label: "1st Place", amount: "" },
          { place: 2, label: "2nd Place", amount: "" },
          { place: 3, label: "3rd Place", amount: "" },
          { place: 4, label: "4th Place", amount: "" },
        ]
  )
  const [charities, setCharities] = useState<Charity[]>(
    initialCharities.length > 0 ? initialCharities : [{ name: "", url: "" }]
  )
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (demoMode && onDemoSave) {
      onDemoSave(
        deadline ? new Date(deadline).toISOString() : null,
        payouts.filter((p) => p.label),
        charities.filter((c) => c.name)
      )
      toast.success("Settings saved (demo)")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          picksDeadline: deadline ? new Date(deadline).toISOString() : null,
          payoutStructure: payouts.filter((p) => p.label),
          defaultCharities: charities.filter((c) => c.name),
        }),
      })
      if (!res.ok) {
        toast.error("Failed to save settings")
        return
      }
      toast.success("Settings saved")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Deadline */}
      <Card>
        <CardHeader><CardTitle className="text-base">Picks Deadline</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-xs">
            <Label htmlFor="deadline">Deadline (local time)</Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              After this time, users cannot submit or edit picks.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payouts */}
      <Card>
        <CardHeader><CardTitle className="text-base">Payout Structure</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {payouts.map((payout, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                className="w-16 text-center"
                value={payout.place}
                type="number"
                onChange={(e) => {
                  const v = [...payouts]
                  v[i] = { ...v[i], place: parseInt(e.target.value) || i + 1 }
                  setPayouts(v)
                }}
              />
              <Input
                placeholder="Label (e.g. 1st Place)"
                value={payout.label}
                onChange={(e) => {
                  const v = [...payouts]
                  v[i] = { ...v[i], label: e.target.value }
                  setPayouts(v)
                }}
              />
              <Input
                placeholder="Amount or description"
                value={payout.amount}
                onChange={(e) => {
                  const v = [...payouts]
                  v[i] = { ...v[i], amount: e.target.value }
                  setPayouts(v)
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPayouts((p) => p.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPayouts((p) => [...p, { place: p.length + 1, label: "", amount: "" }])}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add tier
          </Button>
        </CardContent>
      </Card>

      {/* Default Charities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Default Charities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Shown to users who don&apos;t specify a charity preference when submitting picks.
          </p>
          {charities.map((charity, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="Charity name"
                value={charity.name}
                onChange={(e) => {
                  const v = [...charities]
                  v[i] = { ...v[i], name: e.target.value }
                  setCharities(v)
                }}
              />
              <Input
                placeholder="URL (optional)"
                value={charity.url ?? ""}
                onChange={(e) => {
                  const v = [...charities]
                  v[i] = { ...v[i], url: e.target.value }
                  setCharities(v)
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCharities((c) => c.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCharities((c) => [...c, { name: "", url: "" }])}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add charity
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
        {saving ? "Saving..." : "Save settings"}
      </Button>
    </div>
  )
}
