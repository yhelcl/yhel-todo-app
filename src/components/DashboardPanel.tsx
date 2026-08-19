import { useMemo } from 'react'
import { format, isToday } from 'date-fns'
import { useTasks } from '../context/TaskContext'
import { getUrgencyStatus } from '../utils/taskUrgency'

export function DashboardPanel() {
  const { tasks } = useTasks()

  const { overdueTasks, dueSoonCount, dueTodayTasks } = useMemo(() => {
    const overdue = tasks.filter(
      (t) => getUrgencyStatus(t.dueDate, t.status) === 'overdue',
    )
    const dueSoon = tasks.filter(
      (t) => getUrgencyStatus(t.dueDate, t.status) === 'due-soon',
    )
    const dueToday = dueSoon.filter(
      (t) => t.dueDate && isToday(new Date(t.dueDate)),
    )
    return {
      overdueTasks: overdue,
      dueSoonCount: dueSoon.length,
      dueTodayTasks: dueToday,
    }
  }, [tasks])

  const attentionTasks = [...overdueTasks, ...dueTodayTasks]
  const nothingUrgent = overdueTasks.length === 0 && dueSoonCount === 0

  return (
    <div className="rounded-lg border border-gray-200 bg-[var(--surface-color)] p-4 shadow-sm dark:border-gray-700">
      <div className="flex flex-wrap gap-3">
        <StatBlock
          count={overdueTasks.length}
          label="Overdue"
          tone="red"
        />
        <StatBlock count={dueSoonCount} label="Due Soon" tone="orange" />
        <StatBlock
          count={dueTodayTasks.length}
          label="Due Today"
          tone="orange"
        />
      </div>

      {nothingUrgent ? (
        <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">
          Nothing urgent — you're all caught up.
        </p>
      ) : (
        <div className="mt-3 max-h-40 divide-y divide-gray-100 overflow-y-auto rounded-md border border-gray-100 dark:divide-gray-700 dark:border-gray-700">
          {attentionTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-2 px-3 py-1.5 text-sm"
            >
              <span className="truncate text-gray-700 dark:text-gray-200">{task.name}</span>
              {task.dueDate && (
                <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                  {format(new Date(task.dueDate), 'MMM d')}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatBlock({
  count,
  label,
  tone,
}: {
  count: number
  label: string
  tone: 'red' | 'orange'
}) {
  const toneStyles =
    tone === 'red'
      ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300'
      : 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300'

  return (
    <div className={`rounded-md px-3 py-1.5 text-sm font-medium ${toneStyles}`}>
      {count} {label}
    </div>
  )
}
