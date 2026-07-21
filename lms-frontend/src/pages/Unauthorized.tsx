import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useAuthStore } from '../store/authStore'

export function Unauthorized() {
  const user = useAuthStore((s) => s.user)

  const home =
    user?.role === 'ADMIN'
      ? '/admin/dashboard'
      : user?.role === 'LECTURER'
        ? '/lecturer/dashboard'
        : '/student/dashboard'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-red-500">403</p>
        <h1 className="mt-4 text-2xl font-semibold text-gray-900">Access denied</h1>
        <p className="mt-2 text-sm text-gray-500">
          You don't have permission to view this page.
        </p>
        <div className="mt-6">
          <Link to={user ? home : '/login'}>
            <Button>{user ? 'Back to dashboard' : 'Sign in'}</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
