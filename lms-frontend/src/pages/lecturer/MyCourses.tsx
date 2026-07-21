import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Textarea } from '../../components/ui/Textarea'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { useCourses, useCreateCourse, useUpdateCourse, useCourseStudents } from '../../hooks/useCourses'
import type { Course, CourseStatus } from '../../types'

// Dynamic course theming lookup
function getCourseTheme(code: string) {
  const upper = code.toUpperCase().trim()
  if (upper.startsWith('CS') || upper.startsWith('INF') || upper.startsWith('COMP')) {
    return {
      border: 'border-gray-200 dark:border-slate-850 hover:border-indigo-400 dark:hover:border-indigo-500/40',
      text: 'text-indigo-700 dark:text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
      badge: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30'
    }
  }
  if (upper.startsWith('MA') || upper.startsWith('MTH') || upper.startsWith('MAT')) {
    return {
      border: 'border-gray-200 dark:border-slate-850 hover:border-rose-400 dark:hover:border-rose-500/40',
      text: 'text-rose-700 dark:text-rose-400 group-hover:text-rose-600 dark:group-hover:text-rose-400',
      badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30'
    }
  }
  if (upper.startsWith('PH') || upper.startsWith('PHY') || upper.startsWith('SCI')) {
    return {
      border: 'border-gray-200 dark:border-slate-850 hover:border-amber-400 dark:hover:border-amber-500/40',
      text: 'text-amber-700 dark:text-amber-400 group-hover:text-amber-600 dark:group-hover:text-amber-400',
      badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30'
    }
  }
  return {
    border: 'border-gray-200 dark:border-slate-850 hover:border-emerald-400 dark:hover:border-emerald-500/40',
    text: 'text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
  }
}

const STATUS_OPTIONS: { value: CourseStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ARCHIVED', label: 'Archived' },
]

function statusBadge(s: CourseStatus) {
  const map: Record<CourseStatus, 'default' | 'success' | 'warning'> = {
    DRAFT: 'warning',
    PUBLISHED: 'success',
    ARCHIVED: 'default',
  }
  return <Badge variant={map[s]}>{s}</Badge>
}

function extractError(err: unknown) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    'Something went wrong'
  )
}

// ─── Course form ──────────────────────────────────────────────────────────────

interface CourseFormProps {
  initial?: Course
  onSave: (d: { title: string; code: string; description: string; status: CourseStatus }) => void
  loading: boolean
  error: string
}

function CourseForm({ initial, onSave, loading, error }: CourseFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [code, setCode] = useState(initial?.code ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [status, setStatus] = useState<CourseStatus>(initial?.status ?? 'DRAFT')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({ title, code, description, status })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Course title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        autoFocus
      />
      <Input
        label="Course code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        required
        placeholder="e.g. CS101"
      />
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Optional course description…"
      />
      <Select
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value as CourseStatus)}
        options={STATUS_OPTIONS}
      />

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-rose-950/20 border border-red-200 dark:border-rose-900/30 px-4 py-3">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          {initial ? 'Save changes' : 'Create course'}
        </Button>
      </div>
    </form>
  )
}

// ─── Students drawer ──────────────────────────────────────────────────────────

