import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '../pages/auth/LoginPage'
import { AdminDashboard } from '../pages/admin/AdminDashboard'
import { UserManagement } from '../pages/admin/UserManagement'
import { CourseManagement } from '../pages/admin/CourseManagement'
import { LecturerDashboard } from '../pages/lecturer/LecturerDashboard'
import { MyCourses } from '../pages/lecturer/MyCourses'
import { CourseModules } from '../pages/lecturer/CourseModules'
import { CourseAssignments } from '../pages/lecturer/CourseAssignments'
import { Gradebook } from '../pages/lecturer/Gradebook'
import { CourseAnalytics } from '../pages/lecturer/CourseAnalytics'
import { StudentDashboard } from '../pages/student/StudentDashboard'
import { MyCourses as StudentMyCourses } from '../pages/student/MyCourses'
import { CourseView } from '../pages/student/CourseView'
import { Assignments } from '../pages/student/Assignments'
import { AiAssistant } from '../pages/student/AiAssistant'
import { AdaptivePathway } from '../pages/student/AdaptivePathway'
import { QuizView } from '../pages/student/QuizView'
import { QuizManager } from '../pages/lecturer/QuizManager'
import { DiscussionForum } from '../pages/shared/DiscussionForum'
import { Messages } from '../pages/Messages'
import { CalendarPage } from '../pages/shared/CalendarPage'
import { NotFound } from '../pages/NotFound'
import { Unauthorized } from '../pages/Unauthorized'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },

  // Admin routes
  {
    element: <ProtectedRoute role="ADMIN" />,
    children: [
      { path: '/admin/dashboard', element: <AdminDashboard /> },
      { path: '/admin/users', element: <UserManagement /> },
      { path: '/admin/courses', element: <CourseManagement /> },
      { path: '/admin/messages', element: <Messages /> },
      { path: '/admin/calendar', element: <CalendarPage /> },
    ],
  },

  // Lecturer routes
  {
    element: <ProtectedRoute role="LECTURER" />,
    children: [
      { path: '/lecturer/dashboard', element: <LecturerDashboard /> },
      { path: '/lecturer/courses', element: <MyCourses /> },
      { path: '/lecturer/courses/:courseId/modules', element: <CourseModules /> },
      { path: '/lecturer/courses/:courseId/assignments', element: <CourseAssignments /> },
      { path: '/lecturer/courses/:courseId/gradebook', element: <Gradebook /> },
      { path: '/lecturer/courses/:courseId/analytics', element: <CourseAnalytics /> },
      { path: '/lecturer/courses/:courseId/quizzes', element: <QuizManager /> },
      { path: '/lecturer/courses/:courseId/forum', element: <DiscussionForum /> },
      { path: '/lecturer/messages', element: <Messages /> },
      { path: '/lecturer/calendar', element: <CalendarPage /> },
    ],
  },


  // Student routes
  {
    element: <ProtectedRoute role="STUDENT" />,
    children: [
      { path: '/student/dashboard', element: <StudentDashboard /> },
      { path: '/student/courses', element: <StudentMyCourses /> },
      { path: '/student/courses/:courseId', element: <CourseView /> },
      { path: '/student/courses/:courseId/assignments', element: <Assignments /> },
      { path: '/student/courses/:courseId/ai', element: <AiAssistant /> },
      { path: '/student/courses/:courseId/pathway', element: <AdaptivePathway /> },
      { path: '/student/courses/:courseId/quizzes', element: <QuizView /> },
      { path: '/student/courses/:courseId/forum', element: <DiscussionForum /> },
      { path: '/student/messages', element: <Messages /> },
      { path: '/student/calendar', element: <CalendarPage /> },
    ],
  },

  {
    path: '*',
    element: <NotFound />,
  },
])
