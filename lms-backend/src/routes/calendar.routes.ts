import { Router } from 'express'
import { getCalendarEvents } from '../controllers/calendar.controller'
import { authenticate } from '../middleware/authenticate'

export const calendarRouter = Router()

calendarRouter.use(authenticate)

calendarRouter.get('/events', getCalendarEvents)
