import { Router } from 'express'
import {
  toggleResourceComplete,
  getCourseProgressStats,
} from '../controllers/progress.controller'
import { authenticate } from '../middleware/authenticate'
import { authorise } from '../middleware/authorise'

export const progressRouter = Router()

progressRouter.use(authenticate)

progressRouter.post(
  '/resources/:resourceId/toggle',
  authorise('STUDENT'),
  toggleResourceComplete,
)

progressRouter.get(
  '/courses/:courseId/stats',
  authorise('LECTURER', 'ADMIN'),
  getCourseProgressStats,
)
