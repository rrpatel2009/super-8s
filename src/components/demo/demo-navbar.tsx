"use client"

/**
 * DemoNavbar — thin wrapper that pulls the fake session from DemoContext
 * and renders the real Navbar with demoMode + linkPrefix props.
 */

import { Navbar } from "@/components/layout/navbar"
import { useDemoContext } from "@/lib/demo-context"
import type { Session } from "next-auth"

export function DemoNavbar() {
  const { session } = useDemoContext()
  return (
    <Navbar
      // Cast: DemoContext session shape matches the augmented NextAuth Session type
      session={session as Session}
      demoMode
      linkPrefix="/demo"
    />
  )
}
