import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { progressService } from '../services/progress.service'

export function useToggleResourceComplete(courseId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (resourceId: string) => progressService.toggleComplete(resourceId),
    onSuccess: () => {
      // Invalidate course and modules data to immediately show checked changes
      if (courseId) {
        void qc.invalidateQueries({ queryKey: ['course', courseId] })
        void qc.invalidateQueries({ queryKey: ['modules', courseId] })
        void qc.invalidateQueries({ queryKey: ['course-progress-stats', courseId] })
        void qc.invalidateQueries({ queryKey: ['course-at-risk', courseId] })
      }
    },
  })
}

export function useCourseProgressStats(courseId: string) {
  return useQuery({
    queryKey: ['course-progress-stats', courseId],
    queryFn: async () => {
      const res = await progressService.getCourseStats(courseId)
      return res.data.data
    },
    enabled: !!courseId,
  })
}
