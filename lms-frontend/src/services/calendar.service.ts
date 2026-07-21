import { api } from './api'

export interface CalendarEvent {
  id: string
  title: string
  date: string // ISO string
  type: 'ASSIGNMENT' | 'ANNOUNCEMENT' | 'MODULE'
  courseName: string
  courseCode: string
  link: string
}

export const calendarService = {
  getEvents: () =>
    api.get<{ success: true; data: CalendarEvent[] }>('/calendar/events'),
}
