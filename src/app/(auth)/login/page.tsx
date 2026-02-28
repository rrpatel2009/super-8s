import { signIn } from "@/lib/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Trophy, Zap, TrendingUp, Play } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-court p-4">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-15"
          style={{ background: "radial-gradient(ellipse, oklch(0.72 0.18 42), transparent 70%)" }}
        />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg glow-orange">
            <Trophy className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Super 8s</h1>
          <p className="text-muted-foreground text-sm mt-1">March Madness Pool</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Sign in to play</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your email and we&apos;ll send a magic link — no password needed.
            </p>
          </div>

          <form
            action={async (formData: FormData) => {
              "use server"
              await signIn("resend", {
                email: formData.get("email") as string,
                redirectTo: "/leaderboard",
              })
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="h-11 bg-muted/50 border-border focus:border-primary/50"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold glow-orange-sm"
            >
              Send magic link →
            </Button>
          </form>
        </div>

        {/* Feature pills */}
        <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
          {[
            { icon: Trophy, text: "Pick 8 teams" },
            { icon: TrendingUp, text: "Seed × wins" },
            { icon: Zap, text: "Live scores" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5"
            >
              <Icon className="h-3 w-3 text-primary" />
              {text}
            </div>
          ))}
        </div>

        <div className="text-center mt-4">
          <Link href="/demo" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1.5">
            <Play className="h-3 w-3" />
            Try the demo first — no sign-in required
          </Link>
        </div>
      </div>
    </div>
  )
}
