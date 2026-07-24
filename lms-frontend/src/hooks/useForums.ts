import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { forumService } from '../services/forum.service'

export function useForumTopics(courseId: string) {
  return useQuery({
    queryKey: ['forums', 'topics', courseId],
    queryFn: () => forumService.listTopicsByCourse(courseId).then(r => r.data.data),
    enabled: !!courseId,
  })
}

export function useForumTopicDetails(topicId: string) {
  return useQuery({
    queryKey: ['forums', 'topic-details', topicId],
    queryFn: () => forumService.getTopicDetails(topicId).then(r => r.data.data),
    enabled: !!topicId,
  })
}

export function useCreateForumTopic() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: forumService.createTopic,
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['forums', 'topics', variables.courseId] })
    },
  })
}

export function useReplyToForumTopic() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: forumService.replyToTopic,
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['forums', 'topic-details', variables.topicId] })
    },
  })
}
