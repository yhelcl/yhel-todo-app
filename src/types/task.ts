export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent'

export type Status = 'Not started' | 'In progress' | 'Done'

export type Workspace = 'Personal' | 'Work'

export interface Subtask {
  id: string
  name: string
  priority: Priority
  dueDate: string | null
  completed: boolean
  createdDate: string
}

export interface Task {
  id: string
  name: string
  category: string
  priority: Priority
  dueDate: string | null
  status: Status
  createdDate: string
  notes: string
  workspace: Workspace
  subtasks: Subtask[]
}
