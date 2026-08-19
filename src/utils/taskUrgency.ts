import { addDays, isPast, isWithinInterval, startOfDay } from 'date-fns'
import type { Status } from '../types/task'

export type UrgencyStatus = 'overdue' | 'due-soon' | 'normal' | 'none'

export function getUrgencyStatus(
  dueDate: string | null,
  status: Status,
): UrgencyStatus {
  if (!dueDate) return 'none'
  if (status === 'Done') return 'normal'

  const due = startOfDay(new Date(dueDate))
  const today = startOfDay(new Date())

  if (isPast(due) && due.getTime() !== today.getTime()) {
    return 'overdue'
  }

  if (isWithinInterval(due, { start: today, end: addDays(today, 2) })) {
    return 'due-soon'
  }

  return 'normal'
}

export function getUrgencyStatusFromCompletion(
  dueDate: string | null,
  completed: boolean,
): UrgencyStatus {
  return getUrgencyStatus(dueDate, completed ? 'Done' : 'Not started')
}
