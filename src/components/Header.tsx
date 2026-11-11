import './Header.scss'

interface HeaderProps {
  isDarkTheme: boolean
  onThemeToggle: () => void
}

function Header({ isDarkTheme, onThemeToggle }: HeaderProps) {
  return (
    <header className="app-header">
      <div>
        <h1 className="app-header__title">Study Planner</h1>
       
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
