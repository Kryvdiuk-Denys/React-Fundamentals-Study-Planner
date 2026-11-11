import { useMemo, useState } from 'react'
import Header from './components/Header'
import TaskFilters from './components/TaskFilters'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import TaskStats from './components/TaskStats'
import Toast from './components/Toast'
import useLocalStorage from './hooks/useLocalStorage'
import useTaskContext from './hooks/useTaskContext'
import type { TaskPriority } from './types/task'
import './styles/app.scss'

function App() {
  const {
    tasks,
    filter,
    setFilter,
    addTask,
    updateTask,
    clearCompleted,
    resetTasks,
    toast,
    dismissToast,
  } = useTaskContext()

  const [searchTerm, setSearchTerm] = useLocalStorage('study-planner.search', '')
  const [sortByPriority, setSortByPriority] = useLocalStorage(
    'study-planner.sort',
    false,
  )
  const [isDarkTheme, setIsDarkTheme] = useLocalStorage(
    'study-planner.theme',
    false,
  )
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)

  const completedCount = tasks.filter((task) => task.completed).length
  const pendingCount = tasks.length - completedCount

  const filteredTasks = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('uk')
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
  }, [filter, searchTerm, sortByPriority, tasks])

  const editingTask = tasks.find((task) => task.id === editingTaskId) ?? null

  const handleSubmitTask = (taskData: Parameters<typeof addTask>[0]) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData)
      setEditingTaskId(null)
      return
    }

    addTask(taskData)
    setFilter('all')
    setSearchTerm('')
  }

  const emptyMessage =
    tasks.length === 0
      ? 'Завдань поки немає. Додайте перше навчальне завдання.'
      : filteredTasks.length === 0 && searchTerm.trim().length > 0
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
              onResetTasks={resetTasks}
            />
            <TaskList
              tasks={filteredTasks}
              emptyMessage={emptyMessage}
              onEditTask={setEditingTaskId}
            />
          </main>
        </div>

        <Toast toast={toast} onDismiss={dismissToast} />
      </div>
    </div>
  )
}

export default App
