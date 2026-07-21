import { Router } from 'express'
import { authenticate } from '../middleware/authenticate'
import { authorise } from '../middleware/authorise'
import { getDashboardStats } from '../controllers/dashboard.controller'

export const dashboardRouter = Router()

dashboardRouter.get('/stats', authenticate, authorise('ADMIN', 'LECTURER', 'STUDENT'), getDashboardStats)
