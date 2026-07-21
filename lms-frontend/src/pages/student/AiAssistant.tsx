import { useState, useRef, useEffect } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { Button } from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Textarea'
import { Badge } from '../../components/ui/Badge'
import { aiService } from '../../services/ai.service'
import type { ChatMessage } from '../../services/ai.service'

function extractError(err: unknown) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    'Something went wrong'
  )
}

export function AiAssistant() {
  const { courseId } = useParams<{ courseId: string }>()
  const location = useLocation()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  
  const initialMsgSent = useRef(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (location.state?.initialMessage && !initialMsgSent.current) {
      initialMsgSent.current = true
      const text = location.state.initialMessage
      setInput(text)
      void triggerInitialSend(text)
    }
  }, [location.state])

  async function triggerInitialSend(text: string) {
    if (!text || loading) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    const nextMessages = [userMsg]
    setMessages(nextMessages)
    setInput('')
    setError('')
    setLoading(true)

    try {
      const res = await aiService.chat(courseId!, text, [])
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.data.reply }])
    } catch (err) {
      setError(extractError(err))
      setMessages(prev => prev.slice(0, -1))
      setInput(text)
    } finally {
      setLoading(false)
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setError('')
    setLoading(true)

    try {
      const history = nextMessages.slice(-11, -1)
      const res = await aiService.chat(courseId!, text, history)
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.data.reply }])
    } catch (err) {
      setError(extractError(err))
      setMessages(prev => prev.slice(0, -1))
      setInput(text)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void sendMessage(e as unknown as React.FormEvent)
    }
  }

  const handleChipClick = (suggestionText: string) => {
    setInput(suggestionText)
    // Auto-send when suggestion chip is clicked:
    void triggerInitialSend(suggestionText)
  }

  const starterChips = [
    { label: 'Summarise syllabus', text: 'Please summarise the current course syllabus and modules.' },
    { label: 'Check assignments', text: 'Are there any upcoming homework tasks or project deadlines?' },
    { label: 'Explain React & TS', text: 'Can you explain the main benefits of pairing React with TypeScript?' }
  ]

  return (
    <DashboardShell title="AI Assistant">
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto space-y-4">
        
        {/* Header navigation bar */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Link to={`/student/courses/${courseId}`} className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Course View
            </Link>
            <span className="text-gray-300 dark:text-slate-600">/</span>
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white">AI Study Assistant</h1>
            </div>
          </div>
          <Badge variant="success">Grounded Model</Badge>
        </div>

        {/* Messaging Board area */}
        <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/40 p-4 space-y-4 shadow-inner">
          
          {messages.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
              <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              
              <div className="space-y-1.5 max-w-sm">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">AI Study Companion</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                  I can review course resources, guide you through homework, and provide answers grounded strictly in your course curriculum.
                </p>
              </div>

              {/* Starter chips */}
              <div className="space-y-2 max-w-sm">
                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">SUGGESTED QUERIES</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {starterChips.map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => handleChipClick(chip.text)}
                      className="text-xs bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-750 text-gray-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400 border border-gray-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 px-3.5 py-1.5 rounded-full shadow-sm font-semibold active:scale-95 transition-all cursor-pointer"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat bubbles list */}
          <div className="space-y-4">
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user'
              return (
                <div key={i} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start animate-fadeIn'}`}>
                  
                  {/* Assistant Avatar */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-slate-700 flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm mt-0.5">
                      ✨
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm border ${
                      isUser
                        ? 'bg-slate-900 dark:bg-indigo-900 border-slate-950 dark:border-indigo-950 text-white rounded-tr-sm'
                        : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-800 dark:text-slate-100 rounded-tl-sm whitespace-pre-wrap font-medium'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Student Avatar */}
                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 shadow-sm mt-0.5">
                      ST
                    </div>
                  )}
                </div>
              )
            })}

            {loading && (
              <div className="flex justify-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-slate-700 flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm mt-0.5">
                  ✨
                </div>
                <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <span className="flex items-center gap-1.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
          </div>

          <div ref={bottomRef} />
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-100 px-4 py-2.5 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* Input box form panel */}
        <form onSubmit={sendMessage} className="flex gap-2 items-end flex-shrink-0 border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 transition-shadow">
          <div className="flex-1">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about this course… (Enter to send, Shift+Enter for new line)"
              rows={2}
              disabled={loading}
              className="border-0 focus:ring-0 px-2 py-1 text-xs resize-none bg-transparent text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-semibold py-2 px-4 shadow active:scale-95 transition-transform text-xs shrink-0"
          >
            Send Message
          </Button>
        </form>
        
        {/* Footnote warning details */}
        <p className="text-[10px] text-gray-400 dark:text-slate-500 text-center flex-shrink-0 select-none leading-none">
          The AI Study Assistant is grounded on course resources and may hallucinate on off-topic questions.
        </p>

      </div>
    </DashboardShell>
  )
}
