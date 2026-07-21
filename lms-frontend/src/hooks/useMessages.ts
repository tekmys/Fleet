import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messageService } from '../services/message.service'

export function useContacts() {
  return useQuery({
    queryKey: ['message-contacts'],
    queryFn: () => messageService.getContacts().then((r) => r.data.data),
  })
}

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => messageService.getConversations().then((r) => r.data.data),
  })
}

export function useThread(userId: string) {
  return useQuery({
    queryKey: ['thread', userId],
    queryFn: () => messageService.getThread(userId).then((r) => r.data.data),
    enabled: !!userId,
  })
}

export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { receiverId: string; content?: string; fileUrl?: string; fileName?: string; fileSize?: number }) =>
      messageService.send(data).then((r) => r.data.data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['thread', variables.receiverId] })
      qc.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useUploadMessageFile() {
  return useMutation({
    mutationFn: (file: File) =>
      messageService.uploadFile(file).then((r) => r.data.data),
  })
}
