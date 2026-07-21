import api from './api'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface QuizQuestion {
  question: string
  options: string[]
  answer: 'A' | 'B' | 'C' | 'D'
  explanation: string
}

export interface PlagiarismFlag {
  studentName: string
  similarityLevel: 'high' | 'medium' | 'low'
  evidence: string
}

export interface PlagiarismResult {
  verdict: string
  flags: PlagiarismFlag[]
  checkedAgainst: number
}

export interface LearningAnalyticsResponse {
  overallTrend: string
  misconceptions: string[]
  suggestions: string[]
}

export interface AdaptiveResource {
  id: string
  title: string
  type: 'FILE' | 'LINK' | 'VIDEO'
  url: string
}

export interface AdaptiveFocusArea {
  topic: string
  reason: string
  recommendedResources: AdaptiveResource[]
}

export interface AdaptivePathwayResponse {
  summary: string
  focusAreas: AdaptiveFocusArea[]
  nextSteps: string[]
  stats?: {
    completionPercent: number
    completedCount: number
    totalResources: number
    missedCount: number
    lowGradesCount: number
  }
}

export const aiService = {
  chat: (courseId: string, message: string, history: ChatMessage[]) =>
    api.post<{ success: true; data: { reply: string } }>('/ai/chat', { courseId, message, history }),

  generateQuiz: (courseId: string, text: string, numQuestions = 5) =>
    api.post<{ success: true; data: { questions: QuizQuestion[] } }>('/ai/generate-quiz', {
      courseId,
      text,
      numQuestions,
    }),

  summarise: (courseId: string, text: string) =>
    api.post<{ success: true; data: { summary: string } }>('/ai/summarise', { courseId, text }),

  plagiarismCheck: (submissionId: string) =>
    api.post<{ success: true; data: PlagiarismResult }>('/ai/plagiarism-check', { submissionId }),

  learningAnalytics: (assignmentId: string) =>
    api.post<{ success: true; data: LearningAnalyticsResponse }>('/ai/learning-analytics', { assignmentId }),

  adaptivePathway: (courseId: string, studentId?: string) =>
    api.get<{ success: true; data: AdaptivePathwayResponse }>(
      `/ai/adaptive-pathway/${courseId}${studentId ? `?studentId=${studentId}` : ''}`
    ),
}

