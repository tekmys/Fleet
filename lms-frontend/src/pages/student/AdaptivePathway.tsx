import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useAdaptivePathway } from '../../hooks/useAssignments'
import { useToggleResourceComplete } from '../../hooks/useProgress'
import { ResourceType } from '../../types'

// Helpers
function resourceIcon(type: ResourceType) {
  if (type === 'VIDEO') return (
    <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
    </svg>
  )
  if (type === 'FILE') return (
    <svg className="w-5 h-5 text-gray-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
  return (
    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  )
}

function RadialProgress({ percentage, size = 72, strokeWidth = 6 }: { percentage: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-white/20"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-amber-400 transition-all duration-500 ease-out"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xs font-black text-white">{percentage}%</span>
    </div>
  )
}

export function AdaptivePathway() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const toggleMutation = useToggleResourceComplete()
  
  const { data, isLoading, error } = useAdaptivePathway(courseId!)
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({})

  if (isLoading) {
    return (
      <DashboardShell title="AI Learning Pathway">
        <div className="max-w-5xl mx-auto py-12 text-center text-gray-400 dark:text-slate-500">
          <svg className="animate-spin h-8 w-8 mx-auto text-indigo-600 dark:text-indigo-400 mb-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm font-medium">Analysing your academic completions...</p>
        </div>
      </DashboardShell>
    )
  }

  if (error || !data) {
    return (
      <DashboardShell title="AI Learning Pathway">
        <div className="max-w-5xl mx-auto py-12 text-center text-rose-600 dark:text-rose-400 font-semibold space-y-4">
          <p>⚠️ Failed to retrieve your learning pathway.</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 font-normal">Ensure backend is seeded and running.</p>
        </div>
      </DashboardShell>
    )
  }

  const { summary, focusAreas, nextSteps, stats } = data

  const handleDiscussTopic = (topic: string) => {
    const promptMessage = `Hi, I am studying my recommended focus topic: '${topic}'. Can you help explain this concept, why it's important, and guide me on how to master it?`
    navigate(`/student/courses/${courseId}/ai`, { state: { initialMessage: promptMessage } })
  }

  const toggleStep = (idx: number) => {
    setCompletedSteps(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  return (
    <DashboardShell title="✦ AI Study Guide">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header navigation bar */}
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800 pb-3">
          <Link to={`/student/courses/${courseId}`} className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Course
          </Link>
          <span className="text-gray-300 dark:text-slate-700">/</span>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">✦ AI Learning Pathway</span>
        </div>

        {/* Welcome study card */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-6 shadow border border-slate-800 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute right-0 top-0 translate-x-20 -translate-y-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-2 relative z-10">
            <Badge variant="warning">Personalised Guide</Badge>
            <h1 className="text-2xl font-black tracking-tight leading-none">Your AI-Powered Learning Pathway</h1>
            <p className="text-xs text-indigo-200 max-w-lg leading-relaxed">
              This guide analyzes your syllabus progress, completions, grades, and missed assignments in real-time to curate conceptual readings and roadmap checklists.
            </p>
          </div>
          
          {stats && (
            <div className="flex items-center gap-4 bg-white/10 border border-white/10 rounded-xl p-3 md:p-4 pr-6 shrink-0 relative z-10">
              <RadialProgress percentage={stats.completionPercent} />
              <div>
                <div className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Course Progress</div>
                <div className="text-lg font-extrabold text-white mt-0.5">
                  {stats.completedCount} / {stats.totalResources}
                </div>
                <div className="text-xs text-white/80">Completed materials</div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Metrics Indicators */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center text-rose-500 dark:text-rose-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">Missed Deadlines</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                    {stats.missedCount > 0 ? `${stats.missedCount} assignment(s) overdue` : 'All tasks submitted'}
                  </p>
                </div>
              </div>
              <Badge variant={stats.missedCount > 0 ? 'danger' : 'success'}>
                {stats.missedCount > 0 ? 'Action Required' : 'On Track'}
              </Badge>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-amber-500 dark:text-amber-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 00-2 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">Needs Conceptual Focus</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                    {stats.lowGradesCount > 0 ? `${stats.lowGradesCount} low grade indicator(s)` : 'Grades healthy'}
                  </p>
                </div>
              </div>
              <Badge variant={stats.lowGradesCount > 0 ? 'warning' : 'success'}>
                {stats.lowGradesCount > 0 ? 'Review Needed' : 'Good Standing'}
              </Badge>
            </div>
          </div>
        )}

        {/* AI Performance Trajectory Summary */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-bold text-sm">
            <span>✨</span>
            <span>AI PERFORMANCE OVERVIEW</span>
          </div>
          <p className="text-gray-700 dark:text-slate-200 leading-relaxed text-sm">
            {summary}
          </p>
        </div>

        {/* Recommended Focus Areas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>📚</span>
              <span>Focus Areas & Recommended Readings</span>
            </h2>
            <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">Click checkbox to complete in real-time</span>
          </div>

          {focusAreas.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-8 text-center shadow-sm">
              <span className="text-3xl">🎉</span>
              <p className="text-gray-500 dark:text-slate-450 font-medium mt-2">All completed! No critical focus areas recommended.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {focusAreas.map((area, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug">{area.topic}</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDiscussTopic(area.topic)}
                        className="text-[10px] py-1 px-2 text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/40 flex items-center gap-1 font-semibold flex-shrink-0"
                      >
                        ✨ Ask AI
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{area.reason}</p>
                  </div>

                  {area.recommendedResources && area.recommendedResources.length > 0 && (
                    <div className="border-t border-gray-100 dark:border-slate-800 pt-3 space-y-2">
                      <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Recommended Materials</div>
                      <div className="space-y-1.5">
                        {area.recommendedResources.map((res) => (
                          <div key={res.id} className="flex items-center justify-between gap-3 text-xs bg-gray-50 dark:bg-slate-800/40 hover:bg-gray-100/80 dark:hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors group">
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 font-semibold text-gray-750 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 truncate flex-1"
                            >
                              {resourceIcon(res.type)}
                              <span className="truncate">{res.title}</span>
                            </a>
                            
                            <button
                              onClick={() => toggleMutation.mutate(res.id)}
                              disabled={toggleMutation.isPending}
                              className="w-4 h-4 rounded-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex-shrink-0 hover:border-emerald-500 hover:bg-emerald-50 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 hover:opacity-50" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actionable Timeline / Next Steps Checklist */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span>🏁</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Action Roadmap</h2>
          </div>
          
          {nextSteps.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-slate-400 italic">No specific steps required. Keep maintaining your steady work!</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {nextSteps.map((step, idx) => {
                const isDone = !!completedSteps[idx]
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0 cursor-pointer group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 px-2 rounded-lg transition-colors"
                  >
                    <button
                      className={`w-4 h-4 rounded mt-0.5 flex-shrink-0 flex items-center justify-center border transition-all ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 group-hover:border-emerald-400'
                      }`}
                    >
                      {isDone && (
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className="space-y-0.5">
                      <p className={`text-xs font-semibold ${isDone ? 'line-through text-gray-400 dark:text-slate-500' : 'text-gray-800 dark:text-slate-200'}`}>
                        {step}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </DashboardShell>
  )
}
