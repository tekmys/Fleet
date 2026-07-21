import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { AnnouncementsPanel } from '../../components/shared/AnnouncementsPanel'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Textarea } from '../../components/ui/Textarea'
import { SkeletonList } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'
import {
  useModules,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
  useAddResource,
  useDeleteResource,
} from '../../hooks/useModules'
import { useCourseProgressStats } from '../../hooks/useProgress'
import type { ResourceType } from '../../types'
import type { Module, Resource } from '../../services/module.service'
import { useCourseEarlyWarnings } from '../../hooks/useAnalytics'
import { AiRiskInsightModal } from '../../components/shared/AiRiskInsightModal'

// ─── helpers ─────────────────────────────────────────────────────────────────

const RESOURCE_TYPE_OPTIONS: { value: ResourceType; label: string }[] = [
  { value: 'LINK', label: 'Link' },
  { value: 'FILE', label: 'File URL' },
  { value: 'VIDEO', label: 'Video' },
]

function resourceTypeBadge(type: ResourceType) {
  const map: Record<ResourceType, { variant: 'info' | 'success' | 'warning' | 'default'; icon: string }> = {
    LINK: { variant: 'info', icon: '🔗' },
    FILE: { variant: 'default', icon: '📄' },
    VIDEO: { variant: 'warning', icon: '▶' },
  }
  const { variant, icon } = map[type]
  return <Badge variant={variant}>{icon} {type}</Badge>
}

function extractError(err: unknown) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    'Something went wrong'
  )
}

// ─── Add Resource inline form ─────────────────────────────────────────────────

interface AddResourceFormProps {
  moduleId: string
  courseId: string
  onDone: () => void
}

function AddResourceForm({ moduleId, courseId, onDone }: AddResourceFormProps) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<ResourceType>('LINK')
  const [url, setUrl] = useState('')
  const [textContent, setTextContent] = useState('')
  const [error, setError] = useState('')
  const addResource = useAddResource(courseId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await addResource.mutateAsync({ 
        moduleId, 
        payload: { title, type, url, textContent: textContent || undefined } 
      })
      setTitle('')
      setUrl('')
      setTextContent('')
      onDone()
    } catch (err) {
      setError(extractError(err))
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="mt-3 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-800 flex flex-col gap-3 transition-colors">
      <p className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Add resource</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Resource title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
        <Select
          value={type}
          onChange={(e) => setType(e.target.value as ResourceType)}
          options={RESOURCE_TYPE_OPTIONS}
        />
        <Input
          placeholder="https://…"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
      </div>
      <div>
        <Textarea
          placeholder="Resource Text Content (for AI Study Assistant RAG) - paste lecture notes, readings, or slides text here..."
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          rows={3}
        />
      </div>
      {error && <p className="text-xs text-red-655 font-semibold">{error}</p>}
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" className="dark:text-slate-350 dark:hover:bg-slate-700" type="button" onClick={onDone}>
          Cancel
        </Button>
        <Button size="sm" type="submit" loading={addResource.isPending}>
          Add resource
        </Button>
      </div>
    </form>
  )
}

// ─── Resource row ─────────────────────────────────────────────────────────────

interface ResourceRowProps {
  resource: Resource
  courseId: string
}

function ResourceRow({ resource, courseId }: ResourceRowProps) {
  const deleteResource = useDeleteResource(courseId)

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/40 group transition-colors">
      <div className="flex-1 flex items-center gap-3 min-w-0">
        {resourceTypeBadge(resource.type)}
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-gray-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline truncate"
        >
          {resource.title}
        </a>
        {resource.textContent && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex-shrink-0 flex items-center gap-0.5">
            ✦ AI Indexed
          </span>
        )}
        <span className="text-xs text-gray-400 dark:text-slate-500 truncate hidden sm:block font-medium">{resource.url}</span>
      </div>
      <button
        onClick={() => void deleteResource.mutateAsync(resource.id)}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1 rounded cursor-pointer"
        title="Delete resource"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// ─── Module card ──────────────────────────────────────────────────────────────

