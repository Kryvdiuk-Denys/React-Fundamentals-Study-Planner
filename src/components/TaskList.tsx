import type { Task } from '../types/task'
import TaskItem from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  emptyMessage: string
  onToggleTask: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
}

function TaskList({
  tasks,
  emptyMessage,
  onToggleTask,
  onDeleteTask,
}: TaskListProps) {
  return (
    <section className="task-list" aria-label="Список навчальних завдань">
      {tasks.length === 0 ? (
        <div className="task-list__empty">
          <h2 className="task-list__empty-title">{emptyMessage}</h2>
          <p className="task-list__empty-description">
            Твій навчальний план оновлюватиметься тут.
          </p>
        </div>
      ) : (
        tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggleTask}
            onDelete={onDeleteTask}
          />
        ))
      )}
    </section>
  )
}

export default TaskList
