import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { taskRepository } from '../repositories/taskRepository'
import type { NewTask, Task, TaskFilter } from '../types/task'
import useLocalStorage from '../hooks/useLocalStorage'
import TaskContext, { type ToastState, type ToastVariant } from './TaskContext'

const PAGE_SIZE = 10

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [reloadKey, setReloadKey] = useState(0)
  const [filter, setFilter] = useLocalStorage<TaskFilter>('study-planner.filter', 'all')
  const [toast, setToast] = useState<ToastState | null>(null)

  const reloadTasks = useCallback(() => {
    setLoading(true)
    setError(null)
    setReloadKey((key) => key + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    taskRepository
      .getAll(PAGE_SIZE, (page - 1) * PAGE_SIZE, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        setTasks(result.tasks)
        setTotal(result.total)
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(requestError instanceof Error ? requestError.message : 'Не вдалося завантажити завдання.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [page, reloadKey])

  useEffect(() => {
    document.title = `Study Planner — ${tasks.filter((task) => !task.completed).length} active tasks`
  }, [tasks])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), toast.durationMs)
    return () => window.clearTimeout(timer)
  }, [toast])

  const showToast = useCallback((message: string, variant: ToastVariant = 'info', options?: { durationMs?: number }) => {
    setToast({
      id: Date.now() + Math.random(),
      message,
      variant,
      durationMs: options?.durationMs ?? 3500,
    })
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  const addTask = useCallback(async (newTask: NewTask) => {
    try {
      const created = await taskRepository.create(newTask)
      setTasks((current) => [created, ...current].slice(0, PAGE_SIZE))
      setTotal((current) => current + 1)
      showToast('Завдання успішно створено.', 'success')
      return true
    } catch (requestError) {
      showToast(requestError instanceof Error ? requestError.message : 'Не вдалося створити завдання.', 'error')
      return false
    }
  }, [showToast])

  const updateTask = useCallback(async (taskId: string, updates: Partial<NewTask>) => {
    try {
      const updated = await taskRepository.update(taskId, updates)
      setTasks((current) => current.map((task) => task.id === taskId ? { ...task, ...updated } : task))
      showToast('Завдання успішно оновлено.', 'success')
    } catch (requestError) {
      showToast(requestError instanceof Error ? requestError.message : 'Не вдалося оновити завдання.', 'error')
    }
  }, [showToast])

  const toggleTask = useCallback(async (taskId: string) => {
    const current = tasks.find((task) => task.id === taskId)
    if (!current) return

    const completed = !current.completed
    setTasks((items) => items.map((task) => task.id === taskId ? { ...task, completed } : task))
    try {
      await taskRepository.update(taskId, { completed })
    } catch (requestError) {
      setTasks((items) => items.map((task) => task.id === taskId ? { ...task, completed: current.completed } : task))
      showToast(requestError instanceof Error ? requestError.message : 'Не вдалося змінити статус.', 'error')
    }
  }, [showToast, tasks])

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await taskRepository.delete(taskId)
      setTasks((current) => current.filter((task) => task.id !== taskId))
      setTotal((current) => Math.max(0, current - 1))
      showToast('Завдання видалено.', 'success')
    } catch (requestError) {
      showToast(requestError instanceof Error ? requestError.message : 'Не вдалося видалити завдання.', 'error')
    }
  }, [showToast])

  const clearCompleted = useCallback(async () => {
    const completed = tasks.filter((task) => task.completed)
    if (completed.length === 0) {
      showToast('Немає виконаних завдань для очищення.', 'error')
      return
    }
    await Promise.allSettled(completed.map((task) => taskRepository.delete(task.id)))
    setTasks((current) => current.filter((task) => !task.completed))
    setTotal((current) => Math.max(0, current - completed.length))
    showToast('Виконані завдання очищено.', 'success')
  }, [showToast, tasks])

  const changePage = useCallback((nextPage: number) => {
    setLoading(true)
    setError(null)
    setPage(Math.max(1, nextPage))
  }, [])

  const value = useMemo(() => ({
    tasks,
    loading,
    error,
    page,
    pageSize: PAGE_SIZE,
    total,
    reloadTasks,
    changePage,
    filter,
    setFilter,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    clearCompleted,
    toast,
    dismissToast,
  }), [addTask, changePage, clearCompleted, deleteTask, dismissToast, error, filter, loading, page, reloadTasks, setFilter, tasks, toggleTask, toast, total, updateTask])

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}
