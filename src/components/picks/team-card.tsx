import type { Team } from "@/generated/prisma"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface TeamCardProps {
  team: Team
  selected: boolean
  onToggle: () => void
  disabled: boolean
  matchupInfo?: string  // e.g. "vs #16 American · Max 96pts" — shown pre-tournament in demo
}

/** Returns seed-tier badge classes for unselected state */
function getSeedBadgeClass(seed: number): string {
  if (seed <= 4) return "bg-primary/15 text-primary/80"
  if (seed <= 8) return "bg-blue-400/15 text-blue-400/80"
  if (seed <= 12) return "bg-emerald-400/15 text-emerald-400/80"
  return "bg-purple-400/15 text-purple-400/80"
}

export function TeamCard({ team, selected, onToggle, disabled, matchupInfo }: TeamCardProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "relative rounded-xl border p-3 text-left transition-all duration-150",
        selected
          ? "border-primary bg-primary/10 shadow-sm shadow-primary/20"
          : disabled
          ? "border-border/40 opacity-40 cursor-not-allowed"
          : "border-border bg-card hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
      )}
    >
      {/* Selected check */}
      {selected && (
        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      )}

      {/* Logo */}
      <div className="flex items-start gap-2.5">
        {team.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={team.logoUrl}
            alt={team.name}
            className={cn("h-8 w-8 object-contain shrink-0", team.eliminated && "opacity-40 grayscale")}
          />
        ) : (
          <div className={cn("h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-bold", team.eliminated && "opacity-40")}>
            {team.shortName?.[0] ?? "?"}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 mb-0.5">
            <span className={cn(
              "text-[10px] font-semibold px-1 py-0.5 rounded",
              selected ? "bg-primary/20 text-primary" : getSeedBadgeClass(team.seed)
            )}>
              #{team.seed}
            </span>
            {team.isPlayIn && (
              <span className="text-[9px] text-amber-400 bg-amber-400/10 px-1 py-0.5 rounded">PI</span>
            )}
          </div>
          <p className={cn("text-xs font-semibold leading-tight truncate", team.eliminated && "line-through text-muted-foreground")}>
            {team.name}
          </p>
          {team.eliminated && (
            <p className="text-[9px] text-red-400 mt-0.5">Eliminated</p>
          )}
          {!team.eliminated && team.wins > 0 && (
            <p className="text-[9px] text-primary mt-0.5">{team.wins}W · {team.seed * team.wins}pts</p>
          )}
          {!team.eliminated && team.wins === 0 && matchupInfo && (
            <p className="text-[9px] text-muted-foreground mt-0.5 truncate">{matchupInfo}</p>
          )}
        </div>
      </div>
    </button>
  )
}
