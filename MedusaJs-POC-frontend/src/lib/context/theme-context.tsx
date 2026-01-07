"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always start with "light" to prevent hydration mismatch
  // The actual theme will be synced in useEffect after mount
  const [theme, setThemeState] = useState<Theme>("light")

  useEffect(() => {
    // After mount, sync with what the inline script set or localStorage
    const stored = localStorage.getItem("medusa-theme") as Theme | null
    const currentClassTheme = document.documentElement.classList.contains("dark") ? "dark" : "light"
    
    // Determine the actual theme to use
    let actualTheme: Theme = "light"
    if (stored) {
      actualTheme = stored
    } else if (currentClassTheme === "dark") {
      // If dark class is applied (by inline script), use dark
      actualTheme = "dark"
    } else {
      // Fallback to system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      actualTheme = prefersDark ? "dark" : "light"
    }
    
    // Only update if different from current state
    if (actualTheme !== theme) {
      setThemeState(actualTheme)
    }
    
    // Ensure the theme is applied (in case inline script didn't run)
    applyTheme(actualTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    if (newTheme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("medusa-theme", newTheme)
    applyTheme(newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
  }

  // Always provide the context, even before mount
  // The inline script in layout.tsx handles the initial theme to prevent flash
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

