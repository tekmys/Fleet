import { Router } from 'express'
import { authenticate } from '../middleware/authenticate'
import { authorise } from '../middleware/authorise'
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcement.controller'

// /api/courses/:id/announcements
export const courseAnnouncementRouter = Router({ mergeParams: true })
courseAnnouncementRouter.use(authenticate, authorise('ADMIN', 'LECTURER', 'STUDENT'))
courseAnnouncementRouter.get('/', listAnnouncements)
courseAnnouncementRouter.post('/', authorise('ADMIN', 'LECTURER'), createAnnouncement)

// /api/announcements/:id
export const announcementRouter = Router()
announcementRouter.use(authenticate, authorise('ADMIN', 'LECTURER'))
announcementRouter.patch('/:id', updateAnnouncement)
announcementRouter.delete('/:id', deleteAnnouncement)
