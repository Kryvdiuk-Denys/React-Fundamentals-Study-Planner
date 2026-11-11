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
  filter: TaskFilter
  setFilter: (filter: TaskFilter) => void
  addTask: (task: NewTask) => void
  updateTask: (taskId: string, updates: Partial<NewTask>) => void
  toggleTask: (taskId: string) => void
  requestDelete: (taskId: string) => void
  undoDelete: (taskId: string) => void
  clearCompleted: () => void
  resetTasks: () => void
  toast: ToastState | null
  dismissToast: () => void
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined)

export default TaskContext
