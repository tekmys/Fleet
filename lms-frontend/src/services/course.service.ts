import { api } from './api'
import type { Course, CourseStatus, Enrolment } from '../types'

export interface CourseListParams {
  status?: CourseStatus
  page?: number
  limit?: number
}

export interface CourseListResponse {
  courses: Course[]
  total: number
  page: number
  limit: number
}

export interface CreateCoursePayload {
  title: string
  code: string
  description?: string
  status?: CourseStatus
  lecturerId?: string
}

export interface UpdateCoursePayload {
  title?: string
  code?: string
  description?: string
  status?: CourseStatus
  lecturerId?: string
}

export interface AtRiskStudentResponse {
  student: {
    id: string
    name: string
    email: string
  }
  riskScore: number
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW'
  daysInactive: number
  missedAssignmentsCount: number
  overdueAssignmentsCount: number
  averageGrade: number | null
  riskReasons: string[]
}

export const courseService = {
  async list(params: CourseListParams = {}): Promise<CourseListResponse> {
    const { data } = await api.get<{ success: true; data: CourseListResponse }>('/courses', { params })
    return data.data
  },

  async create(payload: CreateCoursePayload): Promise<Course> {
    const { data } = await api.post<{ success: true; data: Course }>('/courses', payload)
    return data.data
  },

  async get(id: string): Promise<Course> {
    const { data } = await api.get<{ success: true; data: Course }>(`/courses/${id}`)
    return data.data
  },

  async update(id: string, payload: UpdateCoursePayload): Promise<Course> {
    const { data } = await api.patch<{ success: true; data: Course }>(`/courses/${id}`, payload)
    return data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/courses/${id}`)
  },

  async enrolStudent(courseId: string, studentId: string): Promise<Enrolment> {
    const { data } = await api.post<{ success: true; data: Enrolment }>(
      `/courses/${courseId}/enrol`,
      { studentId },
    )
    return data.data
  },

  async getStudents(courseId: string): Promise<Enrolment[]> {
    const { data } = await api.get<{ success: true; data: Enrolment[] }>(
      `/courses/${courseId}/students`,
    )
    return data.data
  },

  async getAtRiskStudents(courseId: string): Promise<AtRiskStudentResponse[]> {
    const { data } = await api.get<{ success: true; data: AtRiskStudentResponse[] }>(
      `/courses/${courseId}/at-risk`,
    )
    return data.data
  },
}
