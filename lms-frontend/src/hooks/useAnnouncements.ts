import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { announcementService } from '../services/announcement.service'

export function useAnnouncements(courseId: string) {
  return useQuery({
    queryKey: ['announcements', courseId],
    queryFn: () => announcementService.list(courseId).then(r => r.data.data),
    enabled: !!courseId,
  })
}

export function useCreateAnnouncement(courseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      announcementService.create(courseId, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements', courseId] }),
  })
}

export function useUpdateAnnouncement(courseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; title?: string; content?: string }) =>
      announcementService.update(id, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements', courseId] }),
  })
}

export function useDeleteAnnouncement(courseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => announcementService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements', courseId] }),
  })
}
