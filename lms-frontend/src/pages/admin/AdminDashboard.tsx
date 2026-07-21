import { Link } from 'react-router-dom'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { Badge } from '../../components/ui/Badge'
import { useAdminStats } from '../../hooks/useDashboard'
import type { Role } from '../../types'

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 transition-colors">
      <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}

const roleBadge: Record<Role, 'default' | 'info' | 'warning'> = {
  ADMIN: 'warning',
  LECTURER: 'info',
  STUDENT: 'default',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats()

  return (
    <DashboardShell title="Dashboard">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Overview</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">System-wide statistics at a glance.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Users"
            value={isLoading ? '—' : (stats?.totalUsers ?? 0)}
            sub="Active accounts"
          />
          <StatCard
            label="Total Courses"
            value={isLoading ? '—' : (stats?.totalCourses ?? 0)}
            sub={isLoading ? '' : `${stats?.coursesByStatus?.PUBLISHED ?? 0} published`}
          />
          <StatCard
            label="Enrolments"
            value={isLoading ? '—' : (stats?.totalEnrolments ?? 0)}
            sub="All time"
          />
          <StatCard
            label="Draft Courses"
            value={isLoading ? '—' : (stats?.coursesByStatus?.DRAFT ?? 0)}
            sub="Not yet published"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 transition-colors">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-4">Courses by status</h3>
            {isLoading ? (
              <p className="text-sm text-gray-400 dark:text-slate-550">Loading…</p>
            ) : (
              <div className="space-y-3">
                {(['PUBLISHED', 'DRAFT', 'ARCHIVED'] as const).map(status => {
                  const count = stats?.coursesByStatus?.[status] ?? 0
                  const total = stats?.totalCourses ?? 1
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0
                  const colour = status === 'PUBLISHED' ? 'bg-green-500' : status === 'DRAFT' ? 'bg-amber-400' : 'bg-gray-305'
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-xs text-gray-600 dark:text-slate-400 mb-1">
                        <span>{status}</span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-800">
                        <div className={`h-2 rounded-full ${colour}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent users */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200">Recent users</h3>
              <Link to="/admin/users" className="text-xs text-indigo-650 dark:text-indigo-400 hover:underline">View all</Link>
            </div>
            {isLoading ? (
              <p className="text-sm text-gray-400 dark:text-slate-550">Loading…</p>
            ) : !stats?.recentUsers.length ? (
              <p className="text-sm text-gray-400 dark:text-slate-550">No users yet.</p>
            ) : (
              <ul className="space-y-2">
                {stats.recentUsers.map(u => (
                  <li key={u.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{u.name}</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500">{u.email} · {formatDate(u.createdAt)}</p>
                    </div>
                    <Badge variant={roleBadge[u.role]}>{u.role}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 transition-colors">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-4">Quick actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/users" className="text-sm text-indigo-650 dark:text-indigo-400 hover:underline font-semibold">Manage users →</Link>
            <Link to="/admin/courses" className="text-sm text-indigo-650 dark:text-indigo-400 hover:underline font-semibold">Manage courses →</Link>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
