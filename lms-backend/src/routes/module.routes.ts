import { Router } from 'express'
import {
  listModules,
  createModule,
  updateModule,
  deleteModule,
  createResource,
  deleteResource,
} from '../controllers/module.controller'
import { authenticate } from '../middleware/authenticate'
import { authorise } from '../middleware/authorise'

// Mounted under /api/courses/:id/modules
export const courseModuleRouter = Router({ mergeParams: true })
courseModuleRouter.use(authenticate, authorise('ADMIN', 'LECTURER', 'STUDENT'))
courseModuleRouter.get('/', listModules)
courseModuleRouter.post('/', authorise('ADMIN', 'LECTURER'), createModule)

// Mounted under /api/modules
export const moduleRouter = Router()
moduleRouter.use(authenticate, authorise('ADMIN', 'LECTURER'))
moduleRouter.patch('/:id', updateModule)
moduleRouter.delete('/:id', deleteModule)
moduleRouter.post('/:id/resources', createResource)

// Mounted under /api/resources
export const resourceRouter = Router()
resourceRouter.use(authenticate, authorise('ADMIN', 'LECTURER'))
resourceRouter.delete('/:id', deleteResource)
