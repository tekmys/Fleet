import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/auth.service'

export function useAuth() {
  const { user, accessToken, refreshToken, setAuth, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const isAuthenticated = !!accessToken && !!user

  async function login(email: string, password: string) {
    const result = await authService.login(email, password)
    setAuth(result.user, result.accessToken, result.refreshToken)

    const role = result.user.role
    if (role === 'ADMIN') navigate('/admin/dashboard', { replace: true })
    else if (role === 'LECTURER') navigate('/lecturer/dashboard', { replace: true })
    else navigate('/student/dashboard', { replace: true })
  }

  async function register(name: string, email: string, password: string, roleInput: string) {
    const result = await authService.register(name, email, password, roleInput)
    setAuth(result.user, result.accessToken, result.refreshToken)

    const role = result.user.role
    if (role === 'ADMIN') navigate('/admin/dashboard', { replace: true })
    else if (role === 'LECTURER') navigate('/lecturer/dashboard', { replace: true })
    else navigate('/student/dashboard', { replace: true })
  }

  async function logout() {
    if (refreshToken) {
      try {
        await authService.logout(refreshToken)
      } catch {
        // best-effort
      }
    }
    clearAuth()
    navigate('/login', { replace: true })
  }

  return { user, isAuthenticated, login, register, logout }
}
