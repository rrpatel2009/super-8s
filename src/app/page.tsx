import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trophy, TrendingUp, Zap, Users, Play, ArrowRight, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function HomePage() {
  // Gracefully handle missing DB/auth config in demo environments
  let session = null
  try {
    session = await auth()
  } catch {
    // No-op: renders landing page without auth
  }
  if (session?.user) redirect("/leaderboard")

  return (
    <div className="min-h-screen bg-background bg-court overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, oklch(0.72 0.18 42), transparent 70%)" }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Trophy className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">Super 8s</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/demo">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
              <Play className="h-3.5 w-3.5" />
              Demo
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1">
              Sign in <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <Badge className="mb-6 bg-primary/15 text-primary border-primary/30 px-3 py-1">
          <Star className="h-3 w-3 mr-1.5" />
          March Madness · 2025
        </Badge>

        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-none mb-6">
          <span className="text-gradient-orange">Super 8s</span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
          Pick <span className="text-foreground font-semibold">8 teams</span>.
          Score <span className="text-foreground font-semibold">seed × wins</span>.
          A #12 seed on a 4-game run is worth 48 points.
        </p>

        <p className="text-base text-muted-foreground/70 mb-12">
          Higher seeds that go on runs score big. Chalk is safe. Chaos wins pools.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-orange text-base px-8 h-12">
              Sign in to play
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link href="/demo">
            <Button size="lg" variant="outline" className="text-base px-8 h-12 border-border hover:border-primary/50 gap-2">
              <Play className="h-4 w-4 text-primary" />
              Try the demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Trophy,
              title: "Pick 8 teams",
              desc: "Choose any 8 teams from all 4 regions. Play-in slots let you pick both teams — the winner counts.",
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              icon: TrendingUp,
              title: "Seed × Wins scoring",
              desc: "Each win earns seed points. A #11 seed winning 4 games scores 44 pts — more than a #1 seed winning 3.",
              color: "text-emerald-400",
              bg: "bg-emerald-400/10",
            },
            {
              icon: Zap,
              title: "Live leaderboard",
              desc: "Auto-refreshes every 30 seconds. Possible Points Remaining (PPR) shows who can still win.",
              color: "text-amber-400",
              bg: "bg-amber-400/10",
            },
          ].map(({ icon: Icon, title, desc, color, bg }) => (
            <div
              key={title}
              className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <h3 className="font-semibold text-base mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Simulator callout */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-card border border-border rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Scenario Simulator</h3>
            <p className="text-sm text-muted-foreground">
              Model any outcome before games tip off. Toggle wins up or down to see how the leaderboard shifts —
              figure out exactly what you need to win.
            </p>
          </div>
          <Link href="/demo" className="shrink-0">
            <Button variant="outline" className="gap-2 border-purple-500/30 hover:border-purple-500/60 text-purple-300">
              <Play className="h-3.5 w-3.5" />
              Try the replay demo
            </Button>
          </Link>
        </div>
      </section>

      {/* How scoring works */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6 text-center">
          How scoring works
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { seed: 12, wins: 4, label: "Cinderella run", highlight: true },
            { seed: 1,  wins: 6, label: "Perfect chalk", highlight: false },
            { seed: 8,  wins: 3, label: "Sweet 16 upset", highlight: false },
            { seed: 5,  wins: 2, label: "R32 exit", highlight: false },
          ].map(({ seed, wins, label, highlight }) => (
            <div
              key={label}
              className={`rounded-xl border p-4 text-center ${
                highlight
                  ? "border-primary/40 bg-primary/10"
                  : "border-border bg-card"
              }`}
            >
              <div className="text-3xl font-black text-primary mb-1">
                {seed * wins}
              </div>
              <div className="text-xs text-muted-foreground mb-2">pts</div>
              <div className="text-sm font-medium">
                #{seed} seed · {wins} wins
              </div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Trophy className="h-3.5 w-3.5 text-primary" />
            Super 8s · March Madness Pool
          </div>
          <div className="flex gap-4">
            <Link href="/rules" className="hover:text-foreground transition-colors">Rules</Link>
            <Link href="/prizes" className="hover:text-foreground transition-colors">Prizes</Link>
            <Link href="/demo" className="hover:text-foreground transition-colors">Demo</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
