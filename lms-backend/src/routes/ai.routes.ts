import { Router } from 'express'
import { authenticate } from '../middleware/authenticate'
import { authorise } from '../middleware/authorise'
import { gradeFeedback, chat, generateQuiz, summarise, plagiarismCheck, learningAnalytics, getAdaptivePathway } from '../controllers/ai.controller'

export const aiRouter = Router()

aiRouter.post('/chat', authenticate, authorise('ADMIN', 'LECTURER', 'STUDENT'), chat)
aiRouter.post('/grade-feedback', authenticate, authorise('ADMIN', 'LECTURER'), gradeFeedback)
aiRouter.post('/generate-quiz', authenticate, authorise('ADMIN', 'LECTURER'), generateQuiz)
aiRouter.post('/summarise', authenticate, authorise('ADMIN', 'LECTURER'), summarise)
aiRouter.post('/plagiarism-check', authenticate, authorise('ADMIN', 'LECTURER'), plagiarismCheck)
aiRouter.post('/learning-analytics', authenticate, authorise('ADMIN', 'LECTURER'), learningAnalytics)
aiRouter.get('/adaptive-pathway/:courseId', authenticate, authorise('ADMIN', 'LECTURER', 'STUDENT'), getAdaptivePathway)
