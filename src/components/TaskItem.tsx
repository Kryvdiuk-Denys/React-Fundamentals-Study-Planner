import { CATEGORY_COLOR_VALUES, type Task } from '../types/task'

interface TaskItemProps {
  task: Task
  onToggle: (taskId: string) => void
  onDelete: (taskId: string) => void
}

const priorityLabels = {
  low: 'Низький пріоритет',
  medium: 'Середній пріоритет',
  high: 'Високий пріоритет',
} as const

function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <article
      className={`task-item${task.completed ? ' task-item--completed' : ''}`}
    >
      <button
        className={`task-item__check${task.completed ? ' task-item__check--completed' : ''}`}
        type="button"
        aria-label={
          task.completed ? `Повернути «${task.title}» у роботу` : `Позначити «${task.title}» виконаним`
        }
        aria-pressed={task.completed}
        onClick={() => onToggle(task.id)}
      >
        {task.completed ? '✓' : ''}
      </button>

      <div className="task-item__body">
        <h3 className="task-item__title">{task.title}</h3>
        {task.description && (
          <p className="task-item__description">{task.description}</p>
        )}
        <div className="task-item__meta">
          <span className="task-item__category">
            <span
              className="task-item__category-dot"
              style={{
                backgroundColor: CATEGORY_COLOR_VALUES[task.categoryColor],
              }}
              aria-hidden="true"
            />
            {task.category}
          </span>
          <span
            className={`task-item__badge task-item__priority--${task.priority}`}
          >
            {priorityLabels[task.priority]}
          </span>
          <span className="task-item__status">
            {task.completed ? 'Виконано' : 'У процесі'}
          </span>
        </div>
      </div>

      <button
        className="task-item__delete"
        type="button"
        aria-label={`Видалити «${task.title}»`}
        onClick={() => onDelete(task.id)}
      >
        ×
      </button>
    </article>
  )
}

export default TaskItem
