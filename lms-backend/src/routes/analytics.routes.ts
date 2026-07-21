import { Router } from 'express'
import { getCourseEarlyWarnings, getStudentAiRiskInsight } from '../controllers/analytics.controller'
import { authenticate } from '../middleware/authenticate'
import { authorise } from '../middleware/authorise'

export const analyticsRouter = Router({ mergeParams: true })

analyticsRouter.use(authenticate)

analyticsRouter.get('/early-warnings', authorise('ADMIN', 'LECTURER'), getCourseEarlyWarnings)
analyticsRouter.get('/early-warnings/insight/:studentId', authorise('ADMIN', 'LECTURER'), getStudentAiRiskInsight)
