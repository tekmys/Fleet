import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { SkeletonList } from '../../components/ui/Skeleton'
import { AnnouncementsPanel } from '../../components/shared/AnnouncementsPanel'
import { useModules } from '../../hooks/useModules'
import { useToggleResourceComplete } from '../../hooks/useProgress'
import type { ResourceType } from '../../types'
import type { Module, Resource } from '../../services/module.service'

// ─── helpers ─────────────────────────────────────────────────────────────────

function resourceIcon(type: ResourceType) {
  if (type === 'VIDEO') return (
    <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
    </svg>
  )
  if (type === 'FILE') return (
    <svg className="w-4 h-4 text-gray-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
  return (
    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  )
}

// ─── Radial Progress Ring Indicator ──────────────────────────────────────────

interface RadialProgressProps {
  percentage: number
  size?: number
  strokeWidth?: number
}

function RadialProgress({ percentage, size = 60, strokeWidth = 5 }: RadialProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background circle */}
        <circle
          className="text-gray-100 dark:text-slate-800"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Foreground circle */}
        <circle
          className="text-emerald-500 transition-all duration-500 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Percentage text */}
      <span className="absolute text-xs font-bold text-gray-700 dark:text-slate-350">{percentage}%</span>
    </div>
  )
}

// ─── Resource item ────────────────────────────────────────────────────────────

function ResourceItem({ resource, courseId }: { resource: Resource; courseId: string }) {
  const typeLabel: Record<ResourceType, string> = { FILE: 'File', LINK: 'Link', VIDEO: 'Video' }
  const toggleMutation = useToggleResourceComplete(courseId)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleMutation.mutate(resource.id)
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/40 group transition-colors border-b border-gray-100 dark:border-slate-800 last:border-b-0">
      {/* Checkbox button */}
      <button
        onClick={handleToggle}
        disabled={toggleMutation.isPending}
        className="flex-shrink-0 focus:outline-none"
        aria-label={resource.isCompleted ? "Mark incomplete" : "Mark complete"}
      >
        {resource.isCompleted ? (
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border border-emerald-500 shadow-sm scale-100 hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 scale-100 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer" />
        )}
      </button>

      {/* Anchor Link for Content */}
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center gap-3 min-w-0"
      >
        <div className="flex-shrink-0">{resourceIcon(resource.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {resource.title}
            </p>
            {resource.textContent && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex-shrink-0">
                ✦ AI Indexed
              </span>
            )}
          </div>
          <p className="text-xs text-gray-450 truncate">{resource.url}</p>
        </div>
        <Badge variant="default">{typeLabel[resource.type]}</Badge>
        <svg
          className="w-4 h-4 text-gray-300 dark:text-slate-600 group-hover:text-indigo-500 flex-shrink-0 transition-colors"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      </a>
    </div>
  )
}

// ─── Module accordion ─────────────────────────────────────────────────────────

function ModuleAccordion({ mod, index, courseId }: { mod: Module; index: number; courseId: string }) {
  const [open, setOpen] = useState(index === 0)
  
  // Calculate completion percentage for this module
  const completedResources = mod.resources.filter((r) => r.isCompleted).length
  const percent = mod.resources.length > 0 ? Math.round((completedResources / mod.resources.length) * 100) : 0

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
          {index + 1}
        </div>
        <span className="flex-1 font-medium text-gray-900 dark:text-white">{mod.title}</span>
        
        {/* Module progress pill */}
        {mod.resources.length > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-16 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden hidden sm:block">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1">
              {percent}%
            </span>
          </div>
        )}

        <span className="text-sm text-gray-400 dark:text-slate-500 flex-shrink-0">
          {completedResources}/{mod.resources.length} item{mod.resources.length !== 1 ? 's' : ''}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-100 dark:border-slate-800 p-2 divide-y divide-gray-50 dark:divide-slate-800/40">
          {mod.resources.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No resources in this module yet.</p>
          ) : (
            mod.resources.map((r) => (
              <ResourceItem key={r.id} resource={r} courseId={courseId} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function CourseView() {
  const { courseId } = useParams<{ courseId: string }>()
  const id = courseId!

  const { data: modules, isLoading, isError } = useModules(id)
  const sorted = [...(modules ?? [])].sort((a, b) => a.order - b.order)

  const totalResources = sorted.reduce((sum, m) => sum + m.resources.length, 0)
  const completedCount = sorted.reduce((sum, m) => sum + m.resources.filter((r) => r.isCompleted).length, 0)
  const overallPercent = totalResources > 0 ? Math.round((completedCount / totalResources) * 100) : 0

  return (
    <DashboardShell title="Course Content">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Back and Sub-Header Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
          <div className="flex-1 min-w-0">
            <Link
              to="/student/courses"
              className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 mb-2 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              My Courses
            </Link>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Course Content</h2>
            {!isLoading && (
              <p className="text-sm text-gray-500 dark:text-slate-450 mt-1.5 flex items-center gap-2">
                <span>{sorted.length} module{sorted.length !== 1 ? 's' : ''}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-700" />
                <span>{totalResources} resource{totalResources !== 1 ? 's' : ''}</span>
              </p>
            )}
          </div>

          {!isLoading && totalResources > 0 && (
            <div className="flex items-center gap-3 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-2.5 px-4 flex-shrink-0 animate-fadeIn">
              <RadialProgress percentage={overallPercent} size={48} strokeWidth={4} />
              <div>
                <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Your Progress</div>
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-550 mt-0.5">
                  {completedCount} / {totalResources} completed
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link to={`/student/courses/${id}/assignments`}>
              <Button size="sm" variant="secondary" className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">Assignments</Button>
            </Link>
            <Link to={`/student/courses/${id}/pathway`}>
              <Button size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm border-0">
                ✦ AI Pathway
              </Button>
            </Link>
            <Link to={`/student/courses/${id}/ai`}>
              <Button size="sm" variant="secondary" className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">✦ AI Assistant</Button>
            </Link>
          </div>
        </div>

        {isLoading && <SkeletonList rows={4} />}
        {isError && <div className="text-center py-16 text-red-500 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">Failed to load course content.</div>}

        {!isLoading && sorted.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
            <p className="text-gray-400">No content has been added to this course yet.</p>
          </div>
        )}

        <div className="space-y-3">
          {sorted.map((mod, index) => (
            <ModuleAccordion key={mod.id} mod={mod} index={index} courseId={id} />
          ))}
        </div>

        <AnnouncementsPanel courseId={id} canEdit={false} />
      </div>
    </DashboardShell>
  )
}
