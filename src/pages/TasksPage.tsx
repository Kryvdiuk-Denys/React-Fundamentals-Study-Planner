import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import useTaskContext from '../hooks/useTaskContext'
import useLocalStorage from '../hooks/useLocalStorage'
import useDebounce from '../hooks/useDebounce'
import { useAuth } from '../context/AuthContext'
import TaskFilters from '../components/TaskFilters'
import TaskFormDialog from '../components/TaskFormDialog'
import TaskList from '../components/TaskList'
import TaskStats from '../components/TaskStats'
import type { Task, TaskFilter, TaskPriority } from '../types/task'

export default function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
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
    addTask,
    updateTask,
    clearCompleted,
  } = useTaskContext()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useLocalStorage('study-planner.search', '')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [sortByPriority, setSortByPriority] = useLocalStorage(
    'study-planner.sort',
    false,
  )

  const statusParam = searchParams.get('status')
  const status: TaskFilter =
    statusParam === 'completed' || statusParam === 'pending'
      ? statusParam
      : 'all'
  const priorityParam = searchParams.get('priority')
  const priority: TaskPriority | 'all' =
    priorityParam === 'high' || priorityParam === 'medium' || priorityParam === 'low'
      ? priorityParam
      : 'all'

  const completedCount = tasks.filter((task) => task.completed).length
  const pendingCount = tasks.length - completedCount

  const visibleTasks = useMemo(() => {
    const normalizedSearch = debouncedSearchTerm.trim().toLocaleLowerCase('uk')
    const filtered = tasks.filter((task) => {
      const matchesStatus =
        status === 'all' ||
        (status === 'completed' && task.completed) ||
        (status === 'pending' && !task.completed)
      const matchesPriority = priority === 'all' || task.priority === priority
      const matchesSearch =
        normalizedSearch.length === 0 ||
        `${task.title} ${task.description} ${task.category}`
          .toLocaleLowerCase('uk')
          .includes(normalizedSearch)

      return matchesStatus && matchesPriority && matchesSearch
    })

    if (!sortByPriority) return filtered

    const priorityOrder: Record<TaskPriority, number> = {
      high: 0,
      medium: 1,
      low: 2,
    }

    return [...filtered].sort(
      (first, second) => priorityOrder[first.priority] - priorityOrder[second.priority],
    )
  }, [debouncedSearchTerm, priority, sortByPriority, status, tasks])

  const updateFilter = (
    key: 'status' | 'priority',
    value: TaskFilter | TaskPriority | 'all',
  ) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'all') next.delete(key)
    else next.set(key, value)
    setSearchParams(next)
  }

  const requireAuth = () => {
    if (isAuthenticated) return true
    navigate('/login', {
      state: { from: location.pathname + location.search },
    })
    return false
  }

  const openCreate = () => {
    if (!requireAuth()) return
    setEditingTaskId(null)
    setDialogOpen(true)
  }

  const editingTask: Task | undefined = tasks.find(
    (task) => task.id === editingTaskId,
  )
  const emptyMessage =
    tasks.length === 0
      ? 'Завдань не знайдено.'
      : debouncedSearchTerm.trim()
        ? 'За вашим запитом нічого не знайдено.'
        : 'За цим фільтром завдань немає.'

  return (
    <>
      <TaskStats
        total={tasks.length}
        completed={completedCount}
        pending={pendingCount}
      />

      <div className="app__workspace">
        <div className="app__main">
          <TaskFilters
            activeFilter={status}
            counts={{
              all: tasks.length,
              completed: completedCount,
              pending: pendingCount,
            }}
            completedCount={completedCount}
            searchTerm={searchTerm}
            sortByPriority={sortByPriority}
            activePriority={priority}
            onFilterChange={(nextStatus) => updateFilter('status', nextStatus)}
            onSearchChange={setSearchTerm}
            onSortChange={setSortByPriority}
            onPriorityChange={(nextPriority) =>
              updateFilter('priority', nextPriority)
            }
            onCreateTask={openCreate}
            onClearCompleted={() => {
              if (requireAuth()) void clearCompleted()
            }}
          />

          {loading && (
            <div className="app__state" role="status">Завантаження...</div>
          )}
          {!loading && error && (
            <div className="app__state app__state--error" role="alert">
              <p>Помилка завантаження: {error}</p>
              <button type="button" onClick={reloadTasks}>Спробувати ще</button>
            </div>
          )}
          {!loading && !error && (
            <TaskList
              tasks={visibleTasks}
              emptyMessage={emptyMessage}
              onEditTask={(taskId) => {
                if (!requireAuth()) return
                setEditingTaskId(taskId)
                setDialogOpen(true)
              }}
              onDetailsTask={(taskId) => navigate(`/tasks/${taskId}`)}
            />
          )}

          {!loading && !error && (
            <nav className="app__pagination" aria-label="Пагінація">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => changePage(page - 1)}
              >
                Попередня
              </button>
              <span>
                Сторінка {page} з {Math.max(1, Math.ceil(total / pageSize))}
              </span>
              <button
                type="button"
                disabled={page >= Math.ceil(total / pageSize)}
                onClick={() => changePage(page + 1)}
              >
                Наступна
              </button>
            </nav>
          )}
        </div>
      </div>

      <TaskFormDialog
        open={dialogOpen}
        mode={editingTask ? 'edit' : 'create'}
        task={editingTask}
        onClose={() => {
          setDialogOpen(false)
          setEditingTaskId(null)
        }}
        onSubmit={async (data) => {
          if (editingTask) {
            const updated = await updateTask(editingTask.id, {
              title: data.title,
              description: data.description,
              category: data.category,
              categoryColor: editingTask.categoryColor,
              priority: data.priority,
            })
            if (updated) {
              setDialogOpen(false)
              setEditingTaskId(null)
            }
            return
          }

          const created = await addTask({
            title: data.title,
            description: data.description,
            category: data.category,
            categoryColor: 'blue',
            priority: data.priority,
          })
          if (created) {
            setDialogOpen(false)
            setSearchTerm('')
            setSearchParams({})
          }
        }}
      />
    </>
  )
}
