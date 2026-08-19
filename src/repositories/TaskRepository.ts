import type { Subtask, Task, Workspace } from '../types/task'
import type { Category } from '../types/category'

export interface TaskRepository {
  getTasks(workspace: Workspace): Promise<Task[]>
  addTask(
    workspace: Workspace,
    task: Omit<Task, 'id' | 'createdDate' | 'workspace' | 'subtasks'>,
  ): Promise<Task>
  updateTask(id: string, updates: Partial<Task>): Promise<Task>
  deleteTask(id: string): Promise<void>
  getCategories(workspace: Workspace): Promise<Category[]>
  addCategory(workspace: Workspace, name: string): Promise<void>
  renameCategory(workspace: Workspace, oldName: string, newName: string): Promise<void>
  deleteCategory(workspace: Workspace, name: string): Promise<void>
  addSubtask(
    taskId: string,
    subtask: Omit<Subtask, 'id' | 'createdDate'>,
  ): Promise<Task>
  updateSubtask(
    taskId: string,
    subtaskId: string,
    updates: Partial<Subtask>,
  ): Promise<Task>
  deleteSubtask(taskId: string, subtaskId: string): Promise<Task>
  toggleSubtaskComplete(taskId: string, subtaskId: string): Promise<Task>
}
