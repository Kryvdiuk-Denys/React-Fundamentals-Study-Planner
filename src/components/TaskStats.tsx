interface TaskStatsProps {
  total: number
  completed: number
  pending: number
}

function TaskStats({ total, completed, pending }: TaskStatsProps) {
  return (
    <section className="task-stats" aria-label="Статистика завдань">
      <article className="task-stats__card">
        <span className="task-stats__icon" aria-hidden="true">
          #
        </span>
        <div>
          <strong className="task-stats__value">{total}</strong>
          <span className="task-stats__label">Усього завдань</span>
        </div>
      </article>
      <article className="task-stats__card task-stats__card--completed">
        <span className="task-stats__icon" aria-hidden="true">
          ✓
        </span>
        <div>
          <strong className="task-stats__value">{completed}</strong>
          <span className="task-stats__label">Виконано</span>
        </div>
      </article>
      <article className="task-stats__card task-stats__card--pending">
        <span className="task-stats__icon" aria-hidden="true">
          ◷
        </span>
        <div>
          <strong className="task-stats__value">{pending}</strong>
          <span className="task-stats__label">У процесі</span>
        </div>
      </article>
    </section>
  )
}

export default TaskStats
