import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { useAuthStore } from '../../store/authStore'
import { useLecturerStats } from '../../hooks/useDashboard'
import { useCourses } from '../../hooks/useCourses'

function StatCard({ label, value, sub, highlight }: { label: string; value: string | number; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 transition-all glass-card-hover ${
      highlight 
        ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 shadow-sm' 
        : 'glass-card shadow-sm'
    }`}>
      <p className={`text-[11px] font-bold uppercase tracking-wider ${highlight ? 'text-amber-700 dark:text-amber-400' : 'text-gray-400 dark:text-slate-500'}`}>{label}</p>
      <p className={`text-3xl font-extrabold mt-1.5 ${highlight ? 'text-amber-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}>{value}</p>
      {sub && <p className={`text-[10px] font-medium mt-1 ${highlight ? 'text-amber-600 dark:text-amber-500' : 'text-gray-400 dark:text-slate-500'}`}>{sub}</p>}
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function LecturerDashboard() {
  const user = useAuthStore((s) => s.user)
  const { data: stats, isLoading: statsLoading } = useLecturerStats()
  const { data: coursesData, isLoading: coursesLoading } = useCourses()
  const [selectedCourse, setSelectedCourse] = useState<string>('')

  const isLoading = statsLoading || coursesLoading
  const courses = coursesData?.courses ?? []

  // Grading queue details
  const totalSubs = stats?.totalSubmissions ?? 0
  const gradedSubs = stats?.gradedSubmissions ?? 0
  const pendingSubs = stats?.pendingSubmissions ?? 0
  const pctGraded = totalSubs > 0 ? Math.round((gradedSubs / totalSubs) * 100) : 0

  // Chart data
  const chartData = [
    { name: 'Graded', count: gradedSubs },
    { name: 'Pending Review', count: pendingSubs },
  ]

  return (
    <DashboardShell title="Dashboard">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Good day, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-xs text-gray-550 dark:text-slate-400 mt-0.5">Here's a telemetry overview of your class sections.</p>
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
            sub="Across all cohorts"
          />
          <StatCard
            label="Assignments"
            value={isLoading ? '—' : (stats?.totalAssignments ?? 0)}
            sub="Total created"
          />
          <StatCard
            label="Pending Grades"
            value={isLoading ? '—' : pendingSubs}
            sub="Awaiting evaluation"
            highlight={pendingSubs > 0}
          />
        </div>

        {/* Main Dashboard Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Workload Progress & Recharts analytics */}
          <div className="col-span-12 lg:col-span-5 glass-card rounded-xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="border-b border-gray-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 flex items-center gap-2">
                  <span>📊</span>
                  <span>Grading Workload Queue</span>
                </h3>
              </div>
              
              {isLoading ? (
                <div className="space-y-4 py-8">
                  <div className="h-12 bg-gray-55/10 rounded animate-pulse" />
                  <div className="h-12 bg-gray-55/10 rounded animate-pulse" />
                </div>
              ) : totalSubs === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-slate-500 space-y-1">
                  <span className="text-2xl">📋</span>
                  <p className="text-sm font-medium">No student submissions</p>
                  <p className="text-xs">Submissions will populate analytics.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Recharts chart */}
                  <div className="w-full flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/20 py-2.5 rounded-lg border border-slate-100 dark:border-slate-900">
                    <ResponsiveContainer width="100%" height={130}>
                      <BarChart layout="vertical" data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} width={90} />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14}>
                          {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f59e0b'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Tailwind Workload Progress bar */}
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between text-[11px] font-bold text-gray-400 dark:text-slate-550">
                      <span>QUEUE PROGRESS</span>
                      <span>{pctGraded}% ({gradedSubs} / {totalSubs} graded)</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden border border-gray-150 dark:border-slate-850">
                      <div className="h-full bg-indigo-650 dark:bg-indigo-500 transition-all duration-500" style={{ width: `${pctGraded}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent submissions list */}
          <div className="col-span-12 lg:col-span-7 glass-card rounded-xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 flex items-center gap-2">
                  <span>📥</span>
                  <span>Recent Submissions</span>
                </h3>
                <Link to="/lecturer/courses" className="text-xs font-semibold text-indigo-650 dark:text-indigo-400 hover:text-indigo-855 dark:hover:text-indigo-300">
                  Manage Sections →
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-10 bg-gray-55/10 rounded animate-pulse" />
                  <div className="h-10 bg-gray-55/10 rounded animate-pulse" />
                </div>
              ) : !stats?.recentSubmissions?.length ? (
                <div className="text-center py-12 text-gray-400 dark:text-slate-500 space-y-1">
                  <span className="text-2xl">📝</span>
                  <p className="text-sm font-medium">No submissions yet</p>
                  <p className="text-xs">Roster uploads will appear here.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-slate-800">
                  {stats.recentSubmissions.map(sub => (
                    <li key={sub.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{sub.student.name}</p>
                        <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">{sub.assignment.title}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] text-gray-400 dark:text-slate-550">{formatDate(sub.submittedAt)}</p>
                        <Link
                          to={`/lecturer/courses/${sub.assignment.courseId}/assignments?gradeSubmissionId=${sub.id}`}
                          className="text-xs text-indigo-650 dark:text-indigo-400 hover:underline font-bold mt-1 inline-block"
                        >
                          Launch Grader →
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* AI Teaching Tools Control Panel */}
        <div className="bg-gradient-to-r from-indigo-50/70 to-blue-50/70 dark:from-slate-950/20 dark:to-indigo-950/20 rounded-xl border border-indigo-100 dark:border-slate-800/60 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-indigo-950 dark:text-indigo-300 text-sm">AI Teaching Assistant</h3>
              <p className="text-xs text-indigo-900/60 dark:text-slate-400 leading-relaxed">
                Generate quizzes, summarise files, and receive auto-grading suggestions based on course rubrics.
              </p>
            </div>
          </div>

          {!isLoading && courses.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-indigo-100/50 dark:border-slate-800/40">
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-[10px] font-bold text-indigo-950/65 dark:text-slate-500 uppercase tracking-wider mb-1.5">Select Course to Launch AI Tool:</label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-slate-900 border border-indigo-150/60 dark:border-slate-800/80 px-3 py-2.5 rounded-lg text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="">-- Select academic program --</option>
                    {courses.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  to={selectedCourse ? `/lecturer/courses/${selectedCourse}/assignments?openAiTool=quiz` : '#'}
                  onClick={(e) => !selectedCourse && e.preventDefault()}
                >
                  <button
                    disabled={!selectedCourse}
                    className={`text-[11px] font-bold px-3.5 py-2.5 rounded-lg border transition-all cursor-pointer shadow-sm hover:shadow ${
                      selectedCourse
                        ? 'bg-white border-indigo-150 text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-850'
                        : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed dark:bg-slate-900/50 dark:border-slate-850 dark:text-slate-655'
                    }`}
                  >
                    🤖 Quiz Generator
                  </button>
                </Link>

                <Link
                  to={selectedCourse ? `/lecturer/courses/${selectedCourse}/assignments?openAiTool=summarise` : '#'}
                  onClick={(e) => !selectedCourse && e.preventDefault()}
                >
                  <button
                    disabled={!selectedCourse}
                    className={`text-[11px] font-bold px-3.5 py-2.5 rounded-lg border transition-all cursor-pointer shadow-sm hover:shadow ${
                      selectedCourse
                        ? 'bg-white border-indigo-150 text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-850'
                        : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed dark:bg-slate-900/50 dark:border-slate-850 dark:text-slate-655'
                    }`}
                  >
                    📚 Summarise Material
                  </button>
                </Link>

                <Link
                  to={selectedCourse ? `/lecturer/courses/${selectedCourse}/assignments?openAiTool=grade` : '#'}
                  onClick={(e) => !selectedCourse && e.preventDefault()}
                >
                  <button
                    disabled={!selectedCourse}
                    className={`text-[11px] font-bold px-3.5 py-2.5 rounded-lg border transition-all cursor-pointer shadow-sm hover:shadow ${
                      selectedCourse
                        ? 'bg-white border-indigo-150 text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-850'
                        : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed dark:bg-slate-900/50 dark:border-slate-850 dark:text-slate-655'
                    }`}
                  >
                    📝 Auto-Grade Assistant
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
