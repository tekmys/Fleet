import { useQuery } from '@tanstack/react-query'
import { calendarService } from '../services/calendar.service'

export function useCalendarEvents() {
  return useQuery({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      const res = await calendarService.getEvents()
      return res.data.data
    },
  })
}
