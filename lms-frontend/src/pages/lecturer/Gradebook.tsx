import { useParams, Link } from 'react-router-dom'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { SkeletonTable } from '../../components/ui/Skeleton'
import { useGradebook } from '../../hooks/useAssignments'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function ScoreCell({
  score,
  maxScore,
  isDraft,
  submitted,
}: {
  score: number | null
  maxScore: number
  isDraft: boolean | null
  submitted: boolean
}) {
  if (!submitted) {
    return <span className="text-gray-300 dark:text-slate-700 text-sm">—</span>
  }
  if (score === null) {
    return <Badge variant="default">Submitted</Badge>
  }
  if (isDraft) {
    return (
      <span className="text-amber-600 dark:text-amber-450 text-sm font-medium">
        {score}/{maxScore} <span className="text-xs text-amber-400 dark:text-amber-500/80 font-semibold">(draft)</span>
      </span>
    )
  }
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0
  const colour =
    pct >= 70 ? 'text-green-700 dark:text-green-400' : pct >= 50 ? 'text-amber-650 dark:text-amber-400' : 'text-rose-600 dark:text-rose-450'
  return (
    <span className={`text-sm font-bold ${colour}`}>
      {score}/{maxScore}
    </span>
  )
}

export function Gradebook() {
  const { courseId } = useParams<{ courseId: string }>()
  const { data, isLoading } = useGradebook(courseId!)

  if (isLoading) {
    return (
      <DashboardShell title="Gradebook">
        <SkeletonTable rows={6} />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell title="Gradebook">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">
            <Link to="/lecturer/courses" className="hover:text-gray-700 dark:hover:text-slate-200 transition-colors">My Courses</Link>
            <span className="text-gray-300 dark:text-slate-750">/</span>
            <Link to={`/lecturer/courses/${courseId}/assignments`} className="hover:text-gray-700 dark:hover:text-slate-200 transition-colors">
              Assignments
            </Link>
            <span className="text-gray-300 dark:text-slate-750">/</span>
            <span>Gradebook</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Gradebook</h1>
        </div>
        <div className="flex gap-2">
          <Link to={`/lecturer/courses/${courseId}/analytics`}>
            <Button variant="secondary" className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">Analytics</Button>
          </Link>
          <Link to={`/lecturer/courses/${courseId}/assignments`}>
            <Button variant="ghost" className="dark:text-slate-300 dark:hover:bg-slate-800">Back to assignments</Button>
          </Link>
        </div>
      </div>

      {!data || data.rows.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-250 dark:border-slate-800 py-16 text-center bg-white dark:bg-slate-900">
          <p className="text-gray-500 dark:text-slate-450 font-semibold">No enrolled students yet.</p>
        </div>
      ) : !data.assignments.length ? (
        <div className="rounded-xl border-2 border-dashed border-gray-250 dark:border-slate-800 py-16 text-center bg-white dark:bg-slate-900">
          <p className="text-gray-500 dark:text-slate-455 font-semibold">No assignments created yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800 text-sm">
            <thead className="bg-gray-50 dark:bg-slate-850/30">
              <tr>
                <th className="sticky left-0 z-10 bg-gray-50 dark:bg-slate-800 px-4 py-3.5 text-left font-semibold text-gray-700 dark:text-slate-300 w-48 shadow-[1px_0_0_0_rgba(229,231,235,1)] dark:shadow-[1px_0_0_0_rgba(30,41,59,1)]">
                  Student
                </th>
                {data.assignments.map(a => (
                  <th
                    key={a.id}
                    className="px-4 py-3.5 text-center font-semibold text-gray-700 dark:text-slate-350 whitespace-nowrap min-w-[120px]"
                  >
                    <div>{a.title}</div>
                    <div className="font-normal text-xs text-gray-400 dark:text-slate-500 mt-0.5">Due {formatDate(a.dueDate)}</div>
                  </th>
                ))}
                <th className="px-4 py-3.5 text-center font-semibold text-gray-700 dark:text-slate-355 whitespace-nowrap">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {data.rows.map(row => {
                const totalMax = data.assignments.reduce((sum, a) => sum + a.maxScore, 0)
                const totalEarned = row.grades.reduce(
                  (sum, g) => sum + (g.isDraft === false && g.score !== null ? g.score : 0),
                  0,
                )
                const publishedCount = row.grades.filter(g => g.isDraft === false && g.score !== null).length
                return (
                  <tr key={row.student.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors shadow-[1px_0_0_0_rgba(229,231,235,1)] dark:shadow-[1px_0_0_0_rgba(30,41,59,1)]">
                      <div className="font-semibold text-gray-900 dark:text-white">{row.student.name}</div>
                      <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{row.student.email}</div>
                    </td>
                    {row.grades.map(g => (
                      <td key={g.assignmentId} className="px-4 py-3 text-center">
                        <ScoreCell
                          score={g.score}
                          maxScore={g.maxScore}
                          isDraft={g.isDraft}
                          submitted={g.submission !== null}
                        />
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center">
                      {publishedCount > 0 ? (
                        <span className="font-bold text-gray-805 dark:text-slate-205">
                          {totalEarned}/{totalMax}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-slate-700 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  )
}
