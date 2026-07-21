import { Link } from 'react-router-dom'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { Badge } from '../../components/ui/Badge'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { useCourses } from '../../hooks/useCourses'
import type { Course } from '../../types'

// Dynamic course theming lookup
export function getCourseTheme(code: string) {
  const upper = code.toUpperCase().trim()
  if (upper.startsWith('CS') || upper.startsWith('INF') || upper.startsWith('COMP')) {
    return {
      bg: 'bg-indigo-50/30 dark:bg-indigo-950/10',
      border: 'border-gray-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/40',
      text: 'text-indigo-700 dark:text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
      badge: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30',
      dot: 'bg-indigo-500'
    }
  }
  if (upper.startsWith('MA') || upper.startsWith('MTH') || upper.startsWith('MAT')) {
    return {
      bg: 'bg-rose-50/30 dark:bg-rose-950/10',
      border: 'border-gray-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-500/40',
      text: 'text-rose-700 dark:text-rose-400 group-hover:text-rose-600 dark:group-hover:text-rose-400',
      badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30',
      dot: 'bg-rose-500'
    }
  }
  if (upper.startsWith('PH') || upper.startsWith('PHY') || upper.startsWith('SCI')) {
    return {
      bg: 'bg-amber-50/30 dark:bg-amber-950/10',
      border: 'border-gray-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/40',
      text: 'text-amber-700 dark:text-amber-400 group-hover:text-amber-600 dark:group-hover:text-amber-400',
      badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30',
      dot: 'bg-amber-500'
    }
  }
  return {
    bg: 'bg-emerald-50/30 dark:bg-emerald-950/10',
    border: 'border-gray-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/40',
    text: 'text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30',
    dot: 'bg-emerald-500'
  }
}

function CourseCard({ course }: { course: Course }) {
  const theme = getCourseTheme(course.code)

  return (
    <Link
      to={`/student/courses/${course.id}`}
      className={`block bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 group ${theme.border}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h3 className={`font-extrabold text-gray-900 dark:text-white truncate transition-colors ${theme.text}`}>
            {course.title}
          </h3>
          <code className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono mt-1.5 inline-block ${theme.badge}`}>
            {course.code}
          </code>
        </div>
        <Badge variant="success">ENROLLED</Badge>
      </div>

      {course.description && (
        <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">{course.description}</p>
      )}

      <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-slate-500 pt-3 border-t border-gray-100 dark:border-slate-800/80">
        <span className="font-semibold">{course.lecturer?.name ?? 'Unknown lecturer'}</span>
        <div className="flex gap-3">
          <span>{course._count?.modules ?? 0} modules</span>
          <span>{course._count?.assignments ?? 0} assignments</span>
        </div>
      </div>
    </Link>
  )
}

export function MyCourses() {
  const { data, isLoading, isError } = useCourses()

  return (
    <DashboardShell title="My Courses">
      <div className="max-w-5xl mx-auto space-y-5">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">My Registered Courses</h2>
          <p className="text-xs text-gray-550 dark:text-slate-400 mt-0.5">
            {data ? `Access course materials, pathfinders, and assignments for your ${data.total} registered program${data.total !== 1 ? 's' : ''}.` : 'Loading courses…'}
          </p>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}
        {isError && <div className="text-center py-16 text-red-500 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">Failed to load courses.</div>}

        {data?.courses.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
            <span className="text-4xl">🎓</span>
            <p className="text-gray-450 font-bold mt-3">You are not enrolled in any courses yet.</p>
            <p className="text-xs text-gray-450 mt-1">Contact your administrator to get enrolled.</p>
          </div>
        )}

        {data && data.courses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
