import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { taskRepository } from '../repositories/taskRepository'
import type { Task } from '../types/task'
import useTaskContext from '../hooks/useTaskContext'
import { useAuth } from '../context/AuthContext'
import TaskFormDialog from '../components/TaskFormDialog'

export default function TaskDetailsPage() {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { updateTask, deleteTask } = useTaskContext()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (!taskId) return
    const controller = new AbortController()
    taskRepository.getById(taskId, controller.signal)
      .then(setTask)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(requestError instanceof Error ? requestError.message : 'Не вдалося завантажити завдання.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [taskId])

  const requireAuth = () => {
    if (isAuthenticated) return true
    navigate('/login', { state: { from: `/tasks/${taskId}` } })
    return false
  }

  const handleDelete = async () => {
    if (!requireAuth() || !taskId) return
    await deleteTask(taskId)
    navigate('/tasks', { replace: true })
  }

  return (
    <section className="task-details">
      {loading && <p role="status">Завантаження...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && task && (
        <>
          <h1>{task.title}</h1>
          <p>{task.description || 'Опис відсутній'}</p>
          <dl>
            <dt>Категорія</dt><dd>{task.category}</dd>
            <dt>Пріоритет</dt><dd>{task.priority}</dd>
            <dt>Статус</dt><dd>{task.completed ? 'Виконано' : 'У процесі'}</dd>
            <dt>Хто створив завдання</dt><dd>{task.createdBy}</dd>
            <dt>Дата створення</dt><dd>{new Date(task.createdAt).toLocaleString()}</dd>
          </dl>
          <p><small>createdBy і createdAt зберігаються клієнтом, бо DummyJSON не повертає ці поля.</small></p>
          <div className="task-details__actions">
            <button type="button" onClick={() => requireAuth() && setDialogOpen(true)}>Редагувати</button>
            <button type="button" onClick={() => void handleDelete()}>Видалити</button>
            <button type="button" onClick={() => navigate('/tasks')}>Назад до списку</button>
          </div>
          <TaskFormDialog
            open={dialogOpen}
            mode="edit"
            task={task}
            onClose={() => setDialogOpen(false)}
            onSubmit={async (data) => {
              if (!taskId) return
              const updated = await updateTask(taskId, {
                title: data.title,
                description: data.description,
                category: data.category,
                categoryColor: task.categoryColor,
                priority: data.priority,
              })
              if (updated) {
                setTask((current) => current ? { ...current, ...data } : current)
                setDialogOpen(false)
              }
            }}
          />
        </>
      )}
    </section>
  )
}
