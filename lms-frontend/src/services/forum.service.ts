import api from './api'

export interface DiscussionTopic {
  id: string
  title: string
  content: string
  courseId: string
  authorId: string
  author: { id: string; name: string; role: string }
  createdAt: string
  updatedAt: string
  _count?: {
    posts: number
  }
  posts?: DiscussionPost[]
}

export interface DiscussionPost {
  id: string
  content: string
  topicId: string
  authorId: string
  author: { id: string; name: string; role: string }
  createdAt: string
}

export const forumService = {
  createTopic: (payload: { title: string; content: string; courseId: string }) =>
    api.post<{ success: true; data: DiscussionTopic }>('/forums', payload),

  listTopicsByCourse: (courseId: string) =>
    api.get<{ success: true; data: DiscussionTopic[] }>(`/forums/course/${courseId}`),

  getTopicDetails: (id: string) =>
    api.get<{ success: true; data: DiscussionTopic }>(`/forums/${id}`),

  replyToTopic: (payload: { topicId: string; content: string }) =>
    api.post<{ success: true; data: DiscussionPost }>('/forums/reply', payload),
}
