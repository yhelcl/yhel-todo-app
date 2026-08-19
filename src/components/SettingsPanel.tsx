import { useState, type ChangeEvent } from 'react'
import { Check, ImageOff, RotateCcw, Settings, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useTasks } from '../context/TaskContext'
import { compressImage } from '../utils/compressImage'
import { THEME_PRESETS, type ThemePreset } from '../constants/themePresets'

function PresetGallery() {
  const { darkMode, accentColor, backgroundColor, surfaceColor, applyPreset } = useTheme()

  const isActive = (preset: ThemePreset) =>
    preset.darkMode === darkMode &&
    preset.accentColor === accentColor &&
    preset.backgroundColor === backgroundColor &&
    preset.surfaceColor === surfaceColor

  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Theme presets
      </span>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {THEME_PRESETS.map((preset) => {
          const active = isActive(preset)
          return (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`relative flex flex-col items-center gap-1.5 rounded-lg border-2 p-2 transition-colors ${
                active
                  ? 'border-[var(--accent-color)]'
                  : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600'
              }`}
            >
              {active && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent-color)] text-white">
                  <Check size={10} />
                </span>
              )}
              <div
                className="flex h-14 w-full items-end justify-start rounded-md border border-black/5 p-1.5"
                style={{ backgroundColor: preset.backgroundColor }}
              >
                <div
                  className="flex h-8 w-full items-center justify-start rounded px-1.5"
                  style={{ backgroundColor: preset.surfaceColor }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: preset.accentColor }}
                  />
                </div>
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {preset.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const {
    darkMode,
    accentColor,
    backgroundColor,
    surfaceColor,
    backgroundImages,
    toggleDarkMode,
    setAccentColor,
    setBackgroundColor,
    resetBackgroundColor,
    setSurfaceColor,
    resetSurfaceColor,
    setBackgroundImage,
  } = useTheme()
  const { currentWorkspace } = useTasks()

  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const currentBackground = backgroundImages[currentWorkspace]

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setError('')
    setIsProcessing(true)
    try {
      const compressed = await compressImage(file)
      setBackgroundImage(currentWorkspace, compressed)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        setError('Image too large to save, try a smaller image.')
      } else {
        setError('Could not process that image. Try a different file.')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemoveBackground = () => {
    setError('')
    try {
      setBackgroundImage(currentWorkspace, null)
    } catch {
      setError('Could not remove the background image. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 py-10 sm:items-center">
      <div className="w-full max-w-md rounded-lg bg-[var(--surface-color)] p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5">
          <PresetGallery />

          <hr className="border-gray-200 dark:border-gray-700" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark mode</span>
            <button
              type="button"
              role="switch"
              aria-checked={darkMode}
              onClick={toggleDarkMode}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                darkMode ? 'bg-[var(--accent-color)]' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  darkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Accent color</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                aria-label="Accent color"
                className="h-9 w-9 cursor-pointer rounded border border-gray-300 bg-transparent p-0 dark:border-gray-600"
              />
              <span className="w-16 text-sm text-gray-500 dark:text-gray-400">{accentColor}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Background color</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                aria-label="Background color"
                className="h-9 w-9 cursor-pointer rounded border border-gray-300 bg-transparent p-0 dark:border-gray-600"
              />
              <span className="w-16 text-sm text-gray-500 dark:text-gray-400">{backgroundColor}</span>
              <button
                type="button"
                onClick={resetBackgroundColor}
                aria-label="Reset background color to default"
                title="Reset to default"
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Surface color</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={surfaceColor}
                onChange={(e) => setSurfaceColor(e.target.value)}
                aria-label="Surface color"
                className="h-9 w-9 cursor-pointer rounded border border-gray-300 bg-transparent p-0 dark:border-gray-600"
              />
              <span className="w-16 text-sm text-gray-500 dark:text-gray-400">{surfaceColor}</span>
              <button
                type="button"
                onClick={resetSurfaceColor}
                aria-label="Reset surface color to default"
                title="Reset to default"
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {currentWorkspace} background
              </span>
              {currentBackground && (
                <button
                  type="button"
                  onClick={handleRemoveBackground}
                  className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                >
                  <ImageOff size={12} />
                  Remove background
                </button>
              )}
            </div>

            {currentBackground ? (
              <img
                src={currentBackground}
                alt={`${currentWorkspace} background preview`}
                className="mb-2 h-24 w-full rounded-md border border-gray-200 object-cover dark:border-gray-700"
              />
            ) : (
              <div className="mb-2 flex h-24 w-full items-center justify-center rounded-md border border-dashed border-gray-300 text-xs text-gray-400 dark:border-gray-600 dark:text-gray-500">
                No background set
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isProcessing}
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200 disabled:opacity-60 dark:text-gray-300 dark:file:bg-gray-700 dark:file:text-gray-200 dark:hover:file:bg-gray-600"
            />
            {isProcessing && (
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Processing image…</p>
            )}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Settings"
        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
      >
        <Settings size={18} />
      </button>
      {isOpen && <SettingsModal onClose={() => setIsOpen(false)} />}
    </>
  )
}
