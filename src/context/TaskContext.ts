import { createContext } from 'react'
import type { NewTask, Task, TaskFilter } from '../types/task'

export type ToastVariant = 'success' | 'info' | 'error'

export interface ToastState {
  id: number
  message: string
  variant: ToastVariant
  durationMs: number
  actionLabel?: string
  onAction?: () => void
}

interface TaskContextValue {
  tasks: Task[]
  loading: boolean
  error: string | null
  page: number
  pageSize: number
  total: number
  reloadTasks: () => void
  changePage: (page: number) => void
  filter: TaskFilter
  setFilter: (filter: TaskFilter) => void
  addTask: (task: NewTask) => Promise<boolean>
  updateTask: (taskId: string, updates: Partial<NewTask>) => Promise<void>
  toggleTask: (taskId: string) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  clearCompleted: () => Promise<void>
  toast: ToastState | null
  dismissToast: () => void
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined)

export default TaskContext
