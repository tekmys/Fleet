import { api } from './api'

export interface EarlyWarningStats {
  studentId: string
  name: string
  email: string
  completionPercent: number
  averageGrade: number | null
  missedAssignments: number
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface AiRiskInsight {
  insight: string
}

export const analyticsService = {
  getCourseEarlyWarnings: (courseId: string) =>
    api.get<{ success: true; data: EarlyWarningStats[] }>(`/courses/${courseId}/analytics/early-warnings`),
    
  getStudentAiRiskInsight: (courseId: string, studentId: string) =>
    api.get<{ success: true; data: AiRiskInsight }>(`/courses/${courseId}/analytics/early-warnings/insight/${studentId}`),
}
