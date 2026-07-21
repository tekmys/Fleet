import { Router } from 'express'
import { authenticate } from '../middleware/authenticate'
import { authorise } from '../middleware/authorise'
import { listNotifications, markRead, markAllRead } from '../controllers/notification.controller'

export const notificationRouter = Router()
notificationRouter.use(authenticate, authorise('ADMIN', 'LECTURER', 'STUDENT'))

notificationRouter.get('/', listNotifications)
notificationRouter.patch('/read-all', markAllRead)
notificationRouter.patch('/:id/read', markRead)
