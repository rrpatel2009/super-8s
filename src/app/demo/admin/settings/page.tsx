"use client"

/**
 * Demo Admin Settings — reuses real SettingsForm with demo settings.
 */

import { SettingsForm } from "@/components/admin/settings-form"
import { useDemoContext } from "@/lib/demo-context"

export default function DemoAdminSettingsPage() {
  const { demoSettings, updateDemoSettings } = useDemoContext()

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Contest Settings</h2>
      <SettingsForm
        initialDeadline={demoSettings.picksDeadline}
        initialPayouts={demoSettings.payoutStructure}
        initialCharities={demoSettings.defaultCharities}
        demoMode
        onDemoSave={(deadline, payouts, charities) => {
          updateDemoSettings({
            picksDeadline: deadline,
            payoutStructure: payouts,
            defaultCharities: charities,
          })
        }}
      />
    </div>
  )
}
