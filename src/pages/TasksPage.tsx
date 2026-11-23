import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import useTaskContext from '../hooks/useTaskContext'
import { useAuth } from '../context/AuthContext'
import TaskFormDialog from '../components/TaskFormDialog'
import type { TaskFilter, TaskPriority } from '../types/task'

export default function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const {
    tasks,
    loading,
    error,
    reloadTasks,
    page,
    pageSize,
    total,
    changePage,
    setFilter,
    addTask,
  } = useTaskContext()
  const [dialogOpen, setDialogOpen] = useState(false)

  const status = (searchParams.get('status') ?? 'all') as TaskFilter
  const priority = searchParams.get('priority') as TaskPriority | null

  useEffect(() => {
    setFilter(status)
  }, [setFilter, status])

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus =
        status === 'all' ||
        (status === 'completed' && task.completed) ||
        (status === 'pending' && !task.completed)
      const matchesPriority = !priority || task.priority === priority
      return matchesStatus && matchesPriority
    })
  }, [priority, status, tasks])

  const updateFilter = (key: 'status' | 'priority', value: string) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'all') next.delete(key)
    else next.set(key, value)
    setSearchParams(next)
  }

  const requireAuth = () => {
    if (isAuthenticated) return true
    navigate('/login', { state: { from: '/tasks' } })
    return false
  }

  const openCreate = () => {
    if (requireAuth()) setDialogOpen(true)
  }

  return (
    <section className="tasks-page">
      <div className="tasks-page__toolbar">
        <h1>Мої завдання</h1>
        <button type="button" onClick={openCreate}>+ Створити завдання</button>
      </div>
      <div className="tasks-page__filters" aria-label="Фільтри завдань">
        <label>
          Статус
          <select value={status} onChange={(event) => updateFilter('status', event.target.value)}>
            <option value="all">Усі</option>
            <option value="pending">Не виконані</option>
            <option value="completed">Виконані</option>
          </select>
        </label>
        <label>
          Пріоритет
          <select value={priority ?? 'all'} onChange={(event) => updateFilter('priority', event.target.value)}>
            <option value="all">Усі</option>
            <option value="low">Низький</option>
            <option value="medium">Середній</option>
            <option value="high">Високий</option>
          </select>
        </label>
      </div>

      {loading && <p role="status">Завантаження...</p>}
      {error && (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={reloadTasks}>Спробувати ще</button>
        </div>
      )}
      {!loading && !error && (
        visibleTasks.length === 0 ? (
          <p>За цим фільтром завдань немає.</p>
        ) : (
          <ul className="tasks-page__list">
            {visibleTasks.map((task) => (
              <li key={task.id}>
                <Link to={`/tasks/${task.id}`}>
                  <strong>{task.title}</strong>
                  <span>{task.completed ? 'Виконано' : 'У процесі'} · {task.priority}</span>
                </Link>
              </li>
            ))}
          </ul>
        )
      )}
      <nav className="app__pagination" aria-label="Пагінація">
        <button type="button" disabled={page === 1} onClick={() => changePage(page - 1)}>Попередня</button>
        <span>Сторінка {page} з {Math.max(1, Math.ceil(total / pageSize))}</span>
        <button type="button" disabled={page >= Math.ceil(total / pageSize)} onClick={() => changePage(page + 1)}>Наступна</button>
      </nav>

      <TaskFormDialog
        open={dialogOpen}
        mode="create"
        onClose={() => setDialogOpen(false)}
        onSubmit={async (data) => {
          const created = await addTask({
            title: data.title,
            description: data.description,
            category: data.category,
            categoryColor: 'blue',
            priority: data.priority,
          })
          if (created) setDialogOpen(false)
        }}
      />
    </section>
  )
}
