"use client"

/**
 * Demo Admin Sync — placeholder showing how the real sync page would look.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Info } from "lucide-react"

export default function DemoAdminSyncPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">ESPN Data Sync</h2>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-primary" />
            Sync Status
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              Demo
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              In the live app, this page lets admins trigger a manual ESPN data sync to
              update game scores, team wins, and eliminate teams. In demo mode, the timeline
              scrubber in the control panel simulates this progression game-by-game.
            </p>
          </div>
          <div className="rounded-md bg-muted/30 border border-border/40 p-4 text-xs font-mono text-muted-foreground space-y-1">
            <p>✓ Tournament data loaded from demo-data.ts (2025 season)</p>
            <p>✓ 63 games sequenced from Round of 64 → Championship</p>
            <p>✓ Scores simulated with seeded RNG for consistency</p>
            <p className="text-primary">→ Use the demo control panel to advance the timeline</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
