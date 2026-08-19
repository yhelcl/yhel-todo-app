import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, parse } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import 'react-day-picker/style.css'

const CALENDAR_STYLE_VARS = {
  '--rdp-day-width': '34px',
  '--rdp-day-height': '34px',
  '--rdp-day_button-width': '32px',
  '--rdp-day_button-height': '32px',
  '--rdp-accent-color': 'var(--accent-color)',
  '--rdp-accent-background-color': 'color-mix(in srgb, var(--accent-color) 15%, white)',
  '--rdp-today-color': 'var(--accent-color)',
} as CSSProperties

interface DatePickerProps {
  id?: string
  value: string | null
  onChange: (value: string | null) => void
}

function parseIsoDate(value: string | null): Date | undefined {
  if (!value) return undefined
  const parsed = parse(value, 'yyyy-MM-dd', new Date())
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

export function DatePicker({ id, value, onChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [alignRight, setAlignRight] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const selected = parseIsoDate(value)

  useLayoutEffect(() => {
    if (!isOpen) {
      setAlignRight(false)
      return
    }
    const rect = popoverRef.current?.getBoundingClientRect()
    if (rect && rect.right > window.innerWidth - 8) {
      setAlignRight(true)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleSelect = (date: Date | undefined) => {
    onChange(date ? format(date, 'yyyy-MM-dd') : null)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-blue-800 sm:w-auto"
      >
        <CalendarDays size={14} className="shrink-0 text-gray-400 dark:text-gray-500" />
        <span className={selected ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}>
          {selected ? format(selected, 'MMM d, yyyy') : 'No due date'}
        </span>
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className={`absolute z-50 mt-2 max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white p-2 text-gray-900 shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 ${
            alignRight ? 'right-0' : 'left-0'
          }`}
          style={CALENDAR_STYLE_VARS}
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected}
          />
          {selected && (
            <button
              type="button"
              onClick={() => handleSelect(undefined)}
              className="mt-1 w-full rounded-md px-2 py-1.5 text-center text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            >
              Clear date
            </button>
          )}
        </div>
      )}
    </div>
  )
}
