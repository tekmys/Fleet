import api from './api'

export interface Notification {
  id: string
  type: 'NEW_MESSAGE' | 'GRADE_PUBLISHED' | 'NEW_ANNOUNCEMENT'
  title: string
  body: string | null
  link: string | null
  readAt: string | null
  createdAt: string
}

export interface NotificationList {
  notifications: Notification[]
  unreadCount: number
}

export const notificationService = {
  list: () =>
    api.get<{ success: true; data: NotificationList }>('/notifications'),

  markRead: (id: string) =>
    api.patch<{ success: true; data: Notification }>(`/notifications/${id}/read`),

  markAllRead: () =>
    api.patch<{ success: true; data: null }>('/notifications/read-all'),
}
