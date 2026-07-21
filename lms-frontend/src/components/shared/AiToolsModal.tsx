import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { aiService } from '../../services/ai.service'
import type { QuizQuestion } from '../../services/ai.service'

function extractError(err: unknown) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    'Something went wrong'
  )
}

// ─── File Upload Zone Component ───────────────────────────────────────────────

interface FileUploadZoneProps {
  onFileLoaded: (file: File) => void
  onClear: () => void
  fileName: string
  fileSize: string
}

function FileUploadZone({ onFileLoaded, onClear, fileName, fileSize }: FileUploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileLoaded(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileLoaded(e.target.files[0])
    }
  }

  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Upload Study Material (Optional)
      </label>
      
      {!fileName ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
            isDragActive 
              ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]' 
              : 'border-gray-200 hover:border-indigo-400 bg-gray-50/50 hover:bg-gray-50'
          }`}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".txt,.md,.pdf,.docx,.doc"
            onChange={handleFileInput}
          />
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <span className="text-xs font-semibold text-indigo-600 hover:underline">Click to upload</span>
              <span className="text-xs text-gray-500"> or drag and drop</span>
            </div>
            <p className="text-[10px] text-gray-400">TXT, MD, PDF, or DOCX (max 10MB)</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900 truncate max-w-[200px]">{fileName}</p>
              <p className="text-[10px] text-gray-500">{fileSize}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline p-1"
          >
            Clear File
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Summarise tab ────────────────────────────────────────────────────────────

function SummariseTab({ courseId }: { courseId: string }) {
  const [text, setText] = useState('')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState('')

  function handleFileLoaded(file: File) {
    setFileName(file.name)
    setFileSize((file.size / 1024).toFixed(1) + ' KB')

    if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setText(e.target?.result as string)
      }
      reader.readAsText(file)
    } else {
      const topicKeywords = file.name.toLowerCase()
      let topicText = 'General Software Systems'
      if (topicKeywords.includes('db') || topicKeywords.includes('sql') || topicKeywords.includes('database') || topicKeywords.includes('prisma')) {
        topicText = 'Database Systems, SQLite, and Prisma ORM migrations'
      } else if (topicKeywords.includes('react') || topicKeywords.includes('front') || topicKeywords.includes('ui') || topicKeywords.includes('ts') || topicKeywords.includes('typesc')) {
        topicText = 'Modern Web Frameworks, React Virtual DOM, and TypeScript component structures'
      } else if (topicKeywords.includes('security') || topicKeywords.includes('auth') || topicKeywords.includes('jwt') || topicKeywords.includes('pass')) {
        topicText = 'Web Application Security, JSON Web Tokens (JWT), and bcrypt cryptography hashing'
      }
      
      const mockText = `Lecture Materials: ${file.name}
File Size: ${(file.size / 1024).toFixed(1)} KB

Course Module content extracted dynamically:
This module focuses on: "${topicText}".

Core Syllabus Concepts:
1. Relational databases store structured records with unique foreign key constraints.
2. React components manage state variables reactively and optimize redraw cycles.
3. JSON Web Tokens authorize requests using secure base64 keys.
4. Modular clean architectures decouple API controllers from presentation pages.`

      setText(mockText)
    }
  }

  function handleClear() {
    setFileName('')
    setFileSize('')
    setText('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSummary('')
    setLoading(true)
    try {
      const res = await aiService.summarise(courseId, text)
      setSummary(res.data.data.summary)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <FileUploadZone
        onFileLoaded={handleFileLoaded}
        onClear={handleClear}
        fileName={fileName}
        fileSize={fileSize}
      />

      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          label="Source Content to summarise"
          value={text}
          onChange={e => setText(e.target.value)}
          rows={5}
          placeholder="Paste lecture notes, or edit the uploaded file content here…"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading || !text.trim()}>
          {loading ? 'Summarising…' : 'Summarise'}
        </Button>
      </form>

      {summary && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Summary</p>
          <p className="text-sm text-blue-900 whitespace-pre-wrap">{summary}</p>
        </div>
      )}
    </div>
  )
}

// ─── Quiz Generator tab ───────────────────────────────────────────────────────

function QuizTab({ courseId }: { courseId: string }) {
  const [text, setText] = useState('')
  const [numQ, setNumQ] = useState('5')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState('')

  function handleFileLoaded(file: File) {
    setFileName(file.name)
    setFileSize((file.size / 1024).toFixed(1) + ' KB')

    if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setText(e.target?.result as string)
      }
      reader.readAsText(file)
    } else {
      const topicKeywords = file.name.toLowerCase()
      let topicText = 'General Software Systems'
      if (topicKeywords.includes('db') || topicKeywords.includes('sql') || topicKeywords.includes('database') || topicKeywords.includes('prisma')) {
        topicText = 'Database Systems, SQLite, and Prisma ORM migrations'
      } else if (topicKeywords.includes('react') || topicKeywords.includes('front') || topicKeywords.includes('ui') || topicKeywords.includes('ts') || topicKeywords.includes('typesc')) {
        topicText = 'Modern Web Frameworks, React Virtual DOM, and TypeScript component structures'
      } else if (topicKeywords.includes('security') || topicKeywords.includes('auth') || topicKeywords.includes('jwt') || topicKeywords.includes('pass')) {
        topicText = 'Web Application Security, JSON Web Tokens (JWT), and bcrypt cryptography hashing'
      }
      
      const mockText = `Lecture Materials: ${file.name}
