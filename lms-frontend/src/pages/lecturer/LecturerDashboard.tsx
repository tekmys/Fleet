import { Link } from 'react-router-dom'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { Badge } from '../../components/ui/Badge'
import { useAuthStore } from '../../store/authStore'
import { useLecturerStats } from '../../hooks/useDashboard'

function StatCard({ label, value, sub, highlight }: { label: string; value: string | number; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-6 transition-colors ${
      highlight 
        ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30' 
        : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800'
    }`}>
      <p className={`text-sm font-medium ${highlight ? 'text-amber-700 dark:text-amber-400' : 'text-gray-500 dark:text-slate-400'}`}>{label}</p>
      <p className={`text-3xl font-bold mt-1 ${highlight ? 'text-amber-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}>{value}</p>
      {sub && <p className={`text-xs mt-1 ${highlight ? 'text-amber-600 dark:text-amber-500' : 'text-gray-400 dark:text-slate-500'}`}>{sub}</p>}
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function LecturerDashboard() {
  const user = useAuthStore((s) => s.user)
  const { data: stats, isLoading } = useLecturerStats()

  return (
    <DashboardShell title="Dashboard">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Good day, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Here's what's happening with your courses.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="My Courses"
            value={isLoading ? '—' : (stats?.totalCourses ?? 0)}
            sub="Published + drafts"
          />
          <StatCard
            label="Students Enrolled"
            value={isLoading ? '—' : (stats?.totalStudents ?? 0)}
            sub="Across all courses"
          />
          <StatCard
            label="Assignments"
            value={isLoading ? '—' : (stats?.totalAssignments ?? 0)}
            sub="Total created"
          />
          <StatCard
            label="Pending Grades"
            value={isLoading ? '—' : (stats?.pendingSubmissions ?? 0)}
            sub="Awaiting review"
            highlight={(stats?.pendingSubmissions ?? 0) > 0}
          />
        </div>

        {/* Recent submissions */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200">Recent submissions</h3>
            <Link to="/lecturer/courses" className="text-xs text-indigo-650 dark:text-indigo-400 hover:underline">Go to courses →</Link>
          </div>
          {isLoading ? (
            <p className="text-sm text-gray-400 dark:text-slate-550">Loading…</p>
          ) : !stats?.recentSubmissions?.length ? (
            <p className="text-sm text-gray-400 dark:text-slate-550">No submissions yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-slate-800">
              {stats.recentSubmissions.map(sub => (
                <li key={sub.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{sub.student.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{sub.assignment.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 dark:text-slate-500">{formatDate(sub.submittedAt)}</p>
                    <Link
                      to={`/lecturer/courses/${sub.assignment.courseId}/assignments`}
                      className="text-xs text-indigo-650 dark:text-indigo-400 hover:underline font-semibold"
                    >
                      Grade →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* AI tools */}
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-slate-950/20 dark:to-indigo-950/20 rounded-xl border border-primary-100 dark:border-slate-800 p-6 transition-colors">
          <h3 className="text-sm font-bold text-indigo-800 dark:text-indigo-400 mb-1">AI Teaching Tools</h3>
          <p className="text-sm text-indigo-900/80 dark:text-slate-300 mb-3">
            Generate quizzes, summarise materials, and get AI-assisted grading feedback.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="info">Quiz Generator</Badge>
            <Badge variant="info">Summarise Material</Badge>
            <Badge variant="info">Grade Feedback</Badge>
          </div>
          <p className="text-xs text-indigo-600/70 dark:text-slate-500 mt-3 font-medium">Available from each course's assignments page.</p>
        </div>
      </div>
    </DashboardShell>
  )
}
