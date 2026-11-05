function Header() {
  return (
    <header className="app-header">
      <div>
        <p className="app-header__eyebrow">Навчайся у власному ритмі</p>
        <h1 className="app-header__title">Study Planner</h1>
        <p className="app-header__description">
          Усі навчальні цілі — в одному зручному місці.
        </p>
      </div>
      <span className="app-header__badge">Мій навчальний план</span>
    </header>
  )
}

export default Header
