import { Router } from 'express'
import { authenticate } from '../middleware/authenticate'
import { authorise } from '../middleware/authorise'
import { getContacts, getConversations, getThread, sendMessage, uploadFile } from '../controllers/message.controller'
import { uploadAttachment } from '../middleware/upload.middleware'

export const messageRouter = Router()
messageRouter.use(authenticate, authorise('ADMIN', 'LECTURER', 'STUDENT'))

messageRouter.get('/contacts', getContacts)
messageRouter.get('/conversations', getConversations)
messageRouter.post('/upload', uploadAttachment.single('file'), uploadFile)
messageRouter.get('/:userId', getThread)
messageRouter.post('/', sendMessage)
