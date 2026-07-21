import { api } from './api'

export interface ToggleCompletionResponse {
  completed: boolean
}

export interface StudentProgressStat {
  id: string
  name: string
  email: string
  completedCount: number
  progressPercent: number
}

export interface ModuleProgressStat {
  id: string
  title: string
  totalResources: number
  averageCompletionPercent: number
}

export interface CourseProgressStats {
  totalResources: number
  studentsCount: number
  students: StudentProgressStat[]
  modules: ModuleProgressStat[]
}

export const progressService = {
  toggleComplete: (resourceId: string) =>
    api.post<{ success: true; data: ToggleCompletionResponse }>(`/progress/resources/${resourceId}/toggle`),

  getCourseStats: (courseId: string) =>
    api.get<{ success: true; data: CourseProgressStats }>(`/progress/courses/${courseId}/stats`),
}
