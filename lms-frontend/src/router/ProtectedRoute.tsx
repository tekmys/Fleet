import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { Role } from '../types'

interface ProtectedRouteProps {
  role?: Role | Role[]
}

export function ProtectedRoute({ role }: ProtectedRouteProps) {
  const { user, accessToken } = useAuthStore()

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />
  }

  if (role) {
    const allowed = Array.isArray(role) ? role : [role]
    if (!allowed.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return <Outlet />
}
