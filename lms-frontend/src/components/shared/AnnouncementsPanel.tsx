import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Modal } from '../ui/Modal'
import {
  useAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
} from '../../hooks/useAnnouncements'
import type { Announcement } from '../../services/announcement.service'

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
  })
}

// ─── Form modal ───────────────────────────────────────────────────────────────

interface FormProps {
  courseId: string
  initial?: Announcement
  onClose: () => void
}

function AnnouncementFormModal({ courseId, initial, onClose }: FormProps) {
  const isEdit = !!initial
  const create = useCreateAnnouncement(courseId)
  const update = useUpdateAnnouncement(courseId)

  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [error, setError] = useState('')

  const busy = create.isPending || update.isPending

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      if (isEdit) {
        await update.mutateAsync({ id: initial!.id, title: title.trim(), content: content.trim() })
      } else {
        await create.mutateAsync({ title: title.trim(), content: content.trim() })
      }
      onClose()
    } catch (err) {
      setError(extractError(err))
    }
  }

  return (
    <Modal open onClose={onClose} title={isEdit ? 'Edit Announcement' : 'New Announcement'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <Textarea
          label="Content"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={5}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Post'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface AnnouncementsPanelProps {
  courseId: string
  canEdit?: boolean  // true for lecturer/admin
}

export function AnnouncementsPanel({ courseId, canEdit = false }: AnnouncementsPanelProps) {
  const { data: announcements, isLoading } = useAnnouncements(courseId)
  const deleteAnnouncement = useDeleteAnnouncement(courseId)

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Announcements</h3>
        {canEdit && (
          <Button size="sm" onClick={() => setShowCreate(true)}>+ Post</Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : !announcements?.length ? (
        <p className="text-sm text-gray-400">No announcements yet.</p>
      ) : (
        <ul className="space-y-4">
          {announcements.map(a => (
            <li key={a.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {a.author.name} · {formatDate(a.createdAt)}
                  </p>
                </div>
                {canEdit && (
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(a)}>Edit</Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (confirm('Delete this announcement?')) deleteAnnouncement.mutate(a.id)
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{a.content}</p>
            </li>
          ))}
        </ul>
      )}

      {showCreate && (
        <AnnouncementFormModal courseId={courseId} onClose={() => setShowCreate(false)} />
      )}
      {editing && (
        <AnnouncementFormModal courseId={courseId} initial={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}
