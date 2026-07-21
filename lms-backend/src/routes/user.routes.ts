import { Router } from 'express'
import { listUsers, createUser, getUser, updateUser, deleteUser } from '../controllers/user.controller'
import { authenticate } from '../middleware/authenticate'
import { authorise } from '../middleware/authorise'

export const userRouter = Router()

userRouter.use(authenticate, authorise('ADMIN'))

userRouter.get('/', listUsers)
userRouter.post('/', createUser)
userRouter.get('/:id', getUser)
userRouter.patch('/:id', updateUser)
userRouter.delete('/:id', deleteUser)
