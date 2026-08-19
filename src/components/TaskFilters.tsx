import { Search, X } from 'lucide-react'
import { useTasks } from '../context/TaskContext'
import type { Priority, Status } from '../types/task'

export type SortOption =
  | 'dueDate-asc'
  | 'dueDate-desc'
  | 'priority-desc'
  | 'priority-asc'

export const DEFAULT_SORT: SortOption = 'dueDate-asc'

const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Urgent']
const STATUSES: Status[] = ['Not started', 'In progress', 'Done']

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'dueDate-asc', label: 'Due date (soonest first)' },
  { value: 'dueDate-desc', label: 'Due date (latest first)' },
  { value: 'priority-desc', label: 'Priority (highest first)' },
  { value: 'priority-asc', label: 'Priority (lowest first)' },
]

const SELECT_CLASSES =
  'min-w-0 rounded-md border border-gray-300 bg-white py-1.5 px-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-blue-800'

export interface TaskFiltersState {
  category: string
  priority: string
  status: string
  search: string
  sort: SortOption
}

interface TaskFiltersProps {
  filters: TaskFiltersState
  onChange: (updates: Partial<TaskFiltersState>) => void
  onClear: () => void
  isActive: boolean
}

export function TaskFilters({ filters, onChange, onClear, isActive }: TaskFiltersProps) {
  const { categories } = useTasks()

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative w-full sm:w-52">
        <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search tasks…"
          className="w-full rounded-md border border-gray-300 bg-white py-1.5 pl-8 pr-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-blue-800"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <select
          value={filters.category}
          onChange={(e) => onChange({ category: e.target.value })}
          className={SELECT_CLASSES}
        >
          <option value="All">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => onChange({ priority: e.target.value })}
          className={SELECT_CLASSES}
        >
          <option value="All">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value })}
          className={SELECT_CLASSES}
        >
          <option value="All">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={filters.sort}
          onChange={(e) => onChange({ sort: e.target.value as SortOption })}
          className={SELECT_CLASSES}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {isActive && (
        <button
          type="button"
          onClick={onClear}
          className="flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 sm:justify-start"
        >
          <X size={14} />
          Clear filters
        </button>
      )}
    </div>
  )
}
