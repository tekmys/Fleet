import api from './api'

export interface Announcement {
  id: string
  title: string
  content: string
  courseId: string
  authorId: string
  author: { id: string; name: string }
  createdAt: string
}

export const announcementService = {
  list: (courseId: string) =>
    api.get<{ success: true; data: Announcement[] }>(`/courses/${courseId}/announcements`),

  create: (courseId: string, data: { title: string; content: string }) =>
    api.post<{ success: true; data: Announcement }>(`/courses/${courseId}/announcements`, data),

  update: (id: string, data: { title?: string; content?: string }) =>
    api.patch<{ success: true; data: Announcement }>(`/announcements/${id}`, data),

  delete: (id: string) =>
    api.delete<{ success: true; data: null }>(`/announcements/${id}`),
}
