import { SyncButton } from "@/components/admin/sync-button"

export default function AdminSyncPage() {
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold">ESPN Sync</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Pull the latest tournament data from ESPN. Updates team wins, eliminated status, and resolves
          play-in slots.
        </p>
      </div>
      <SyncButton />
    </div>
  )
}
