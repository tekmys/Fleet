import { Router } from 'express'
import { authenticate } from '../middleware/authenticate'
import { authorise } from '../middleware/authorise'
import {
  createQuiz,
  getQuizzesByCourse,
  getQuizDetails,
  submitQuizAttempt,
  getStudentQuizAttempts,
} from '../controllers/quiz.controller'

export const quizRouter = Router()

quizRouter.post('/', authenticate, authorise('ADMIN', 'LECTURER'), createQuiz)
quizRouter.get('/course/:courseId', authenticate, authorise('ADMIN', 'LECTURER', 'STUDENT'), getQuizzesByCourse)
quizRouter.get('/:id', authenticate, authorise('ADMIN', 'LECTURER', 'STUDENT'), getQuizDetails)
quizRouter.post('/submit', authenticate, authorise('STUDENT'), submitQuizAttempt)
quizRouter.get('/:quizId/attempts', authenticate, authorise('STUDENT'), getStudentQuizAttempts)
