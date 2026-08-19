import { useMemo, useState } from 'react'
import { useTasks } from '../context/TaskContext'
import { TaskItem } from './TaskItem'
import {
  DEFAULT_SORT,
  TaskFilters,
  type SortOption,
  type TaskFiltersState,
} from './TaskFilters'
import { CategoryManager } from './CategoryManager'
import type { Priority } from '../types/task'

const PRIORITY_ORDER: Record<Priority, number> = {
  Low: 0,
  Medium: 1,
  High: 2,
  Urgent: 3,
}

const DEFAULT_FILTERS: TaskFiltersState = {
  category: 'All',
  priority: 'All',
  status: 'All',
  search: '',
  sort: DEFAULT_SORT,
}

function sortTasks<T extends { dueDate: string | null; priority: Priority }>(
  tasks: T[],
  sort: SortOption,
): T[] {
  const sorted = [...tasks]
  switch (sort) {
    case 'dueDate-asc':
      sorted.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return a.dueDate.localeCompare(b.dueDate)
      })
      break
    case 'dueDate-desc':
      sorted.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return b.dueDate.localeCompare(a.dueDate)
      })
      break
    case 'priority-desc':
      sorted.sort((a, b) => PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority])
      break
    case 'priority-asc':
      sorted.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
      break
  }
  return sorted
}

export function TaskList() {
  const { tasks, loading } = useTasks()
  const [filters, setFilters] = useState<TaskFiltersState>(DEFAULT_FILTERS)

  const isActive =
    filters.category !== DEFAULT_FILTERS.category ||
    filters.priority !== DEFAULT_FILTERS.priority ||
    filters.status !== DEFAULT_FILTERS.status ||
    filters.search.trim() !== '' ||
    filters.sort !== DEFAULT_FILTERS.sort

  const handleFilterChange = (updates: Partial<TaskFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }

  const handleClear = () => setFilters(DEFAULT_FILTERS)

  const visibleTasks = useMemo(() => {
    const search = filters.search.trim().toLowerCase()
    const filtered = tasks.filter((task) => {
      if (filters.category !== 'All' && task.category !== filters.category) return false
      if (filters.priority !== 'All' && task.priority !== filters.priority) return false
      if (filters.status !== 'All' && task.status !== filters.status) return false
      if (search) {
        const matchesName = task.name.toLowerCase().includes(search)
        const matchesNotes = task.notes.toLowerCase().includes(search)
        if (!matchesName && !matchesNotes) return false
      }
      return true
    })
    return sortTasks(filtered, filters.sort)
  }, [tasks, filters])

  if (loading) {
    return <p className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">Loading tasks…</p>
  }

  if (tasks.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex justify-end">
          <CategoryManager />
        </div>
        <p className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
          No tasks yet — add one to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <TaskFilters
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClear}
          isActive={isActive}
        />
        <CategoryManager />
      </div>

      {visibleTasks.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
          <p>No tasks match your filters.</p>
          <button
            type="button"
            onClick={handleClear}
            className="mt-2 text-sm font-medium text-[var(--accent-color)] hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  )
}
