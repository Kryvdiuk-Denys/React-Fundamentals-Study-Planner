import { useState } from 'react'
import { CATEGORY_COLOR_VALUES, type Task } from '../types/task'
import useTaskContext from '../hooks/useTaskContext'
import './TaskItem.scss'
import { useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

interface TaskItemProps {
  task: Task
  onEdit: (taskId: string) => void
  onDetails: (taskId: string) => void
}

const priorityLabels = {
  low: 'Низький пріоритет',
  medium: 'Середній пріоритет',
  high: 'Високий пріоритет',
} as const

function TaskItem({ task, onEdit, onDetails }: TaskItemProps) {
  const { toggleTask, deleteTask } = useTaskContext()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [deleteConfirmation, setDeleteConfirmation] = useState(false)

  const requireAuth = () => {
    if (isAuthenticated) return true
    navigate('/login', { state: { from: `/tasks/${task.id}` } })
    return false
  }

  return (
    <article
      className={`task-item${task.completed ? ' task-item--completed' : ''}${task.pendingDelete ? ' task-item--pending-delete' : ''}`}
    >
      <button
        className={`task-item__check${task.completed ? ' task-item__check--completed' : ''}`}
        type="button"
        aria-label={
          task.completed ? `Повернути «${task.title}» у роботу` : `Позначити «${task.title}» виконаним`
        }
        aria-pressed={task.completed}
        disabled={task.pendingDelete}
        onClick={() => requireAuth() && void toggleTask(task.id)}
      >
        {task.completed ? '+' : ''}
      </button>

      <div className="task-item__body">
        <h3 className="task-item__title">
          {task.title}
          {task.pendingDelete && (
            <span className="task-item__pending-label">Буде видалено</span>
          )}
        </h3>
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

      <div className="task-item__actions">
        {!task.pendingDelete && (
          <button
            className="task-item__edit"
            type="button"
            onClick={() => requireAuth() && onEdit(task.id)}
          >
            Редагувати
          </button>
        )}
        <button
          className="task-item__edit"
          type="button"
          onClick={() => onDetails(task.id)}
        >
          Деталі
        </button>
        <button
          className="task-item__delete"
          type="button"
          aria-label={`Видалити «${task.title}»`}
          onClick={() => requireAuth() && setDeleteConfirmation(true)}
        >
          ×
        </button>
      </div>
      {deleteConfirmation && (
        <div className="task-item__delete-confirm" role="group" aria-label="Підтвердження видалення">
          <span>Видалити завдання?</span>
          <button type="button" onClick={() => void deleteTask(task.id)}>Так, видалити</button>
          <button type="button" onClick={() => setDeleteConfirmation(false)}>Скасувати</button>
        </div>
      )}
    </article>
  )
}

export default TaskItem
