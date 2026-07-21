export type Role = 'ADMIN' | 'LECTURER' | 'STUDENT'
export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type ResourceType = 'FILE' | 'LINK' | 'VIDEO'
export type SubmissionStatus = 'SUBMITTED' | 'GRADED'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Course {
  id: string
  title: string
  code: string
  description?: string
  status: CourseStatus
  lecturerId: string
  lecturer?: Pick<User, 'id' | 'name' | 'email'>
  createdAt: string
  updatedAt: string
  _count?: {
    enrolments: number
    modules: number
    assignments: number
  }
}

export interface Enrolment {
  id: string
  studentId: string
  courseId: string
  student?: Pick<User, 'id' | 'name' | 'email' | 'isActive'>
  enrolledAt: string
}

export interface Module {
  id: string
  title: string
  order: number
  courseId: string
  createdAt: string
  updatedAt: string
}

export interface Assignment {
  id: string
  title: string
  description?: string
  dueDate: string
  maxScore: number
  courseId: string
  createdAt: string
  updatedAt: string
}

export interface Submission {
  id: string
  content?: string
  fileUrl?: string
  submittedAt: string
  status: SubmissionStatus
  studentId: string
  assignmentId: string
}

export interface Grade {
  id: string
  score: number
  feedback?: string
  isDraft: boolean
  submissionId: string
  gradedById: string
  createdAt: string
  updatedAt: string
}

// API response shapes
export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}
