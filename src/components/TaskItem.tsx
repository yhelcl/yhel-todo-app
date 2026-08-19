import { useState } from 'react'
import { format } from 'date-fns'
import { ChevronDown, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { useTasks } from '../context/TaskContext'
import type { Priority, Status, Task } from '../types/task'
import { TaskForm } from './TaskForm'
import { SubtaskList } from './SubtaskList'
import { getUrgencyStatus } from '../utils/taskUrgency'

const PRIORITY_STYLES: Record<Priority, string> = {
  Low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  High: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
  Urgent: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300',
}

const STATUSES: Status[] = ['Not started', 'In progress', 'Done']

const URGENCY_BORDER_STYLES: Record<string, string> = {
  overdue: 'border-l-4 border-l-red-500',
  'due-soon': 'border-l-4 border-l-orange-400',
  normal: 'border-l-4 border-l-transparent',
  none: 'border-l-4 border-l-transparent',
}

interface TaskItemProps {
  task: Task
}

export function TaskItem({ task }: TaskItemProps) {
  const { updateTask, deleteTask } = useTasks()
  const [isEditing, setIsEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const isDone = task.status === 'Done'
  const urgency = getUrgencyStatus(task.dueDate, task.status)
  const subtasks = task.subtasks ?? []
  const completedSubtasks = subtasks.filter((s) => s.completed).length

  const toggleDone = () => {
    updateTask(task.id, { status: isDone ? 'Not started' : 'Done' })
  }

  const handleStatusChange = (status: Status) => {
    updateTask(task.id, { status })
  }

  const handleDeleteClick = () => {
    if (confirmingDelete) {
      deleteTask(task.id)
    } else {
      setConfirmingDelete(true)
    }
  }

  if (isEditing) {
    return <TaskForm task={task} onClose={() => setIsEditing(false)} />
  }

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border border-gray-200 bg-[var(--surface-color)] p-4 shadow-sm transition-opacity duration-200 dark:border-gray-700 ${URGENCY_BORDER_STYLES[urgency]}`}
    >
      <button
        type="button"
        onClick={toggleDone}
        aria-label={isDone ? 'Mark as not started' : 'Mark as done'}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
          isDone
            ? 'border-[var(--accent-color)] bg-[var(--accent-color)]'
            : 'border-gray-300 bg-[var(--surface-color)] dark:border-gray-600'
        }`}
      >
        {isDone && (
          <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
            <path
              d="M3 8.5L6.5 12L13 4.5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <div className={`min-w-0 flex-1 transition-opacity duration-200 ${isDone ? 'opacity-60' : 'opacity-100'}`}>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
            className="shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <span
            className={`text-sm font-medium text-gray-900 transition-all duration-200 dark:text-gray-100 ${
              isDone ? 'line-through decoration-gray-400 dark:decoration-gray-500' : ''
            }`}
          >
            {task.name}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {task.category}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}>
            {task.priority}
          </span>
          {task.dueDate && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
            </span>
          )}
          {subtasks.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              {completedSubtasks}/{subtasks.length} done
              <span className="h-1 w-10 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                <span
                  className="block h-full rounded-full bg-[var(--accent-color)] transition-all duration-200"
                  style={{
                    width: `${subtasks.length === 0 ? 0 : (completedSubtasks / subtasks.length) * 100}%`,
                  }}
                />
              </span>
            </span>
          )}
        </div>

        {task.notes && (
          <p className="mt-1 truncate text-xs text-gray-400 dark:text-gray-500" title={task.notes}>
            {task.notes}
          </p>
        )}

        <div className="mt-2">
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value as Status)}
            className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs text-gray-600 outline-none focus:ring-1 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:focus:ring-blue-800"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {isExpanded && <SubtaskList task={task} />}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          aria-label="Edit task"
          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        >
          <Pencil size={16} />
        </button>
        <button
          type="button"
          onClick={handleDeleteClick}
          onBlur={() => setConfirmingDelete(false)}
          aria-label="Delete task"
          className={`rounded p-1.5 text-xs transition-colors ${
            confirmingDelete
              ? 'bg-red-50 px-2 text-red-600 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/60'
              : 'text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-red-400'
          }`}
        >
          {confirmingDelete ? 'Confirm?' : <Trash2 size={16} />}
        </button>
      </div>
    </div>
  )
}
