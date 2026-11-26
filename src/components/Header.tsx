import './Header.scss'
import { NavLink, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

interface HeaderProps {
  isDarkTheme: boolean
  onThemeToggle: () => void
}

function Header({ isDarkTheme, onThemeToggle }: HeaderProps) {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/tasks', { replace: true })
  }

  return (
    <header className="app-header">
      <div>
        <h1 className="app-header__title">Study Planner</h1>
      </div>
      <nav className="app-header__nav" aria-label="Основна навігація">
        <NavLink to="/tasks">Tasks</NavLink>
        <NavLink to="/profile">Profile</NavLink>
        {isAuthenticated ? (
          <button type="button" onClick={handleLogout}>Logout</button>
        ) : (
          <NavLink to="/login" state={{ from: location.pathname + location.search }}>Login</NavLink>
        )}
        <button
          className="app-header__theme-toggle"
          type="button"
          aria-label={isDarkTheme ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
          aria-pressed={isDarkTheme}
          onClick={onThemeToggle}
        >
          {isDarkTheme ? 'Світла тема' : 'Темна тема'}
        </button>
      </nav>
    </header>
  )
}

export default Header
