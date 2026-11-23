import { Outlet } from 'react-router'
import Header from '../components/Header'
import Toast from '../components/Toast'
import useTaskContext from '../hooks/useTaskContext'
import useLocalStorage from '../hooks/useLocalStorage'
import '../styles/app.scss'

export default function AppLayout() {
  const [isDarkTheme, setIsDarkTheme] = useLocalStorage('study-planner.theme', false)
  const { toast, dismissToast } = useTaskContext()

  return (
    <div className={`app-shell${isDarkTheme ? ' app-shell--dark' : ''}`}>
      <div className="app">
        <Header
          isDarkTheme={isDarkTheme}
          onThemeToggle={() => setIsDarkTheme((currentTheme) => !currentTheme)}
        />
        <main>
          <Outlet />
        </main>
        <Toast toast={toast} onDismiss={dismissToast} />
      </div>
    </div>
  )
}
