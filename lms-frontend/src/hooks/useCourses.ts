import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseService } from '../services/course.service'
import type { CourseListParams, CreateCoursePayload, UpdateCoursePayload } from '../services/course.service'

export function useCourses(params: CourseListParams = {}) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => courseService.list(params),
  })
}

export function useCourseStudents(courseId: string) {
  return useQuery({
    queryKey: ['course-students', courseId],
    queryFn: () => courseService.getStudents(courseId),
    enabled: !!courseId,
  })
}

export function useCreateCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCoursePayload) => courseService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  })
}

export function useUpdateCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCoursePayload }) =>
      courseService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  })
}

export function useDeleteCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => courseService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  })
}

export function useEnrolStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ courseId, studentId }: { courseId: string; studentId: string }) =>
      courseService.enrolStudent(courseId, studentId),
    onSuccess: (_data, { courseId }) => {
      qc.invalidateQueries({ queryKey: ['course-students', courseId] })
      qc.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}

export function useCourseAtRiskStudents(courseId: string) {
  return useQuery({
    queryKey: ['course-at-risk', courseId],
    queryFn: () => courseService.getAtRiskStudents(courseId),
    enabled: !!courseId,
    staleTime: 60_000 * 5,
  })
}
