import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import TaskFilters from './components/TaskFilters'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import TaskStats from './components/TaskStats'
import Toast from './components/Toast'
import useLocalStorage from './hooks/useLocalStorage'
import useDebounce from './hooks/useDebounce'
import useTaskContext from './hooks/useTaskContext'
import type { TaskPriority } from './types/task'
import { taskRepository } from './repositories/taskRepository'
import type { Task } from './types/task'
import './styles/app.scss'

function App() {
  const {
    tasks,
    loading,
    error,
    page,
    pageSize,
    total,
    reloadTasks,
    changePage,
    filter,
    setFilter,
    addTask,
    updateTask,
    clearCompleted,
    toast,
    dismissToast,
  } = useTaskContext()

  const [searchTerm, setSearchTerm] = useLocalStorage('study-planner.search', '')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [sortByPriority, setSortByPriority] = useLocalStorage(
    'study-planner.sort',
    false,
  )
  const [isDarkTheme, setIsDarkTheme] = useLocalStorage(
    'study-planner.theme',
    false,
  )
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedTaskId) return undefined
    const controller = new AbortController()

    taskRepository.getById(selectedTaskId, controller.signal)
      .then((task) => {
        if (!controller.signal.aborted) setSelectedTask(task)
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setDetailsError(requestError instanceof Error ? requestError.message : 'Не вдалося завантажити деталі.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setDetailsLoading(false)
      })

    return () => controller.abort()
  }, [selectedTaskId])

  const openTaskDetails = (taskId: string) => {
    setSelectedTask(null)
    setDetailsLoading(true)
    setDetailsError(null)
    setSelectedTaskId(taskId)
  }

  const completedCount = tasks.filter((task) => task.completed).length
  const pendingCount = tasks.length - completedCount

  const filteredTasks = useMemo(() => {
    const normalizedSearch = debouncedSearchTerm.trim().toLocaleLowerCase('uk')
    const visibleTasks = tasks.filter((task) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'completed' && task.completed) ||
        (filter === 'pending' && !task.completed)
      const matchesSearch =
        normalizedSearch.length === 0 ||
        `${task.title} ${task.description} ${task.category}`
          .toLocaleLowerCase('uk')
          .includes(normalizedSearch)

      return matchesFilter && matchesSearch
    })

    if (!sortByPriority) {
      return visibleTasks
    }

    const priorityOrder: Record<TaskPriority, number> = {
      high: 0,
      medium: 1,
      low: 2,
    }

    return [...visibleTasks].sort(
      (first, second) =>
        priorityOrder[first.priority] - priorityOrder[second.priority],
    )
  }, [debouncedSearchTerm, filter, sortByPriority, tasks])

  const editingTask = tasks.find((task) => task.id === editingTaskId) ?? null

  const handleSubmitTask = async (taskData: Parameters<typeof addTask>[0]) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData)
      setEditingTaskId(null)
      return
    }

    const created = await addTask(taskData)
    if (created) {
      setFilter('all')
      setSearchTerm('')
    }
    return created
  }

  const emptyMessage =
    tasks.length === 0
      ? 'Завдань не знайдено.'
      : filteredTasks.length === 0 && debouncedSearchTerm.trim().length > 0
        ? 'За вашим запитом нічого не знайдено.'
        : 'За цим фільтром завдань немає.'

  return (
    <div className={`app-shell${isDarkTheme ? ' app-shell--dark' : ''}`}>
      <div className="app">
        <Header
          isDarkTheme={isDarkTheme}
          onThemeToggle={() => setIsDarkTheme((currentTheme) => !currentTheme)}
        />

        <TaskStats
          total={tasks.length}
          completed={completedCount}
          pending={pendingCount}
        />

        <div className="app__workspace">
          <aside className="app__sidebar" aria-label="Створення завдання">
            <TaskForm
              key={editingTask?.id ?? 'new'}
              initialTask={editingTask ?? undefined}
              onSubmit={handleSubmitTask}
              onCancel={() => setEditingTaskId(null)}
            />
          </aside>

          <main className="app__main">
            <TaskFilters
              activeFilter={filter}
              counts={{
                all: tasks.length,
                completed: completedCount,
                pending: pendingCount,
              }}
              completedCount={completedCount}
              searchTerm={searchTerm}
              sortByPriority={sortByPriority}
              onFilterChange={setFilter}
              onSearchChange={setSearchTerm}
              onSortChange={setSortByPriority}
              onClearCompleted={clearCompleted}
            />
            {loading && <div className="app__state" role="status">Loading...</div>}
            {!loading && error && (
              <div className="app__state app__state--error" role="alert">
                <p>Помилка завантаження.</p>
                <button type="button" onClick={reloadTasks}>Спробувати ще</button>
              </div>
            )}
            {!loading && !error && (
              <TaskList
                tasks={filteredTasks}
                emptyMessage={emptyMessage}
                onEditTask={setEditingTaskId}
                onDetailsTask={openTaskDetails}
              />
            )}
            {!loading && !error && (
              <nav className="app__pagination" aria-label="Пагінація">
                <button type="button" disabled={page === 1} onClick={() => changePage(page - 1)}>Попередня</button>
                <span>Сторінка {page} з {Math.max(1, Math.ceil(total / pageSize))}</span>
                <button type="button" disabled={page >= Math.ceil(total / pageSize)} onClick={() => changePage(page + 1)}>Наступна</button>
              </nav>
            )}
            {(detailsLoading || detailsError || selectedTask) && (
              <section className="app__details" aria-live="polite">
                <button type="button" className="app__details-close" onClick={() => { setSelectedTask(null); setSelectedTaskId(null); setDetailsLoading(false); setDetailsError(null) }}>×</button>
                {detailsLoading && <p>Loading...</p>}
                {detailsError && <p role="alert">Помилка завантаження: {detailsError}</p>}
                {selectedTask && (
                  <>
                    <h2>{selectedTask.title}</h2>
                    <p>{selectedTask.description || 'Опис відсутній'}</p>
                    <p><strong>Категорія:</strong> {selectedTask.category}</p>
                    <p><strong>Пріоритет:</strong> {selectedTask.priority}</p>
                    <p><strong>Статус:</strong> {selectedTask.completed ? 'Виконано' : 'У процесі'}</p>
                  </>
                )}
              </section>
            )}
          </main>
        </div>

        <Toast toast={toast} onDismiss={dismissToast} />
      </div>
    </div>
  )
}

export default App
