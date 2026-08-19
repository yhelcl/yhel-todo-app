export interface ThemePreset {
  name: string
  darkMode: boolean
  accentColor: string
  backgroundColor: string
  surfaceColor: string
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'Sunset',
    darkMode: false,
    accentColor: '#f97316',
    backgroundColor: '#fdf1e3',
    surfaceColor: '#ffffff',
  },
  {
    name: 'Ocean',
    darkMode: false,
    accentColor: '#0891b2',
    backgroundColor: '#e6f4f9',
    surfaceColor: '#ffffff',
  },
  {
    name: 'Forest',
    darkMode: false,
    accentColor: '#16a34a',
    backgroundColor: '#eef7ee',
    surfaceColor: '#ffffff',
  },
  {
    name: 'Midnight',
    darkMode: true,
    accentColor: '#a855f7',
    backgroundColor: '#0f1424',
    surfaceColor: '#1c2438',
  },
  {
    name: 'Rose',
    darkMode: true,
    accentColor: '#ec4899',
    backgroundColor: '#2a1a2e',
    surfaceColor: '#3d2438',
  },
  {
    name: 'Classic',
    darkMode: false,
    accentColor: '#3b82f6',
    backgroundColor: '#f9fafb',
    surfaceColor: '#ffffff',
  },
]
