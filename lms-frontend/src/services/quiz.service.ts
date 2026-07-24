import api from './api'

export interface Quiz {
  id: string
  title: string
  description?: string | null
  timeLimit?: number | null
  maxAttempts: number
  courseId: string
  questions?: QuizQuestion[]
  attempts?: any[]
  attemptCount?: number
  completed?: boolean
  highScore?: number | null
  createdAt: string
  updatedAt: string
}

export interface QuizQuestion {
  id: string
  questionText: string
  type: string
  options: string[]
  correctAnswer?: string
  explanation?: string | null
}

export interface QuizAttempt {
  id: string
  quizId: string
  studentId: string
  answers: Record<string, string>
  score: number
  startedAt: string
  completedAt?: string | null
  questions?: {
    id: string
    questionText: string
    options: string[]
    studentAnswer: string
    correctAnswer: string
    isCorrect: boolean
    explanation?: string | null
  }[]
}

export const quizService = {
  create: (payload: { title: string; description?: string; timeLimit?: number; maxAttempts?: number; courseId: string; questions: Omit<QuizQuestion, 'id'>[] }) =>
    api.post<{ success: true; data: Quiz }>('/quizzes', payload),

  listByCourse: (courseId: string) =>
    api.get<{ success: true; data: Quiz[] }>(`/quizzes/course/${courseId}`),

  getDetails: (id: string) =>
    api.get<{ success: true; data: Quiz & { attemptsCount: number } }>(`/quizzes/${id}`),

  submitAttempt: (payload: { quizId: string; answers: Record<string, string> }) =>
    api.post<{ success: true; data: { id: string; score: number; startedAt: string; completedAt: string; questions: any[] } }>('/quizzes/submit', payload),

  getAttempts: (quizId: string) =>
    api.get<{ success: true; data: QuizAttempt[] }>(`/quizzes/${quizId}/attempts`),
}
