import NextAuth from "next-auth"
import Resend from "next-auth/providers/resend"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/lib/auth.config"
import type { Role } from "@/generated/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "database" },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma as any) as any,
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.RESEND_FROM_EMAIL ?? "Super 8s <noreply@example.com>",
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.role = (user as { role: Role }).role
        session.user.isPaid = (user as { isPaid: boolean }).isPaid
      }
      return session
    },
  },
  events: {
    async createUser({ user }) {
      // First registered user becomes SUPERADMIN
      const count = await prisma.user.count()
      if (count === 1) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "SUPERADMIN" },
        })
      }
    },
  },
})
