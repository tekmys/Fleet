import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Select } from '../../components/ui/Select'
import { SkeletonTable } from '../../components/ui/Skeleton'
import { useCourseAtRiskStudents } from '../../hooks/useCourses'
import { useAssignments, useAiLearningAnalytics } from '../../hooks/useAssignments'
import type { LearningAnalyticsResponse } from '../../services/ai.service'

export function CourseAnalytics() {
  const { courseId } = useParams<{ courseId: string }>()
  const { data: atRiskStudents = [], isLoading, isError } = useCourseAtRiskStudents(courseId!)
  const { data: assignments = [] } = useAssignments(courseId!)
  
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('')
  const [analyticsResult, setAnalyticsResult] = useState<LearningAnalyticsResponse | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState('')
  const aiLearningAnalytics = useAiLearningAnalytics()

  async function handleAnalyze() {
    if (!selectedAssignmentId) return
    setAnalyticsLoading(true)
    setAnalyticsError('')
    setAnalyticsResult(null)
    try {
      const result = await aiLearningAnalytics.mutateAsync(selectedAssignmentId)
      setAnalyticsResult(result)
    } catch (err: any) {
      setAnalyticsError(err?.response?.data?.message ?? 'Failed to generate learning analytics')
    } finally {
      setAnalyticsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardShell title="Course Analytics">
        <div className="max-w-5xl mx-auto space-y-5">
          <div className="h-10 w-48 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
          <SkeletonTable rows={5} />
        </div>
      </DashboardShell>
    )
  }

  // Count risk levels
  const highRiskCount = atRiskStudents.filter((s) => s.riskLevel === 'HIGH').length
  const mediumRiskCount = atRiskStudents.filter((s) => s.riskLevel === 'MEDIUM').length
  const lowRiskCount = atRiskStudents.filter((s) => s.riskLevel === 'LOW').length

  return (
    <DashboardShell title="Course Analytics">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">
              <Link to="/lecturer/courses" className="hover:text-gray-700 dark:hover:text-slate-200 transition-colors">My Courses</Link>
              <span className="text-gray-300 dark:text-slate-750">/</span>
              <Link to={`/lecturer/courses/${courseId}/assignments`} className="hover:text-gray-700 dark:hover:text-slate-200 transition-colors">
                Assignments
              </Link>
              <span className="text-gray-300 dark:text-slate-750">/</span>
              <span className="text-gray-900 dark:text-white font-bold">Analytics</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Predictive Analytics & Risk Radar</h1>
            <p className="text-xs text-gray-500 dark:text-slate-450 mt-1">
              Early-warning system tracking student deadlines, grades, and portal inactivity.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to={`/lecturer/courses/${courseId}/gradebook`}>
              <Button variant="secondary" className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">Gradebook</Button>
            </Link>
            <Link to={`/lecturer/courses/${courseId}/assignments`}>
              <Button variant="ghost" className="dark:text-slate-350 dark:hover:bg-slate-800">Back to assignments</Button>
            </Link>
          </div>
        </div>

        {/* Risk Level Summaries */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 dark:bg-rose-955/15 border border-red-200 dark:border-rose-900/20 rounded-xl p-5 flex items-center justify-between shadow-sm transition-colors">
            <div>
              <p className="text-sm font-semibold text-red-850 dark:text-rose-350">Critical Risk Students</p>
              <p className="text-xs text-red-600 dark:text-rose-450 mt-1">Requires immediate outreach</p>
            </div>
            <div className="text-3xl font-extrabold text-red-900 dark:text-rose-400">{highRiskCount}</div>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-955/15 border border-amber-205 dark:border-amber-900/20 rounded-xl p-5 flex items-center justify-between shadow-sm transition-colors">
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-350">Medium Risk Students</p>
              <p className="text-xs text-amber-600 dark:text-amber-450 mt-1">Needs monitoring & support</p>
            </div>
            <div className="text-3xl font-extrabold text-amber-900 dark:text-amber-400">{mediumRiskCount}</div>
          </div>
          
          <div className="bg-green-50 dark:bg-emerald-955/15 border border-green-200 dark:border-emerald-900/20 rounded-xl p-5 flex items-center justify-between shadow-sm transition-colors">
            <div>
              <p className="text-sm font-semibold text-green-800 dark:text-emerald-350">On Track / Low Risk</p>
              <p className="text-xs text-green-600 dark:text-emerald-455 mt-1">Healthy course engagement</p>
            </div>
            <div className="text-3xl font-extrabold text-green-900 dark:text-emerald-400">{lowRiskCount}</div>
          </div>
        </div>

        {/* AI Cohort Insights Panel */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI Learning Analytics & Cohort Insights</h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
            Select an assignment to run an AI analysis on the cohort's submissions to discover common conceptual misconceptions and get re-teaching suggestions.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-end max-w-xl">
            <div className="flex-1">
              <Select
                label="Select Assignment"
                value={selectedAssignmentId}
                onChange={(e) => setSelectedAssignmentId(e.target.value)}
                options={[
                  { value: '', label: 'Select an assignment...' },
                  ...assignments.map(a => ({ value: a.id, label: a.title }))
                ]}
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!selectedAssignmentId || analyticsLoading}
            >
              {analyticsLoading ? 'Generating Analysis...' : '✨ Run AI Cohort Analysis'}
            </Button>
          </div>

          {analyticsError && (
            <div className="rounded-lg bg-red-50 dark:bg-rose-950/20 border border-red-200 dark:border-rose-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-400 font-semibold">
              {analyticsError}
            </div>
          )}

          {analyticsResult && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-gray-100 dark:border-slate-800 animate-fadeIn">
              <div className="lg:col-span-1 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-5 space-y-2 transition-colors">
                <span className="text-[10px] font-bold text-indigo-850 dark:text-indigo-400 uppercase tracking-wider block">Cohort Overall Trend</span>
                <p className="text-xs text-indigo-900 dark:text-slate-205 leading-relaxed font-bold">
                  {analyticsResult.overallTrend}
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-955/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-5 space-y-3 transition-colors">
                <span className="text-[10px] font-bold text-amber-850 dark:text-amber-400 uppercase tracking-wider block">Common Misconceptions</span>
                {analyticsResult.misconceptions.length === 0 ? (
                  <p className="text-sm text-amber-900 dark:text-amber-400 italic">No significant misconceptions identified.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {analyticsResult.misconceptions.map((m, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/30 rounded-lg p-2.5 text-xs text-amber-955 dark:text-amber-300 font-bold shadow-sm flex items-start gap-2">
                        <span className="text-amber-500 flex-shrink-0">⚠️</span>
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-955/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-5 space-y-3 transition-colors">
                <span className="text-[10px] font-bold text-emerald-850 dark:text-emerald-400 uppercase tracking-wider block">Re-teaching Suggestions</span>
                {analyticsResult.suggestions.length === 0 ? (
                  <p className="text-sm text-emerald-950 dark:text-emerald-450 italic">All clear! No recommendations needed.</p>
                ) : (
                  <ul className="space-y-2">
                    {analyticsResult.suggestions.map((s, i) => (
                      <li key={i} className="text-xs text-emerald-900 dark:text-emerald-300 flex items-start gap-2 leading-relaxed font-semibold">
                        <span className="text-emerald-500 font-bold flex-shrink-0">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Analytics Breakdown Table */}
        {isError ? (
          <div className="text-center py-16 text-rose-500 font-semibold bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">Failed to load analytics dashboard.</div>
        ) : atRiskStudents.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 py-16 text-center shadow-sm">
            <p className="text-gray-500 dark:text-slate-450 font-semibold">No students are currently enrolled in this course.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-250 dark:divide-slate-800 text-sm">
                <thead className="bg-gray-50 dark:bg-slate-850/30">
                  <tr>
                    <th className="px-5 py-3.5 text-left font-semibold text-gray-700 dark:text-slate-300">Student Info</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-gray-700 dark:text-slate-300">Risk Radar</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-gray-700 dark:text-slate-300">Missed Deadlines</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-gray-700 dark:text-slate-300">Grade Average</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-gray-700 dark:text-slate-300">Last Active</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-gray-700 dark:text-slate-300">Primary Risk Triggers</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-gray-700 dark:text-slate-300">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {atRiskStudents.map((row) => {
                    const badgeMap = {
                      HIGH: { variant: 'danger' as const, label: '🚨 Critical' },
                      MEDIUM: { variant: 'warning' as const, label: '⚠️ Warning' },
                      LOW: { variant: 'success' as const, label: '🟢 Low Risk' },
                    }
                    const badge = badgeMap[row.riskLevel]

                    return (
                      <tr key={row.student.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/15 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900 dark:text-white">{row.student.name}</div>
                          <div className="text-xs text-gray-400 dark:text-slate-500">{row.student.email}</div>
                        </td>
                        
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                        
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          {row.missedAssignmentsCount > 0 ? (
                            <span className="font-bold text-rose-600 dark:text-rose-450">
                              {row.missedAssignmentsCount} / {row.overdueAssignmentsCount}
                            </span>
                          ) : row.overdueAssignmentsCount > 0 ? (
                            <span className="font-bold text-emerald-700 dark:text-emerald-450">
                              0 / {row.overdueAssignmentsCount}
                            </span>
                          ) : (
                            <span className="text-gray-300 dark:text-slate-700">—</span>
                          )}
                        </td>
                        
                        <td className="px-5 py-4 text-center whitespace-nowrap font-bold">
                          {row.averageGrade !== null ? (
                            <span className={row.averageGrade < 55 ? 'text-rose-605 dark:text-rose-400' : row.averageGrade < 75 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}>
                              {row.averageGrade}%
                            </span>
                          ) : (
                            <span className="text-gray-300 dark:text-slate-700">—</span>
                          )}
                        </td>
                        
                        <td className="px-5 py-4 text-center whitespace-nowrap font-semibold">
                          {row.daysInactive === 0 ? (
                            <span className="text-emerald-700 dark:text-emerald-400">Active today</span>
                          ) : row.daysInactive >= 5 ? (
                            <span className="text-rose-600 dark:text-rose-400 font-extrabold">{row.daysInactive} days ago</span>
                          ) : (
                            <span className="text-gray-600 dark:text-slate-400">{row.daysInactive} days ago</span>
                          )}
                        </td>
                        
                        <td className="px-5 py-4 min-w-[200px]">
                          {row.riskReasons.length === 0 ? (
                            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">All indicators healthy</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {row.riskReasons.map((reason, i) => (
                                <span
                                  key={i}
                                  className="inline-block bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded font-bold border border-gray-200 dark:border-slate-700"
                                >
                                    {reason}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          <Link to="/lecturer/messages">
                            <Button size="sm" variant="ghost" className="dark:text-slate-350 dark:hover:bg-slate-800">
                              💬 Chat
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
