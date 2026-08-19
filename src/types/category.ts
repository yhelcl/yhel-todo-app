import type { Workspace } from './task'

export type Category = string

export const UNCATEGORIZED = 'Uncategorized'

export const DEFAULT_CATEGORIES_BY_WORKSPACE: Record<Workspace, Category[]> = {
  Personal: ['Personal', 'Errands'],
  Work: ['Meetings', 'Work'],
}
