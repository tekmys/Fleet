import { Router } from 'express'
import { authenticate } from '../middleware/authenticate'
import { authorise } from '../middleware/authorise'
import {
  listAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  listSubmissions,
  gradeSubmission,
  getGradebook,
} from '../controllers/assignment.controller'

// /api/courses/:id/assignments
export const courseAssignmentRouter = Router({ mergeParams: true })
courseAssignmentRouter.use(authenticate, authorise('ADMIN', 'LECTURER', 'STUDENT'))
courseAssignmentRouter.get('/', listAssignments)
courseAssignmentRouter.post('/', authorise('ADMIN', 'LECTURER'), createAssignment)

// /api/courses/:id/gradebook
export const courseGradebookRouter = Router({ mergeParams: true })
courseGradebookRouter.use(authenticate, authorise('ADMIN', 'LECTURER'))
courseGradebookRouter.get('/', getGradebook)

// /api/assignments/:id
export const assignmentRouter = Router()
assignmentRouter.use(authenticate, authorise('ADMIN', 'LECTURER', 'STUDENT'))
assignmentRouter.get('/:id', getAssignment)
assignmentRouter.patch('/:id', authorise('ADMIN', 'LECTURER'), updateAssignment)
assignmentRouter.delete('/:id', authorise('ADMIN', 'LECTURER'), deleteAssignment)
assignmentRouter.post('/:id/submit', authorise('STUDENT'), submitAssignment)
assignmentRouter.get('/:id/submissions', authorise('ADMIN', 'LECTURER'), listSubmissions)

// /api/submissions/:id
export const submissionRouter = Router()
submissionRouter.use(authenticate, authorise('ADMIN', 'LECTURER'))
submissionRouter.patch('/:id/grade', gradeSubmission)
