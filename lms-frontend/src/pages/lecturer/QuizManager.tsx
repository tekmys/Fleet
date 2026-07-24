import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Select } from '../../components/ui/Select'
import { useToast } from '../../components/ui/Toast'
import { useQuizzes, useQuizDetails, useCreateQuiz } from '../../hooks/useQuizzes'
import { aiService } from '../../services/ai.service'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function QuizManager() {
  const { courseId } = useParams<{ courseId: string }>()
  const toast = useToast()

  const { data: quizzes, isLoading: listLoading } = useQuizzes(courseId ?? '')
  const createQuiz = useCreateQuiz()

  // Selected quiz states
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null)
  const { data: quizDetail, isLoading: quizLoading } = useQuizDetails(activeQuizId ?? '')

  // Create quiz states
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [timeLimit, setTimeLimit] = useState('15')
  const [maxAttempts, setMaxAttempts] = useState('1')

  // Creating questions states
  const [questions, setQuestions] = useState<any[]>([])

  // Question form state
  const [qText, setQText] = useState('')
  const [optA, setOptA] = useState('')
  const [optB, setOptB] = useState('')
  const [optC, setOptC] = useState('')
  const [optD, setOptD] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('A')
  const [explanation, setExplanation] = useState('')

  // AI Quiz generation state
  const [aiText, setAiText] = useState('')
  const [isAiGenerating, setIsAiGenerating] = useState(false)

  function handleAddQuestion() {
    if (!qText.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      toast('Please fill in all question fields and options', 'error')
      return
    }

    const newQ = {
      questionText: qText,
      options: [
        `A) ${optA.trim()}`,
        `B) ${optB.trim()}`,
        `C) ${optC.trim()}`,
        `D) ${optD.trim()}`,
      ],
      correctAnswer,
      explanation: explanation.trim() || null,
    }

    setQuestions([...questions, newQ])

    // Reset question form
    setQText('')
    setOptA('')
    setOptB('')
    setOptC('')
    setOptD('')
    setCorrectAnswer('A')
    setExplanation('')
  }

  function handleRemoveQuestion(idx: number) {
    setQuestions(questions.filter((_, i) => i !== idx))
  }

  async function handleAiGenerateQuiz() {
    if (!aiText.trim()) {
      toast('Please input reference context text for the AI', 'error')
      return
    }

    setIsAiGenerating(true)
    try {
      const res = await aiService.generateQuiz(courseId ?? '', aiText, 3) // generate 3 questions
      const generated = res.data.data.questions.map((q: any) => {
        // Strip options letters like "A) " from beginning of options if they exist, or clean them
        const cleanOpts = q.options.map((o: string) => {
          return o.replace(/^[A-D]\)\s*/i, '').trim()
        })
        return {
          questionText: q.question,
          options: [
            `A) ${cleanOpts[0] || ''}`,
            `B) ${cleanOpts[1] || ''}`,
            `C) ${cleanOpts[2] || ''}`,
            `D) ${cleanOpts[3] || ''}`,
          ],
          correctAnswer: q.answer,
          explanation: q.explanation || null,
        }
      })

      setQuestions([...questions, ...generated])
      setAiText('')
      toast(`AI successfully generated ${generated.length} questions!`, 'success')
    } catch (err) {
      console.error(err)
      toast('Failed to generate questions via OpenRouter AI', 'error')
    } finally {
      setIsAiGenerating(false)
    }
  }

  async function handleSaveQuiz(e: React.FormEvent) {
    e.preventDefault()
    if (questions.length === 0) {
      toast('You must add at least one question to the quiz', 'error')
      return
    }

    try {
      await createQuiz.mutateAsync({
        title,
        description,
        timeLimit: timeLimit ? parseInt(timeLimit) : undefined,
        maxAttempts: maxAttempts ? parseInt(maxAttempts) : 1,
        courseId: courseId ?? '',
        questions,
      })
      toast('Quiz successfully published!', 'success')
      setShowCreate(false)
      setTitle('')
      setDescription('')
      setTimeLimit('15')
      setMaxAttempts('1')
      setQuestions([])
    } catch (err) {
      console.error(err)
      toast('Failed to create quiz', 'error')
    }
  }

  return (
    <DashboardShell title="Quiz Content Manager">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Breadcrumbs */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors">
          <div>
            <Link
              to={`/lecturer/courses/${courseId}/modules`}
              className="text-sm font-semibold text-indigo-650 dark:text-indigo-400 hover:text-indigo-850 dark:hover:text-indigo-300 flex items-center gap-1 mb-1.5 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Course
            </Link>
            <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">Assessments & Quizzes</h2>
            <p className="text-xs text-gray-550 dark:text-slate-400 mt-0.5">Author manual quizzes, trigger AI generation, and review student grades.</p>
          </div>
          {!activeQuizId && !showCreate && (
            <Button size="sm" onClick={() => setShowCreate(true)}>
              + Create Quiz
            </Button>
          )}
        </div>

        {/* 1. QUIZ DETAILS AND GRADEBOOK ATTEMPTS VIEW */}
        {activeQuizId ? (
          <div className="space-y-6">
            <button
              onClick={() => setActiveQuizId(null)}
              className="text-xs font-bold text-gray-550 hover:text-indigo-600 dark:text-slate-450 dark:hover:text-indigo-400"
            >
              ← Back to Quizzes
            </button>

            {quizLoading || !quizDetail ? (
              <div className="text-center py-12 text-gray-450">Loading quiz details…</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Questions Details List */}
                <div className="col-span-12 lg:col-span-7 space-y-4">
                  <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white">{quizDetail.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">Questions list for lecturer review.</p>
                  </div>

                  <div className="space-y-4">
                    {quizDetail.questions?.map((q, idx) => (
                      <div key={q.id} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-3">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white flex gap-2">
                          <span className="text-indigo-600 font-extrabold">{idx + 1}.</span>
                          <span>{q.questionText}</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-slate-400 pl-4">
                          {q.options.map((opt) => (
                            <div key={opt} className={`p-2 rounded border border-gray-100 dark:border-slate-850 ${
                              opt.charAt(0).toUpperCase() === q.correctAnswer?.toUpperCase() 
                                ? 'bg-emerald-50 border-emerald-250 text-emerald-950 font-bold dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                                : ''
                            }`}>
                              {opt}
                            </div>
                          ))}
                        </div>
                        {q.explanation && (
                          <div className="text-[11px] text-gray-500 bg-slate-50 dark:bg-slate-850 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 italic">
                            Explanation: "{q.explanation}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Student Attempts gradebook */}
                <div className="col-span-12 lg:col-span-5 space-y-4">
                  <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                    <h3 className="text-sm font-bold text-gray-700 dark:text-slate-200">Roster Submissions & Scores</h3>
                  </div>

                  {quizDetail.attempts?.length === 0 ? (
                    <div className="text-center py-12 text-xs text-gray-400 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-850 shadow-sm">
                      No student attempts recorded yet.
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm divide-y divide-gray-100 dark:divide-slate-800 overflow-hidden">
                      {quizDetail.attempts?.map((a: any) => (
                        <div key={a.id} className="p-4 flex items-center justify-between text-xs gap-3">
                          <div>
                            <p className="font-bold text-gray-800 dark:text-slate-350">{a.student?.name || 'Student'}</p>
                            <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{formatDate(a.startedAt)}</p>
                          </div>
                          <span className={`font-black px-2.5 py-1 rounded-full border ${
                            a.score >= 80 
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/30' 
                              : a.score >= 50 
                              ? 'text-amber-700 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/30' 
                              : 'text-rose-700 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-950/30'
                          }`}>
                            {a.score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        /* 2. CREATE A NEW MOCK/MANUAL QUIZ WITH DUAL METHOD */
        ) : showCreate ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Create form and Questions queue */}
            <div className="col-span-12 lg:col-span-7 space-y-4">
              <form onSubmit={handleSaveQuiz} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Quiz Details</h3>
                <Input
                  label="Quiz Title"
                  placeholder="e.g. Week 1 Core Algorithm Check"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <Textarea
                  label="Instructions / Description"
                  placeholder="Provide general exam instructions…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Time Limit (Minutes)"
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    required
                  />
                  <Input
                    label="Max Attempts"
                    type="number"
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(e.target.value)}
                    required
                  />
                </div>

                {/* Configured questions roster */}
                <div className="space-y-3 pt-3 border-t border-gray-150 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-gray-450 uppercase tracking-widest">Questions added ({questions.length})</h4>
                  {questions.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No questions added yet. Use the manual form or AI assistant below to construct questions.</p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {questions.map((q, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-xs flex justify-between items-start gap-4">
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-800 dark:text-slate-200 truncate">{idx + 1}. {q.questionText}</p>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-bold">Answer: {q.correctAnswer}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(idx)}
                            className="text-red-500 hover:text-red-700 font-bold shrink-0"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-150 dark:border-slate-800">
                  <Button type="button" variant="secondary" size="sm" className="dark:bg-slate-850" onClick={() => setShowCreate(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={createQuiz.isPending || questions.length === 0}>
                    {createQuiz.isPending ? 'Publishing…' : 'Publish Quiz'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Manual add & AI generate sidebar options */}
            <div className="col-span-12 lg:col-span-5 space-y-6">
              
              {/* Option A: AI Quiz Generation */}
              <div className="bg-gradient-to-r from-violet-50/70 to-indigo-50/70 dark:from-slate-950/20 dark:to-indigo-950/20 rounded-2xl border border-indigo-150 dark:border-slate-800/80 p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-black text-indigo-950 dark:text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
                  <span>✦</span>
                  <span>AI quiz generator helper</span>
                </h4>
                <p className="text-[11px] text-indigo-900/60 dark:text-slate-400 leading-relaxed">
                  Paste textbook paragraphs or lecture transcripts below. Fleet AI will construct multiple-choice questions automatically.
                </p>
                <Textarea
                  label=""
                  placeholder="Paste context content block here…"
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  className="bg-white/80 dark:bg-slate-900 text-xs h-24"
                />
                <Button
                  type="button"
                  size="sm"
                  className="w-full text-xs font-bold"
                  onClick={handleAiGenerateQuiz}
                  disabled={isAiGenerating}
                >
                  {isAiGenerating ? 'AI Generating questions…' : '✦ Generate AI Questions'}
                </Button>
              </div>

              {/* Option B: Manual Add Question Form */}
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">Manual Question Creator</h4>
                <Textarea
                  label="Question text"
                  placeholder="Type the question here…"
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  className="text-xs h-20"
                />
                
                <div className="space-y-2 pt-1.5">
                  <Input label="Option A" placeholder="Option A text" value={optA} onChange={(e) => setOptA(e.target.value)} className="text-xs" />
                  <Input label="Option B" placeholder="Option B text" value={optB} onChange={(e) => setOptB(e.target.value)} className="text-xs" />
                  <Input label="Option C" placeholder="Option C text" value={optC} onChange={(e) => setOptC(e.target.value)} className="text-xs" />
                  <Input label="Option D" placeholder="Option D text" value={optD} onChange={(e) => setOptD(e.target.value)} className="text-xs" />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1.5">
                  <Select
                    label="Correct Answer"
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    options={[
                      { value: 'A', label: 'Option A' },
                      { value: 'B', label: 'Option B' },
                      { value: 'C', label: 'Option C' },
                      { value: 'D', label: 'Option D' },
                    ]}
                  />
                </div>

                <Input
                  label="Feedback explanation"
                  placeholder="Optional concept feedback details…"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="text-xs"
                />

                <Button type="button" variant="secondary" size="sm" className="w-full text-xs font-bold mt-2" onClick={handleAddQuestion}>
                  + Add to Quiz
                </Button>
              </div>
            </div>
          </div>

        /* 3. SHOW QUIZZES LISTING TABLE FOR LECTURER */
        ) : (
          <div className="space-y-4">
            {listLoading ? (
              <div className="space-y-3">
                <div className="h-16 bg-gray-55/10 rounded animate-pulse" />
                <div className="h-16 bg-gray-55/10 rounded animate-pulse" />
              </div>
            ) : !quizzes?.length ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-850 shadow-sm space-y-2">
                <span className="text-4xl">📊</span>
                <p className="text-sm font-bold text-gray-700 dark:text-white">No quizzes created yet.</p>
                <p className="text-xs text-gray-400">Click "+ Create Quiz" to author your first course examination.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quizzes.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => setActiveQuizId(q.id)}
                    className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 rounded-2xl p-5 shadow-sm hover:shadow transition-all duration-300 cursor-pointer flex justify-between items-center gap-4 group"
                  >
                    <div className="min-w-0 space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-755 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-950/40 px-2 py-0.5 rounded font-mono uppercase">
                          Exam
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                          {q.title}
                        </h3>
                      </div>
                      {q.description && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1 leading-relaxed">{q.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-[10px] text-gray-450 dark:text-slate-500 font-semibold">
                        <span>Attempts Cap: {q.maxAttempts}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
                        <span>Limit: {q.timeLimit ? `${q.timeLimit}m` : 'None'}</span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline">
                        Manage & Grades →
                      </span>
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
