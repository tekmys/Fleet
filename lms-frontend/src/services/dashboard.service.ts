import api from './api'
import type { User, Assignment } from '../types'

export interface AdminStats {
  totalUsers: number
  totalCourses: number
  totalEnrolments: number
  coursesByStatus: { DRAFT: number; PUBLISHED: number; ARCHIVED: number }
  recentUsers: Pick<User, 'id' | 'name' | 'email' | 'role' | 'createdAt'>[]
}

export interface LecturerStats {
  totalCourses: number
  totalStudents: number
  totalAssignments: number
  pendingSubmissions: number
  recentSubmissions: {
    id: string
    submittedAt: string
    student: { id: string; name: string }
    assignment: { id: string; title: string; courseId: string }
  }[]
}

export interface StudentStats {
  totalEnrolledCourses: number
  totalSubmitted: number
  upcomingAssignments: (Assignment & {
    submitted: boolean
    course: { id: string; title: string; code: string }
  })[]
  recentGrades: {
    id: string
    score: number
    updatedAt: string
    submission: {
      assignment: { id: string; title: string; maxScore: number; courseId: string }
    }
  }[]
}

export const dashboardService = {
  getStats: () => api.get<{ success: true; data: AdminStats | LecturerStats | StudentStats }>('/dashboard/stats'),
}
