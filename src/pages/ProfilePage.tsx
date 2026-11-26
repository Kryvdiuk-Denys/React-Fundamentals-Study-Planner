import { useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/tasks', { replace: true })
  }

  return (
    <section className="profile-page">
      <h1>Профіль</h1>
      <p><strong>Username:</strong> {user?.username ?? 'Невідомо'}</p>
      {user?.email && <p><strong>Email:</strong> {user.email}</p>}
      <p><strong>Статус:</strong> {isAuthenticated ? 'Авторизований' : 'Гість'}</p>
      <button type="button" onClick={handleLogout}>Logout</button>
    </section>
  )
}
