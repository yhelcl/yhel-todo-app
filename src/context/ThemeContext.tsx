import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Workspace } from '../types/task'
import type { ThemePreset } from '../constants/themePresets'

const THEME_KEY = 'todo-app:theme'
const DEFAULT_ACCENT = '#3b82f6'
const DEFAULT_BG_LIGHT = '#f9fafb'
const DEFAULT_BG_DARK = '#111827'
const DEFAULT_SURFACE_LIGHT = '#ffffff'
const DEFAULT_SURFACE_DARK = '#1f2937'

interface ThemeState {
  darkMode: boolean
  accentColor: string
  customBackgroundColor: string | null
  customSurfaceColor: string | null
  backgroundImages: Record<Workspace, string | null>
}

const DEFAULT_THEME: ThemeState = {
  darkMode: false,
  accentColor: DEFAULT_ACCENT,
  customBackgroundColor: null,
  customSurfaceColor: null,
  backgroundImages: { Personal: null, Work: null },
}

function loadTheme(): ThemeState {
  const raw = localStorage.getItem(THEME_KEY)
  if (!raw) return DEFAULT_THEME
  try {
    const parsed = JSON.parse(raw)
    return {
      darkMode:
        typeof parsed.darkMode === 'boolean' ? parsed.darkMode : DEFAULT_THEME.darkMode,
      accentColor:
        typeof parsed.accentColor === 'string'
          ? parsed.accentColor
          : DEFAULT_THEME.accentColor,
      customBackgroundColor:
        typeof parsed.customBackgroundColor === 'string'
          ? parsed.customBackgroundColor
          : null,
      customSurfaceColor:
        typeof parsed.customSurfaceColor === 'string'
          ? parsed.customSurfaceColor
          : null,
      backgroundImages: {
        Personal: parsed.backgroundImages?.Personal ?? null,
        Work: parsed.backgroundImages?.Work ?? null,
      },
    }
  } catch {
    return DEFAULT_THEME
  }
}

function saveTheme(theme: ThemeState): void {
  localStorage.setItem(THEME_KEY, JSON.stringify(theme))
}

interface ThemeContextValue
  extends Omit<ThemeState, 'customBackgroundColor' | 'customSurfaceColor'> {
  backgroundColor: string
  surfaceColor: string
  toggleDarkMode: () => void
  setAccentColor: (hex: string) => void
  setBackgroundColor: (hex: string) => void
  resetBackgroundColor: () => void
  setSurfaceColor: (hex: string) => void
  resetSurfaceColor: () => void
  setBackgroundImage: (workspace: Workspace, dataUrl: string | null) => void
  applyPreset: (preset: ThemePreset) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeState>(loadTheme)

  const backgroundColor =
    theme.customBackgroundColor ?? (theme.darkMode ? DEFAULT_BG_DARK : DEFAULT_BG_LIGHT)
  const surfaceColor =
    theme.customSurfaceColor ?? (theme.darkMode ? DEFAULT_SURFACE_DARK : DEFAULT_SURFACE_LIGHT)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme.darkMode)
  }, [theme.darkMode])

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', theme.accentColor)
  }, [theme.accentColor])

  useEffect(() => {
    document.documentElement.style.setProperty('--bg-color', backgroundColor)
  }, [backgroundColor])

  useEffect(() => {
    document.documentElement.style.setProperty('--surface-color', surfaceColor)
  }, [surfaceColor])

  useEffect(() => {
    try {
      saveTheme(theme)
    } catch {
      // Background image uploads validate the write themselves (see setBackgroundImage);
      // other theme values are tiny and shouldn't realistically hit quota limits.
    }
  }, [theme])

  const toggleDarkMode = () => setTheme((t) => ({ ...t, darkMode: !t.darkMode }))

  const setAccentColor = (hex: string) =>
    setTheme((t) => ({ ...t, accentColor: hex }))

  const setBackgroundColor = (hex: string) =>
    setTheme((t) => ({ ...t, customBackgroundColor: hex }))

  const resetBackgroundColor = () =>
    setTheme((t) => ({ ...t, customBackgroundColor: null }))

  const setSurfaceColor = (hex: string) =>
    setTheme((t) => ({ ...t, customSurfaceColor: hex }))

  const resetSurfaceColor = () =>
    setTheme((t) => ({ ...t, customSurfaceColor: null }))

  const setBackgroundImage = (workspace: Workspace, dataUrl: string | null) => {
    const nextTheme: ThemeState = {
      ...theme,
      backgroundImages: { ...theme.backgroundImages, [workspace]: dataUrl },
    }
    // Save synchronously first so a quota error can be caught by the caller
    // (e.g. SettingsPanel) before the in-memory state changes.
    saveTheme(nextTheme)
    setTheme(nextTheme)
  }

  const applyPreset = (preset: ThemePreset) => {
    setTheme((t) => ({
      ...t,
      darkMode: preset.darkMode,
      accentColor: preset.accentColor,
      customBackgroundColor: preset.backgroundColor,
      customSurfaceColor: preset.surfaceColor,
    }))
  }

  const value: ThemeContextValue = {
    darkMode: theme.darkMode,
    accentColor: theme.accentColor,
    backgroundColor,
    surfaceColor,
    backgroundImages: theme.backgroundImages,
    toggleDarkMode,
    setAccentColor,
    setBackgroundColor,
    resetBackgroundColor,
    setSurfaceColor,
    resetSurfaceColor,
    setBackgroundImage,
    applyPreset,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
