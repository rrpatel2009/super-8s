"use client"

/**
 * Demo Admin layout — guards non-admin personas and shows admin sidebar.
 */

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Users, Settings, RefreshCw, Shield, ChevronRight } from "lucide-react"
import { useDemoContext } from "@/lib/demo-context"

const ADMIN_LINKS = [
  { href: "/demo/admin/users", label: "Users", icon: Users },
  { href: "/demo/admin/settings", label: "Settings", icon: Settings },
  { href: "/demo/admin/sync", label: "Sync (Demo)", icon: RefreshCw },
]

export default function DemoAdminLayout({ children }: { children: React.ReactNode }) {
  const { currentPersona } = useDemoContext()
  const pathname = usePathname()
  const router = useRouter()

  const isAdmin = currentPersona.role === "ADMIN" || currentPersona.role === "SUPERADMIN"

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/demo/leaderboard")
    }
  }, [isAdmin, router])

  if (!isAdmin) return null

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Admin header */}
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <Shield className="h-4 w-4 text-primary" />
        <span className="text-primary font-medium">Admin Panel</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="capitalize">{pathname.split("/").pop()}</span>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-44 shrink-0 space-y-1">
          {ADMIN_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                pathname === link.href
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <link.icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
