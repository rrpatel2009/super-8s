"use client"

/**
 * ThemeToggle — compact dark/light mode toggle + orange/blue accent switcher.
 * Designed to sit in the Navbar right side.
 */

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/layout/theme-provider"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { mode, accent, toggleMode, setAccent } = useTheme()

  return (
    <div className="flex items-center gap-1.5">
      {/* Dark / Light mode toggle */}
      <button
        onClick={toggleMode}
        className="h-7 w-7 rounded-md border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {mode === "dark"
          ? <Sun className="h-3.5 w-3.5" />
          : <Moon className="h-3.5 w-3.5" />
        }
      </button>

      {/* Accent color switcher */}
      <div className="flex items-center gap-1 p-0.5 rounded-md border border-border/50">
        {/* Orange accent */}
        <button
          onClick={() => setAccent("orange")}
          className={cn(
            "w-4 h-4 rounded-sm transition-all",
            accent === "orange"
              ? "ring-1 ring-offset-1 ring-offset-background ring-orange-400 scale-110"
              : "opacity-50 hover:opacity-80"
          )}
          style={{ backgroundColor: "#f97316" }}
          title="Orange theme"
        />
        {/* Blue accent */}
        <button
          onClick={() => setAccent("blue")}
          className={cn(
            "w-4 h-4 rounded-sm transition-all",
            accent === "blue"
              ? "ring-1 ring-offset-1 ring-offset-background ring-blue-400 scale-110"
              : "opacity-50 hover:opacity-80"
          )}
          style={{ backgroundColor: "#3b82f6" }}
          title="Blue theme"
        />
      </div>
    </div>
  )
}
