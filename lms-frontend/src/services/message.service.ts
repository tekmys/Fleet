import api from './api'

export interface Contact {
  id: string
  name: string
  email: string
  role: string
}

export interface Message {
  id: string
  content: string
  fileUrl?: string | null
  fileName?: string | null
  fileSize?: number | null
  senderId: string
  receiverId: string
  sender: { id: string; name: string }
  receiver: { id: string; name: string }
  readAt: string | null
  createdAt: string
}

export interface Conversation {
  user: { id: string; name: string }
  lastMessage: { content: string; createdAt: string; senderId: string; fileUrl?: string | null; fileName?: string | null }
  unreadCount: number
}

export const messageService = {
  getContacts: () =>
    api.get<{ success: true; data: Contact[] }>('/messages/contacts'),

  getConversations: () =>
    api.get<{ success: true; data: Conversation[] }>('/messages/conversations'),

  getThread: (userId: string) =>
    api.get<{ success: true; data: Message[] }>(`/messages/${userId}`),

  send: (data: { receiverId: string; content?: string; fileUrl?: string; fileName?: string; fileSize?: number }) =>
    api.post<{ success: true; data: Message }>('/messages', data),

  uploadFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<{ success: true; data: { fileUrl: string; fileName: string; fileSize: number } }>('/messages/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
