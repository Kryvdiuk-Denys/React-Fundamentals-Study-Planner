import { useCallback, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import { initialTasks } from '../data/initialTasks'
import { CATEGORY_COLORS, type NewTask, type Task, type TaskFilter } from '../types/task'
import { taskReducer } from '../reducers/taskReducer'
import TaskContext, { type ToastState, type ToastVariant } from './TaskContext'
import useLocalStorage from '../hooks/useLocalStorage'

const STORAGE_KEY = 'study-planner.tasks'

function readStoredTasks(): Task[] {
  if (typeof window === 'undefined') {
    return initialTasks
  }

  try {
    const storedTasks = window.localStorage.getItem(STORAGE_KEY)
    if (!storedTasks) {
      return initialTasks
    }

    const parsedTasks: unknown = JSON.parse(storedTasks)
    if (!Array.isArray(parsedTasks) || !parsedTasks.every(isStoredTask)) {
      return initialTasks
    }

    return parsedTasks.map((task) => ({ ...task, pendingDelete: false }))
  } catch {
    return initialTasks
  }
}

function isStoredTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const task = value as Record<string, unknown>
  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.description === 'string' &&
    typeof task.completed === 'boolean' &&
    (task.priority === 'low' ||
      task.priority === 'medium' ||
      task.priority === 'high') &&
    typeof task.category === 'string' &&
    CATEGORY_COLORS.some((color) => color.id === task.categoryColor)
  )
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, dispatch] = useReducer(taskReducer, undefined, readStoredTasks)
  const [filter, setFilter] = useLocalStorage<TaskFilter>(
    'study-planner.filter',
    'all',
  )
  const [toast, setToast] = useState<ToastState | null>(null)

  useEffect(() => {
    const savedTasks = tasks.map(
      ({ id, title, description, completed, priority, category, categoryColor }) => ({
        id,
        title,
        description,
        completed,
        priority,
        category,
        categoryColor,
      }),
    )
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTasks))
    } catch (error) {
      console.error('Unable to save study planner tasks to localStorage.', error)
    }
  }, [tasks])

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
      dispatch({
        type: 'add',
        payload: { task: newTask, id: crypto.randomUUID() },
      })
      showToast('Завдання успішно створено.', 'success', { durationMs: 3500 })
    },
    [showToast],
  )

  const updateTask = useCallback(
    (taskId: string, updates: Partial<NewTask>) => {
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
      const activePendingDelete = tasks.find((task) => task.pendingDelete)
      if (activePendingDelete) {
        showToast(
          'Спочатку скасуйте або дочекайтеся поточного видалення.',
          'error',
          { durationMs: 3500 },
        )
        return
      }

      if (!tasks.some((task) => task.id === taskId)) {
        showToast('Не вдалося знайти це завдання.', 'error')
        return
      }

      dispatch({ type: 'requestDelete', payload: { taskId } })
      showToast('Завдання буде видалено через 5 секунд.', 'info', {
        durationMs: 5000,
        actionLabel: 'Скасувати',
        onAction: () => {
          dispatch({ type: 'undoDelete', payload: { taskId } })
          showToast('Видалення скасовано.', 'success', { durationMs: 2500 })
        },
      })
    },
    [showToast, tasks],
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
    const completedTasks = tasks
      .filter((task) => task.completed)
      .map((task) => ({ ...task, pendingDelete: false }))

    if (completedTasks.length === 0) {
      showToast('Немає виконаних завдань для очищення.', 'error')
      return
    }

    dispatch({ type: 'clearCompleted' })
    showToast('Виконані завдання очищено.', 'info', {
      durationMs: 5000,
      actionLabel: 'Скасувати',
      onAction: () => {
        dispatch({ type: 'restoreTasks', payload: completedTasks })
        showToast('Очищення скасовано.', 'success', { durationMs: 2500 })
      },
    })
  }, [showToast, tasks])

  const resetTasks = useCallback(() => {
    dispatch({ type: 'reset', payload: initialTasks })
    showToast('Дані скинуто до початкових.', 'info', { durationMs: 3000 })
  }, [showToast])

  const value = useMemo(
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
    [addTask, clearCompleted, dismissToast, filter, requestDelete, resetTasks, setFilter, tasks, toast, toggleTask, undoDelete, updateTask],
  )

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}
