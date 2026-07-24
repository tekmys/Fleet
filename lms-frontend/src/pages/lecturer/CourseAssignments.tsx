import { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { SkeletonList } from '../../components/ui/Skeleton'
import {
  useAssignments,
  useCreateAssignment,
  useUpdateAssignment,
  useDeleteAssignment,
  useSubmissions,
  useGradeSubmission,
  useAiGradeFeedback,
  useAiPlagiarismCheck,
  useAiLearningAnalytics,
} from '../../hooks/useAssignments'
import { AiToolsModal } from '../../components/shared/AiToolsModal'
import type { AssignmentWithCount, SubmissionWithStudent } from '../../services/assignment.service'
import type { PlagiarismResult, LearningAnalyticsResponse } from '../../services/ai.service'

function extractError(err: unknown) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    'Something went wrong'
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isPastDue(iso: string) {
  return new Date(iso) < new Date()
}

// ─── Assignment form modal ────────────────────────────────────────────────────

interface AssignmentFormProps {
  initial?: AssignmentWithCount
  courseId: string
  onClose: () => void
}

function AssignmentFormModal({ initial, courseId, onClose }: AssignmentFormProps) {
  const isEdit = !!initial
  const create = useCreateAssignment(courseId)
  const update = useUpdateAssignment(courseId)

  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [dueDate, setDueDate] = useState(
    initial ? new Date(initial.dueDate).toISOString().slice(0, 16) : '',
  )
  const [maxScore, setMaxScore] = useState(String(initial?.maxScore ?? 100))
  const [error, setError] = useState('')

  const busy = create.isPending || update.isPending

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const data = {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: new Date(dueDate).toISOString(),
      maxScore: Number(maxScore),
    }
    try {
      if (isEdit) {
        await update.mutateAsync({ id: initial!.id, ...data })
      } else {
        await create.mutateAsync(data)
      }
      onClose()
    } catch (err) {
      setError(extractError(err))
    }
  }

  return (
    <Modal open onClose={onClose} title={isEdit ? 'Edit Assignment' : 'New Assignment'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <Textarea
          label="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Due date"
            type="datetime-local"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            required
          />
          <Input
            label="Max score"
            type="number"
            min={1}
            value={maxScore}
            onChange={e => setMaxScore(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-655 font-semibold">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" className="dark:text-slate-350 dark:hover:bg-slate-800" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Submissions panel ────────────────────────────────────────────────────────

interface SubmissionsPanelProps {
  assignment: AssignmentWithCount
  onClose: () => void
}

function SubmissionsPanel({ assignment, onClose }: SubmissionsPanelProps) {
  const toast = useToast()
  const { data: submissions, isLoading } = useSubmissions(assignment.id)
  const grade = useGradeSubmission(assignment.id)
  const aiGrade = useAiGradeFeedback()
  const aiPlagiarism = useAiPlagiarismCheck()

  const [selected, setSelected] = useState<SubmissionWithStudent | null>(null)
  const [score, setScore] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isDraft, setIsDraft] = useState(false)
  const [gradeError, setGradeError] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [plagiarismResult, setPlagiarismResult] = useState<PlagiarismResult | null>(null)
  const [plagiarismLoading, setPlagiarismLoading] = useState(false)
  const [plagiarismError, setPlagiarismError] = useState('')

  const aiLearningAnalytics = useAiLearningAnalytics()
  const [analyticsResult, setAnalyticsResult] = useState<LearningAnalyticsResponse | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState('')

  function openGrade(sub: SubmissionWithStudent) {
    setSelected(sub)
    setScore(sub.grade ? String(sub.grade.score) : '')
    setFeedback(sub.grade?.feedback ?? '')
    setIsDraft(sub.grade?.isDraft ?? false)
    setGradeError('')
    setPlagiarismResult(null)
    setPlagiarismError('')
  }

  async function handlePlagiarismCheck() {
    if (!selected) return
    setPlagiarismLoading(true)
    setPlagiarismResult(null)
    setPlagiarismError('')
    try {
      const result = await aiPlagiarism.mutateAsync(selected.id)
      setPlagiarismResult(result)
    } catch (err) {
      setPlagiarismError(extractError(err))
    } finally {
      setPlagiarismLoading(false)
    }
  }

  async function handleAiGrade() {
    if (!selected) return
    setAiLoading(true)
    try {
      const result = await aiGrade.mutateAsync({ submissionId: selected.id })
      setScore(String(result.score))
      setFeedback(result.feedback)
      setIsDraft(true)
    } catch (err) {
      setGradeError(extractError(err))
    } finally {
      setAiLoading(false)
    }
  }

  async function handleGrade(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setGradeError('')
    try {
      await grade.mutateAsync({
        submissionId: selected.id,
        score: Number(score),
        feedback: feedback.trim() || undefined,
        isDraft,
      })
      toast(isDraft ? 'Grade saved as draft' : 'Grade published', 'success')
      setSelected(null)
    } catch (err) {
      setGradeError(extractError(err))
      toast('Failed to save grade', 'error')
    }
  }

  async function handleLearningAnalytics() {
    setAnalyticsLoading(true)
    setAnalyticsError('')
    try {
      const result = await aiLearningAnalytics.mutateAsync(assignment.id)
      setAnalyticsResult(result)
    } catch (err) {
      setAnalyticsError(extractError(err))
    } finally {
      setAnalyticsLoading(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Submissions — ${assignment.title}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300">All Submissions</h3>
        <Button 
          size="sm" 
          variant="secondary" 
          className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
          onClick={handleLearningAnalytics}
          disabled={analyticsLoading || submissions?.length === 0}
        >
          {analyticsLoading ? 'Generating…' : '✨ Class Analytics'}
        </Button>
      </div>

      {analyticsError && (
        <p className="mb-4 text-sm text-red-655 font-semibold">{analyticsError}</p>
      )}

      {analyticsResult && (
        <div className="mb-6 rounded-xl border border-indigo-200 dark:border-indigo-950 bg-indigo-50/50 dark:bg-indigo-950/20 p-5 shadow-sm transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">✨</span>
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-350">AI Learning Analytics</h4>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-850 dark:text-indigo-400 mb-1">Overall Trend</p>
              <p className="text-sm text-indigo-900 dark:text-slate-200 leading-relaxed font-medium">{analyticsResult.overallTrend}</p>
            </div>
            {analyticsResult.misconceptions.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-2">Common Misconceptions</p>
                <div className="flex flex-wrap gap-2">
                  {analyticsResult.misconceptions.map((m, i) => (
                    <span key={i} className="inline-block bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-300 text-xs px-2.5 py-1.5 rounded-md border border-amber-200 dark:border-amber-900/30 font-medium">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {analyticsResult.suggestions.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-green-800 dark:text-green-400 mb-2">Re-teaching Suggestions</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-green-900 dark:text-green-300">
                  {analyticsResult.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-end pt-2.5 border-t border-indigo-200/50 dark:border-indigo-900/30">
              <Button size="sm" variant="ghost" className="dark:text-indigo-400" onClick={() => setAnalyticsResult(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="py-8 text-center text-gray-500 dark:text-slate-400 font-medium">Loading…</p>
      ) : !submissions?.length ? (
        <p className="py-8 text-center text-gray-550 dark:text-slate-400 font-medium">No submissions yet.</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {submissions.map(sub => (
            <div
              key={sub.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-slate-800 px-4 py-3 bg-white dark:bg-slate-900 transition-colors"
            >
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{sub.student.name}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{sub.student.email}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 font-medium">
                  Submitted {formatDate(sub.submittedAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {sub.grade ? (
                  <span className="text-sm font-medium text-gray-750">
                    {sub.grade.isDraft ? (
                      <Badge variant="warning">Draft {sub.grade.score}/{assignment.maxScore}</Badge>
                    ) : (
                      <Badge variant="success">{sub.grade.score}/{assignment.maxScore}</Badge>
                    )}
                  </span>
                ) : (
                  <Badge variant="default">Ungraded</Badge>
                )}
                <Button size="sm" onClick={() => openGrade(sub)}>Grade</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="mt-6 border-t border-gray-150 dark:border-slate-800 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">Grading: {selected.student.name}</h4>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-350 text-sm font-semibold cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {selected.content && (
            <div className="mb-4 rounded-lg bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-800 p-3 max-h-40 overflow-y-auto">
              <p className="text-xs text-gray-500 dark:text-slate-450 mb-1 font-bold uppercase tracking-wider">Submission Text</p>
              <p className="text-sm text-gray-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">{selected.content}</p>
            </div>
          )}
          {selected.fileUrl && (
            <a
              href={selected.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="mb-4 inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              📎 View submitted file
            </a>
          )}

          <form onSubmit={handleGrade} className="space-y-3">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Input
                  label={`Score (max ${assignment.maxScore})`}
                  type="number"
                  min={0}
                  max={assignment.maxScore}
                  value={score}
                  onChange={e => setScore(e.target.value)}
                  required
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                onClick={handleAiGrade}
                disabled={aiLoading || !selected.content}
              >
                {aiLoading ? 'AI thinking…' : '✨ AI suggest'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                onClick={handlePlagiarismCheck}
                disabled={plagiarismLoading || !selected.content}
              >
                {plagiarismLoading ? 'Checking…' : '🔍 Plagiarism'}
              </Button>
            </div>
            <Textarea
              label="Feedback"
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              rows={3}
              placeholder="Optional feedback for the student…"
            />
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isDraft}
                onChange={e => setIsDraft(e.target.checked)}
                className="rounded border-gray-300 dark:border-slate-700 dark:bg-slate-800"
              />
              Save as draft (student won't see this grade yet)
            </label>
            {gradeError && <p className="text-sm text-red-655 font-semibold">{gradeError}</p>}
            <div className="flex justify-end">
              <Button type="submit" disabled={grade.isPending}>
                {grade.isPending ? 'Saving…' : isDraft ? 'Save draft' : 'Publish grade'}
              </Button>
            </div>
          </form>

          {plagiarismError && (
            <p className="mt-3 text-sm text-red-655 font-semibold">{plagiarismError}</p>
          )}

          {plagiarismResult && (
            <div className="mt-4 rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-850 p-4 transition-colors">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-450 mb-2">
                Plagiarism Report · checked against {plagiarismResult.checkedAgainst} submission{plagiarismResult.checkedAgainst !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-gray-805 dark:text-slate-200 mb-3 leading-relaxed font-semibold">{plagiarismResult.verdict}</p>
              {plagiarismResult.flags.length === 0 ? (
                <p className="text-sm text-green-700 dark:text-green-400 font-bold">No similarity matching found.</p>
              ) : (
                <div className="space-y-2">
                  {plagiarismResult.flags.map((flag, i) => (
                    <div key={i} className="rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-gray-900 dark:text-white">{flag.studentName}</span>
                        <Badge
                          variant={flag.similarityLevel === 'high' ? 'danger' : flag.similarityLevel === 'medium' ? 'warning' : 'default'}
                        >
                          {flag.similarityLevel} similarity
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-slate-400 leading-normal">{flag.evidence}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function CourseAssignments() {
  const toast = useToast()
  const { courseId } = useParams<{ courseId: string }>()
  const { data: assignments, isLoading } = useAssignments(courseId!)
  const deleteAssignment = useDeleteAssignment(courseId!)

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<AssignmentWithCount | null>(null)
  const [viewing, setViewing] = useState<AssignmentWithCount | null>(null)
  const [showAiTools, setShowAiTools] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('openAiTool')) {
      setShowAiTools(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  async function handleDelete(id: string) {
    if (!confirm('Delete this assignment? This will also delete all submissions.')) return
    try {
      await deleteAssignment.mutateAsync(id)
      toast('Assignment deleted', 'success')
    } catch (err) {
      setDeleteError(extractError(err))
      toast('Failed to delete assignment', 'error')
    }
  }

  return (
    <DashboardShell title="Assignments">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">
            <Link to="/lecturer/courses" className="hover:text-gray-700 dark:hover:text-slate-200 transition-colors">My Courses</Link>
            <span className="text-gray-300 dark:text-slate-650">/</span>
            <span>Assignments</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Assignments Management</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/lecturer/courses/${courseId}/modules`}>
            <Button variant="ghost" className="dark:text-slate-300 dark:hover:bg-slate-800">Modules</Button>
          </Link>
          <Link to={`/lecturer/courses/${courseId}/gradebook`}>
            <Button variant="secondary" className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">Gradebook</Button>
          </Link>
          <Link to={`/lecturer/courses/${courseId}/analytics`}>
            <Button variant="secondary" className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">Analytics</Button>
          </Link>
          <Link to={`/lecturer/courses/${courseId}/quizzes`}>
            <Button variant="secondary" className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">Quizzes</Button>
          </Link>
          <Link to={`/lecturer/courses/${courseId}/forum`}>
            <Button variant="secondary" className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">Discussion Board</Button>
          </Link>
          <Button variant="secondary" className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700" onClick={() => setShowAiTools(true)}>✦ AI Tools</Button>
          <Button onClick={() => setShowCreate(true)}>+ New assignment</Button>
        </div>
      </div>

      {deleteError && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-rose-950/20 border border-red-200 dark:border-rose-900/35 px-4 py-3 text-sm text-red-700 dark:text-red-400 font-semibold">
          {deleteError}
        </div>
      )}

      {isLoading ? (
        <SkeletonList rows={3} />
      ) : !assignments?.length ? (
        <div className="rounded-xl border-2 border-dashed border-gray-250 dark:border-slate-800 py-16 text-center bg-white dark:bg-slate-900 transition-colors">
          <p className="text-gray-500 dark:text-slate-400 mb-4 font-semibold">No assignments yet.</p>
          <Button onClick={() => setShowCreate(true)}>Create first assignment</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {(assignments as AssignmentWithCount[]).map(a => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-gray-900 dark:text-white truncate">{a.title}</h3>
                  {isPastDue(a.dueDate) ? (
                    <Badge variant="danger">Closed</Badge>
                  ) : (
                    <Badge variant="success">Open</Badge>
                  )}
                </div>
                {a.description && (
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-1">{a.description}</p>
                )}
                <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 font-semibold">
                  Due {formatDate(a.dueDate)} · Max score {a.maxScore} · {a._count.submissions} submission
                  {a._count.submissions !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <Button size="sm" variant="secondary" className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700" onClick={() => setViewing(a)}>
                  Submissions
                </Button>
                <Button size="sm" variant="ghost" className="dark:text-slate-350 dark:hover:bg-slate-800" onClick={() => setEditing(a)}>
                  Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(a.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAiTools && (
        <AiToolsModal courseId={courseId!} onClose={() => setShowAiTools(false)} />
      )}
      {showCreate && (
        <AssignmentFormModal courseId={courseId!} onClose={() => setShowCreate(false)} />
      )}
      {editing && (
        <AssignmentFormModal
          courseId={courseId!}
          initial={editing}
          onClose={() => setEditing(null)}
        />
      )}
      {viewing && (
        <SubmissionsPanel assignment={viewing} onClose={() => setViewing(null)} />
      )}
    </DashboardShell>
  )
}
