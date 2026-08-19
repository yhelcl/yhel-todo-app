import { useState } from 'react'
import { Plus } from 'lucide-react'
import { TaskForm } from './TaskForm'

export function AddTaskButton() {
  const [isAdding, setIsAdding] = useState(false)

  if (isAdding) {
    return <TaskForm onClose={() => setIsAdding(false)} />
  }

  return (
    <button
      type="button"
      onClick={() => setIsAdding(true)}
      className="flex items-center gap-1.5 rounded-md bg-[var(--accent-color)] px-4 py-2 text-sm font-medium text-white transition-[filter] hover:brightness-90"
    >
      <Plus size={16} />
      Add Task
    </button>
  )
}
