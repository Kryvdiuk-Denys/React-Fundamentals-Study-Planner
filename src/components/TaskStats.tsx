interface TaskStatsProps {
  total: number
  completed: number
  pending: number
}

function TaskStats({ total, completed, pending }: TaskStatsProps) {
  return (
    <section className="task-stats" aria-label="Статистика завдань">
      <div className="task-stats__item">
        <article className="task-stats__card">
          <div className="task-stats__content">
            <h2 className="task-stats__label">Усього завдань</h2>
            <strong className="task-stats__value">{total}</strong>
            <span className="task-stats__note">У твоєму списку</span>
          </div>
        </article>
      </div>
      <div className="task-stats__item">
        <article className="task-stats__card task-stats__card--completed">
          <div className="task-stats__content">
            <h2 className="task-stats__label">Виконано</h2>
            <strong className="task-stats__value">{completed}</strong>
            <span className="task-stats__note">Готові справи</span>
          </div>
        </article>
      </div>
      <div className="task-stats__item">
        <article className="task-stats__card task-stats__card--pending">
          <div className="task-stats__content">
            <h2 className="task-stats__label">У процесі</h2>
            <strong className="task-stats__value">{pending}</strong>
            <span className="task-stats__note">Ще попереду</span>
          </div>
        </article>
      </div>
    </section>
  )
}

export default TaskStats
