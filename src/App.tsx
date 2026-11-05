import { useMemo, useState } from 'react'
import Header from './components/Header'
import TaskFilters from './components/TaskFilters'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import TaskStats from './components/TaskStats'
import { initialTasks } from './data/initialTasks'
import type {
  NewTask,
  Task,
  TaskFilter,
  TaskPriority,
} from './types/task'

function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortByPriority, setSortByPriority] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(false)

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

    if (!sortByPriority) return visibleTasks

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

  const addTask = (newTask: NewTask) => {
    setTasks((currentTasks) => [
      { ...newTask, id: crypto.randomUUID(), completed: false },
      ...currentTasks,
    ])
    setFilter('all')
    setSearchTerm('')
  }

  const toggleTask = (taskId: string) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    )
  }

  const deleteTask = (taskId: string) => {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId),
    )
  }

  const clearCompletedTasks = () => {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => !task.completed),
    )
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
            <TaskForm onAddTask={addTask} />
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
              onClearCompleted={clearCompletedTasks}
            />
            <TaskList
              tasks={filteredTasks}
              emptyMessage={emptyMessage}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
            />
          </main>
        </div>

        <footer className="app__footer">
          Плануй маленькі кроки — досягай великих цілей.
        </footer>
      </div>
    </div>
  )
}

export default App
