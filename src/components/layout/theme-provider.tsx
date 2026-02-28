"use client"

/**
 * ThemeProvider — manages dark/light mode and orange/blue accent theme.
 *
 * Persists to localStorage. Applies classes to <html>:
 *   - `.dark` or nothing for mode
 *   - `.accent-blue` or nothing for accent (orange is the default, no class needed)
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

export type ThemeMode = "dark" | "light"
export type ThemeAccent = "orange" | "blue"

interface ThemeContextValue {
  mode: ThemeMode
  accent: ThemeAccent
  setMode: (mode: ThemeMode) => void
  setAccent: (accent: ThemeAccent) => void
  toggleMode: () => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>")
  return ctx
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("dark")
  const [accent, setAccentState] = useState<ThemeAccent>("orange")

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("theme-mode") as ThemeMode | null
      const savedAccent = localStorage.getItem("theme-accent") as ThemeAccent | null
      if (savedMode === "light" || savedMode === "dark") setModeState(savedMode)
      if (savedAccent === "blue" || savedAccent === "orange") setAccentState(savedAccent)
    } catch {
      // localStorage not available (SSR guard)
    }
  }, [])

  // Apply classes to <html> whenever mode/accent changes
  useEffect(() => {
    const html = document.documentElement
    if (mode === "dark") {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }
    if (accent === "blue") {
      html.classList.add("accent-blue")
    } else {
      html.classList.remove("accent-blue")
    }
  }, [mode, accent])

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode)
    try { localStorage.setItem("theme-mode", newMode) } catch { /* */ }
  }, [])

  const setAccent = useCallback((newAccent: ThemeAccent) => {
    setAccentState(newAccent)
    try { localStorage.setItem("theme-accent", newAccent) } catch { /* */ }
  }, [])

  const toggleMode = useCallback(() => {
    setMode(mode === "dark" ? "light" : "dark")
  }, [mode, setMode])

  return (
    <ThemeContext.Provider value={{ mode, accent, setMode, setAccent, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  )
}
