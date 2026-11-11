import { useContext } from 'react'
import { createContext, useCallback, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import { initialTasks } from '../data/initialTasks'
import type { NewTask, Task, TaskFilter } from '../types/task'
import { taskReducer } from '../reducers/taskReducer'

const STORAGE_KEY = 'study-planner.tasks'
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
  updateTask: (taskId: string, updates: Partial<Task>) => void
  toggleTask: (taskId: string) => void
  requestDelete: (taskId: string) => void
  undoDelete: (taskId: string) => void
  clearCompleted: () => void
  resetTasks: () => void
  toast: ToastState | null
  dismissToast: () => void
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined)

function readStoredTasks(): Task[] {
  if (typeof window === 'undefined') {
    return initialTasks
  }

  try {
    const storedTasks = window.localStorage.getItem(STORAGE_KEY)
    if (!storedTasks) {
      return initialTasks
    }

    const parsedTasks = JSON.parse(storedTasks)
    if (!Array.isArray(parsedTasks)) {
      return initialTasks
    }

    return parsedTasks.map((task) => ({ ...task, pendingDelete: Boolean(task.pendingDelete) })) as Task[]
  } catch {
    return initialTasks
  }
}

function readStoredFilter(): TaskFilter {
  if (typeof window === 'undefined') {
    return 'all'
  }

  try {
    const rawValue = window.localStorage.getItem('study-planner.filter')
    if (rawValue === null) {
      return 'all'
    }

    const parsedValue = JSON.parse(rawValue)
    return parsedValue === 'all' || parsedValue === 'completed' || parsedValue === 'pending'
      ? parsedValue
      : 'all'
  } catch {
    return 'all'
  }
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, dispatch] = useReducer(taskReducer, undefined, readStoredTasks)
  const [filter, setFilter] = useState<TaskFilter>(() => readStoredFilter())
  const [toast, setToast] = useState<ToastState | null>(null)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    window.localStorage.setItem('study-planner.filter', JSON.stringify(filter))
  }, [filter])

  useEffect(() => {
    const activeTasks = tasks.filter((task) => !task.completed).length
    document.title = `Study Planner — ${activeTasks} active tasks`
  }, [tasks])

  useEffect(() => {
    if (!toast) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setToast(null)
    }, toast.durationMs)

    return () => {
      window.clearTimeout(timer)
    }
  }, [toast])

  const dismissToast = useCallback(() => {
    setToast(null)
  }, [])

  const showToast = useCallback(
    (
      message: string,
      variant: ToastVariant = 'info',
      options?: { durationMs?: number; actionLabel?: string; onAction?: () => void },
    ) => {
      setToast({
        id: Date.now() + Math.random(),
        message,
        variant,
        durationMs: options?.durationMs ?? 4000,
        actionLabel: options?.actionLabel,
        onAction: options?.onAction,
      })
    },
    [],
  )

  const addTask = useCallback(
    (newTask: NewTask) => {
      dispatch({ type: 'add', payload: newTask })
      showToast('Завдання успішно створено.', 'success', { durationMs: 3500 })
    },
    [showToast],
  )

  const updateTask = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      dispatch({ type: 'update', payload: { taskId, updates } })
      showToast('Завдання успішно оновлено.', 'success', { durationMs: 3500 })
    },
    [showToast],
  )

  const toggleTask = useCallback((taskId: string) => {
    dispatch({ type: 'toggle', payload: { taskId } })
  }, [])

  const requestDelete = useCallback(
    (taskId: string) => {
      dispatch({ type: 'requestDelete', payload: { taskId } })
      showToast('Завдання буде видалено через 5 секунд.', 'info', {
        durationMs: 5000,
        actionLabel: 'Скасувати',
        onAction: () => {
          dispatch({ type: 'undoDelete', payload: { taskId } })
          setToast(null)
          showToast('Видалення скасовано.', 'success', { durationMs: 2500 })
        },
      })
    },
    [showToast],
  )

  const pendingDeleteTask = useMemo(
    () => tasks.find((task) => task.pendingDelete) ?? null,
    [tasks],
  )

  useEffect(() => {
    if (!pendingDeleteTask) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      dispatch({ type: 'confirmDelete', payload: { taskId: pendingDeleteTask.id } })
      showToast('Завдання видалено.', 'success', { durationMs: 2500 })
    }, 5000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [pendingDeleteTask, showToast])

  const undoDelete = useCallback(
    (taskId: string) => {
      dispatch({ type: 'undoDelete', payload: { taskId } })
      setToast(null)
      showToast('Видалення скасовано.', 'success', { durationMs: 2500 })
    },
    [showToast],
  )

  const clearCompleted = useCallback(() => {
    dispatch({ type: 'clearCompleted' })
    showToast('Виконані завдання очищено.', 'success', { durationMs: 3000 })
  }, [showToast])

  const resetTasks = useCallback(() => {
    dispatch({ type: 'reset', payload: initialTasks })
    showToast('Дані скинуто до початкових.', 'info', { durationMs: 3000 })
  }, [showToast])

  const value = useMemo<TaskContextValue>(
    () => ({
      tasks,
      filter,
      setFilter,
      addTask,
      updateTask,
      toggleTask,
      requestDelete,
      undoDelete,
      clearCompleted,
      resetTasks,
      toast,
      dismissToast,
    }),
    [addTask, clearCompleted, dismissToast, filter, requestDelete, resetTasks, tasks, toast, toggleTask, undoDelete, updateTask],
  )

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

export function useTaskContext() {
  const context = useContext(TaskContext)

  if (!context) {
    throw new Error('useTaskContext must be used inside a TaskProvider')
  }

  return context
}

export default TaskContext