interface ModuleCardProps {
  mod: Module
  index: number
  total: number
  courseId: string
  onEdit: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

function ModuleCard({ mod, index, total, courseId, onEdit, onMoveUp, onMoveDown }: ModuleCardProps) {
  const [expanded, setExpanded] = useState(true)
  const [showAddResource, setShowAddResource] = useState(false)
  const deleteModule = useDeleteModule(courseId)
  const toast = useToast()

  async function handleDelete() {
    if (!confirm(`Delete module "${mod.title}"? All its resources will also be removed.`)) return
    try {
      await deleteModule.mutateAsync(mod.id)
      toast('Module deleted', 'success')
    } catch {
      toast('Failed to delete module', 'error')
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors shadow-sm">
      {/* Module header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/80 dark:bg-slate-800/30 border-b border-gray-100 dark:border-slate-800 transition-colors">
        {/* Order controls */}
        <div className="flex flex-col gap-0.5">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-0.5 rounded text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Move up"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-0.5 rounded text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Move down"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>

        <span className="text-xs font-mono text-gray-400 dark:text-slate-500 w-6 text-center">{index + 1}</span>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 text-left font-bold text-gray-900 dark:text-white text-sm hover:text-indigo-650 dark:hover:text-indigo-400 cursor-pointer"
        >
          {mod.title}
        </button>

        <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">{mod.resources.length} resource{mod.resources.length !== 1 ? 's' : ''}</span>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="dark:text-slate-350 dark:hover:bg-slate-800" onClick={onEdit}>Edit</Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
            onClick={() => void handleDelete()}
          >
            Delete
          </Button>
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-gray-405 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 p-1 cursor-pointer"
        >
          <svg
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      {/* Resources */}
      {expanded && (
        <div className="px-4 py-3 space-y-1">
          {mod.resources.length === 0 && !showAddResource && (
            <p className="text-sm text-gray-400 dark:text-slate-500 py-2 text-center font-medium">No resources yet.</p>
          )}
          {mod.resources.map((r) => (
            <ResourceRow key={r.id} resource={r} courseId={courseId} />
          ))}

          {showAddResource ? (
            <AddResourceForm
              moduleId={mod.id}
              courseId={courseId}
              onDone={() => setShowAddResource(false)}
            />
          ) : (
            <button
              onClick={() => setShowAddResource(true)}
              className="mt-1 w-full text-xs font-bold text-indigo-600 dark:text-indigo-400 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all text-center cursor-pointer"
            >
              + Add Resource Item
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Progress Matrix Tab ──────────────────────────────────────────────────────

function ProgressMatrixTab({ courseId }: { courseId: string }) {
  const { data: stats, isLoading, isError } = useCourseProgressStats(courseId)

  if (isLoading) {
    return <SkeletonList rows={5} />
  }

  if (isError || !stats) {
    return <div className="text-center py-12 text-rose-500 font-semibold bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">Failed to load progress stats.</div>
  }

  const averageClassProgress = stats.students.length > 0
    ? Math.round(stats.students.reduce((sum, s) => sum + s.progressPercent, 0) / stats.students.length)
    : 0

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Total Resources</span>
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{stats.totalResources}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Enrolled Students</span>
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{stats.studentsCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-450 uppercase tracking-wider">Class Completion Avg</span>
          <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{averageClassProgress}%</span>
        </div>
      </div>

      {/* Module Engagement Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5">Module Completion Rates</h3>
        {stats.modules.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-6">No modules created yet.</p>
        ) : (
          <div className="space-y-4">
            {stats.modules.map((m) => (
              <div key={m.id} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-700 dark:text-slate-200">{m.title}</span>
                  <span className="text-emerald-650 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                    {m.averageCompletionPercent}% Avg
                  </span>
                </div>
                <div className="h-3 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden border border-gray-50 dark:border-slate-750">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${m.averageCompletionPercent}%` }}
                  />
                </div>
                <div className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                  Configured content: {m.totalResources} items
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student completions list */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Individual Student Completions</h3>
        </div>
        {stats.students.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-10">No students enrolled yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-250 dark:divide-slate-800 text-sm">
              <thead className="bg-gray-50/70 dark:bg-slate-800/40">
                <tr>
                  <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-350">Student Info</th>
                  <th className="px-5 py-3.5 text-center font-semibold text-gray-600 dark:text-slate-350">Resources Completed</th>
                  <th className="px-5 py-3.5 text-right font-semibold text-gray-600 dark:text-slate-350">Completions Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {stats.students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-gray-900 dark:text-white">{student.name}</div>
                      <div className="text-xs text-gray-400 dark:text-slate-500">{student.email}</div>
                    </td>
                    <td className="px-5 py-3.5 text-center font-medium text-gray-700 dark:text-slate-300">
                      {student.completedCount} / {stats.totalResources}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          student.progressPercent < 40
                            ? 'text-amber-750 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/30'
                            : 'text-emerald-750 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/30'
                        }`}
                      >
                        {student.progressPercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Early Warnings Tab ───────────────────────────────────────────────────────

function EarlyWarningsTab({ courseId }: { courseId: string }) {
  const { data: warnings, isLoading, isError } = useCourseEarlyWarnings(courseId)
  const [insightStudent, setInsightStudent] = useState<{ id: string, name: string } | null>(null)

  if (isLoading) return <SkeletonList rows={5} />
  if (isError || !warnings) return <div className="text-center py-12 text-rose-500 font-semibold bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">Failed to load early warnings.</div>

  const highRiskCount = warnings.filter(w => w.riskLevel === 'HIGH').length
  const mediumRiskCount = warnings.filter(w => w.riskLevel === 'MEDIUM').length

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-red-50 dark:bg-rose-950/15 p-5 rounded-2xl border border-red-100 dark:border-rose-900/20 flex flex-col justify-between transition-colors">
          <span className="text-[11px] font-bold text-red-800 dark:text-rose-350 uppercase tracking-wider">High Risk Students</span>
          <span className="text-3xl font-extrabold text-red-650 dark:text-rose-450 mt-2">{highRiskCount}</span>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/15 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/20 flex flex-col justify-between transition-colors">
          <span className="text-[11px] font-bold text-amber-800 dark:text-amber-350 uppercase tracking-wider">Medium Risk Students</span>
          <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">{mediumRiskCount}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">At-Risk Students List</h3>
        </div>
        {warnings.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-10">No enrolled students.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800 text-sm">
              <thead className="bg-gray-55/70 dark:bg-slate-800/40">
                <tr>
                  <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-350">Student Info</th>
                  <th className="px-5 py-3.5 text-center font-semibold text-gray-600 dark:text-slate-350">Resource %</th>
                  <th className="px-5 py-3.5 text-center font-semibold text-gray-600 dark:text-slate-350">Avg Grade</th>
                  <th className="px-5 py-3.5 text-center font-semibold text-gray-600 dark:text-slate-350">Missed</th>
                  <th className="px-5 py-3.5 text-center font-semibold text-gray-600 dark:text-slate-350">Risk Level</th>
                  <th className="px-5 py-3.5 text-right font-semibold text-gray-600 dark:text-slate-350">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                {warnings.map((student) => (
                  <tr key={student.studentId} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-gray-900 dark:text-white">{student.name}</div>
                      <div className="text-xs text-gray-400 dark:text-slate-500">{student.email}</div>
                    </td>
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      <span className={student.completionPercent < 40 ? 'text-rose-600 dark:text-rose-400 font-extrabold' : 'font-semibold text-gray-700 dark:text-slate-300'}>
                        {student.completionPercent}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      <span className={student.averageGrade !== null && student.averageGrade < 50 ? 'text-rose-600 dark:text-rose-400 font-extrabold' : 'font-semibold text-gray-700 dark:text-slate-300'}>
                        {student.averageGrade !== null ? student.averageGrade + '%' : 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      <span className={student.missedAssignments > 0 ? 'text-rose-650 dark:text-rose-400 font-extrabold' : 'font-semibold text-gray-700 dark:text-slate-300'}>
                        {student.missedAssignments}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          student.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-rose-950/40 dark:text-rose-400' :
                          student.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        }`}
                      >
                        {student.riskLevel}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      {(student.riskLevel === 'HIGH' || student.riskLevel === 'MEDIUM') && (
                        <Button 
                          size="sm" 
                          variant="secondary"
                          className="dark:bg-slate-850 dark:text-slate-200 dark:border-slate-700"
                          onClick={() => setInsightStudent({ id: student.studentId, name: student.name })}
                        >
                          ✦ AI Insight
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AiRiskInsightModal 
        open={!!insightStudent}
        onClose={() => setInsightStudent(null)}
        courseId={courseId}
        studentId={insightStudent?.id ?? null}
        studentName={insightStudent?.name ?? ''}
      />
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function CourseModules() {
  const { courseId } = useParams<{ courseId: string }>()
  const id = courseId!
  const toast = useToast()

  const { data: modules, isLoading, isError } = useModules(id)
  const createModule = useCreateModule(id)
  const updateModule = useUpdateModule(id)

  const [activeTab, setActiveTab] = useState<'modules' | 'progress' | 'early-warnings'>('modules')
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<Module | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [mutationError, setMutationError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setMutationError('')
    try {
      await createModule.mutateAsync(newTitle)
      setNewTitle('')
      setShowCreate(false)
      toast('Module created', 'success')
    } catch (err) {
      setMutationError(extractError(err))
      toast('Failed to create module', 'error')
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editTarget) return
    setMutationError('')
    try {
      await updateModule.mutateAsync({ id: editTarget.id, payload: { title: editTitle } })
      setEditTarget(null)
      toast('Module renamed', 'success')
    } catch (err) {
      setMutationError(extractError(err))
      toast('Failed to rename module', 'error')
    }
  }

  async function handleReorder(mod: Module, direction: 'up' | 'down') {
    if (!modules) return
    const sorted = [...modules].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex((m) => m.id === mod.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return

    const swapTarget = sorted[swapIdx]
    await Promise.all([
      updateModule.mutateAsync({ id: mod.id, payload: { order: swapTarget.order } }),
      updateModule.mutateAsync({ id: swapTarget.id, payload: { order: mod.order } }),
    ])
  }

  const sorted = [...(modules ?? [])].sort((a, b) => a.order - b.order)

  return (
    <DashboardShell title="Course Content Manager">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Back + header card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors">
          <div>
            <Link
              to="/lecturer/courses"
              className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-850 dark:hover:text-indigo-300 flex items-center gap-1 mb-2 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              My Courses
            </Link>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Course Content</h2>
            <p className="text-sm text-gray-500 dark:text-slate-450 mt-1">{sorted.length} module{sorted.length !== 1 ? 's' : ''} configured</p>
          </div>
          {activeTab === 'modules' && (
            <Button size="sm" onClick={() => { setShowCreate(true); setNewTitle(''); setMutationError('') }}>
              + Add module
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-205 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'modules'
                ? 'border-indigo-500 dark:border-indigo-400 text-indigo-650 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-205'
            }`}
          >
            Manage Modules & Resources
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'progress'
                ? 'border-indigo-500 dark:border-indigo-400 text-indigo-650 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-205'
            }`}
          >
            Student Progress Matrix
          </button>
          <button
            onClick={() => setActiveTab('early-warnings')}
            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'early-warnings'
                ? 'border-indigo-500 dark:border-indigo-400 text-indigo-650 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-205'
            }`}
          >
            Early Warnings
          </button>
        </div>

        {/* Content Panel */}
        {activeTab === 'modules' ? (
          <div className="space-y-4">
            {/* List */}
            {isLoading && <SkeletonList rows={4} />}
            {isError && <div className="text-center py-16 text-red-500 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">Failed to load modules.</div>}

            {!isLoading && sorted.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
                <p className="text-gray-400 dark:text-slate-500 font-medium">No modules yet. Add one to get started.</p>
                <Button className="mt-4" size="sm" onClick={() => setShowCreate(true)}>Add first module</Button>
              </div>
            )}

            <div className="space-y-3">
              {sorted.map((mod, index) => (
                <ModuleCard
                  key={mod.id}
                  mod={mod}
                  index={index}
                  total={sorted.length}
                  courseId={id}
                  onEdit={() => { setEditTarget(mod); setEditTitle(mod.title); setMutationError('') }}
                  onMoveUp={() => void handleReorder(mod, 'up')}
                  onMoveDown={() => void handleReorder(mod, 'down')}
                />
              ))}
            </div>

            <AnnouncementsPanel courseId={id} canEdit />
          </div>
        ) : activeTab === 'progress' ? (
          <ProgressMatrixTab courseId={id} />
        ) : (
          <EarlyWarningsTab courseId={id} />
        )}
      </div>

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Module" size="sm">
        <form onSubmit={(e) => void handleCreate(e)} className="flex flex-col gap-4">
          <Input
            label="Module title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            autoFocus
            placeholder="e.g. Introduction to the Course"
          />
          {mutationError && <p className="text-xs text-red-655 font-semibold">{mutationError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={createModule.isPending}>Add module</Button>
          </div>
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Rename Module" size="sm">
        <form onSubmit={(e) => void handleEdit(e)} className="flex flex-col gap-4">
          <Input
            label="Module title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
            autoFocus
          />
          {mutationError && <p className="text-xs text-red-655 font-semibold">{mutationError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button type="submit" loading={updateModule.isPending}>Save</Button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  )
}
