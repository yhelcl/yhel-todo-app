import type { Subtask, Task, Workspace } from '../types/task'
import type { Category } from '../types/category'
import { DEFAULT_CATEGORIES_BY_WORKSPACE, UNCATEGORIZED } from '../types/category'
import type { TaskRepository } from './TaskRepository'

const TASKS_KEY = 'todo-app:tasks'
const CATEGORIES_KEY = 'todo-app:categories'

type CategoriesByWorkspace = Record<Workspace, Category[]>

function readJSON<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJSON<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function isValidCategoriesShape(value: unknown): value is CategoriesByWorkspace {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return Array.isArray(v.Personal) && Array.isArray(v.Work)
}

export class LocalStorageTaskRepository implements TaskRepository {
  constructor() {
    this.migrateTasks()
    this.migrateCategories()
  }

  private migrateTasks(): void {
    const raw = localStorage.getItem(TASKS_KEY)
    if (raw === null) return

    let tasks: unknown
    try {
      tasks = JSON.parse(raw)
    } catch {
      return
    }
    if (!Array.isArray(tasks)) return

    let migrated = false
    const nextTasks = tasks.map((t) => {
      if (!t || typeof t !== 'object') return t
      let next = t as Record<string, unknown>
      if (!('workspace' in next)) {
        migrated = true
        next = { ...next, workspace: 'Work' as Workspace }
      }
      if (!Array.isArray(next.subtasks)) {
        migrated = true
        next = { ...next, subtasks: [] }
      }
      return next
    })

    if (migrated) {
      writeJSON(TASKS_KEY, nextTasks)
    }
  }

  private migrateCategories(): void {
    const raw = localStorage.getItem(CATEGORIES_KEY)
    if (raw === null) {
      writeJSON(CATEGORIES_KEY, DEFAULT_CATEGORIES_BY_WORKSPACE)
      return
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      writeJSON(CATEGORIES_KEY, DEFAULT_CATEGORIES_BY_WORKSPACE)
      return
    }

    if (!isValidCategoriesShape(parsed)) {
      writeJSON(CATEGORIES_KEY, DEFAULT_CATEGORIES_BY_WORKSPACE)
    }
  }

  async getTasks(workspace: Workspace): Promise<Task[]> {
    const tasks = readJSON<Task[]>(TASKS_KEY, [])
    return tasks.filter((t) => t.workspace === workspace)
  }

  async addTask(
    workspace: Workspace,
    task: Omit<Task, 'id' | 'createdDate' | 'workspace' | 'subtasks'>,
  ): Promise<Task> {
    const tasks = readJSON<Task[]>(TASKS_KEY, [])
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdDate: new Date().toISOString(),
      workspace,
      subtasks: [],
    }
    writeJSON(TASKS_KEY, [...tasks, newTask])
    return newTask
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const tasks = readJSON<Task[]>(TASKS_KEY, [])
    let updated: Task | undefined
    const nextTasks = tasks.map((t) => {
      if (t.id !== id) return t
      updated = {
        ...t,
        ...updates,
        id: t.id,
        createdDate: t.createdDate,
        workspace: t.workspace,
      }
      return updated
    })
    if (!updated) {
      throw new Error(`Task with id "${id}" not found`)
    }
    writeJSON(TASKS_KEY, nextTasks)
    return updated
  }

  async deleteTask(id: string): Promise<void> {
    const tasks = readJSON<Task[]>(TASKS_KEY, [])
    writeJSON(
      TASKS_KEY,
      tasks.filter((t) => t.id !== id),
    )
  }

  async getCategories(workspace: Workspace): Promise<Category[]> {
    const categories = readJSON<CategoriesByWorkspace>(
      CATEGORIES_KEY,
      DEFAULT_CATEGORIES_BY_WORKSPACE,
    )
    return categories[workspace] ?? []
  }

  async addCategory(workspace: Workspace, name: string): Promise<void> {
    const categories = readJSON<CategoriesByWorkspace>(
      CATEGORIES_KEY,
      DEFAULT_CATEGORIES_BY_WORKSPACE,
    )
    const existing = categories[workspace] ?? []
    if (existing.includes(name)) return
    writeJSON(CATEGORIES_KEY, { ...categories, [workspace]: [...existing, name] })
  }

  async renameCategory(
    workspace: Workspace,
    oldName: string,
    newName: string,
  ): Promise<void> {
    const categories = readJSON<CategoriesByWorkspace>(
      CATEGORIES_KEY,
      DEFAULT_CATEGORIES_BY_WORKSPACE,
    )
    const existing = categories[workspace] ?? []
    writeJSON(CATEGORIES_KEY, {
      ...categories,
      [workspace]: existing.map((c) => (c === oldName ? newName : c)),
    })

    const tasks = readJSON<Task[]>(TASKS_KEY, [])
    const nextTasks = tasks.map((t) =>
      t.workspace === workspace && t.category === oldName
        ? { ...t, category: newName }
        : t,
    )
    writeJSON(TASKS_KEY, nextTasks)
  }

  async deleteCategory(workspace: Workspace, name: string): Promise<void> {
    const categories = readJSON<CategoriesByWorkspace>(
      CATEGORIES_KEY,
      DEFAULT_CATEGORIES_BY_WORKSPACE,
    )
    const existing = categories[workspace] ?? []
    writeJSON(CATEGORIES_KEY, {
      ...categories,
      [workspace]: existing.filter((c) => c !== name),
    })

    const tasks = readJSON<Task[]>(TASKS_KEY, [])
    const nextTasks = tasks.map((t) =>
      t.workspace === workspace && t.category === name
        ? { ...t, category: UNCATEGORIZED }
        : t,
    )
    writeJSON(TASKS_KEY, nextTasks)
  }

  private updateTaskSubtasks(
    taskId: string,
    mutate: (subtasks: Subtask[]) => Subtask[],
  ): Task {
    const tasks = readJSON<Task[]>(TASKS_KEY, [])
    let updated: Task | undefined
    const nextTasks = tasks.map((t) => {
      if (t.id !== taskId) return t
      updated = { ...t, subtasks: mutate(t.subtasks ?? []) }
      return updated
    })
    if (!updated) {
      throw new Error(`Task with id "${taskId}" not found`)
    }
    writeJSON(TASKS_KEY, nextTasks)
    return updated
  }

  async addSubtask(
    taskId: string,
    subtask: Omit<Subtask, 'id' | 'createdDate'>,
  ): Promise<Task> {
    const newSubtask: Subtask = {
      ...subtask,
      id: crypto.randomUUID(),
      createdDate: new Date().toISOString(),
    }
    return this.updateTaskSubtasks(taskId, (subtasks) => [...subtasks, newSubtask])
  }

  async updateSubtask(
    taskId: string,
    subtaskId: string,
    updates: Partial<Subtask>,
  ): Promise<Task> {
    return this.updateTaskSubtasks(taskId, (subtasks) =>
      subtasks.map((s) =>
        s.id === subtaskId
          ? { ...s, ...updates, id: s.id, createdDate: s.createdDate }
          : s,
      ),
    )
  }

  async deleteSubtask(taskId: string, subtaskId: string): Promise<Task> {
    return this.updateTaskSubtasks(taskId, (subtasks) =>
      subtasks.filter((s) => s.id !== subtaskId),
    )
  }

  async toggleSubtaskComplete(taskId: string, subtaskId: string): Promise<Task> {
    return this.updateTaskSubtasks(taskId, (subtasks) =>
      subtasks.map((s) => (s.id === subtaskId ? { ...s, completed: !s.completed } : s)),
    )
  }
}
