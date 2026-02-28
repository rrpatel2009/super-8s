import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

const { auth } = NextAuth(authConfig)

export default auth

export const config = {
  matcher: [
    // Only protect these specific routes — exclude public pages and demo
    "/(picks|leaderboard|scores|simulator|admin)(.*)",
  ],
}
