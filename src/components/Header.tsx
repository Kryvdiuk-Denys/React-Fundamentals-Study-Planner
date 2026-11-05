interface HeaderProps {
  isDarkTheme: boolean
  onThemeToggle: () => void
}

function Header({ isDarkTheme, onThemeToggle }: HeaderProps) {
  return (
    <header className="app-header">
      <div>
        <h1 className="app-header__title">Study Planner</h1>
        <p className="app-header__description">
          Плануй справи, відмічай зроблене.
        </p>
      </div>
      <button
        className="app-header__theme-toggle"
        type="button"
        aria-label={isDarkTheme ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
        aria-pressed={isDarkTheme}
        onClick={onThemeToggle}
      >
        {isDarkTheme ? 'Світла тема' : 'Темна тема'}
      </button>
    </header>
  )
}

export default Header
