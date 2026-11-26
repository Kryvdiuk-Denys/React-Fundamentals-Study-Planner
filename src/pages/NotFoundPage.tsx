import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <section>
      <h1>404</h1>
      <p>Сторінку не знайдено.</p>
      <Link to="/tasks">Повернутися до завдань</Link>
    </section>
  )
}
