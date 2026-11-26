import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import TasksPage from './pages/TasksPage'
import TaskDetailsPage from './pages/TaskDetailsPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/tasks" replace />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:taskId" element={<TaskDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile"element={ <ProtectedRoute> <ProfilePage /> </ProtectedRoute>}/>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
