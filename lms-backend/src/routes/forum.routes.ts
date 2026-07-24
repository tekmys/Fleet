import { Router } from 'express'
import { authenticate } from '../middleware/authenticate'
import { authorise } from '../middleware/authorise'
import {
  createDiscussionTopic,
  getDiscussionTopicsByCourse,
  getDiscussionTopicDetails,
  createDiscussionPost,
} from '../controllers/forum.controller'

export const forumRouter = Router()

forumRouter.post('/', authenticate, authorise('ADMIN', 'LECTURER', 'STUDENT'), createDiscussionTopic)
forumRouter.get('/course/:courseId', authenticate, authorise('ADMIN', 'LECTURER', 'STUDENT'), getDiscussionTopicsByCourse)
forumRouter.get('/:id', authenticate, authorise('ADMIN', 'LECTURER', 'STUDENT'), getDiscussionTopicDetails)
forumRouter.post('/reply', authenticate, authorise('ADMIN', 'LECTURER', 'STUDENT'), createDiscussionPost)
