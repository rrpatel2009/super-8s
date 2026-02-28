"use client"

/**
 * Demo Admin Users — reuses real UserTable with demo user data.
 */

import { UserTable } from "@/components/admin/user-table"
import { useDemoContext } from "@/lib/demo-context"

export default function DemoAdminUsersPage() {
  const { demoUsers, updateDemoUser, currentPersona } = useDemoContext()

  // Build shape UserTable expects: { id, name, email, role, isPaid, _count: { picks } }[]
  const tableUsers = demoUsers.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: (u.role ?? "USER") as "USER" | "ADMIN" | "SUPERADMIN",
    isPaid: u.isPaid,
    _count: { picks: u.picks.length },
    createdAt: new Date(),
  }))

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Manage Users</h2>
      <UserTable
        users={tableUsers}
        currentUserRole={currentPersona.role}
        demoMode
        onDemoPatch={(userId, patch) => updateDemoUser(userId, patch)}
      />
    </div>
  )
}
