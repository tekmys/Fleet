import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { Button } from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Textarea'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { useAssignments, useSubmitAssignment } from '../../hooks/useAssignments'
import { SkeletonList } from '../../components/ui/Skeleton'
import type { AssignmentForStudent } from '../../services/assignment.service'

function extractError(err: unknown) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    'Something went wrong'
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isPastDue(iso: string) {
  return new Date(iso) < new Date()
}

function dueBadge(a: AssignmentForStudent) {
  if (a.mySubmission) {
    const g = a.mySubmission.grade
    if (g && !g.isDraft) {
      const pct = a.maxScore > 0 ? (g.score / a.maxScore) * 100 : 0
      const variant = pct >= 70 ? 'success' : pct >= 50 ? 'warning' : 'danger'
      return <Badge variant={variant}>Graded {g.score}/{a.maxScore}</Badge>
    }
    return <Badge variant="info">Submitted</Badge>
  }
  if (isPastDue(a.dueDate)) return <Badge variant="danger">Past due</Badge>
  return <Badge variant="success">Open</Badge>
}

// ─── Submit modal ─────────────────────────────────────────────────────────────

interface SubmitModalProps {
  assignment: AssignmentForStudent
  courseId: string
  onClose: () => void
}

function SubmitModal({ assignment, courseId, onClose }: SubmitModalProps) {
  const submit = useSubmitAssignment(courseId)
  const existing = assignment.mySubmission

  const [content, setContent] = useState(existing?.content ?? '')
  const [error, setError] = useState('')

  const alreadyGraded = existing?.grade && !existing.grade.isDraft

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!content.trim()) {
      setError('Please enter your answer.')
      return
    }
    try {
      await submit.mutateAsync({ assignmentId: assignment.id, content: content.trim() })
      onClose()
    } catch (err) {
      setError(extractError(err))
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={assignment.title}
    >
      <div className="space-y-4">
        {assignment.description && (
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{assignment.description}</p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>Due: {formatDate(assignment.dueDate)}</span>
          <span>Max score: {assignment.maxScore}</span>
        </div>

        {/* Show grade/feedback if graded */}
        {existing?.grade && !existing.grade.isDraft && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="font-semibold text-green-800 mb-1">
              Grade: {existing.grade.score}/{assignment.maxScore}
            </p>
            {existing.grade.feedback && (
              <p className="text-sm text-green-700 whitespace-pre-wrap">{existing.grade.feedback}</p>
            )}
          </div>
        )}

        {/* Submission form — allow edit while not graded */}
        {!alreadyGraded && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              label="Your answer"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={6}
              placeholder="Type your answer here…"
              disabled={isPastDue(assignment.dueDate) && !existing}
            />
            {isPastDue(assignment.dueDate) && !existing && (
              <p className="text-sm text-red-600">This assignment is past its due date.</p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              {(!isPastDue(assignment.dueDate) || existing) && (
                <Button type="submit" disabled={submit.isPending}>
                  {submit.isPending ? 'Submitting…' : existing ? 'Update submission' : 'Submit'}
                </Button>
              )}
            </div>
          </form>
        )}

        {alreadyGraded && (
          <div className="flex justify-end">
            <Button type="button" variant="ghost" onClick={onClose}>Close</Button>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function Assignments() {
  const { courseId } = useParams<{ courseId: string }>()
  const { data: assignments, isLoading } = useAssignments(courseId!)
  const [selected, setSelected] = useState<AssignmentForStudent | null>(null)

  const list = (assignments as AssignmentForStudent[] | undefined) ?? []

  const upcoming = list.filter(a => !isPastDue(a.dueDate))
  const past = list.filter(a => isPastDue(a.dueDate))

  return (
    <DashboardShell title="Assignments">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Link to="/student/courses" className="hover:text-gray-700">My Courses</Link>
          <span>/</span>
          <Link to={`/student/courses/${courseId}`} className="hover:text-gray-700">Course</Link>
          <span>/</span>
          <span>Assignments</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
      </div>

      {isLoading ? (
        <SkeletonList rows={3} />
      ) : list.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-500">No assignments yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
                Upcoming
              </h2>
              <div className="space-y-3">
                {upcoming.map(a => (
                  <AssignmentRow key={a.id} assignment={a} onClick={() => setSelected(a)} />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
                Past
              </h2>
              <div className="space-y-3">
                {past.map(a => (
                  <AssignmentRow key={a.id} assignment={a} onClick={() => setSelected(a)} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {selected && (
        <SubmitModal
          assignment={selected}
          courseId={courseId!}
          onClose={() => setSelected(null)}
        />
      )}
    </DashboardShell>
  )
}

function AssignmentRow({
  assignment,
  onClick,
}: {
  assignment: AssignmentForStudent
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all"
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{assignment.title}</h3>
        {assignment.description && (
          <p className="text-sm text-gray-500 truncate mt-0.5">{assignment.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          Due {formatDate(assignment.dueDate)} · Max {assignment.maxScore} pts
        </p>
      </div>
      <div className="ml-4 shrink-0">{dueBadge(assignment)}</div>
    </div>
  )
}
