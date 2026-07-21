import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import { authRouter } from './routes/auth.routes'
import { userRouter } from './routes/user.routes'
import { courseRouter } from './routes/course.routes'
import { courseModuleRouter, moduleRouter, resourceRouter } from './routes/module.routes'
import { courseAssignmentRouter, courseGradebookRouter, assignmentRouter, submissionRouter } from './routes/assignment.routes'
import { aiRouter } from './routes/ai.routes'
import { dashboardRouter } from './routes/dashboard.routes'
import { courseAnnouncementRouter, announcementRouter } from './routes/announcement.routes'
import { messageRouter } from './routes/message.routes'
import { notificationRouter } from './routes/notification.routes'
import { progressRouter } from './routes/progress.routes'
import { calendarRouter } from './routes/calendar.routes'
import { analyticsRouter } from './routes/analytics.routes'
import { errorHandler } from './middleware/errorHandler'
import path from 'path'
import fs from 'fs'

import { createServer } from 'http'
import { initSocket } from './lib/socket'

const app = express()

// Trust proxy for correct req.protocol resolution behind reverse proxies (like Render)
app.enable('trust proxy')

// Auto-initialize static uploads directory (customizable via env var for persistent storage mount)
const uploadsDir = process.env.UPLOADS_DIR ?? path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

app.use('/uploads', express.static(uploadsDir))

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173', credentials: true }))
app.use(express.json())

// Routes
app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/api/courses', courseRouter)
app.use('/api/courses/:id/modules', courseModuleRouter)
app.use('/api/modules', moduleRouter)
app.use('/api/resources', resourceRouter)
app.use('/api/courses/:id/assignments', courseAssignmentRouter)
app.use('/api/courses/:id/gradebook', courseGradebookRouter)
app.use('/api/assignments', assignmentRouter)
app.use('/api/submissions', submissionRouter)
app.use('/api/ai', aiRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/courses/:id/announcements', courseAnnouncementRouter)
app.use('/api/announcements', announcementRouter)
app.use('/api/messages', messageRouter)
app.use('/api/notifications', notificationRouter)
app.use('/api/progress', progressRouter)
app.use('/api/calendar', calendarRouter)
app.use('/api/courses/:courseId/analytics', analyticsRouter)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } })
})

app.use(errorHandler)

const httpServer = createServer(app)
initSocket(httpServer)

const PORT = process.env.PORT ?? 3000
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

