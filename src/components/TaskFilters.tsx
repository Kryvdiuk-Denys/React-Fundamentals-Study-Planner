import type { TaskFilter, TaskPriority } from '../types/task'
import './TaskFilters.scss'

interface TaskFiltersProps {
  activeFilter: TaskFilter
  counts: Record<TaskFilter, number>
  completedCount: number
  searchTerm: string
  sortByPriority: boolean
  activePriority: TaskPriority | 'all'
  onFilterChange: (filter: TaskFilter) => void
  onSearchChange: (searchTerm: string) => void
  onSortChange: (sortByPriority: boolean) => void
  onPriorityChange: (priority: TaskPriority | 'all') => void
  onClearCompleted: () => void
  onCreateTask: () => void
}

const filters: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'Усі' },
  { value: 'pending', label: 'Не виконані' },
  { value: 'completed', label: 'Виконані' },
]

function TaskFilters({
  activeFilter,
  counts,
  completedCount,
  searchTerm,
  sortByPriority,
  activePriority,
  onFilterChange,
  onSearchChange,
  onSortChange,
  onPriorityChange,
  onClearCompleted,
  onCreateTask,
}: TaskFiltersProps) {
  return (
    <section className="task-filters" aria-label="Фільтри завдань">
      <div className="task-filters__top">
        <h2 className="task-filters__heading">Мої завдання</h2>
        <div className="task-filters__top-actions">
          <span className="task-filters__total">
            {counts.all} {counts.all === 1 ? 'завдання' : 'завдань'}
          </span>
          <button
            className="task-filters__create"
            type="button"
            onClick={onCreateTask}
          >
            + Створити завдання
          </button>
        </div>
      </div>

      <label className="task-filters__search-label">
        <span className="task-form__label">Пошук завдань</span>
        <input
          className="task-filters__search"
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Назва, опис або категорія..."
        />
      </label>

      <label className="task-filters__priority-label">
        <span className="task-form__label">Пріоритет</span>
        <select
          className="task-filters__sort"
          value={activePriority}
          onChange={(event) =>
            onPriorityChange(event.target.value as TaskPriority | 'all')
          }
        >
          <option value="all">Усі пріоритети</option>
          <option value="high">Високий</option>
          <option value="medium">Середній</option>
          <option value="low">Низький</option>
        </select>
      </label>

      <div className="task-filters__tabs" role="group" aria-label="Показати">
        {filters.map(({ value, label }) => (
          <button
            className={`task-filters__button${activeFilter === value ? ' task-filters__button--active' : ''}`}
            key={value}
            type="button"
            aria-pressed={activeFilter === value}
            onClick={() => onFilterChange(value)}
          >
            {label}
            <span className="task-filters__count">{counts[value]}</span>
          </button>
        ))}
      </div>

      <div className="task-filters__actions">
        <label className="task-filters__sort-label">
          <span className="task-form__label">Сортування</span>
          <select
            className="task-filters__sort"
            value={sortByPriority ? 'priority' : 'default'}
            onChange={(event) =>
              onSortChange(event.target.value === 'priority')
            }
          >
            <option value="default">За порядком додавання</option>
            <option value="priority">За пріоритетом</option>
          </select>
        </label>
        <div className="task-filters__button-group">
          <button
            className="task-filters__clear"
            type="button"
            onClick={onClearCompleted}
            disabled={completedCount === 0}
          >
            Очистити виконані ({completedCount})
          </button>
        </div>
      </div>
    </section>
  )
}

export default TaskFilters
