import api from './api'
import type { Assignment, Submission, Grade } from '../types'

// ─── Extended types with relations ────────────────────────────────────────────

export interface AssignmentWithCount extends Assignment {
  _count: { submissions: number }
}

export interface AssignmentForStudent extends AssignmentWithCount {
  mySubmission: SubmissionWithGrade | null
}

export interface SubmissionWithGrade extends Submission {
  grade: Grade | null
}

export interface SubmissionWithStudent extends SubmissionWithGrade {
  student: { id: string; name: string; email: string }
}

export interface GradebookRow {
  student: { id: string; name: string; email: string }
  grades: {
    assignmentId: string
    assignmentTitle: string
    maxScore: number
    submission: SubmissionWithGrade | null
    score: number | null
    isDraft: boolean | null
  }[]
}

export interface GradebookData {
  assignments: Assignment[]
  rows: GradebookRow[]
}

// ─── Assignments ──────────────────────────────────────────────────────────────

export const assignmentService = {
  listByCourse: (courseId: string) =>
    api.get<{ success: true; data: AssignmentWithCount[] | AssignmentForStudent[] }>(
      `/courses/${courseId}/assignments`,
    ),

  create: (courseId: string, data: { title: string; description?: string; dueDate: string; maxScore?: number }) =>
    api.post<{ success: true; data: AssignmentWithCount }>(`/courses/${courseId}/assignments`, data),

  update: (
    id: string,
    data: { title?: string; description?: string; dueDate?: string; maxScore?: number },
  ) => api.patch<{ success: true; data: AssignmentWithCount }>(`/assignments/${id}`, data),

  delete: (id: string) => api.delete<{ success: true; data: null }>(`/assignments/${id}`),

  // Student submit
  submit: (assignmentId: string, data: { content?: string; fileUrl?: string }) =>
    api.post<{ success: true; data: SubmissionWithGrade }>(`/assignments/${assignmentId}/submit`, data),

  // Lecturer: list submissions for an assignment
  listSubmissions: (assignmentId: string) =>
    api.get<{ success: true; data: SubmissionWithStudent[] }>(`/assignments/${assignmentId}/submissions`),

  // Lecturer: grade a submission
  grade: (submissionId: string, data: { score: number; feedback?: string; isDraft?: boolean }) =>
    api.patch<{ success: true; data: Grade }>(`/submissions/${submissionId}/grade`, data),

  // Gradebook
  getGradebook: (courseId: string) =>
    api.get<{ success: true; data: GradebookData }>(`/courses/${courseId}/gradebook`),

  // AI auto-grade draft
  aiGradeFeedback: (submissionId: string, rubric?: string) =>
    api.post<{ success: true; data: { score: number; feedback: string; isDraft: true } }>(
      '/ai/grade-feedback',
      { submissionId, rubric },
    ),
}
