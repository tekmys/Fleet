import { Link } from 'react-router-dom'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { Badge } from '../../components/ui/Badge'
import { useAuthStore } from '../../store/authStore'
import { useStudentStats } from '../../hooks/useDashboard'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function daysUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  return `Due in ${days}d`
}

function avgGrade(grades: { score: number; submission: { assignment: { maxScore: number } } }[]) {
  if (!grades.length) return null
  const total = grades.reduce((sum, g) => sum + (g.score / g.submission.assignment.maxScore) * 100, 0)
  return Math.round(total / grades.length)
}

export function StudentDashboard() {
  const user = useAuthStore((s) => s.user)
  const { data: stats, isLoading } = useStudentStats()

  const avg = stats?.recentGrades ? avgGrade(stats.recentGrades) : null

  // Determine grade remark
  let gradeRemark = 'No Grades'
  if (avg !== null) {
    if (avg >= 85) gradeRemark = 'Excellent (A)'
    else if (avg >= 70) gradeRemark = 'Good (B)'
    else if (avg >= 50) gradeRemark = 'Passing (C/D)'
    else gradeRemark = 'Needs Focus (F)'
  }

  return (
    <DashboardShell title="Dashboard">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Welcome Academic Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-20 -translate-y-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-1.5">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">STUDENT PORTAL</span>
            <h2 className="text-2xl font-extrabold text-white leading-none">
              Welcome back, {user?.name}
            </h2>
            <p className="text-xs text-slate-400">
              AI LMS Portal · Department of Computer Science / IT
            </p>
          </div>
          
          <div className="flex-shrink-0 flex items-center gap-2 relative z-10 text-xs bg-slate-800/40 border border-slate-800 px-3.5 py-2 rounded-xl text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Academic Term: Summer 2026</span>
          </div>
        </div>

        {/* Stats metrics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm space-y-1 flex justify-between items-center group hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Enrolled Courses</p>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{isLoading ? '—' : (stats?.totalEnrolledCourses ?? 0)}</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">Active curriculum</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm space-y-1 flex justify-between items-center group hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Submissions Completed</p>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{isLoading ? '—' : (stats?.totalSubmitted ?? 0)}</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">All assignments</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm space-y-1 flex justify-between items-center group hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Current Standing</p>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{isLoading ? '—' : (avg !== null ? `${avg}%` : '—')}</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{gradeRemark}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 00-2 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>

        </div>

        {/* Dashboard Split Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Upcoming deadlines */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-slate-850 pb-3">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <span>📅</span>
                  <span>Upcoming Assignments</span>
                </h3>
                <Link to="/student/courses" className="text-xs font-semibold text-indigo-650 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
                  View Syllabus →
                </Link>
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-10 bg-gray-50 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-10 bg-gray-50 dark:bg-slate-800 rounded animate-pulse" />
                </div>
              ) : !stats?.upcomingAssignments.length ? (
                <div className="text-center py-12 text-gray-400 dark:text-slate-500 space-y-1">
                  <span className="text-2xl">🎉</span>
                  <p className="text-sm font-medium">All caught up!</p>
                  <p className="text-xs">No pending deadlines for this term.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-slate-800 space-y-1">
                  {stats.upcomingAssignments.map(a => (
                    <li key={a.id} className="flex items-start justify-between gap-3 py-3 last:border-b-0">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">{a.title}</p>
                        <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                          Course Code: <span className="font-semibold">{a.course.code}</span> · {formatDate(a.dueDate)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide">{daysUntil(a.dueDate)}</span>
                        {a.submitted ? (
                          <Badge variant="success">Submitted</Badge>
                        ) : (
                          <Link to={`/student/courses/${a.courseId}/assignments`}>
                            <Badge variant="warning">Submit</Badge>
                          </Link>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Recent evaluations */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-slate-850 pb-3">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <span>🎓</span>
                  <span>Recent Grades & Feedback</span>
                </h3>
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-10 bg-gray-50 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-10 bg-gray-50 dark:bg-slate-800 rounded animate-pulse" />
                </div>
              ) : !stats?.recentGrades.length ? (
                <div className="text-center py-12 text-gray-400 dark:text-slate-500 space-y-1">
                  <span className="text-2xl">📝</span>
                  <p className="text-sm font-medium">No evaluations yet</p>
                  <p className="text-xs">Your graded tasks will appear here.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-slate-800 space-y-1">
                  {stats.recentGrades.map(g => {
                    const pct = Math.round((g.score / g.submission.assignment.maxScore) * 100)
                    const colour = pct >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/30' : pct >= 65 ? 'text-amber-700 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/30' : 'text-rose-700 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-950/30 dark:border-rose-900/30'
                    return (
                      <li key={g.id} className="flex items-center justify-between py-3 last:border-b-0">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{g.submission.assignment.title}</p>
                          <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">{formatDate(g.updatedAt)}</p>
                        </div>
                        <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${colour} shrink-0`}>
                          {g.score} / {g.submission.assignment.maxScore}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>

        </div>

        {/* AI Assistant Help Banner */}
        <div className="bg-gradient-to-r from-violet-50/70 via-purple-50/70 to-indigo-50/70 dark:from-slate-900/70 dark:via-indigo-950/20 dark:to-blue-950/20 backdrop-blur-md border border-violet-100/50 dark:border-slate-800/45 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm hover:scale-[1.005] transition-transform duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-indigo-950 dark:text-indigo-200 text-sm">Need help studying for assignments?</h3>
              <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed mt-0.5">
                The AI Study Assistant is grounded directly in your syllabus and ready to assist you.
              </p>
            </div>
          </div>
          <Link to="/student/courses" className="shrink-0 w-full sm:w-auto">
            <button className="w-full text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 px-4 py-2.5 rounded-lg shadow transition-all border-0 cursor-pointer">
              💬 Launch Study Assistant
            </button>
          </Link>
        </div>

      </div>
    </DashboardShell>
  )
}
