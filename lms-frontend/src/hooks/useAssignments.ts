import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assignmentService } from '../services/assignment.service'
import { aiService } from '../services/ai.service'

export function useAssignments(courseId: string) {
  return useQuery({
    queryKey: ['assignments', courseId],
    queryFn: () => assignmentService.listByCourse(courseId).then(r => r.data.data),
    enabled: !!courseId,
  })
}

export function useSubmissions(assignmentId: string) {
  return useQuery({
    queryKey: ['submissions', assignmentId],
    queryFn: () => assignmentService.listSubmissions(assignmentId).then(r => r.data.data),
    enabled: !!assignmentId,
  })
}

export function useGradebook(courseId: string) {
  return useQuery({
    queryKey: ['gradebook', courseId],
    queryFn: () => assignmentService.getGradebook(courseId).then(r => r.data.data),
    enabled: !!courseId,
  })
}

export function useCreateAssignment(courseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string; description?: string; dueDate: string; maxScore?: number }) =>
      assignmentService.create(courseId, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assignments', courseId] }),
  })
}

export function useUpdateAssignment(courseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; title?: string; description?: string; dueDate?: string; maxScore?: number }) =>
      assignmentService.update(id, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assignments', courseId] }),
  })
}

export function useDeleteAssignment(courseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => assignmentService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assignments', courseId] }),
  })
}

export function useSubmitAssignment(courseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ assignmentId, ...data }: { assignmentId: string; content?: string; fileUrl?: string }) =>
      assignmentService.submit(assignmentId, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assignments', courseId] }),
  })
}

export function useGradeSubmission(assignmentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      submissionId,
      ...data
    }: { submissionId: string; score: number; feedback?: string; isDraft?: boolean }) =>
      assignmentService.grade(submissionId, data).then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['submissions', assignmentId] })
      qc.invalidateQueries({ queryKey: ['gradebook'] })
    },
  })
}

export function useAiGradeFeedback() {
  return useMutation({
    mutationFn: ({ submissionId, rubric }: { submissionId: string; rubric?: string }) =>
      assignmentService.aiGradeFeedback(submissionId, rubric).then(r => r.data.data),
  })
}

export function useAiPlagiarismCheck() {
  return useMutation({
    mutationFn: (submissionId: string) =>
      aiService.plagiarismCheck(submissionId).then(r => r.data.data),
  })
}

export function useAiLearningAnalytics() {
  return useMutation({
    mutationFn: (assignmentId: string) =>
      aiService.learningAnalytics(assignmentId).then(r => r.data.data),
  })
}

export function useAdaptivePathway(courseId: string, studentId?: string) {
  return useQuery({
    queryKey: ['adaptive-pathway', courseId, studentId],
    queryFn: () => aiService.adaptivePathway(courseId, studentId).then(r => r.data.data),
    enabled: !!courseId,
    staleTime: 60 * 1000,
  })
}

