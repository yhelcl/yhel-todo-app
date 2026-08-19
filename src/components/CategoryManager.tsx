import { useState } from 'react'
import { Pencil, Settings, Trash2, X } from 'lucide-react'
import { useTasks } from '../context/TaskContext'

interface CategoryManagerProps {
  onClose: () => void
}

function CategoryManagerModal({ onClose }: CategoryManagerProps) {
  const { categories, tasks, addCategory, renameCategory, deleteCategory } =
    useTasks()

  const [newName, setNewName] = useState('')
  const [addError, setAddError] = useState('')
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null)

  const countForCategory = (category: string) =>
    tasks.filter((t) => t.category === category).length

  const handleAdd = async () => {
    const trimmed = newName.trim()
    if (!trimmed) {
      setAddError('Category name is required.')
      return
    }
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setAddError('That category already exists.')
      return
    }
    await addCategory(trimmed)
    setNewName('')
    setAddError('')
  }

  const startEditing = (category: string) => {
    setEditingCategory(category)
    setEditValue(category)
  }

  const commitRename = async (oldName: string) => {
    const trimmed = editValue.trim()
    setEditingCategory(null)
    if (!trimmed || trimmed === oldName) return
    if (
      categories.some(
        (c) => c.toLowerCase() === trimmed.toLowerCase() && c !== oldName,
      )
    ) {
      return
    }
    await renameCategory(oldName, trimmed)
  }

  const handleDeleteClick = (category: string) => {
    if (confirmingDelete === category) {
      deleteCategory(category)
      setConfirmingDelete(null)
    } else {
      setConfirmingDelete(category)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 py-10 sm:items-center">
      <div className="w-full max-w-md rounded-lg bg-[var(--surface-color)] p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Manage categories
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value)
              if (addError) setAddError('')
            }}
            placeholder="New category name"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-blue-800"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="shrink-0 rounded-md bg-[var(--accent-color)] px-3 py-2 text-sm font-medium text-white transition-[filter] hover:brightness-90"
          >
            Add
          </button>
        </div>
        {addError && <p className="-mt-3 mb-3 text-xs text-red-500">{addError}</p>}

        {categories.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
            No categories yet — add one above.
          </p>
        ) : (
          <ul className="space-y-1">
            {categories.map((category) => {
              const count = countForCategory(category)
              const isEditing = editingCategory === category
              const isConfirming = confirmingDelete === category

              return (
                <li
                  key={category}
                  className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {isEditing ? (
                    <input
                      autoFocus
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => commitRename(category)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename(category)
                        if (e.key === 'Escape') setEditingCategory(null)
                      }}
                      className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-blue-800"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEditing(category)}
                      className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-sm text-gray-700 dark:text-gray-300"
                    >
                      <span className="truncate">{category}</span>
                      <Pencil size={12} className="shrink-0 text-gray-300 dark:text-gray-600" />
                    </button>
                  )}

                  <div className="flex shrink-0 items-center gap-2">
                    {isConfirming && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {count > 0
                          ? `${count} task${count === 1 ? '' : 's'} → Uncategorized?`
                          : 'Delete?'}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(category)}
                      onBlur={() => setConfirmingDelete(null)}
                      aria-label={`Delete ${category}`}
                      className={`rounded p-1 transition-colors ${
                        isConfirming
                          ? 'bg-red-50 px-2 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/60'
                          : 'text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-red-400'
                      }`}
                    >
                      {isConfirming ? 'Confirm' : <Trash2 size={14} />}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export function CategoryManager() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
      >
        <Settings size={14} />
        Manage categories
      </button>
      {isOpen && <CategoryManagerModal onClose={() => setIsOpen(false)} />}
    </>
  )
}
