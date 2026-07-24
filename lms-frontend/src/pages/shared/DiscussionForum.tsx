import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Badge } from '../../components/ui/Badge'
import { useAuthStore } from '../../store/authStore'
import {
  useForumTopics,
  useForumTopicDetails,
  useCreateForumTopic,
  useReplyToForumTopic,
} from '../../hooks/useForums'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function DiscussionForum() {
  const { courseId } = useParams<{ courseId: string }>()
  const user = useAuthStore((s) => s.user)
  const isLecturer = user?.role === 'LECTURER'

  const { data: topics, isLoading: topicsLoading } = useForumTopics(courseId ?? '')
  const createTopic = useCreateForumTopic()
  const replyToTopic = useReplyToForumTopic()

  const [activeTopicId, setActiveTopicId] = useState<string | null>(null)
  const { data: activeTopic, isLoading: topicLoading } = useForumTopicDetails(activeTopicId ?? '')

  // Create topic state
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')

  // Create reply state
  const [newReply, setNewReply] = useState('')

  async function handleCreateTopic(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) return
    try {
      await createTopic.mutateAsync({
        title: newTitle,
        content: newContent,
        courseId: courseId ?? '',
      })
      setNewTitle('')
      setNewContent('')
      setShowCreate(false)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleCreateReply(e: React.FormEvent) {
    e.preventDefault()
    if (!newReply.trim() || !activeTopicId) return
    try {
      await replyToTopic.mutateAsync({
        topicId: activeTopicId,
        content: newReply,
      })
      setNewReply('')
    } catch (err) {
      console.error(err)
    }
  }

  const courseBackPath = isLecturer 
    ? `/lecturer/courses/${courseId}/modules` 
    : `/student/courses/${courseId}`

  return (
    <DashboardShell title="Discussion Forum">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Breadcrumbs */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors">
          <div>
            <Link
              to={courseBackPath}
              className="text-sm font-semibold text-indigo-650 dark:text-indigo-400 hover:text-indigo-850 dark:hover:text-indigo-300 flex items-center gap-1 mb-1.5 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Course
            </Link>
            <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">Discussion Board</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Collaborate, share queries, and discuss assignments with peers.</p>
          </div>
          {!activeTopicId && !showCreate && (
            <Button size="sm" onClick={() => setShowCreate(true)}>
              + Start Discussion
            </Button>
          )}
        </div>

        {/* 1. VIEW DETAILED TOPIC THREAD */}
        {activeTopicId ? (
          <div className="space-y-6">
            <button
              onClick={() => setActiveTopicId(null)}
              className="text-xs font-bold text-gray-550 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 flex items-center gap-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-3 py-1.5 rounded-lg shadow-sm transition-all"
            >
              ← Back to Board
            </button>

            {topicLoading || !activeTopic ? (
              <div className="text-center py-12 text-gray-400">Loading discussion thread…</div>
            ) : (
              <div className="space-y-6">
                {/* Main Topic Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                      {activeTopic.author.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span>{activeTopic.author.name}</span>
                        <Badge variant={activeTopic.author.role === 'LECTURER' ? 'success' : 'info'}>
                          {activeTopic.author.role}
                        </Badge>
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{formatDate(activeTopic.createdAt)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">{activeTopic.title}</h3>
                    <p className="text-sm text-gray-650 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{activeTopic.content}</p>
                  </div>
                </div>

                {/* Replies Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-450 dark:text-slate-500 uppercase tracking-widest px-1">Replies ({activeTopic.posts?.length ?? 0})</h4>
                  
                  {activeTopic.posts?.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-400 bg-gray-50/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-850">
                      No replies yet. Be the first to start the conversation!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeTopic.posts?.map((post) => (
                        <div key={post.id} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 flex items-center justify-center font-semibold text-xs">
                              {post.author.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span>{post.author.name}</span>
                                <Badge variant={post.author.role === 'LECTURER' ? 'success' : 'info'}>
                                  {post.author.role}
                                </Badge>
                              </p>
                              <p className="text-[9px] text-gray-400 dark:text-slate-500 mt-0.5">{formatDate(post.createdAt)}</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-700 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleCreateReply} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                  <Textarea
                    label="Reply to Discussion"
                    placeholder="Type your reply here…"
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    required
                  />
                  <div className="flex justify-end">
                    <Button type="submit" size="sm" disabled={replyToTopic.isPending}>
                      {replyToTopic.isPending ? 'Posting…' : 'Post Reply'}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

        /* 2. CREATE A NEW DISCUSSION TOPIC */
        ) : showCreate ? (
          <form onSubmit={handleCreateTopic} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Start a New Discussion</h3>
            <Input
              label="Topic Title"
              placeholder="e.g. Question about Homework 2 database keys"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <Textarea
              label="Discussion Content"
              placeholder="Provide context, code snippets, or study queries…"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              required
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" size="sm" className="dark:bg-slate-850" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={createTopic.isPending}>
                {createTopic.isPending ? 'Creating…' : 'Start Topic'}
              </Button>
            </div>
          </form>

        /* 3. DISCUSSION THREADS LIST BOARD */
        ) : (
          <div className="space-y-4">
            {topicsLoading ? (
              <div className="space-y-3">
                <div className="h-16 bg-gray-55/10 rounded animate-pulse" />
                <div className="h-16 bg-gray-55/10 rounded animate-pulse" />
              </div>
            ) : !topics?.length ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-850 shadow-sm space-y-2">
                <span className="text-4xl">💬</span>
                <p className="text-sm font-bold text-gray-700 dark:text-white">No discussions started yet.</p>
                <p className="text-xs text-gray-400">Click "+ Start Discussion" to share your first post with the class!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topics.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setActiveTopicId(t.id)}
                    className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 rounded-2xl p-5 shadow-sm hover:shadow transition-all duration-300 cursor-pointer flex justify-between items-center gap-4 group"
                  >
                    <div className="min-w-0 space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded uppercase font-mono">
                          Topic
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                          {t.title}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
                        {t.content}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-slate-500 font-semibold">
                        <span>Started by: {t.author.name}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
                        <span>{formatDate(t.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center shrink-0 bg-slate-50 dark:bg-slate-850 px-3.5 py-2 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                      <span className="text-sm font-extrabold">{t._count?.posts ?? 0}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider">Replies</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
