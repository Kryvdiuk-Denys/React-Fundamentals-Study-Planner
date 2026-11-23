import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router'
import { loginSchema, type LoginFormData } from '../schemas/authSchema'
import { useAuth } from '../context/AuthContext'
import { normalizeApiError } from '../api/httpClient'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: string } | null)?.from ?? '/tasks'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, location.state, navigate])

  const submit = async (data: LoginFormData) => {
    try {
      await login(data.username, data.password)
      const from = (location.state as { from?: string } | null)?.from ?? '/tasks'
      navigate(from, { replace: true })
    } catch (error) {
      const normalized = normalizeApiError(error)
      setError('root', { message: normalized.message })
    }
  }

  return (
    <section className="login-page">
      <h1>Вхід</h1>
      <form onSubmit={handleSubmit(submit)} noValidate>
        <label>
          Username
          <input {...register('username')} autoComplete="username" />
          {errors.username && <span role="alert">{errors.username.message}</span>}
        </label>
        <label>
          Password
          <input {...register('password')} type="password" autoComplete="current-password" />
          {errors.password && <span role="alert">{errors.password.message}</span>}
        </label>
        {errors.root && <p role="alert">{errors.root.message}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Вхід...' : 'Увійти'}
        </button>
      </form>
    </section>
  )
}
