import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quizService } from '../services/quiz.service'

export function useQuizzes(courseId: string) {
  return useQuery({
    queryKey: ['quizzes', 'list', courseId],
    queryFn: () => quizService.listByCourse(courseId).then(r => r.data.data),
    enabled: !!courseId,
  })
}

export function useQuizDetails(quizId: string) {
  return useQuery({
    queryKey: ['quizzes', 'details', quizId],
    queryFn: () => quizService.getDetails(quizId).then(r => r.data.data),
    enabled: !!quizId,
  })
}

export function useQuizAttempts(quizId: string) {
  return useQuery({
    queryKey: ['quizzes', 'attempts', quizId],
    queryFn: () => quizService.getAttempts(quizId).then(r => r.data.data),
    enabled: !!quizId,
  })
}

export function useCreateQuiz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: quizService.create,
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['quizzes', 'list', variables.courseId] })
    },
  })
}

export function useSubmitQuizAttempt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: quizService.submitAttempt,
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['quizzes', 'attempts', variables.quizId] })
      qc.invalidateQueries({ queryKey: ['quizzes', 'details', variables.quizId] })
      qc.invalidateQueries({ queryKey: ['dashboard', 'stats', 'student'] })
    },
  })
}
