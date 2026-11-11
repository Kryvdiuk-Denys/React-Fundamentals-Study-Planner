import { useState, type FormEvent } from 'react'
import {
  CATEGORY_COLORS,
  type CategoryColor,
  type NewTask,
  type Task,
  type TaskPriority,
} from '../types/task'
import './TaskForm.scss'

interface TaskFormProps {
  initialTask?: Task
  onSubmit: (task: NewTask) => void
  onCancel?: () => void
}

function TaskForm({ initialTask, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title ?? '')
  const [description, setDescription] = useState(initialTask?.description ?? '')
  const [category, setCategory] = useState(initialTask?.category ?? '')
  const [categoryColor, setCategoryColor] = useState<CategoryColor>(
    initialTask?.categoryColor ?? 'blue',
  )
  const [priority, setPriority] = useState<TaskPriority>(
    initialTask?.priority ?? 'medium',
  )
  const [error, setError] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      setError('Введіть назву завдання.')
      return
    }

    onSubmit({
      title: trimmedTitle,
      description: description.trim(),
      category: category.trim() || 'Навчання',
      categoryColor,
      priority,
    })

    if (!initialTask) {
      setTitle('')
      setDescription('')
      setCategory('')
      setCategoryColor('blue')
      setPriority('medium')
    }
    setError('')
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2 className="task-form__heading">
        {initialTask ? 'Редагувати завдання' : 'Нове завдання'}
      </h2>
      <p className="task-form__hint">
        {initialTask
          ? 'Онови дані про завдання та збережи зміни.'
          : 'Додай наступний крок до свого навчального плану.'}
      </p>

      <label className="task-form__field">
        <span className="task-form__label">
          Назва <span className="task-form__required">*</span>
        </span>
        <input
          className="task-form__input"
          type="text"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value)
            if (error) setError('')
          }}
          placeholder="Наприклад, купити продукти"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'task-title-error' : undefined}
          required
        />
        {error && (
          <span className="task-form__error" id="task-title-error" role="alert">
            {error}
          </span>
        )}
      </label>

      <label className="task-form__field">
        <span className="task-form__label">Опис</span>
        <textarea
          className="task-form__textarea"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Коротко опиши, що потрібно зробити"
          rows={3}
        />
      </label>

      <label className="task-form__field">
        <span className="task-form__label">Категорія</span>
        <input
          className="task-form__input"
          type="text"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="Наприклад, Покупки"
        />
      </label>

      <label className="task-form__field">
        <span className="task-form__label">Колір категорії</span>
        <select
          className="task-form__select"
          value={categoryColor}
          onChange={(event) =>
            setCategoryColor(event.target.value as CategoryColor)
          }
        >
          {CATEGORY_COLORS.map((color) => (
            <option key={color.id} value={color.id}>
              {color.label}
            </option>
          ))}
        </select>
      </label>

      <label className="task-form__field">
        <span className="task-form__label">Пріоритет</span>
        <select
          className="task-form__select"
          value={priority}
          onChange={(event) => setPriority(event.target.value as TaskPriority)}
        >
          <option value="low">Низький</option>
          <option value="medium">Середній</option>
          <option value="high">Високий</option>
        </select>
      </label>

      <div className="task-form__actions">
        <button className="task-form__submit" type="submit">
          {initialTask ? 'Зберегти зміни' : '+ Додати завдання'}
        </button>
        {initialTask && onCancel && (
          <button
            className="task-form__cancel"
            type="button"
            onClick={onCancel}
          >
            Скасувати
          </button>
        )}
      </div>
    </form>
  )
}

export default TaskForm
