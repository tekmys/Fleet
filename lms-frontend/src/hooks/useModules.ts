import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { moduleService } from '../services/module.service'
import type { ResourceType } from '../types'

export function useModules(courseId: string) {
  return useQuery({
    queryKey: ['modules', courseId],
    queryFn: () => moduleService.list(courseId),
    enabled: !!courseId,
  })
}

export function useCreateModule(courseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (title: string) => moduleService.create(courseId, title),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['modules', courseId] }),
  })
}

export function useUpdateModule(courseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { title?: string; order?: number } }) =>
      moduleService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['modules', courseId] }),
  })
}

export function useDeleteModule(courseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => moduleService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['modules', courseId] }),
  })
}

export function useAddResource(courseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      moduleId,
      payload,
    }: {
      moduleId: string
      payload: { title: string; type: ResourceType; url: string; textContent?: string }
    }) => moduleService.addResource(moduleId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['modules', courseId] }),
  })
}

export function useDeleteResource(courseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => moduleService.deleteResource(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['modules', courseId] }),
  })
}
