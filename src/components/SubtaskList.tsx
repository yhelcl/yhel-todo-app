import { useState } from 'react'
import { format } from 'date-fns'
import { Plus, Trash2 } from 'lucide-react'
import { useTasks } from '../context/TaskContext'
import type { Priority, Task } from '../types/task'
import { DatePicker } from './DatePicker'
import { getUrgencyStatusFromCompletion } from '../utils/taskUrgency'

const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Urgent']

const PRIORITY_STYLES: Record<Priority, string> = {
  Low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  High: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
  Urgent: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300',
}

const URGENCY_BORDER_STYLES: Record<string, string> = {
  overdue: 'border-l-2 border-l-red-500',
  'due-soon': 'border-l-2 border-l-orange-400',
  normal: 'border-l-2 border-l-transparent',
  none: 'border-l-2 border-l-transparent',
}

interface SubtaskRowProps {
  task: Task
  subtaskId: string
}

function SubtaskRow({ task, subtaskId }: SubtaskRowProps) {
  const { toggleSubtaskComplete, deleteSubtask } = useTasks()
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const subtask = task.subtasks.find((s) => s.id === subtaskId)
  if (!subtask) return null

  const urgency = getUrgencyStatusFromCompletion(subtask.dueDate, subtask.completed)

  const handleDeleteClick = () => {
    if (confirmingDelete) {
      deleteSubtask(task.id, subtask.id)
    } else {
      setConfirmingDelete(true)
    }
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-md py-1.5 pl-2 pr-1 ${URGENCY_BORDER_STYLES[urgency]}`}
    >
      <button
        type="button"
        onClick={() => toggleSubtaskComplete(task.id, subtask.id)}
        aria-label={subtask.completed ? 'Mark subtask as not done' : 'Mark subtask as done'}
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
          subtask.completed
            ? 'border-[var(--accent-color)] bg-[var(--accent-color)]'
            : 'border-gray-300 bg-[var(--surface-color)] dark:border-gray-600'
        }`}
      >
        {subtask.completed && (
          <svg viewBox="0 0 16 16" fill="none" className="h-2.5 w-2.5">
            <path
              d="M3 8.5L6.5 12L13 4.5"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <div className={`min-w-0 flex-1 transition-opacity duration-200 ${subtask.completed ? 'opacity-60' : 'opacity-100'}`}>
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`truncate text-xs font-medium text-gray-800 dark:text-gray-200 ${
              subtask.completed ? 'line-through decoration-gray-400 dark:decoration-gray-500' : ''
            }`}
          >
            {subtask.name}
          </span>
          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${PRIORITY_STYLES[subtask.priority]}`}>
            {subtask.priority}
          </span>
          {subtask.dueDate && (
            <span className="shrink-0 text-[10px] text-gray-400 dark:text-gray-500">
              {format(new Date(subtask.dueDate), 'MMM d, yyyy')}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleDeleteClick}
        onBlur={() => setConfirmingDelete(false)}
        aria-label="Delete subtask"
        className={`shrink-0 rounded p-1 text-[10px] transition-colors ${
          confirmingDelete
            ? 'bg-red-50 px-1.5 text-red-600 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/60'
            : 'text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-red-400'
        }`}
      >
        {confirmingDelete ? 'Confirm?' : <Trash2 size={12} />}
      </button>
    </div>
  )
}

interface AddSubtaskFormProps {
  task: Task
}

function AddSubtaskForm({ task }: AddSubtaskFormProps) {
  const { addSubtask } = useTasks()
  const [name, setName] = useState('')
  const [priority, setPriority] = useState<Priority>('Medium')
  const [dueDate, setDueDate] = useState<string | null>(null)

  const handleAdd = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    await addSubtask(task.id, {
      name: trimmed,
      priority,
      dueDate,
      completed: false,
    })
    setName('')
    setPriority('Medium')
    setDueDate(null)
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            handleAdd()
          }
        }}
        placeholder="Add subtask…"
        className="min-w-0 flex-1 rounded-md border border-gray-300 bg-[var(--surface-color)] px-2 py-1 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-800"
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as Priority)}
        className="rounded-md border border-gray-300 bg-[var(--surface-color)] px-1.5 py-1 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-800"
      >
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <div className="text-xs">
        <DatePicker value={dueDate} onChange={setDueDate} />
      </div>
      <button
        type="button"
        onClick={handleAdd}
        aria-label="Add subtask"
        className="flex shrink-0 items-center justify-center rounded-md bg-[var(--accent-color)] p-1.5 text-white transition-[filter] hover:brightness-90"
      >
        <Plus size={12} />
      </button>
    </div>
  )
}

interface SubtaskListProps {
  task: Task
}

export function SubtaskList({ task }: SubtaskListProps) {
  return (
    <div className="mt-2 space-y-0.5 border-l-2 border-gray-100 pl-3 dark:border-gray-700">
      {task.subtasks.map((subtask) => (
        <SubtaskRow key={subtask.id} task={task} subtaskId={subtask.id} />
      ))}
      <AddSubtaskForm task={task} />
    </div>
  )
}
