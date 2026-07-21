import { useQuery, useMutation } from '@tanstack/react-query'
import { analyticsService } from '../services/analytics.service'
import { useToast } from '../components/ui/Toast'

export function useCourseEarlyWarnings(courseId: string) {
  return useQuery({
    queryKey: ['early-warnings', courseId],
    queryFn: async () => {
      const res = await analyticsService.getCourseEarlyWarnings(courseId)
      return res.data.data
    },
    enabled: !!courseId,
  })
}

export function useAiRiskInsight() {
  const toast = useToast()

  return useMutation({
    mutationFn: async ({ courseId, studentId }: { courseId: string; studentId: string }) => {
      const res = await analyticsService.getStudentAiRiskInsight(courseId, studentId)
      return res.data.data
    },
    onError: (err: any) => {
      toast('Failed to generate AI insight', 'error')
      console.error(err)
    },
  })
}