function StudentsModal({ course, onClose }: { course: Course; onClose: () => void }) {
  const { data, isLoading } = useCourseStudents(course.id)

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
        {isLoading ? 'Loading…' : `${data?.length ?? 0} student${data?.length !== 1 ? 's' : ''} enrolled`}
      </p>
      {data && data.length > 0 ? (
        <ul className="divide-y divide-gray-50 dark:divide-slate-800 border border-gray-100 dark:border-slate-750 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
          {data.map((enrolment) => (
            <li key={enrolment.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-slate-850 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {enrolment.student?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{enrolment.student?.name}</p>
                <p className="text-xs text-gray-405 dark:text-slate-500 font-medium">{enrolment.student?.email}</p>
              </div>
              <span className="ml-auto text-xs text-gray-400 dark:text-slate-500 font-medium">
                {new Date(enrolment.enrolledAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        !isLoading && (
          <p className="text-center py-8 text-gray-405 dark:text-slate-500 text-sm font-medium">No students enrolled yet.</p>
        )
      )}
      <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-slate-800">
        <Button variant="secondary" size="sm" className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700" onClick={onClose}>Close</Button>
      </div>
    </div>
  )
}

// ─── Course card ──────────────────────────────────────────────────────────────

interface CourseCardProps {
  course: Course
  onEdit: () => void
  onViewStudents: () => void
}

function CourseCard({ course, onEdit, onViewStudents }: CourseCardProps) {
  const theme = getCourseTheme(course.code)

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 group ${theme.border}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className={`font-extrabold text-gray-900 dark:text-white truncate transition-colors ${theme.text}`}>{course.title}</h3>
          <code className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono mt-1.5 inline-block ${theme.badge}`}>
            {course.code}
          </code>
        </div>
        {statusBadge(course.status)}
      </div>

      {course.description && (
        <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{course.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-450 dark:text-slate-500 pt-3 border-t border-gray-50 dark:border-slate-800/80">
        <span>{course._count?.enrolments ?? 0} students</span>
        <span>{course._count?.modules ?? 0} modules</span>
        <span>{course._count?.assignments ?? 0} assignments</span>
      </div>

      <div className="flex gap-2 pt-1.5">
        <Link to={`/lecturer/courses/${course.id}/modules`} className="flex-1">
          <Button variant="primary" size="sm" className="w-full text-xs font-bold py-1.5">
            Modules
          </Button>
        </Link>
        <Link to={`/lecturer/courses/${course.id}/assignments`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full text-xs font-bold py-1.5 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
            Assignments
          </Button>
        </Link>
        <Button variant="secondary" size="sm" className="text-xs font-bold dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700" onClick={onViewStudents}>
          Students
        </Button>
        <Button variant="ghost" size="sm" className="text-xs font-semibold dark:text-slate-350 dark:hover:bg-slate-800" onClick={onEdit}>
          Edit
        </Button>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function MyCourses() {
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<Course | null>(null)
  const [studentsTarget, setStudentsTarget] = useState<Course | null>(null)
  const [mutationError, setMutationError] = useState('')

  const { data, isLoading, isError } = useCourses()
  const createCourse = useCreateCourse()
  const updateCourse = useUpdateCourse()

  async function handleCreate(form: { title: string; code: string; description: string; status: CourseStatus }) {
    setMutationError('')
    try {
      await createCourse.mutateAsync(form)
      setShowCreate(false)
    } catch (err) {
      setMutationError(extractError(err))
    }
  }

  async function handleEdit(form: { title: string; code: string; description: string; status: CourseStatus }) {
    if (!editTarget) return
    setMutationError('')
    try {
      await updateCourse.mutateAsync({ id: editTarget.id, payload: form })
      setEditTarget(null)
    } catch (err) {
      setMutationError(extractError(err))
    }
  }

  return (
    <DashboardShell title="My Courses">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">My Teaching Courses</h2>
            <p className="text-xs text-gray-500 dark:text-slate-450 mt-0.5">
              {data ? `Manage curriculum, syllabus releases, and grades for your ${data.total} active course${data.total !== 1 ? 's' : ''}.` : 'Loading courses…'}
            </p>
          </div>
          <Button onClick={() => { setShowCreate(true); setMutationError('') }}>
            + New course
          </Button>
        </div>

        {/* Grid */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}
        {isError && (
          <div className="text-center py-16 text-rose-500 font-semibold bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">Failed to load courses.</div>
        )}
        {data && data.courses.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
            <span className="text-4xl">📚</span>
            <p className="text-gray-450 font-bold mt-3">You haven't created any courses yet.</p>
            <Button className="mt-4" onClick={() => setShowCreate(true)}>
              Create your first course
            </Button>
          </div>
        )}
        {data && data.courses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={() => { setEditTarget(course); setMutationError('') }}
                onViewStudents={() => setStudentsTarget(course)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Course">
        <CourseForm
          onSave={(d) => void handleCreate(d)}
          loading={createCourse.isPending}
          error={mutationError}
        />
      </Modal>

      {/* Edit */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Course Profile">
        {editTarget && (
          <CourseForm
            initial={editTarget}
            onSave={(d) => void handleEdit(d)}
            loading={updateCourse.isPending}
            error={mutationError}
          />
        )}
      </Modal>

      {/* Students */}
      <Modal
        open={!!studentsTarget}
        onClose={() => setStudentsTarget(null)}
        title={`Enrolled Students — ${studentsTarget?.title ?? ''}`}
      >
        {studentsTarget && (
          <StudentsModal course={studentsTarget} onClose={() => setStudentsTarget(null)} />
        )}
      </Modal>
    </DashboardShell>
  )
}
