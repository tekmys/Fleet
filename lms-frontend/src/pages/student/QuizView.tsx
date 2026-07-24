import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useToast } from '../../components/ui/Toast'
import { useQuizzes, useQuizDetails, useSubmitQuizAttempt } from '../../hooks/useQuizzes'

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function QuizView() {
  const { courseId } = useParams<{ courseId: string }>()
  const toast = useToast()

  const { data: quizzes, isLoading: listLoading } = useQuizzes(courseId ?? '')
  const submitAttempt = useSubmitQuizAttempt()

  // Selected quiz states
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null)
  const { data: quizDetail, isLoading: quizLoading } = useQuizDetails(activeQuizId ?? '')

  // Quiz execution states
  const [isQuizActive, setIsQuizActive] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Graded attempt feedback state
  const [gradedResult, setGradedResult] = useState<any | null>(null)

  // Start quiz session
  function startQuiz() {
    if (!quizDetail) return
    setSelectedAnswers({})
    setGradedResult(null)
    setIsQuizActive(true)
    if (quizDetail.timeLimit) {
      setTimeLeft(quizDetail.timeLimit * 60)
    } else {
      setTimeLeft(null)
    }
  }

  // Timer countdown hook
  useEffect(() => {
    if (isQuizActive && timeLeft !== null) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev !== null && prev <= 1) {
            clearInterval(timerRef.current!)
            // Auto submit
            void triggerAutoSubmit()
            return 0
          }
          return prev !== null ? prev - 1 : null
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isQuizActive, timeLeft])

  async function triggerAutoSubmit() {
    toast('Time is up! Submitting your answers automatically…', 'error')
    await submitQuiz()
  }

  async function handleSubmitAnswers(e: React.FormEvent) {
    e.preventDefault()
    await submitQuiz()
  }

  async function submitQuiz() {
    if (!activeQuizId) return
    setIsQuizActive(false)
    if (timerRef.current) clearInterval(timerRef.current)

    try {
      const res = await submitAttempt.mutateAsync({
        quizId: activeQuizId,
        answers: selectedAnswers,
      })
      setGradedResult(res.data.data)
      toast(`Quiz completed! You scored ${res.data.data.score}%`, 'success')
    } catch (err: any) {
      const msg = err.response?.data?.error ?? 'Failed to submit quiz attempt'
      toast(msg, 'error')
      setIsQuizActive(false)
    }
  }

  function handleSelectOption(questionId: string, optionLetter: string) {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionLetter,
    }))
  }

  return (
    <DashboardShell title="Online Quizzes">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Course Header Banner */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors">
          <div>
            <Link
              to={`/student/courses/${courseId}`}
              className="text-sm font-semibold text-indigo-650 dark:text-indigo-400 hover:text-indigo-850 dark:hover:text-indigo-300 flex items-center gap-1 mb-1.5 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Course
            </Link>
            <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">Course Assessments & Quizzes</h2>
            <p className="text-xs text-gray-550 dark:text-slate-400 mt-0.5">Test your understanding with active program quizzes.</p>
          </div>
        </div>

        {/* 1. QUIZ RUNNING ACTIVE SESSION */}
        {isQuizActive && quizDetail ? (
          <form onSubmit={handleSubmitAnswers} className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm sticky top-4 z-20 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-gray-900 dark:text-white text-base truncate">{quizDetail.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{quizDetail.questions?.length ?? 0} questions to complete</p>
              </div>
              {timeLeft !== null && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 px-3.5 py-1.5 rounded-xl text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 font-mono text-sm font-extrabold">
                  <span>⏳ Time Left:</span>
                  <span>{formatTime(timeLeft)}</span>
                </div>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-5">
              {quizDetail.questions?.map((q, qIdx) => (
                <div key={q.id} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400">{qIdx + 1}.</span>
                    <span>{q.questionText}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-5">
                    {q.options.map((opt) => {
                      const letter = opt.charAt(0).toUpperCase() // Options are "A) ...", "B) ..." etc.
                      const isSelected = selectedAnswers[q.id] === letter
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSelectOption(q.id, letter)}
                          className={`text-left text-xs p-3.5 rounded-xl border transition-all cursor-pointer font-medium leading-relaxed ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-900 dark:bg-indigo-950/30 dark:border-indigo-400 dark:text-indigo-300'
                              : 'bg-white border-gray-200 hover:bg-slate-50 text-gray-700 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-850 dark:text-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3">
              <Button type="submit" size="md" className="px-8 shadow-sm">
                Submit Quiz Attempt
              </Button>
            </div>
          </form>

        /* 2. QUIZ GRADED FEEDBACK DISPLAY SCREEN */
        ) : gradedResult ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm text-center space-y-3">
              <span className="text-4xl">🎓</span>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Assessment Score Summary</h3>
              <p className="text-xs text-gray-400">Quiz successfully completed and graded.</p>
              
              <div className="inline-block bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 px-6 py-3 rounded-2xl">
                <span className={`text-3xl font-black ${
                  gradedResult.score >= 80 ? 'text-emerald-600' : gradedResult.score >= 50 ? 'text-amber-500' : 'text-rose-500'
                }`}>
                  {gradedResult.score}%
                </span>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Final Result</p>
              </div>

              <div>
                <button
                  onClick={() => { setGradedResult(null); setActiveQuizId(null) }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Return to Quiz List
                </button>
              </div>
            </div>

            {/* Questions Review Breakdown */}
            <div className="space-y-5">
              <h4 className="text-xs font-bold text-gray-450 uppercase tracking-widest px-1">Questions Review</h4>
              {gradedResult.questions.map((q: any, idx: number) => (
                <div key={q.id} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <h5 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-start gap-2 flex-1">
                      <span className="text-indigo-650 dark:text-indigo-400">{idx + 1}.</span>
                      <span>{q.questionText}</span>
                    </h5>
                    <Badge variant={q.isCorrect ? 'success' : 'danger'}>
                      {q.isCorrect ? 'Correct' : 'Incorrect'}
                    </Badge>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-5">
                    {q.options.map((opt: string) => {
                      const letter = opt.charAt(0).toUpperCase()
                      const isStudentAns = q.studentAnswer === letter
                      const isCorrectAns = q.correctAnswer === letter
                      const colour = isCorrectAns
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-500 dark:text-emerald-400'
                        : isStudentAns
                        ? 'bg-rose-50 border-rose-400 text-rose-900 dark:bg-rose-950/20 dark:border-rose-500 dark:text-rose-400'
                        : 'bg-white border-gray-200 text-gray-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-500'
                      return (
                        <div
                          key={opt}
                          className={`text-xs p-3.5 rounded-xl border font-semibold leading-relaxed ${colour}`}
                        >
                          {opt}
                        </div>
                      )
                    })}
                  </div>

                  {/* Explanation card */}
                  {q.explanation && (
                    <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs leading-relaxed text-gray-650 dark:text-slate-350">
                      <span className="font-extrabold text-indigo-900 dark:text-indigo-300 block mb-1">Concept Feedback:</span>
                      "{q.explanation}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        /* 3. SHOW QUIZ ASSESSMENT INFO BEFORE STARTING */
        ) : activeQuizId ? (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <button
              onClick={() => setActiveQuizId(null)}
              className="text-xs font-bold text-gray-550 hover:text-indigo-650 dark:text-slate-450 dark:hover:text-indigo-400"
            >
              ← Back to Quizzes
            </button>

            {quizLoading || !quizDetail ? (
              <div className="text-center py-12 text-gray-450">Loading quiz overview…</div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-gray-905 dark:text-white leading-tight">{quizDetail.title}</h3>
                  {quizDetail.description && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed mt-2">{quizDetail.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 p-4 rounded-xl text-xs text-gray-600 dark:text-slate-400">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">TIME LIMIT</p>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">
                      {quizDetail.timeLimit ? `${quizDetail.timeLimit} minutes` : 'No time limit'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">MAX ATTEMPTS ALLOWED</p>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{quizDetail.maxAttempts} attempts</p>
                  </div>
                  <div className="space-y-1 mt-2">
                    <p className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">ATTEMPTS COMPLETED</p>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{quizDetail.attemptsCount} attempts</p>
                  </div>
                  <div className="space-y-1 mt-2">
                    <p className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">HIGH SCORE</p>
                    <p className="font-bold text-sm text-emerald-600 dark:text-emerald-450">
                      {quizDetail.attempts && quizDetail.attempts.length > 0 
                        ? `${Math.max(...quizDetail.attempts.map((a: any) => a.score))}%` 
                        : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-150 dark:border-slate-800">
                  <Button variant="secondary" size="sm" className="dark:bg-slate-850" onClick={() => setActiveQuizId(null)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={startQuiz}
                    disabled={quizDetail.attemptsCount >= quizDetail.maxAttempts}
                  >
                    {quizDetail.attemptsCount >= quizDetail.maxAttempts ? 'No attempts left' : 'Start Attempt'}
                  </Button>
                </div>
              </div>
            )}
          </div>

        /* 4. SHOW QUIZZES LIST FOR COURSE */
        ) : (
          <div className="space-y-4">
            {listLoading ? (
              <div className="space-y-3">
                <div className="h-16 bg-gray-55/10 rounded animate-pulse" />
                <div className="h-16 bg-gray-55/10 rounded animate-pulse" />
              </div>
            ) : !quizzes?.length ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-850 shadow-sm space-y-2">
                <span className="text-4xl">📋</span>
                <p className="text-sm font-bold text-gray-700 dark:text-white">No quizzes active for this course.</p>
                <p className="text-xs text-gray-450">Your lecturer will publish quizzes when scheduled.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quizzes.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => setActiveQuizId(q.id)}
                    className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 rounded-2xl p-5 shadow-sm hover:shadow transition-all duration-300 cursor-pointer flex justify-between items-center gap-4 group"
                  >
                    <div className="min-w-0 space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-950/40 px-2 py-0.5 rounded font-mono uppercase">
                          Exam
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                          {q.title}
                        </h3>
                      </div>
                      {q.description && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1 leading-relaxed">{q.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-slate-500 font-semibold">
                        <span>Attempts: {q.attemptCount} / {q.maxAttempts}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
                        <span>Limit: {q.timeLimit ? `${q.timeLimit}m` : 'None'}</span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {q.completed ? (
                        <Badge variant="success">Completed</Badge>
                      ) : (
                        <Badge variant="warning">Start Quiz</Badge>
                      )}
                      {q.highScore !== null && (
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold mt-1.5">Score: {q.highScore}%</p>
                      )}
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