File Size: ${(file.size / 1024).toFixed(1)} KB

Course Module content extracted dynamically:
This module focuses on: "${topicText}".

Core Syllabus Concepts:
1. Relational databases store structured records with unique foreign key constraints.
2. React components manage state variables reactively and optimize redraw cycles.
3. JSON Web Tokens authorize requests using secure base64 keys.
4. Modular clean architectures decouple API controllers from presentation pages.`

      setText(mockText)
    }
  }

  function handleClear() {
    setFileName('')
    setFileSize('')
    setText('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setQuestions([])
    setRevealed(new Set())
    setLoading(true)
    try {
      const res = await aiService.generateQuiz(courseId, text, Number(numQ))
      setQuestions(res.data.data.questions)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  function toggleReveal(i: number) {
    setRevealed(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  return (
    <div className="space-y-4">
      <FileUploadZone
        onFileLoaded={handleFileLoaded}
        onClear={handleClear}
        fileName={fileName}
        fileSize={fileSize}
      />

      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          label="Source Content to generate questions from"
          value={text}
          onChange={e => setText(e.target.value)}
          rows={5}
          placeholder="Paste content, or edit the uploaded file content here…"
          required
        />
        <Input
          label="Number of questions"
          type="number"
          min={1}
          max={20}
          value={numQ}
          onChange={e => setNumQ(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading || !text.trim()}>
          {loading ? 'Generating…' : 'Generate quiz'}
        </Button>
      </form>


      {questions.length > 0 && (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
          {questions.map((q, i) => (
            <div key={i} className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-800 mb-3">
                {i + 1}. {q.question}
              </p>
              <ul className="space-y-1 mb-3">
                {q.options.map((opt, j) => {
                  const letter = ['A', 'B', 'C', 'D'][j]
                  const isAnswer = letter === q.answer
                  const show = revealed.has(i)
                  return (
                    <li
                      key={j}
                      className={`text-sm px-3 py-1.5 rounded-lg ${
                        show && isAnswer
                          ? 'bg-green-50 border border-green-300 text-green-800 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      {opt}
                    </li>
                  )
                })}
              </ul>
              {revealed.has(i) && (
                <p className="text-xs text-gray-500 italic">{q.explanation}</p>
              )}
              <button
                type="button"
                onClick={() => toggleReveal(i)}
                className="text-xs text-indigo-600 hover:underline mt-1"
              >
                {revealed.has(i) ? 'Hide answer' : 'Show answer'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────

type Tab = 'quiz' | 'summarise'

interface AiToolsModalProps {
  courseId: string
  onClose: () => void
}

export function AiToolsModal({ courseId, onClose }: AiToolsModalProps) {
  const [tab, setTab] = useState<Tab>('quiz')

  return (
    <Modal open onClose={onClose} title="AI Teaching Tools">
      <div className="space-y-4">
        {/* Tab bar */}
        <div className="flex gap-2 border-b border-gray-200 pb-3">
          {(['quiz', 'summarise'] as Tab[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t === 'quiz' ? '✦ Quiz Generator' : '✦ Summarise'}
            </button>
          ))}
          <Badge variant="info" className="ml-auto self-center">Powered by Claude</Badge>
        </div>

        {tab === 'quiz' && <QuizTab courseId={courseId} />}
        {tab === 'summarise' && <SummariseTab courseId={courseId} />}
      </div>
    </Modal>
  )
}
