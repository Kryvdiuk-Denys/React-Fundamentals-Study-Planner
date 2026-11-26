import { useEffect, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { taskSchema, type TaskFormData } from '../schemas/taskSchema'
import type { Task } from '../types/task'
import './TaskFormDialog.scss'

export interface TaskFormDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  task?: Task
  onClose: () => void
  onSubmit: (data: TaskFormData) => Promise<void>
}

export default function TaskFormDialog({
  open,
  mode,
  task,
  onClose,
  onSubmit,
}: TaskFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      category: task?.category ?? '',
      priority: task?.priority ?? 'medium',
    },
  })

  useEffect(() => {
    reset({
      title: task?.title ?? '',
      description: task?.description ?? '',
      category: task?.category ?? '',
      priority: task?.priority ?? 'medium',
    })
  }, [open, task, reset])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const submit = async (data: TaskFormData) => {
    await onSubmit(data)
  }

  return (
    <dialog
      ref={dialogRef}
      className="task-dialog"
      aria-labelledby="task-dialog-title"
      onCancel={(event) => {
        event.preventDefault()
        if (!isSubmitting) onClose()
      }}
      onClose={onClose}
    >
      <form className="task-dialog__form" onSubmit={handleSubmit(submit)} noValidate>
        <h2 id="task-dialog-title" className="task-dialog__title">
          {mode === 'create' ? 'Створити завдання' : 'Редагувати завдання'}
        </h2>
        <label className="task-dialog__field">
          <span>Назва</span>
          <input {...register('title')} aria-invalid={Boolean(errors.title)} />
          {errors.title && <span className="task-dialog__error" role="alert">{errors.title.message}</span>}
        </label>
        <label className="task-dialog__field">
          <span>Опис</span>
          <textarea {...register('description')} rows={4} />
        </label>
        <label className="task-dialog__field">
          <span>Категорія</span>
          <input {...register('category')} aria-invalid={Boolean(errors.category)} />
          {errors.category && <span className="task-dialog__error" role="alert">{errors.category.message}</span>}
        </label>
        <label className="task-dialog__field">
          <span>Пріоритет</span>
          <select {...register('priority')}>
            <option value="low">Низький</option>
            <option value="medium">Середній</option>
            <option value="high">Високий</option>
          </select>
        </label>
        <div className="task-dialog__actions">
          <button type="button" onClick={onClose} disabled={isSubmitting}>Скасувати</button>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Збереження...' : mode === 'create' ? 'Створити' : 'Зберегти'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
