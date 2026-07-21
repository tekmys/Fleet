import { useState } from 'react'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Textarea } from '../../components/ui/Textarea'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Skeleton } from '../../components/ui/Skeleton'
import {
  useCourses,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
  useEnrolStudent,
  useCourseStudents,
} from '../../hooks/useCourses'
import { useUsers } from '../../hooks/useUsers'
import type { Course, CourseStatus } from '../../types'

// ─── helpers ─────────────────────────────────────────────────────────────────

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
  onSave: (d: { title: string; code: string; description: string; status: CourseStatus; lecturerId: string }) => void
  loading: boolean
  error: string
}

function CourseForm({ initial, onSave, loading, error }: CourseFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [code, setCode] = useState(initial?.code ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [status, setStatus] = useState<CourseStatus>(initial?.status ?? 'DRAFT')
  const [lecturerId, setLecturerId] = useState(initial?.lecturerId ?? '')

  const { data: lecturerData } = useUsers({ role: 'LECTURER', limit: 100 })
  const lecturerOptions = (lecturerData?.users ?? []).map((u) => ({ value: u.id, label: u.name }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({ title, code, description, status, lecturerId })
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
      <Select
        label="Lecturer"
        value={lecturerId}
        onChange={(e) => setLecturerId(e.target.value)}
        options={lecturerOptions}
        placeholder="Select a lecturer…"
        required
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

// ─── Enrol modal ──────────────────────────────────────────────────────────────

function EnrolModal({
  course,
  onClose,
}: {
  course: Course
  onClose: () => void
}) {
  const [studentId, setStudentId] = useState('')
  const [error, setError] = useState('')
  const enrol = useEnrolStudent()
  const { data: studentsData } = useCourseStudents(course.id)
  const enrolledIds = new Set(studentsData?.map((e) => e.studentId) ?? [])

  const { data: allStudents } = useUsers({ role: 'STUDENT', limit: 200 })
  const available = (allStudents?.users ?? []).filter(
    (u) => u.isActive && !enrolledIds.has(u.id),
  )

  async function handleEnrol(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await enrol.mutateAsync({ courseId: course.id, studentId })
      setStudentId('')
    } catch (err) {
      setError(extractError(err))
    }
  }

  return (
    <div className="space-y-4">
      {/* Already enrolled */}
      {studentsData && studentsData.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-450 uppercase tracking-wider mb-2">
            Enrolled ({studentsData.length})
          </p>
          <ul className="divide-y divide-gray-50 dark:divide-slate-800 border border-gray-100 dark:border-slate-750 rounded-lg overflow-hidden max-h-40 overflow-y-auto bg-white dark:bg-slate-900">
            {studentsData.map((enrolment) => (
              <li key={enrolment.id} className="flex items-center gap-2 px-3 py-2.5 text-sm">
                <div className="w-6 h-6 rounded-full bg-gray-150 dark:bg-slate-800 text-gray-600 dark:text-slate-450 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {enrolment.student?.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{enrolment.student?.name}</span>
                <span className="text-gray-400 dark:text-slate-500 text-xs ml-auto font-medium">{enrolment.student?.email}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add student */}
      <form onSubmit={(e) => void handleEnrol(e)} className="flex flex-col gap-3">
        <Select
          label="Add student"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          options={available.map((u) => ({ value: u.id, label: `${u.name} (${u.email})` }))}
          placeholder={available.length ? 'Select a student…' : 'No students available'}
        />
        {error && <p className="text-xs text-red-655 font-semibold">{error}</p>}
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={!studentId} loading={enrol.isPending}>
            Enrol Student
          </Button>
        </div>
      </form>

      <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-slate-800">
        <Button variant="secondary" size="sm" className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function CourseManagement() {
  const [statusFilter, setStatusFilter] = useState<CourseStatus | ''>('')
  const [page, setPage] = useState(1)
  const LIMIT = 15

  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<Course | null>(null)
  const [enrolTarget, setEnrolTarget] = useState<Course | null>(null)
  const [mutationError, setMutationError] = useState('')

  const { data, isLoading, isError } = useCourses({
    status: statusFilter || undefined,
    page,
    limit: LIMIT,
  })

  const createCourse = useCreateCourse()
  const updateCourse = useUpdateCourse()
  const deleteCourse = useDeleteCourse()

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1

  type CourseFormData = { title: string; code: string; description: string; status: CourseStatus; lecturerId: string }

  async function handleCreate(form: CourseFormData) {
    setMutationError('')
    try {
      await createCourse.mutateAsync(form)
      setShowCreate(false)
    } catch (err) {
      setMutationError(extractError(err))
    }
  }

  async function handleEdit(form: CourseFormData) {
    if (!editTarget) return
    setMutationError('')
    try {
      await updateCourse.mutateAsync({ id: editTarget.id, payload: form })
      setEditTarget(null)
    } catch (err) {
      setMutationError(extractError(err))
    }
  }

  async function handleDelete(course: Course) {
    if (!confirm(`Delete "${course.title}"? This cannot be undone.`)) return
    await deleteCourse.mutateAsync(course.id)
  }

  return (
    <DashboardShell title="Course Management">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">System Courses</h2>
            <p className="text-xs text-gray-550 dark:text-slate-450">{data ? `${data.total} registered courses` : 'Loading courses…'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              options={[{ value: '', label: 'All statuses' }, ...STATUS_OPTIONS]}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as CourseStatus | ''); setPage(1) }}
              className="w-40"
            />
            <Button onClick={() => { setShowCreate(true); setMutationError('') }}>
              + New course
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-805/40">
                  <th className="text-left px-4 py-3 font-semibold text-gray-650 dark:text-slate-350">Course</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-650 dark:text-slate-350">Code</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-655 dark:text-slate-350">Lecturer</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-655 dark:text-slate-350">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-655 dark:text-slate-350">Students</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {isLoading && Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-gray-100 dark:border-slate-800/50">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-44" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-18 rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-7 w-16 ml-auto rounded-lg" /></td>
                  </tr>
                ))}
                {isError && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-rose-500 font-semibold">Failed to load courses.</td>
                  </tr>
                )}
                {data?.courses.map((course) => (
                  <tr key={course.id} className="border-b border-gray-50 dark:border-slate-800/50 hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-900 dark:text-white block">{course.title}</span>
                      {course.description && (
                        <p className="text-xs text-gray-400 dark:text-slate-500 truncate max-w-xs mt-0.5">{course.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-300 px-2 py-0.5 rounded font-mono border border-transparent dark:border-slate-700">{course.code}</code>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-300 font-medium">{course.lecturer?.name ?? '—'}</td>
                    <td className="px-4 py-3">{statusBadge(course.status)}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-300 font-medium">{course._count?.enrolments ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="dark:text-slate-350 dark:hover:bg-slate-800"
                          onClick={() => setEnrolTarget(course)}
                        >
                          Enrol
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="dark:text-slate-350 dark:hover:bg-slate-800"
                          onClick={() => { setEditTarget(course); setMutationError('') }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          onClick={() => void handleDelete(course)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data?.courses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">No courses found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
              <p className="text-xs text-gray-500 dark:text-slate-450 font-semibold">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="secondary" size="sm" className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
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
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Course Details">
        {editTarget && (
          <CourseForm
            initial={editTarget}
            onSave={(d) => void handleEdit(d)}
            loading={updateCourse.isPending}
            error={mutationError}
          />
        )}
      </Modal>

      {/* Enrol */}
      <Modal
        open={!!enrolTarget}
        onClose={() => setEnrolTarget(null)}
        title={`Enrol Students — ${enrolTarget?.title ?? ''}`}
      >
        {enrolTarget && (
          <EnrolModal course={enrolTarget} onClose={() => setEnrolTarget(null)} />
        )}
      </Modal>
    </DashboardShell>
  )
}
