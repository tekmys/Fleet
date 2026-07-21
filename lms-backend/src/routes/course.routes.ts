import { Router } from 'express'
import {
  listCourses,
  createCourse,
  getCourse,
  updateCourse,
  deleteCourse,
  enrolStudent,
  getCourseStudents,
  getAtRiskStudents,
} from '../controllers/course.controller'
import { authenticate } from '../middleware/authenticate'
import { authorise } from '../middleware/authorise'

export const courseRouter = Router()

courseRouter.use(authenticate)

courseRouter.get('/', authorise('ADMIN', 'LECTURER', 'STUDENT'), listCourses)
courseRouter.post('/', authorise('ADMIN', 'LECTURER'), createCourse)
courseRouter.get('/:id', authorise('ADMIN', 'LECTURER', 'STUDENT'), getCourse)
courseRouter.patch('/:id', authorise('ADMIN', 'LECTURER'), updateCourse)
courseRouter.delete('/:id', authorise('ADMIN'), deleteCourse)
courseRouter.post('/:id/enrol', authorise('ADMIN'), enrolStudent)
courseRouter.get('/:id/students', authorise('ADMIN', 'LECTURER'), getCourseStudents)
courseRouter.get('/:id/at-risk', authorise('ADMIN', 'LECTURER'), getAtRiskStudents)

