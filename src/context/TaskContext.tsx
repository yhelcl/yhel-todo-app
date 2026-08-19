import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Subtask, Task, Workspace } from '../types/task'
import type { Category } from '../types/category'
import { LocalStorageTaskRepository } from '../repositories/LocalStorageTaskRepository'

interface TaskContextValue {
  tasks: Task[]
  categories: Category[]
  loading: boolean
  currentWorkspace: Workspace
  setCurrentWorkspace: (workspace: Workspace) => void
  addTask: (
    task: Omit<Task, 'id' | 'createdDate' | 'workspace' | 'subtasks'>,
  ) => Promise<Task>
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>
  deleteTask: (id: string) => Promise<void>
  addCategory: (name: string) => Promise<void>
  renameCategory: (oldName: string, newName: string) => Promise<void>
  deleteCategory: (name: string) => Promise<void>
  addSubtask: (
    taskId: string,
    subtask: Omit<Subtask, 'id' | 'createdDate'>,
  ) => Promise<Task>
  updateSubtask: (
    taskId: string,
    subtaskId: string,
    updates: Partial<Subtask>,
  ) => Promise<Task>
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<Task>
  toggleSubtaskComplete: (taskId: string, subtaskId: string) => Promise<Task>
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined)

export function TaskProvider({ children }: { children: ReactNode }) {
  const repository = useMemo(() => new LocalStorageTaskRepository(), [])

  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>('Work')
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = async (workspace: Workspace) => {
    const [nextTasks, nextCategories] = await Promise.all([
      repository.getTasks(workspace),
      repository.getCategories(workspace),
    ])
    setTasks(nextTasks)
    setCategories(nextCategories)
  }

  useEffect(() => {
    setLoading(true)
    refresh(currentWorkspace).finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspace])

  const addTask: TaskContextValue['addTask'] = async (task) => {
    const created = await repository.addTask(currentWorkspace, task)
    await refresh(currentWorkspace)
    return created
  }

  const updateTask: TaskContextValue['updateTask'] = async (id, updates) => {
    const updated = await repository.updateTask(id, updates)
    await refresh(currentWorkspace)
    return updated
  }

  const deleteTask: TaskContextValue['deleteTask'] = async (id) => {
    await repository.deleteTask(id)
    await refresh(currentWorkspace)
  }

  const addCategory: TaskContextValue['addCategory'] = async (name) => {
    await repository.addCategory(currentWorkspace, name)
    await refresh(currentWorkspace)
  }

  const renameCategory: TaskContextValue['renameCategory'] = async (
    oldName,
    newName,
  ) => {
    await repository.renameCategory(currentWorkspace, oldName, newName)
    await refresh(currentWorkspace)
  }

  const deleteCategory: TaskContextValue['deleteCategory'] = async (name) => {
    await repository.deleteCategory(currentWorkspace, name)
    await refresh(currentWorkspace)
  }

  const addSubtask: TaskContextValue['addSubtask'] = async (taskId, subtask) => {
    const updated = await repository.addSubtask(taskId, subtask)
    await refresh(currentWorkspace)
    return updated
  }

  const updateSubtask: TaskContextValue['updateSubtask'] = async (
    taskId,
    subtaskId,
    updates,
  ) => {
    const updated = await repository.updateSubtask(taskId, subtaskId, updates)
    await refresh(currentWorkspace)
    return updated
  }

  const deleteSubtask: TaskContextValue['deleteSubtask'] = async (taskId, subtaskId) => {
    const updated = await repository.deleteSubtask(taskId, subtaskId)
    await refresh(currentWorkspace)
    return updated
  }

  const toggleSubtaskComplete: TaskContextValue['toggleSubtaskComplete'] = async (
    taskId,
    subtaskId,
  ) => {
    const updated = await repository.toggleSubtaskComplete(taskId, subtaskId)
    await refresh(currentWorkspace)
    return updated
  }

  const value: TaskContextValue = {
    tasks,
    categories,
    loading,
    currentWorkspace,
    setCurrentWorkspace,
    addTask,
    updateTask,
    deleteTask,
    addCategory,
    renameCategory,
    deleteCategory,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    toggleSubtaskComplete,
  }

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

export function useTasks(): TaskContextValue {
  const ctx = useContext(TaskContext)
  if (!ctx) {
    throw new Error('useTasks must be used within a TaskProvider')
  }
  return ctx
}
