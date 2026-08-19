import { useState, type FormEvent } from 'react'
import { useTasks } from '../context/TaskContext'
import type { Priority, Task } from '../types/task'
import { DatePicker } from './DatePicker'

const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Urgent']

const NEW_CATEGORY_VALUE = '__new_category__'

interface TaskFormProps {
  task?: Task
  onClose: () => void
}

export function TaskForm({ task, onClose }: TaskFormProps) {
  const { categories, addCategory, addTask, updateTask } = useTasks()
  const isEditMode = Boolean(task)

  const [name, setName] = useState(task?.name ?? '')
  const [category, setCategory] = useState(task?.category ?? categories[0] ?? '')
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'Medium')
  const [dueDate, setDueDate] = useState<string | null>(task?.dueDate ?? null)
  const [notes, setNotes] = useState(task?.notes ?? '')
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [nameError, setNameError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleCategoryChange = (value: string) => {
    if (value === NEW_CATEGORY_VALUE) {
      setIsAddingCategory(true)
      setNewCategoryName('')
    } else {
      setCategory(value)
    }
  }

  const confirmNewCategory = async () => {
    const trimmed = newCategoryName.trim()
    if (!trimmed) {
      setIsAddingCategory(false)
      return
    }
    await addCategory(trimmed)
    setCategory(trimmed)
    setIsAddingCategory(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError(true)
      return
    }
    setSubmitting(true)
    try {
      if (isEditMode && task) {
        await updateTask(task.id, {
          name: trimmedName,
          category,
          priority,
          dueDate,
          notes,
        })
      } else {
        await addTask({
          name: trimmedName,
          category,
          priority,
          dueDate,
          notes,
          status: 'Not started',
        })
      }
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-gray-200 bg-[var(--surface-color)] p-5 shadow-sm dark:border-gray-700"
    >
      <div>
        <label htmlFor="task-name" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Name
        </label>
        <input
          id="task-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (nameError) setNameError(false)
          }}
          className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-200 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-blue-800 ${
            nameError ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="What needs to be done?"
        />
        {nameError && <p className="mt-1 text-xs text-red-500">Name is required.</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="task-category" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          {isAddingCategory ? (
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-blue-800"
              />
              <button
                type="button"
                onClick={confirmNewCategory}
                className="shrink-0 rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Add
              </button>
            </div>
          ) : (
            <select
              id="task-category"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-blue-800"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value={NEW_CATEGORY_VALUE}>+ Add new category…</option>
            </select>
          )}
        </div>

        <div>
          <label htmlFor="task-priority" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Priority
          </label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-blue-800"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="task-due-date" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Due date
        </label>
        <DatePicker id="task-due-date" value={dueDate} onChange={setDueDate} />
      </div>

      <div>
        <label htmlFor="task-notes" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Notes
        </label>
        <textarea
          id="task-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-blue-800"
          placeholder="Optional notes…"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-[var(--accent-color)] px-4 py-2 text-sm font-medium text-white transition-[filter] hover:brightness-90 disabled:opacity-60"
        >
          Save
        </button>
      </div>
    </form>
  )
}
